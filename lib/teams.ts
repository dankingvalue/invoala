import { randomUUID, createHash } from "crypto";
import { dbGet, dbAll, dbRun } from "@/lib/db";

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

export async function createTeam(ownerId: string, name: string): Promise<Team> {
  const now = Date.now();
  const id = randomUUID();

  await dbRun(
    `INSERT INTO teams (id, name, owner_id, plan, created_at, updated_at)
     VALUES (?, ?, ?, 'teams_monthly', ?, ?)`,
    id, name, ownerId, now, now
  );

  // Add owner as admin member
  await dbRun(
    `INSERT INTO team_members (id, team_id, user_id, role, invited_by, joined_at)
     VALUES (?, ?, ?, 'admin', ?, ?)`,
    randomUUID(), id, ownerId, ownerId, now
  );

  return { id, name, owner_id: ownerId, plan: "teams_monthly", created_at: now, updated_at: now };
}

export async function getTeam(teamId: string): Promise<Team | null> {
  return (await dbGet<Team>("SELECT * FROM teams WHERE id = ?", teamId)) ?? null;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  return await dbAll<Team>(
    `SELECT t.* FROM teams t
     INNER JOIN team_members tm ON t.id = tm.team_id
     WHERE tm.user_id = ?
     ORDER BY t.name COLLATE NOCASE`,
    userId
  );
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return await dbAll<TeamMember>(
    `SELECT tm.*, u.name, u.email
     FROM team_members tm
     INNER JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = ?
     ORDER BY tm.role DESC, u.name COLLATE NOCASE`,
    teamId
  );
}

export async function getTeamMemberCount(teamId: string): Promise<number> {
  const row = await dbGet<{ count: number }>("SELECT COUNT(*) as count FROM team_members WHERE team_id = ?", teamId);
  return row?.count ?? 0;
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
  const row = await dbGet("SELECT id FROM team_members WHERE team_id = ? AND user_id = ?", teamId, userId);
  return !!row;
}

export async function getTeamMemberRole(teamId: string, userId: string): Promise<string | null> {
  const row = await dbGet<{ role: string }>("SELECT role FROM team_members WHERE team_id = ? AND user_id = ?", teamId, userId);
  return row?.role ?? null;
}

export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const role = await getTeamMemberRole(teamId, userId);
  return role === "admin" || role === "owner";
}

export async function isTeamOwner(teamId: string, userId: string): Promise<boolean> {
  const team = await getTeam(teamId);
  return team?.owner_id === userId;
}

