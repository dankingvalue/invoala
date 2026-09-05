import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";
import { PLANS, type PlanId } from "@/lib/billing";
import { resolveRange } from "@/lib/date-range";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const { from, to, range } = resolveRange(
    url.searchParams.get("range"),
    url.searchParams.get("from"),
    url.searchParams.get("to"),
  );

  const users = (await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM users"))?.n ?? 0;
  const newUsersInRange = (
    await dbGet<{ n: number }>(
      "SELECT COUNT(*) AS n FROM users WHERE created_at BETWEEN ? AND ?", from, to,
    )
  )?.n ?? 0;
  const invoices = (await dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM invoices"))?.n ?? 0;
  const invoicesInRange = (
    await dbGet<{ n: number }>(
      "SELECT COUNT(*) AS n FROM invoices WHERE created_at BETWEEN ? AND ?", from, to,
    )
  )?.n ?? 0;

  const subs = await dbAll<{ plan: string; status: string; provider: string; email: string }>(
    `SELECT s.plan, s.status, s.provider, u.email FROM subscriptions s
     JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 200`
  );

  // Active subscriptions and MRR are a snapshot of "right now" — a date
  // range doesn't really apply to "who is currently paying us."
  const activeSubs = subs.filter((s) => s.status === "active");
  // Monthly-equivalent revenue across every real plan (Pro and Teams, both
  // monthly and yearly) — the old version only priced pro_monthly/pro_yearly
  // and silently added $0 for Teams subscribers, undercounting MRR whenever
  // any existed. Lifetime is intentionally excluded: a one-time payment
  // isn't recurring revenue.
  const mrrCents = activeSubs.reduce((sum, s) => {
    if (!(s.plan in PLANS)) return sum;
    const plan = PLANS[s.plan as PlanId];
    if (plan.interval === "month") return sum + plan.amountCents;
    if (plan.interval === "year") return sum + Math.round(plan.amountCents / 12);
    return sum;
  }, 0);

  const emailsInRange = (
    await dbGet<{ n: number }>(
      "SELECT COUNT(*) AS n FROM email_log WHERE created_at BETWEEN ? AND ?", from, to,
    )
  )?.n ?? 0;

  return Response.json({
    users,
    newUsersInRange,
    invoices,
    invoicesInRange,
    activeSubs: activeSubs.length,
    mrrCents,
    emailsInRange,
    recentSubs: subs.slice(0, 20),
    range: { from, to, id: range },
  });
}
