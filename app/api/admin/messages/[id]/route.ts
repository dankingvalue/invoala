import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(_req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await dbGet<{ id: string; user_id: string; status: string; subject: string; user_email: string; user_name: string; created_at: number; updated_at: number }>(
    `SELECT c.*, u.email as user_email, u.name as user_name
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?`,
    id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await dbAll("SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC", id);

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

  // Add support message
  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'support', ?, ?, ?)`,
    randomUUID(), id, user.id, content, now
  );

  // Update status to human support if it was escalated
  if (conversation.status === "escalated") {
    await dbRun("UPDATE conversations SET status = 'support', updated_at = ? WHERE id = ?", now, id);
  } else {
    await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now, id);
  }

  return Response.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
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

  await dbRun("UPDATE conversations SET status = ?, updated_at = ? WHERE id = ?", status, Date.now(), id);

  return Response.json({ ok: true });
}