export async function inviteToTeam(
  teamId: string,
  email: string,
  role: string,
  invitedBy: string
): Promise<TeamInvite | null> {
  const now = Date.now();

  // Check team exists
  const team = await getTeam(teamId);
  if (!team) return null;

  // Check inviter is admin
  if (!(await isTeamAdmin(teamId, invitedBy))) return null;

  // Check member count limit (5 for teams plan)
  const count = await getTeamMemberCount(teamId);
  if (count >= 5) return null;

  // Check if already a member
  const existingUser = await dbGet<{ id: string }>("SELECT id FROM users WHERE email = ?", email);
  if (existingUser && await isTeamMember(teamId, existingUser.id)) return null;

  // Check for existing invite
  const existingInvite = await dbGet(
    "SELECT id FROM team_invites WHERE team_id = ? AND email = ? AND expires_at > ?",
    teamId, email, now
  );
  if (existingInvite) return null;

  const id = randomUUID();
  const token = randomUUID();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = now + 7 * 24 * 60 * 60 * 1000; // 7 days

  await dbRun(
    `INSERT INTO team_invites (id, team_id, email, role, invited_by, token_hash, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id, teamId, email, role, invitedBy, tokenHash, expiresAt, now
  );

  const inviter = await dbGet<{ name: string }>("SELECT name FROM users WHERE id = ?", invitedBy);

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

export async function getTeamInvites(teamId: string): Promise<Array<{ id: string; email: string; role: string; created_at: number }>> {
  return await dbAll(
    "SELECT id, email, role, created_at FROM team_invites WHERE team_id = ? AND expires_at > ? ORDER BY created_at DESC",
    teamId, Date.now()
  );
}

export async function cancelTeamInvite(inviteId: string, teamId: string): Promise<boolean> {
  const { changes } = await dbRun(
    "DELETE FROM team_invites WHERE id = ? AND team_id = ?",
    inviteId, teamId
  );
  return changes > 0;
}

export async function getUserInvites(userId: string): Promise<TeamInvite[]> {
  const user = await dbGet<{ email: string }>("SELECT email FROM users WHERE id = ?", userId);
  if (!user) return [];

  return await dbAll<TeamInvite>(
    `SELECT ti.*, t.name as team_name, u.name as inviter_name
     FROM team_invites ti
     INNER JOIN teams t ON ti.team_id = t.id
     INNER JOIN users u ON ti.invited_by = u.id
     WHERE ti.email = ? AND ti.expires_at > ?
     ORDER BY ti.created_at DESC`,
    user.email, Date.now()
  );
}

export async function acceptInvite(inviteId: string, userId: string): Promise<boolean> {
  const now = Date.now();

  const invite = await dbGet<{ team_id: string; email: string; role: string; invited_by: string }>(
    "SELECT * FROM team_invites WHERE id = ? AND expires_at > ?",
    inviteId, now
  );

  if (!invite) return false;

  // Verify email matches
  const user = await dbGet<{ email: string }>("SELECT email FROM users WHERE id = ?", userId);
  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) return false;

  // Check not already a member
  if (await isTeamMember(invite.team_id, userId)) {
    await dbRun("DELETE FROM team_invites WHERE id = ?", inviteId);
    return true;
  }

  // Check member count
  const count = await getTeamMemberCount(invite.team_id);
  if (count >= 5) return false;

  // Add member
  await dbRun(
    `INSERT INTO team_members (id, team_id, user_id, role, invited_by, joined_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    randomUUID(), invite.team_id, userId, invite.role, invite.invited_by, now
  );

  // Delete invite
  await dbRun("DELETE FROM team_invites WHERE id = ?", inviteId);

  return true;
}

export async function declineInvite(inviteId: string, userId: string): Promise<boolean> {
  const invite = await dbGet<{ email: string }>(
    "SELECT email FROM team_invites WHERE id = ? AND expires_at > ?",
    inviteId, Date.now()
  );
  if (!invite) return false;

  const user = await dbGet<{ email: string }>("SELECT email FROM users WHERE id = ?", userId);
  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) return false;

  await dbRun("DELETE FROM team_invites WHERE id = ?", inviteId);
  return true;
}

export async function removeMember(teamId: string, userId: string): Promise<boolean> {
  // Can't remove owner
  if (await isTeamOwner(teamId, userId)) return false;

  const { changes } = await dbRun(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
    teamId, userId
  );

  return changes > 0;
}

export async function leaveTeam(teamId: string, userId: string): Promise<boolean> {
  // Owner must transfer ownership first
  if (await isTeamOwner(teamId, userId)) return false;

  const { changes } = await dbRun(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
    teamId, userId
  );

  return changes > 0;
}

export async function deleteTeam(teamId: string, userId: string): Promise<boolean> {
  // Only owner can delete
  if (!(await isTeamOwner(teamId, userId))) return false;

  await dbRun("DELETE FROM team_invites WHERE team_id = ?", teamId);
  await dbRun("DELETE FROM team_members WHERE team_id = ?", teamId);
  await dbRun("DELETE FROM teams WHERE id = ?", teamId);

  return true;
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: string): Promise<boolean> {
  // Can't change owner role
  if (await isTeamOwner(teamId, userId)) return false;

  const { changes } = await dbRun(
    "UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?",
    role, teamId, userId
  );

  return changes > 0;
}

export async function getTeamClients(teamId: string): Promise<Array<{ id: string; name: string; email: string; address: string }>> {
  return await dbAll(
    "SELECT id, name, email, address FROM clients WHERE team_id = ? ORDER BY name COLLATE NOCASE",
    teamId
  );
}

export async function getTeamInvoices(teamId: string): Promise<Array<{ id: string; number: string; status: string; total: number; currency: string; client_name: string; created_at: number; updated_at: number }>> {
  return await dbAll(
    "SELECT id, number, status, total, currency, client_name, created_at, updated_at FROM invoices WHERE team_id = ? ORDER BY updated_at DESC",
    teamId
  );
}
