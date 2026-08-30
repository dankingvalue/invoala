import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbAll, dbRun } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; message?: string; body?: string; target?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const message = typeof body.body === "string"
    ? body.body.trim()
    : typeof body.message === "string" ? body.message.trim() : "";
  const target = body.target === "pro" ? "pro" : "all";

  if (!title || title.length > 120) {
    return Response.json({ error: "Title is required (max 120 characters)." }, { status: 400 });
  }
  if (message.length > 1000) {
    return Response.json({ error: "Message too long (max 1000 characters)." }, { status: 400 });
  }

  let userIds: Array<{ id: string }>;
  if (target === "pro") {
    userIds = await dbAll<{ id: string }>(
      `SELECT DISTINCT u.id FROM users u
       JOIN subscriptions s ON s.user_id = u.id
       WHERE s.status = 'active'`
    );
  } else {
    userIds = await dbAll<{ id: string }>("SELECT id FROM users");
  }

  const now = Date.now();
  for (const row of userIds) {
    await dbRun(
      `INSERT INTO notifications (id, user_id, type, title, body, created_at)
       VALUES (?, ?, 'broadcast', ?, ?, ?)`,
      randomUUID(), row.id, title, message, now
    );
  }

  await logAudit({
    action: "send_broadcast",
    targetType: "users",
    details: { broadcast: title, target, count: userIds.length },
    req,
  });

  return Response.json({ ok: true, count: userIds.length });
}
