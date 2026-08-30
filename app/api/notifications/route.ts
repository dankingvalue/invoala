import { getSessionUser } from "@/lib/server-auth";
import { dbAll, dbRun } from "@/lib/db";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: number;
  created_at: number;
  meta: string | null;
};

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await dbAll<Notification>(
    `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    user.id
  );

  const unread = notifications.filter((n) => !n.read).length;

  return Response.json({ notifications, unread });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: { ids?: string[]; markAll?: boolean };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  if (body.markAll) {
    await dbRun(
      "UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0",
      user.id
    );
  } else if (body.ids && body.ids.length > 0) {
    for (const id of body.ids) {
      await dbRun(
        "UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?",
        id, user.id
      );
    }
  }

  return Response.json({ ok: true });
}
