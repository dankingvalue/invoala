import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const weekAgo = now - 7 * 864e5;
  const monthAgo = now - 30 * 864e5;

  const users = (await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM users"))?.n ?? 0;
  const newUsers7d = (
    await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM users WHERE created_at > ?", weekAgo)
  )?.n ?? 0;
  const invoices = (await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM invoices"))?.n ?? 0;
  const invoices30d = (
    await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM invoices WHERE created_at > ?", monthAgo)
  )?.n ?? 0;

  const subs = await dbAll<{ plan: string; status: string; provider: string; email: string }>(
    `SELECT s.plan, s.status, s.provider, u.email FROM subscriptions s
     JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 200`
  );

  const activeSubs = subs.filter((s) => s.status === "active");
  const mrrCents = activeSubs.reduce((sum, s) => {
    if (s.plan === "pro_monthly") return sum + 900;
    if (s.plan === "pro_yearly") return sum + Math.round(7900 / 12);
    return sum;
  }, 0);

  const emailsSent = (
    await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM email_log WHERE created_at > ?", weekAgo)
  )?.n ?? 0;

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
