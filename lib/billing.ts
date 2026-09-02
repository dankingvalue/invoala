import { randomUUID } from "crypto";
import { dbGet, dbRun } from "@/lib/db";

export const PLANS = {
  pro_monthly: { label: "Pro Monthly", amountCents: 900, interval: "month" as const },
  pro_yearly: { label: "Pro Yearly", amountCents: 7900, interval: "year" as const },
  teams_monthly: { label: "Teams Monthly", amountCents: 2900, interval: "month" as const },
  teams_yearly: { label: "Teams Yearly", amountCents: 24900, interval: "year" as const },
  lifetime: { label: "Lifetime", amountCents: 49900, interval: "lifetime" as const },
};

export type PlanId = keyof typeof PLANS;

export type Subscription = {
  id: string;
  plan: string;
  status: string;
  provider: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
};

export function isPlan(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}

function periodMs(plan: PlanId): number {
  if (PLANS[plan].interval === "lifetime") return 36500 * 864e5; // 100 years
  return PLANS[plan].interval === "year" ? 365 * 864e5 : 30 * 864e5;
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const row = await dbGet<{
    id: string;
    plan: string;
    status: string;
    provider: string;
    current_period_end: number;
    cancel_at_period_end: number;
  }>("SELECT * FROM subscriptions WHERE user_id = ?", userId);
  if (!row) return null;

  let status = row.status;
  let periodEnd = row.current_period_end;
  const now = Date.now();

  if (status === "active" && periodEnd < now) {
    // Dev provider simulates successful rebills so recurring flows stay testable.
    if (row.provider === "dev") {
      const plan = row.plan as PlanId;
      periodEnd = isPlan(plan) ? periodEnd + periodMs(plan) : now + 30 * 864e5;
      await dbRun(
        "UPDATE subscriptions SET current_period_end = ?, updated_at = ? WHERE id = ?",
        periodEnd, now, row.id
      );
    } else {
      status = "past_due";
      await dbRun(
        "UPDATE subscriptions SET status = 'past_due', updated_at = ? WHERE id = ?",
        now, row.id
      );
    }
  }

  return {
    id: row.id,
    plan: row.plan,
    status,
    provider: row.provider,
    current_period_end: periodEnd,
    cancel_at_period_end: !!row.cancel_at_period_end,
  };
}

export async function isUserPro(userId: string, role: string): Promise<boolean> {
  if (role === "admin" || role === "superadmin") return true;
  const sub = await getSubscription(userId);
  return !!sub && sub.status === "active";
}

// Teams are a paid entitlement: Teams plans and Lifetime include them, dev
// subscriptions simulate them for testing, staff roles are always allowed.
const TEAMS_PLANS = new Set(["teams_monthly", "teams_yearly", "lifetime"]);

export async function canUseTeams(userId: string, role?: string): Promise<boolean> {
  if (role && (role === "admin" || role === "superadmin" || role === "support")) return true;
  const sub = await getSubscription(userId);
  if (!sub || sub.status !== "active") return false;
  if (sub.provider === "dev") return true;
  return TEAMS_PLANS.has(sub.plan);
}

export async function activateDevSubscription(userId: string, plan: PlanId): Promise<Subscription> {
  const now = Date.now();
  const existing = await dbGet<{ id: string }>("SELECT id FROM subscriptions WHERE user_id = ?", userId);
  if (existing) {
    await dbRun(
      `UPDATE subscriptions SET plan=?, status='active', provider='dev',
       current_period_end=?, cancel_at_period_end=0, updated_at=? WHERE user_id=?`,
      plan, now + periodMs(plan), now, userId
    );
  } else {
    await dbRun(
      `INSERT INTO subscriptions (id, user_id, plan, status, provider, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, 'active', 'dev', ?, ?, ?)`,
      randomUUID(), userId, plan, now + periodMs(plan), now, now
    );
  }
  return (await getSubscription(userId))!;
}

export async function activatePaymentSubscription(opts: {
  userId: string;
  plan: PlanId;
  customerId: string | null;
  subscriptionId: string | null;
  currentPeriodEnd: number;
  provider?: string;
}): Promise<void> {
  const now = Date.now();
  const provider = opts.provider || "payment";
  const existing = await dbGet<{ id: string }>("SELECT id FROM subscriptions WHERE user_id = ?", opts.userId);
  if (existing) {
    await dbRun(
      `UPDATE subscriptions SET plan=?, status='active', provider=?, stripe_customer_id=?,
       stripe_subscription_id=?, current_period_end=?, cancel_at_period_end=0, updated_at=? WHERE user_id=?`,
      opts.plan, provider, opts.customerId, opts.subscriptionId, opts.currentPeriodEnd, now, opts.userId
    );
  } else {
    await dbRun(
      `INSERT INTO subscriptions (id, user_id, plan, status, provider, stripe_customer_id, stripe_subscription_id, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
      randomUUID(), opts.userId, opts.plan, provider, opts.customerId, opts.subscriptionId, opts.currentPeriodEnd, now, now
    );
  }
}

export async function cancelSubscription(userId: string): Promise<boolean> {
  const { changes } = await dbRun(
    "UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = ? WHERE user_id = ?",
    Date.now(), userId
  );
  return changes > 0;
}

export async function revokeSubscription(userId: string): Promise<boolean> {
  const { changes } = await dbRun("DELETE FROM subscriptions WHERE user_id = ?", userId);
  return changes > 0;
}
