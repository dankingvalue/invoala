import { verifyWhopWebhook } from "@/lib/whop";
import { activatePaymentSubscription, revokeSubscription, isPlan } from "@/lib/billing";
import { dbGet, dbRun } from "@/lib/db";
import { createTeam, getUserTeams } from "@/lib/teams";

// The Membership object shape (per Whop's docs) — the source of truth for
// "is this user entitled right now," carried as `data` on every
// membership.* event and nested under `data.membership` on payment.* events.
type WhopMembership = {
  id?: string;
  status?: string;
  cancel_at_period_end?: boolean;
  renewal_period_end?: string | null;
  metadata?: { userId?: string; plan?: string } | null;
};

async function activate(userId: string, plan: string, membershipId: string | null, renewalPeriodEnd?: string | null) {
  if (!userId || !isPlan(plan)) return;
  const periodEnd =
    renewalPeriodEnd && !Number.isNaN(Date.parse(renewalPeriodEnd))
      ? Date.parse(renewalPeriodEnd)
      : Date.now() + (plan === "pro_yearly" || plan === "teams_yearly" ? 365 : plan === "lifetime" ? 36500 : 30) * 864e5;

  await activatePaymentSubscription({
    userId,
    plan,
    // Whop's membership id doubles for what Polar/Stripe called the
    // "subscription id" — Whop has no separate customer id to store.
    customerId: null,
    subscriptionId: membershipId,
    currentPeriodEnd: periodEnd,
    provider: "whop",
  });

  if (plan.startsWith("teams_")) {
    const existingTeams = await getUserTeams(userId);
    if (existingTeams.length < 3) {
      const user = await dbGet<{ name: string; email: string }>("SELECT name, email FROM users WHERE id = ?", userId);
      if (user) {
        await createTeam(userId, `${user.name || user.email}'s Team`);
      }
    }
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  if (!verifyWhopWebhook(payload, req.headers)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const type = event.type || "";
  const membership = (event.data ?? {}) as WhopMembership;
  const metadata = membership.metadata ?? {};
  const userId = metadata.userId || "";
  const plan = metadata.plan || "";
  const membershipId = typeof membership.id === "string" ? membership.id : null;

  if (type === "membership.activated") {
    if (membership.status === "active" || membership.status === "trialing") {
      await activate(userId, plan, membershipId, membership.renewal_period_end);
    }
  }

  if (type === "membership.deactivated") {
    if (userId) await revokeSubscription(userId);
  }

  if (type === "membership.cancel_at_period_end_changed") {
    if (userId) {
      await dbRun(
        "UPDATE subscriptions SET cancel_at_period_end = ?, updated_at = ? WHERE user_id = ? AND provider = 'whop'",
        membership.cancel_at_period_end ? 1 : 0,
        Date.now(),
        userId,
      );
    }
  }

  // Best-effort fallback so a completed charge still activates/renews the
  // subscription even if the corresponding membership.activated delivery is
  // delayed or lost — Whop nests the full membership under data.membership
  // on payment events (per their cross-referenced docs).
  if (type === "payment.succeeded") {
    const nested = ((event.data as { membership?: WhopMembership } | undefined)?.membership) ?? membership;
    const pMeta = nested.metadata ?? metadata;
    const pUserId = pMeta.userId || userId;
    const pPlan = pMeta.plan || plan;
    if (pUserId && isPlan(pPlan)) {
      await activate(pUserId, pPlan, (typeof nested.id === "string" ? nested.id : membershipId), nested.renewal_period_end);
    }
  }

  if (type === "payment.failed") {
    if (userId) {
      await dbRun(
        "UPDATE subscriptions SET status='past_due', updated_at=? WHERE user_id=? AND provider='whop'",
        Date.now(),
        userId,
      );
    }
  }

  return Response.json({ received: true });
}
