import { getSessionUser } from "@/lib/server-auth";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const pageSize = 50;

  const db = getDb();
  const where = q ? "WHERE u.email LIKE ?" : "";
  const like = `%${q}%`;
  const total = (
    db.prepare(`SELECT COUNT(*) AS n FROM users u ${where}`).get(...(q ? [like] : [])) as { n: number }
  ).n;

  const rows = db
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, s.plan, s.status AS sub_status,
              s.cancel_at_period_end, s.current_period_end
       FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id
       ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...(q ? [like] : []), pageSize, (page - 1) * pageSize) as Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: number;
    plan: string | null;
    sub_status: string | null;
    cancel_at_period_end: number | null;
    current_period_end: number | null;
  }>;

  return Response.json({
    total,
    page,
    pageSize,
    users: rows.map((r) => ({
      ...r,
      cancel_at_period_end: !!r.cancel_at_period_end,
      isPro:
        ["admin", "superadmin"].includes(r.role) ||
        (r.sub_status === "active" && !!r.current_period_end && r.current_period_end > Date.now()),
    })),
  });
}
