import { randomUUID } from "crypto";
import { dbRun, dbAll, dbGet } from "@/lib/db";

export type AuditAction =
  | "role_change"
  | "grant_plan"
  | "revoke_plan"
  | "delete_user"
  | "flag_toggle"
  | "send_broadcast"
  | "conversation_status"
  | "conversation_reply"
  | "settings_change"
  | "danger_reset"
  | "impersonate"
  | "stop_impersonate"
  // Workspace/team activity (see lib/teams.ts and lib/data.ts) — reuses this
  // same table via the team_id column rather than a second event system.
  | "team_created"
  | "team_updated"
  | "team_archived"
  | "team_unarchived"
  | "team_deleted"
  | "ownership_transferred"
  | "member_invited"
  | "invite_resent"
  | "invite_role_changed"
  | "invite_cancelled"
  | "member_role_changed"
  | "member_removed"
  | "member_left"
  | "invoice_created"
  | "invoice_updated"
  | "invoice_status_changed"
  | "invoice_deleted"
  | "payment_recorded"
  | "payment_updated"
  | "payment_deleted"
  | "client_created"
  | "client_updated"
  | "client_deleted";

export async function logAudit(opts: {
  action: AuditAction;
  targetId?: string;
  targetType?: string;
  teamId?: string;
  details?: Record<string, unknown>;
  req?: Request;
  actor?: { id: string; email: string; role: string };
}): Promise<void> {
  try {
    let actor = opts.actor;
    if (!actor && opts.req) {
      const { getSessionUser } = await import("@/lib/server-auth");
      const user = await getSessionUser(opts.req);
      if (!user) return;
      actor = { id: user.id, email: user.email, role: user.role };
    }
    if (!actor) return;

    const ip = opts.req?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

    await dbRun(
      `INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, target_id, target_type, details, ip_address, created_at, team_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      actor.id,
      actor.email,
      actor.role,
      opts.action,
      opts.targetId ?? null,
      opts.targetType ?? null,
      opts.details ? JSON.stringify(opts.details) : null,
      ip,
      Date.now(),
      opts.teamId ?? null,
    );
  } catch {
    // audit logging must never break the request
  }
}

export type ActivityEntry = {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_id: string | null;
  target_type: string | null;
  details: string | null;
  created_at: number;
  actor_name: string;
};

export type TeamActivityFilter = {
  actorId?: string;
  action?: string;
  from?: number;
  to?: number;
  limit?: number;
  offset?: number;
};

// Workspace activity feed — team_id-scoped subset of the same audit_logs
// table platform admins already read from getAuditLogs above. Supports the
// Activity page's filters (actor/action/date range) and pagination; kept
// as a separate function from the simple getTeamActivity below so existing
// callers that just want "the last N entries" don't need to pass filters.
export async function getTeamActivityFiltered(teamId: string, filter: TeamActivityFilter): Promise<{ entries: ActivityEntry[]; total: number }> {
  const conditions = ["a.team_id = ?"];
  const args: (string | number)[] = [teamId];
  if (filter.actorId) { conditions.push("a.actor_id = ?"); args.push(filter.actorId); }
  if (filter.action) { conditions.push("a.action = ?"); args.push(filter.action); }
  if (filter.from) { conditions.push("a.created_at >= ?"); args.push(filter.from); }
  if (filter.to) { conditions.push("a.created_at <= ?"); args.push(filter.to); }
  const where = conditions.join(" AND ");
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  const offset = Math.max(filter.offset ?? 0, 0);

  const [entries, totalRow] = await Promise.all([
    dbAll<ActivityEntry>(
      `SELECT a.id, a.actor_id, a.actor_email, a.action, a.target_id, a.target_type, a.details, a.created_at,
              COALESCE(u.name, a.actor_email) AS actor_name
       FROM audit_logs a
       LEFT JOIN users u ON u.id = a.actor_id
       WHERE ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      ...args, limit, offset,
    ),
    dbGet<{ n: number }>(`SELECT COUNT(*) AS n FROM audit_logs a WHERE ${where}`, ...args),
  ]);

  return { entries, total: totalRow?.n ?? 0 };
}

// Workspace activity feed — team_id-scoped subset of the same audit_logs
// table platform admins already read from getAuditLogs above.
export async function getTeamActivity(teamId: string, limit = 100): Promise<ActivityEntry[]> {
  return await dbAll<ActivityEntry>(
    `SELECT a.id, a.actor_id, a.actor_email, a.action, a.target_id, a.target_type, a.details, a.created_at,
            COALESCE(u.name, a.actor_email) AS actor_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.actor_id
     WHERE a.team_id = ?
     ORDER BY a.created_at DESC
     LIMIT ?`,
    teamId, limit,
  );
}

export type AuditLog = {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target_id: string | null;
  target_type: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: number;
};

export async function getAuditLogs(opts: {
  page?: number;
  pageSize?: number;
  actorId?: string;
  targetId?: string;
  action?: string;
  from?: number;
  to?: number;
  viewerRole: string;
  viewerId: string;
}): Promise<{ logs: AuditLog[]; total: number; page: number; pageSize: number }> {
  const page = opts.page || 1;
  const pageSize = opts.pageSize || 50;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const args: unknown[] = [];

  // Role-based filtering
  if (opts.viewerRole === "support") {
    conditions.push("actor_id = ?");
    args.push(opts.viewerId);
  } else if (opts.viewerRole === "admin") {
    conditions.push("actor_role = ?");
    args.push("support");
  }
  // superadmin sees all — no filter

  if (opts.actorId) {
    conditions.push("actor_id = ?");
    args.push(opts.actorId);
  }
  if (opts.targetId) {
    conditions.push("target_id = ?");
    args.push(opts.targetId);
  }
  if (opts.action) {
    conditions.push("action = ?");
    args.push(opts.action);
  }
  if (opts.from) {
    conditions.push("created_at >= ?");
    args.push(opts.from);
  }
  if (opts.to) {
    conditions.push("created_at <= ?");
    args.push(opts.to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await dbGet<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM audit_logs ${where}`,
    ...args
  );
  const total = countRow?.cnt ?? 0;

  const logs = await dbAll<AuditLog>(
    `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    ...args,
    pageSize,
    offset
  );

  return { logs, total, page, pageSize };
}
