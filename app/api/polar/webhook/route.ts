import { verifyPolarWebhook } from "@/lib/polar";
import { activatePaymentSubscription, revokeSubscription, isPlan } from "@/lib/billing";
import { dbGet, dbRun } from "@/lib/db";
import { createTeam, getUserTeams } from "@/lib/teams";

type PolarMeta = {
  userId?: string;
  plan?: string;
};

async function activate(userId: string, plan: string, customerId: string | null, subscriptionId: string | null, periodEnd?: number) {
  if (!userId || !isPlan(plan)) return;
  const end = periodEnd || Date.now() + (plan === "pro_yearly" || plan === "teams_yearly" ? 365 : plan === "lifetime" ? 36500 : 30) * 864e5;
  await activatePaymentSubscription({
    userId,
    plan,
    customerId,
    subscriptionId,
    currentPeriodEnd: end,
    provider: "polar",
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
  if (!verifyPolarWebhook(payload, req.headers)) {
    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const type = event.type || "";
  const data = event.data ?? {};
  const metadata = (data.metadata ?? {}) as PolarMeta;

  if (type === "checkout.updated") {
    const status = String(data.status || "");
    if (status === "succeeded") {
      const userId = String(data.external_customer_id || metadata.userId || "");
      const plan = metadata.plan || "";
      await activate(
        userId,
        plan,
        typeof data.customer_id === "string" ? data.customer_id : null,
        typeof data.subscription_id === "string" ? data.subscription_id : null
      );
    }
  }

  if (type === "subscription.updated" || type === "subscription.active") {
    const status = String(data.status || "active");
    const userId = metadata.userId || "";
    const plan = metadata.plan || "";
    const periodEndRaw = data.current_period_end;
    const periodEnd =
      typeof periodEndRaw === "string" && !Number.isNaN(Date.parse(periodEndRaw))
        ? Date.parse(periodEndRaw)
        : undefined;
    if (status === "active" || status === "trialing") {
      await activate(
        userId,
        plan,
        typeof data.customer_id === "string" ? data.customer_id : null,
        typeof data.id === "string" ? data.id : null,
        periodEnd
      );
    } else if (status === "past_due") {
      if (userId) {
        await dbRun(
          "UPDATE subscriptions SET status='past_due', updated_at=? WHERE user_id=? AND provider='polar'",
          Date.now(), userId
        );
      }
    }
  }

  if (type === "subscription.revoked") {
    const userId = metadata.userId || "";
    if (userId) {
      await revokeSubscription(userId);
    }
  }

  if (type === "subscription.canceled") {
    const userId = metadata.userId || "";
    if (userId) {
      await dbRun(
        "UPDATE subscriptions SET cancel_at_period_end = 1, updated_at=? WHERE user_id=? AND provider='polar'",
        Date.now(), userId
      );
    }
  }

  if (type === "order.paid") {
    const userId = String(data.external_customer_id || metadata.userId || "");
    const plan = metadata.plan || "";
    await activate(
      userId,
      plan,
      typeof data.customer_id === "string" ? data.customer_id : null,
      typeof data.subscription_id === "string" ? data.subscription_id : null
    );
  }

  return Response.json({ received: true });
}
