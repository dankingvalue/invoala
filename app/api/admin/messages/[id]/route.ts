import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(_req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await dbGet<{
    id: string; user_id: string; status: string; subject: string;
    rating: number | null; rating_comment: string | null; rating_at: number | null;
    user_email: string; user_name: string;
    created_at: number; updated_at: number;
  }>(
    `SELECT c.*, u.email as user_email, u.name as user_name
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?`,
    id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await dbAll<{
    id: string; conversation_id: string; sender_type: string; sender_id: string | null;
    content: string; created_at: number;
  } & { sender_name?: string }>(
    `SELECT m.*, u.name as sender_name
     FROM messages m
     LEFT JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    id
  );

  return Response.json({ conversation, messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let content = "";
  try {
    const body = (await req.json()) as { content?: string };
    content = typeof body.content === "string" ? body.content.trim() : "";
  } catch {}

  if (!content) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const conversation = await dbGet<{ id: string; status: string }>(
    "SELECT * FROM conversations WHERE id = ?",
    id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const now = Date.now();

  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'support', ?, ?, ?)`,
    randomUUID(), id, user.id, content, now
  );

  if (conversation.status === "escalated") {
    await dbRun("UPDATE conversations SET status = 'support', updated_at = ? WHERE id = ?", now, id);
  } else {
    await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now, id);
  }

  await logAudit({
    action: "conversation_reply",
    targetId: id,
    targetType: "conversation",
    details: { contentPreview: content.slice(0, 200) },
    req,
  });

  return Response.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let status = "";
  try {
    const body = (await req.json()) as { status?: string };
    status = typeof body.status === "string" ? body.status : "";
  } catch {}

  if (!status || !["ai", "escalated", "support", "resolved"].includes(status)) {
    return Response.json({ error: "Invalid status." }, { status: 400 });
  }

  const old = await dbGet<{ status: string }>("SELECT status FROM conversations WHERE id = ?", id);

  await dbRun("UPDATE conversations SET status = ?, updated_at = ? WHERE id = ?", status, Date.now(), id);

  await logAudit({
    action: "conversation_status",
    targetId: id,
    targetType: "conversation",
    details: { from: old?.status, to: status },
    req,
  });

  return Response.json({ ok: true });
}
