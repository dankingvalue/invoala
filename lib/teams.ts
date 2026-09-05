import { randomUUID, createHash } from "crypto";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { type TeamRole, isTeamRole } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export type Team = {
  id: string;
  name: string;
  owner_id: string;
  plan: string;
  status: string;
  logo: string;
  business_name: string;
  business_email: string;
  business_address: string;
  default_currency: string;
  default_tax_rate: number | null;
  default_notes: string;
  default_payment_instructions: string;
  created_at: number;
  updated_at: number;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
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
    `INSERT INTO teams (id, name, owner_id, plan, status, default_currency, created_at, updated_at)
     VALUES (?, ?, ?, 'teams_monthly', 'active', 'USD', ?, ?)`,
    id, name, ownerId, now, now
  );

  await dbRun(
    `INSERT INTO team_members (id, team_id, user_id, role, invited_by, joined_at)
     VALUES (?, ?, ?, 'owner', ?, ?)`,
    randomUUID(), id, ownerId, ownerId, now
  );

  const team = await getTeam(id);
  await logAudit({
    action: "team_created",
    teamId: id,
    targetType: "team",
    targetId: id,
    details: { name },
    actor: await actorFor(ownerId),
  });
  return team!;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  return (await dbGet<Team>("SELECT * FROM teams WHERE id = ?", teamId)) ?? null;
}

export type TeamWithMeta = Team & {
  my_role: TeamRole;
  member_count: number;
  pending_invite_count: number;
  owner_name: string;
  owner_email: string;
};

