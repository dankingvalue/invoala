import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { generateAiResponse, sendToTelegram } from "@/lib/ai";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await dbAll(`
    SELECT c.*,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT sender_type FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_type = 'user' AND created_at > COALESCE(
        (SELECT created_at FROM messages WHERE conversation_id = c.id AND sender_type != 'user' ORDER BY created_at DESC LIMIT 1), 0
      )) as unread_count
    FROM conversations c
    WHERE c.user_id = ?
    ORDER BY c.updated_at DESC
  `, user.id);

  return Response.json({ conversations });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let subject = "";
  let content = "";
  try {
    const body = (await req.json()) as { subject?: string; content?: string };
    subject = typeof body.subject === "string" ? body.subject.trim() : "";
    content = typeof body.content === "string" ? body.content.trim() : "";
  } catch {}

  if (!content) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const convId = randomUUID();
  const now = Date.now();

  await dbRun(
    `INSERT INTO conversations (id, user_id, status, subject, created_at, updated_at)
    VALUES (?, ?, 'ai', ?, ?, ?)`,
    convId, user.id, subject || "Support request", now, now
  );

  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'user', ?, ?, ?)`,
    randomUUID(), convId, user.id, content, now
  );

  // Generate AI response
  const aiResponse = await generateAiResponse(content);

  if (aiResponse.escalate) {
    await dbRun("UPDATE conversations SET status = 'escalated', updated_at = ? WHERE id = ?", now, convId);

    await dbRun(
      `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
      VALUES (?, ?, 'system', NULL, ?, ?)`,
      randomUUID(), convId, "This conversation has been escalated to our support team. A team member will respond shortly.", now + 1
    );

    await sendToTelegram(user.email, content, convId);
  } else {
    await dbRun(
      `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
      VALUES (?, ?, 'ai', NULL, ?, ?)`,
      randomUUID(), convId, aiResponse.message, now + 1
    );
  }

  await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now + 1, convId);

  return Response.json({
    ok: true,
    conversationId: convId,
    escalated: aiResponse.escalate
  });
}
