import { randomUUID, createHash } from "crypto";
import { getDb } from "@/lib/db";

export type Team = {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  created_at: number;
  updated_at: number;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  name: string;
  email: string;
  joined_at: number;
};

export type TeamInvite = {
  id: string;
  team_id: string;
  email: string;
  role: string;
  invited_by: string;
  inviter_name: string;
  team_name: string;
  expires_at: number;
  created_at: number;
};

export function createTeam(ownerId: string, name: string): Team {
  const db = getDb();
  const now = Date.now();
  const id = randomUUID();

  db.prepare(
    `INSERT INTO teams (id, name, owner_id, plan, created_at, updated_at)
     VALUES (?, ?, ?, 'teams_monthly', ?, ?)`
  ).run(id, name, ownerId, now, now);

  // Add owner as admin member
  db.prepare(
    `INSERT INTO team_members (id, team_id, user_id, role, invited_by, joined_at)
     VALUES (?, ?, ?, 'admin', ?, ?)`
  ).run(randomUUID(), id, ownerId, ownerId, now);

  return { id, name, owner_id: ownerId, plan: "teams_monthly", created_at: now, updated_at: now };
}

export function getTeam(teamId: string): Team | null {
  const db = getDb();
  return db.prepare("SELECT * FROM teams WHERE id = ?").get(teamId) as Team | null;
}

export function getUserTeams(userId: string): Team[] {
  const db = getDb();
  return db.prepare(
    `SELECT t.* FROM teams t
     INNER JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = ?
     ORDER BY t.name COLLATE NOCASE`
  ).all(userId) as Team[];
}

export function getTeamMembers(teamId: string): TeamMember[] {
  const db = getDb();
  return db.prepare(
    `SELECT tm.*, u.name, u.email
     FROM team_members tm
     INNER JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = ?
     ORDER BY tm.role DESC, u.name COLLATE NOCASE`
  ).all(teamId) as TeamMember[];
}

export function getTeamMemberCount(teamId: string): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM team_members WHERE team_id = ?").get(teamId) as { count: number };
  return row.count;
}

export function isTeamMember(teamId: string, userId: string): boolean {
  const db = getDb();
  const row = db.prepare("SELECT id FROM team_members WHERE team_id = ? AND user_id = ?").get(teamId, userId);
  return !!row;
}

export function getTeamMemberRole(teamId: string, userId: string): string | null {
  const db = getDb();
  const row = db.prepare("SELECT role FROM team_members WHERE team_id = ? AND user_id = ?").get(teamId, userId) as { role: string } | undefined;
  return row?.role ?? null;
}

export function isTeamAdmin(teamId: string, userId: string): boolean {
  const role = getTeamMemberRole(teamId, userId);
  return role === "admin" || role === "owner";
}

export function isTeamOwner(teamId: string, userId: string): boolean {
  const team = getTeam(teamId);
  return team?.owner_id === userId;
}

