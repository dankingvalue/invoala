import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbRun } from "@/lib/db";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  let body: { rating?: number; comment?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.rating || body.rating < 1 || body.rating > 5) {
    return Response.json({ error: "Rating must be 1-5." }, { status: 400 });
  }

  const conversation = await dbGet<{ id: string; user_id: string; status: string }>(
    "SELECT id, user_id, status FROM conversations WHERE id = ? AND user_id = ?",
    id, user.id
  );

  if (!conversation) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  if (conversation.status !== "resolved") {
    return Response.json({ error: "You can only rate resolved conversations." }, { status: 400 });
  }

  const existing = await dbGet<{ rating: number }>(
    "SELECT rating FROM conversations WHERE id = ? AND rating IS NOT NULL",
    id
  );
  if (existing) {
    return Response.json({ error: "Already rated." }, { status: 400 });
  }

  const comment = body.comment?.trim().slice(0, 500) || null;
  const now = Date.now();

  await dbRun(
    "UPDATE conversations SET rating = ?, rating_comment = ?, rating_at = ? WHERE id = ?",
    body.rating, comment, now, id
  );

  await logAudit({
    action: "conversation_status",
    targetId: id,
    targetType: "conversation",
    details: { rating: body.rating, comment },
    req,
  });

  return Response.json({ ok: true });
}
