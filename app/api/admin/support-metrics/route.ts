import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";
import { redactEmail } from "@/lib/redact";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const days30 = now - 30 * 864e5;

  const openChats = (await dbGet<{ n: number }>(
    "SELECT COUNT(*) AS n FROM conversations WHERE status IN ('support', 'escalated')"
  ))?.n ?? 0;

  const ratingRow = await dbGet<{ n: number; avg: number | null }>(
    "SELECT COUNT(*) AS n, AVG(rating) AS avg FROM conversations WHERE rating IS NOT NULL AND rating_at > ?",
    days30
  );
  const ratingsCount = ratingRow?.n ?? 0;
  const avgRating = ratingRow?.avg ?? 0;

  // First reply time: time from the user's first message to the first staff message
  const firstReplies = await dbAll<{ first_user: number; first_staff: number }>(
    `SELECT MIN(u.created_at) AS first_user, MIN(s.created_at) AS first_staff
     FROM conversations c
     JOIN messages u ON u.conversation_id = c.id AND u.sender_type = 'user'
     JOIN messages s ON s.conversation_id = c.id AND s.sender_type IN ('support', 'ai', 'system')
     WHERE c.created_at > ?
     GROUP BY c.id
     HAVING first_staff > first_user`,
    days30
  );
  const firstReplyMinutes = firstReplies.length
    ? firstReplies.reduce((sum, r) => sum + (r.first_staff - r.first_user), 0) /
      firstReplies.length /
      60000
    : 0;

  const resRow = await dbGet<{ n: number; avg_ms: number | null }>(
    `SELECT COUNT(*) AS n, AVG(updated_at - created_at) AS avg_ms
     FROM conversations WHERE status = 'resolved' AND created_at > ?`,
    days30
  );
  const resolutionMinutes = resRow?.avg_ms ? resRow.avg_ms / 60000 : 0;

  const recentRatings = await dbAll<{
    rating: number; rating_comment: string | null; rating_at: number; email: string;
  }>(
    `SELECT c.rating, c.rating_comment, c.rating_at, u.email
     FROM conversations c
     JOIN users u ON u.id = c.user_id
     WHERE c.rating IS NOT NULL
     ORDER BY c.rating_at DESC LIMIT 10`
  );

  return Response.json({
    openChats,
    ratingsCount,
    avgRating,
    firstReplyMinutes: Math.round(firstReplyMinutes * 10) / 10,
    repliesMeasured: firstReplies.length,
    resolutionMinutes: Math.round(resolutionMinutes * 10) / 10,
    recentRatings: recentRatings.map((r) => ({
      rating: r.rating,
      comment: r.rating_comment || "",
      at: r.rating_at,
      email: redactEmail(r.email),
    })),
  });
}
