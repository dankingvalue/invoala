import { getSessionUser } from "@/lib/server-auth";
import { getDb } from "@/lib/db";

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const now = Date.now();
  const weekAgo = now - 7 * 864e5;
  const monthAgo = now - 30 * 864e5;

  const users = (db.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n;
  const newUsers7d = (
    db.prepare("SELECT COUNT(*) AS n FROM users WHERE created_at > ?").get(weekAgo) as { n: number }
  ).n;
  const invoices = (db.prepare("SELECT COUNT(*) AS n FROM invoices").get() as { n: number }).n;
  const invoices30d = (
    db.prepare("SELECT COUNT(*) AS n FROM invoices WHERE created_at > ?").get(monthAgo) as { n: number }
  ).n;

  const subs = db
    .prepare(
      `SELECT s.plan, s.status, s.provider, u.email FROM subscriptions s
       JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 200`,
    )
    .all() as Array<{ plan: string; status: string; provider: string; email: string }>;

  const activeSubs = subs.filter((s) => s.status === "active");
  const mrrCents = activeSubs.reduce((sum, s) => {
    if (s.plan === "pro_monthly") return sum + 900;
    if (s.plan === "pro_yearly") return sum + Math.round(7900 / 12);
    return sum;
  }, 0);

  const emailsSent = (
    db.prepare("SELECT COUNT(*) AS n FROM email_log WHERE created_at > ?").get(weekAgo) as { n: number }
  ).n;

  return Response.json({
    users,
    newUsers7d,
    invoices,
    invoices30d,
    activeSubs: activeSubs.length,
    mrrCents,
    emailsSent7d: emailsSent,
    recentSubs: subs.slice(0, 20),
  });
}
