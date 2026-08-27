import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";

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

  let where = "";
  if (status !== "all") {
    where = `WHERE c.status = '${status}'`;
  }

  const conversations = await dbAll(`
    SELECT c.*, u.email as user_email, u.name as user_name,
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
  `, limit, offset);

  const total = await dbGet<{ count: number }>(`SELECT COUNT(*) as count FROM conversations c ${where}`);

  return Response.json({
    conversations,
    total: total?.count ?? 0,
    page,
    totalPages: Math.ceil((total?.count ?? 0) / limit)
  });
}