export function inviteToTeam(
  teamId: string,
  email: string,
  role: string,
  invitedBy: string
): TeamInvite | null {
  const db = getDb();
  const now = Date.now();

  // Check team exists
  const team = getTeam(teamId);
  if (!team) return null;

  // Check inviter is admin
  if (!isTeamAdmin(teamId, invitedBy)) return null;

  // Check member count limit (5 for teams plan)
  const count = getTeamMemberCount(teamId);
  if (count >= 5) return null;

  // Check if already a member
  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as { id: string } | undefined;
  if (existingUser && isTeamMember(teamId, existingUser.id)) return null;

  // Check for existing invite
  const existingInvite = db.prepare(
    "SELECT id FROM team_invites WHERE team_id = ? AND email = ? AND expires_at > ?"
  ).get(teamId, email, now);
  if (existingInvite) return null;

  const id = randomUUID();
  const token = randomUUID();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  db.prepare(
    `INSERT INTO team_invites (id, team_id, email, role, invited_by, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(id, teamId, email, role, invitedBy, tokenHash, expiresAt, now);

  const inviter = db.prepare("SELECT name FROM users WHERE id = ?").get(invitedBy) as { name: string };

  return {
    id,
    team_id: teamId,
    email,
    role,
    invited_by: invitedBy,
    inviter_name: inviter?.name || "Someone",
    team_name: team.name,
    expires_at: expiresAt,
    created_at: now,
  };
}

export function getTeamInvites(teamId: string): Array<{ email: string; role: string; created_at: number }> {
  const db = getDb();
  return db.prepare(
    "SELECT email, role, created_at FROM team_invites WHERE team_id = ? AND expires_at > ?"
  ).all(teamId, Date.now()) as Array<{ email: string; role: string; created_at: number }>;
}

export function getUserInvites(userId: string): TeamInvite[] {
  const db = getDb();
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string } | undefined;
  if (!user) return [];

  return db.prepare(
    `SELECT ti.*, t.name as team_name, u.name as inviter_name
     FROM team_invites ti
     INNER JOIN teams t ON ti.team_id = t.id
     INNER JOIN users u ON ti.invited_by = u.id
     WHERE ti.email = ? AND ti.expires_at > ?
     ORDER BY ti.created_at DESC`
  ).all(user.email, Date.now()) as TeamInvite[];
}

export function acceptInvite(inviteId: string, userId: string): boolean {
  const db = getDb();
  const now = Date.now();

  const invite = db.prepare(
    "SELECT * FROM team_invites WHERE id = ? AND expires_at > ?"
  ).get(inviteId, now) as { team_id: string; email: string; role: string; invited_by: string } | undefined;

  if (!invite) return false;

  // Verify email matches
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(userId) as { email: string };
  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) return false;

  // Check not already a member
  if (isTeamMember(invite.team_id, userId)) {
    db.prepare("DELETE FROM team_invites WHERE id = ?").run(inviteId);
    return true;
  }

  // Check member count
  const count = getTeamMemberCount(invite.team_id);
  if (count >= 5) return false;

  // Add member
  db.prepare(
    `INSERT INTO team_members (id, team_id, user_id, role, invited_by, joined_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(randomUUID(), invite.team_id, userId, invite.role, invite.invited_by, now);

  // Delete invite
  db.prepare("DELETE FROM team_invites WHERE id = ?").run(inviteId);

  return true;
}

export function removeMember(teamId: string, userId: string): boolean {
  const db = getDb();

  // Can't remove owner
  if (isTeamOwner(teamId, userId)) return false;

  const result = db.prepare(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?"
  ).run(teamId, userId);

  return result.changes > 0;
}

export function leaveTeam(teamId: string, userId: string): boolean {
  const db = getDb();

  // Owner must transfer ownership first
  if (isTeamOwner(teamId, userId)) return false;

  const result = db.prepare(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?"
  ).run(teamId, userId);

  return result.changes > 0;
}

export function deleteTeam(teamId: string, userId: string): boolean {
  const db = getDb();

  // Only owner can delete
  if (!isTeamOwner(teamId, userId)) return false;

  db.prepare("DELETE FROM team_invites WHERE team_id = ?").run(teamId);
  db.prepare("DELETE FROM team_members WHERE team_id = ?").run(teamId);
  db.prepare("DELETE FROM teams WHERE id = ?").run(teamId);

  return true;
}

export function updateTeamMemberRole(teamId: string, userId: string, role: string): boolean {
  const db = getDb();

  // Can't change owner role
  if (isTeamOwner(teamId, userId)) return false;

  const result = db.prepare(
    "UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?"
  ).run(role, teamId, userId);

  return result.changes > 0;
}

export function getTeamClients(teamId: string): Array<{ id: string; name: string; email: string; address: string }> {
  const db = getDb();
  return db.prepare(
    "SELECT id, name, email, address FROM clients WHERE team_id = ? ORDER BY name COLLATE NOCASE"
  ).all(teamId) as Array<{ id: string; name: string; email: string; address: string }>;
}

export function getTeamInvoices(teamId: string): Array<{ id: string; number: string; status: string; total: number; currency: string; client_name: string; created_at: number; updated_at: number }> {
  const db = getDb();
  return db.prepare(
    "SELECT id, number, status, total, currency, client_name, created_at, updated_at FROM invoices WHERE team_id = ? ORDER BY updated_at DESC"
  ).all(teamId) as Array<{ id: string; number: string; status: string; total: number; currency: string; client_name: string; created_at: number; updated_at: number }>;
}
