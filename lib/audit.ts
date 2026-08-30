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
  | "impersonate";

export async function logAudit(opts: {
  action: AuditAction;
  targetId?: string;
  targetType?: string;
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
      `INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, target_id, target_type, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      actor.id,
      actor.email,
      actor.role,
      opts.action,
      opts.targetId ?? null,
      opts.targetType ?? null,
      opts.details ? JSON.stringify(opts.details) : null,
      ip,
      Date.now()
    );
  } catch {
    // audit logging must never break the request
  }
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
