import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { generateAiResponse, sendToTelegram } from "@/lib/ai";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(_req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const conversation = await dbGet<{
    id: string; user_id: string; status: string; subject: string;
    rating: number | null; rating_comment: string | null; rating_at: number | null;
    created_at: number; updated_at: number;
  }>(
    "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
    id, user.id
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

  // Auto-close: if last support message was 10+ min ago and no user reply since, resolve
  if (conversation.status === "support" || conversation.status === "escalated") {
    const lastSupportMsg = [...messages].reverse().find(
      (m) => m.sender_type === "support" || m.sender_type === "system"
    );
    const lastUserMsg = [...messages].reverse().find((m) => m.sender_type === "user");
    if (lastSupportMsg && (!lastUserMsg || lastUserMsg.created_at < lastSupportMsg.created_at)) {
      const elapsed = Date.now() - lastSupportMsg.created_at;
      if (elapsed > 10 * 60 * 1000) {
        await dbRun("UPDATE conversations SET status = 'resolved', updated_at = ? WHERE id = ?", Date.now(), id);
        conversation.status = "resolved";
      }
    }
  }

  // Mark as read
  await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", Date.now(), id);

  return Response.json({ conversation, messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
    "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
    id, user.id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (conversation.status === "resolved") {
    return Response.json({ error: "This conversation is resolved." }, { status: 400 });
  }

  const now = Date.now();

  // Add user message
  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'user', ?, ?, ?)`,
    randomUUID(), id, user.id, content, now
  );

  await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now, id);

  // If conversation is in AI mode, generate AI response
  if (conversation.status === "ai") {
    const aiResponse = await generateAiResponse(content);

    if (aiResponse.escalate) {
      await dbRun("UPDATE conversations SET status = 'escalated', updated_at = ? WHERE id = ?", now + 1, id);

      await dbRun(
        `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
        VALUES (?, ?, 'system', NULL, ?, ?)`,
        randomUUID(), id, "This conversation has been escalated to our support team. A team member will respond shortly.", now + 1
      );

      await sendToTelegram(user.email, content, id);
    } else {
      await dbRun(
        `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
        VALUES (?, ?, 'ai', NULL, ?, ?)`,
        randomUUID(), id, aiResponse.message, now + 1
      );
    }

    await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now + 1, id);
  }

  return Response.json({ ok: true });
}
