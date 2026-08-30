import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";
import { generateSupportSuggestion } from "@/lib/ai";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { conversationId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.conversationId) {
    return Response.json({ error: "conversationId required." }, { status: 400 });
  }

  const messages = await dbAll<{ sender_type: string; content: string }>(
    "SELECT sender_type, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
    body.conversationId
  );

  if (messages.length === 0) {
    return Response.json({ error: "No messages found." }, { status: 404 });
  }

  const suggestion = await generateSupportSuggestion(messages);

  return Response.json({ ok: true, suggestion });
}
