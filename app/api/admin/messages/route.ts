import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";
import { redactEmail } from "@/lib/redact";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "all";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const isSupport = user.role === "support";

  let where = "";
  let statusParam: string | null = null;
  if (status !== "all") {
    where = "WHERE c.status = ?";
    statusParam = status;
  }

  const conversations = await dbAll<{
    id: string; user_id: string; status: string; subject: string;
    user_email: string; user_name: string;
    last_message: string; last_sender: string; unread_count: number;
    rating: number | null;
    created_at: number; updated_at: number;
  }>(`    SELECT c.*, u.email as user_email, u.name as user_name,
      (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT sender_type FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_sender,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_type = 'user' AND created_at > COALESCE(
        (SELECT created_at FROM messages WHERE conversation_id = c.id AND sender_type != 'user' ORDER BY created_at DESC LIMIT 1), 0
      )) as unread_count
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    ${where}
    ORDER BY c.updated_at DESC
    LIMIT ? OFFSET ?
  `, ...(statusParam !== null ? [statusParam, limit, offset] : [limit, offset]));

  const total = await dbGet<{ count: number }>(
    statusParam !== null
      ? `SELECT COUNT(*) as count FROM conversations c WHERE c.status = ?`
      : `SELECT COUNT(*) as count FROM conversations c`,
    ...(statusParam !== null ? [statusParam] : [])
  );

  return Response.json({
    conversations: conversations.map((c) => ({
      ...c,
      user_email: isSupport ? redactEmail(c.user_email) : c.user_email,
    })),
    total: total?.count ?? 0,
    page,
    totalPages: Math.ceil((total?.count ?? 0) / limit)
  });
}
