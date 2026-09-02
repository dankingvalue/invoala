import { getSessionUser } from "@/lib/server-auth";
import { dbAll, dbGet } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 500), 1), 2000);
  const offset = Math.max(Number(url.searchParams.get("offset") || 0), 0);

  const rows = await dbAll<{ email: string; source: string; created_at: number }>(
    "SELECT email, source, created_at FROM newsletter_subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?",
    limit,
    offset,
  );
  const total = await dbGet<{ n: number }>(
    "SELECT COUNT(*) AS n FROM newsletter_subscribers",
  );

  return Response.json({ subscribers: rows, total: total?.n ?? 0 });
}