// Everything a team card needs (name/owner/member count/pending invites/my
// role) in one query, instead of the UI fanning out N+1 requests per card.
export async function getUserTeams(userId: string): Promise<TeamWithMeta[]> {
  return await dbAll<TeamWithMeta>(
    `SELECT t.*, tm.role AS my_role, u.name AS owner_name, u.email AS owner_email,
       (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) AS member_count,
       (SELECT COUNT(*) FROM team_invites WHERE team_id = t.id AND expires_at > ?) AS pending_invite_count
     FROM teams t
     INNER JOIN team_members tm ON t.id = tm.team_id
     INNER JOIN users u ON u.id = t.owner_id
     WHERE tm.user_id = ?
     ORDER BY t.name COLLATE NOCASE`,
    Date.now(), userId,
  );
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return await dbAll<TeamMember>(
    `SELECT tm.*, u.name, u.email
     FROM team_members tm
     INNER JOIN users u ON tm.user_id = u.id
     WHERE tm.team_id = ?
     ORDER BY CASE tm.role WHEN 'owner' THEN 0 WHEN 'admin' THEN 1 ELSE 2 END, u.name COLLATE NOCASE`,
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

// Authoritative role lookup — every server route authorizing a
// team-scoped action should go through this (or isTeamMember for a plain
// "are they on this team at all" check), not re-derive role from teams.
export async function getTeamRole(teamId: string, userId: string): Promise<TeamRole | null> {
  const row = await dbGet<{ role: string }>("SELECT role FROM team_members WHERE team_id = ? AND user_id = ?", teamId, userId);
  return row && isTeamRole(row.role) ? row.role : null;
}

export async function getTeamMemberRole(teamId: string, userId: string): Promise<string | null> {
  return getTeamRole(teamId, userId);
}

export async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
  const role = await getTeamRole(teamId, userId);
  return role === "admin" || role === "owner";
}

export async function isTeamOwner(teamId: string, userId: string): Promise<boolean> {
  const team = await getTeam(teamId);
  return team?.owner_id === userId;
}

export async function actorFor(userId: string): Promise<{ id: string; email: string; role: string }> {
  const user = await dbGet<{ email: string; role: string }>("SELECT email, role FROM users WHERE id = ?", userId);
  return { id: userId, email: user?.email ?? "", role: user?.role ?? "user" };
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

  // Ownership is never granted through an invite — only transferOwnership,
  // a separately confirmed action, can make someone owner.
  if (role !== "member" && role !== "admin") return null;

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

  await logAudit({
    action: "member_invited",
    teamId,
    targetType: "invite",
    targetId: id,
    details: { email, role },
    actor: await actorFor(invitedBy),
  });

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

export async function getTeamInvites(teamId: string): Promise<Array<{ id: string; email: string; role: string; created_at: number; expires_at: number }>> {
  return await dbAll(
    "SELECT id, email, role, created_at, expires_at FROM team_invites WHERE team_id = ? AND expires_at > ? ORDER BY created_at DESC",
    teamId, Date.now()
  );
}

export async function cancelTeamInvite(inviteId: string, teamId: string, actorId?: string): Promise<boolean> {
  const invite = await dbGet<{ email: string }>("SELECT email FROM team_invites WHERE id = ? AND team_id = ?", inviteId, teamId);
  const { changes } = await dbRun(
    "DELETE FROM team_invites WHERE id = ? AND team_id = ?",
    inviteId, teamId
  );
  if (changes > 0 && actorId) {
    await logAudit({
      action: "invite_cancelled",
      teamId,
      targetType: "invite",
      targetId: inviteId,
      details: invite ? { email: invite.email } : undefined,
      actor: await actorFor(actorId),
    });
  }
  return changes > 0;
}

// Regenerates the token/expiry on the existing invite row (rather than
// creating a second one) and returns enough to re-send the email.
export async function resendTeamInvite(
  inviteId: string,
  teamId: string,
  actorId: string,
): Promise<{ id: string; email: string; team_name: string; inviter_name: string } | null> {
  if (!(await isTeamAdmin(teamId, actorId))) return null;

  const invite = await dbGet<{ email: string }>(
    "SELECT email FROM team_invites WHERE id = ? AND team_id = ?", inviteId, teamId,
  );
  if (!invite) return null;

  const token = randomUUID();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
  await dbRun(
    "UPDATE team_invites SET token_hash = ?, expires_at = ? WHERE id = ?",
    tokenHash, expiresAt, inviteId,
  );

  const team = await getTeam(teamId);
  const actor = await actorFor(actorId);
  await logAudit({
    action: "invite_resent",
    teamId,
    targetType: "invite",
    targetId: inviteId,
    details: { email: invite.email },
    actor,
  });

  return { id: inviteId, email: invite.email, team_name: team?.name ?? "", inviter_name: actor.email };
}

export async function updateInviteRole(
  inviteId: string,
  teamId: string,
  role: string,
  actorId: string,
): Promise<boolean> {
  if (!(await isTeamAdmin(teamId, actorId))) return false;
  if (role !== "member" && role !== "admin") return false;

  const invite = await dbGet<{ email: string }>("SELECT email FROM team_invites WHERE id = ? AND team_id = ?", inviteId, teamId);
  if (!invite) return false;

  const { changes } = await dbRun(
    "UPDATE team_invites SET role = ? WHERE id = ? AND team_id = ?",
    role, inviteId, teamId,
  );
  if (changes > 0) {
    await logAudit({
      action: "invite_role_changed",
      teamId,
      targetType: "invite",
      targetId: inviteId,
      details: { email: invite.email, role },
      actor: await actorFor(actorId),
    });
  }
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

export async function removeMember(teamId: string, userId: string, actorId?: string): Promise<boolean> {
  // Can't remove owner
  if (await isTeamOwner(teamId, userId)) return false;

  const { changes } = await dbRun(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
    teamId, userId
  );

  if (changes > 0 && actorId) {
    const removed = await dbGet<{ email: string }>("SELECT email FROM users WHERE id = ?", userId);
    await logAudit({
      action: "member_removed",
      teamId,
      targetType: "user",
      targetId: userId,
      details: removed ? { email: removed.email } : undefined,
      actor: await actorFor(actorId),
    });
  }

  return changes > 0;
}

export async function leaveTeam(teamId: string, userId: string): Promise<boolean> {
  // Owner must transfer ownership first
  if (await isTeamOwner(teamId, userId)) return false;

  const { changes } = await dbRun(
    "DELETE FROM team_members WHERE team_id = ? AND user_id = ?",
    teamId, userId
  );

  if (changes > 0) {
    await logAudit({
      action: "member_left",
      teamId,
      targetType: "user",
      targetId: userId,
      actor: await actorFor(userId),
    });
  }

  return changes > 0;
}

export async function deleteTeam(teamId: string, userId: string): Promise<boolean> {
  // Only owner can delete
  if (!(await isTeamOwner(teamId, userId))) return false;

  const team = await getTeam(teamId);
  await logAudit({
    action: "team_deleted",
    teamId,
    targetType: "team",
    targetId: teamId,
    details: team ? { name: team.name } : undefined,
    actor: await actorFor(userId),
  });

  // Historical financial records (invoices/payments/clients) are kept —
  // only the workspace's own rows (membership/invites/the team itself) are
  // removed. Their team_id is left pointing at a now-gone id rather than
  // nulled out, same as how a deleted client leaves invoices' client_id
  // NULL via ON DELETE SET NULL: the invoice/payment/client rows themselves
  // are never destroyed by a workspace deletion.
  await dbRun("DELETE FROM team_invites WHERE team_id = ?", teamId);
  await dbRun("DELETE FROM team_members WHERE team_id = ?", teamId);
  await dbRun("DELETE FROM teams WHERE id = ?", teamId);

  return true;
}

export async function archiveTeam(teamId: string, actorId: string, archived: boolean): Promise<boolean> {
  if (!(await isTeamOwner(teamId, actorId))) return false;

  const { changes } = await dbRun(
    "UPDATE teams SET status = ?, updated_at = ? WHERE id = ?",
    archived ? "archived" : "active", Date.now(), teamId,
  );
  if (changes > 0) {
    await logAudit({
      action: archived ? "team_archived" : "team_unarchived",
      teamId,
      targetType: "team",
      targetId: teamId,
      actor: await actorFor(actorId),
    });
  }
  return changes > 0;
}

export type TeamSettingsInput = {
  name?: string;
  logo?: string;
  businessName?: string;
  businessEmail?: string;
  businessAddress?: string;
  defaultCurrency?: string;
  defaultTaxRate?: number | null;
  defaultNotes?: string;
  defaultPaymentInstructions?: string;
};

export async function updateTeamSettings(teamId: string, actorId: string, input: TeamSettingsInput): Promise<Team | null> {
  if (!(await isTeamAdmin(teamId, actorId))) return null;

  const current = await getTeam(teamId);
  if (!current) return null;

  const name = input.name !== undefined ? input.name.trim() : current.name;
  if (!name || name.length > 80) return null;

  await dbRun(
    `UPDATE teams SET name = ?, logo = ?, business_name = ?, business_email = ?, business_address = ?,
      default_currency = ?, default_tax_rate = ?, default_notes = ?, default_payment_instructions = ?, updated_at = ?
     WHERE id = ?`,
    name,
    input.logo ?? current.logo,
    input.businessName ?? current.business_name,
    input.businessEmail ?? current.business_email,
    input.businessAddress ?? current.business_address,
    input.defaultCurrency ?? current.default_currency,
    input.defaultTaxRate !== undefined ? input.defaultTaxRate : current.default_tax_rate,
    input.defaultNotes ?? current.default_notes,
    input.defaultPaymentInstructions ?? current.default_payment_instructions,
    Date.now(),
    teamId,
  );

  await logAudit({
    action: "team_updated",
    teamId,
    targetType: "team",
    targetId: teamId,
    actor: await actorFor(actorId),
  });

  return getTeam(teamId);
}

// The only path by which team_members.role can become 'owner' or
// teams.owner_id can change — a normal role edit (updateTeamMemberRole)
// explicitly can't reach either.
export async function transferOwnership(teamId: string, actorId: string, newOwnerUserId: string): Promise<boolean> {
  if (!(await isTeamOwner(teamId, actorId))) return false;
  if (actorId === newOwnerUserId) return false;
  if (!(await isTeamMember(teamId, newOwnerUserId))) return false;

  await dbRun("UPDATE teams SET owner_id = ?, updated_at = ? WHERE id = ?", newOwnerUserId, Date.now(), teamId);
  await dbRun("UPDATE team_members SET role = 'owner' WHERE team_id = ? AND user_id = ?", teamId, newOwnerUserId);
  await dbRun("UPDATE team_members SET role = 'admin' WHERE team_id = ? AND user_id = ?", teamId, actorId);

  const newOwner = await dbGet<{ email: string }>("SELECT email FROM users WHERE id = ?", newOwnerUserId);
  await logAudit({
    action: "ownership_transferred",
    teamId,
    targetType: "user",
    targetId: newOwnerUserId,
    details: newOwner ? { newOwnerEmail: newOwner.email } : undefined,
    actor: await actorFor(actorId),
  });

  return true;
}

export async function updateTeamMemberRole(teamId: string, userId: string, role: string, actorId?: string): Promise<boolean> {
  // Can't change owner role, and this endpoint can never grant ownership —
  // see transferOwnership for that separately confirmed action.
  if (role !== "member" && role !== "admin") return false;
  if (await isTeamOwner(teamId, userId)) return false;

  const { changes } = await dbRun(
    "UPDATE team_members SET role = ? WHERE team_id = ? AND user_id = ?",
    role, teamId, userId
  );

  if (changes > 0 && actorId) {
    const target = await dbGet<{ email: string }>("SELECT email FROM users WHERE id = ?", userId);
    await logAudit({
      action: "member_role_changed",
      teamId,
      targetType: "user",
      targetId: userId,
      details: target ? { email: target.email, role } : { role },
      actor: await actorFor(actorId),
    });
  }

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

export type TeamOverviewStats = {
  memberCount: number;
  pendingInviteCount: number;
  clientCount: number;
  invoiceCount: number;
  // Per-currency, since a workspace isn't guaranteed to bill in just one.
  byCurrency: Array<{ currency: string; outstanding: number; paid: number }>;
};

// Aggregate counts via COUNT(*) rather than fetching full rows — only the
// money breakdown needs row-level data (to reuse the same paid/outstanding
// derivation as the Documents tab: lib/invoice-status.ts's remainingBalance,
// fed by each invoice's stored status/total and its data blob's amountPaid).
export async function getTeamOverviewStats(teamId: string): Promise<TeamOverviewStats> {
  const [memberRow, inviteRow, clientRow, invoiceRows] = await Promise.all([
    dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM team_members WHERE team_id = ?", teamId),
    dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM team_invites WHERE team_id = ? AND expires_at > ?", teamId, Date.now()),
    dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM clients WHERE team_id = ?", teamId),
    dbAll<{ status: string; total: number; currency: string; data: string }>(
      "SELECT status, total, currency, data FROM invoices WHERE team_id = ?", teamId,
    ),
  ]);

  const byCurrency = new Map<string, { outstanding: number; paid: number }>();
  for (const row of invoiceRows) {
    const currency = row.currency || "USD";
    const bucket = byCurrency.get(currency) ?? { outstanding: 0, paid: 0 };
    let amountPaid = 0;
    if (row.status === "paid") {
      amountPaid = row.total || 0;
    } else {
      try {
        const parsed = JSON.parse(row.data) as { amountPaid?: number };
        amountPaid = typeof parsed.amountPaid === "number" ? parsed.amountPaid : 0;
      } catch {}
    }
    bucket.paid += amountPaid;
    if (row.status !== "paid" && row.status !== "void" && row.status !== "cancelled") {
      bucket.outstanding += Math.max(0, (row.total || 0) - amountPaid);
    }
    byCurrency.set(currency, bucket);
  }

  return {
    memberCount: memberRow?.n ?? 0,
    pendingInviteCount: inviteRow?.n ?? 0,
    clientCount: clientRow?.n ?? 0,
    invoiceCount: invoiceRows.length,
    byCurrency: [...byCurrency.entries()].map(([currency, v]) => ({ currency, ...v })),
  };
}
