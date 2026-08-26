import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";

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

export function getSubscription(userId: string): Subscription | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId) as
    | {
        id: string;
        plan: string;
        status: string;
        provider: string;
        current_period_end: number;
        cancel_at_period_end: number;
      }
    | undefined;
  if (!row) return null;

  let status = row.status;
  let periodEnd = row.current_period_end;
  const now = Date.now();

  if (status === "active" && periodEnd < now) {
    // Dev provider simulates successful rebills so recurring flows stay testable.
    if (row.provider === "dev") {
      const plan = row.plan as PlanId;
      periodEnd = isPlan(plan) ? periodEnd + periodMs(plan) : now + 30 * 864e5;
      db.prepare("UPDATE subscriptions SET current_period_end = ?, updated_at = ? WHERE id = ?").run(
        periodEnd,
        now,
        row.id,
      );
    } else {
      status = "past_due";
      db.prepare("UPDATE subscriptions SET status = 'past_due', updated_at = ? WHERE id = ?").run(
        now,
        row.id,
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

export function isUserPro(userId: string, role: string): boolean {
  if (role === "admin" || role === "superadmin") return true;
  const sub = getSubscription(userId);
  return !!sub && sub.status === "active";
}

export function activateDevSubscription(userId: string, plan: PlanId): Subscription {
  const db = getDb();
  const now = Date.now();
  const existing = db.prepare("SELECT id FROM subscriptions WHERE user_id = ?").get(userId);
  if (existing) {
    db.prepare(
      `UPDATE subscriptions SET plan=?, status='active', provider='dev',
       current_period_end=?, cancel_at_period_end=0, updated_at=? WHERE user_id=?`,
    ).run(plan, now + periodMs(plan), now, userId);
  } else {
    db.prepare(
      `INSERT INTO subscriptions (id, user_id, plan, status, provider, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, 'active', 'dev', ?, ?, ?)`,
    ).run(randomUUID(), userId, plan, now + periodMs(plan), now, now);
  }
  return getSubscription(userId)!;
}

export function activateStripeSubscription(opts: {
  userId: string;
  plan: PlanId;
  customerId: string | null;
  subscriptionId: string | null;
  currentPeriodEnd: number;
}): void {
  const db = getDb();
  const now = Date.now();
  const existing = db.prepare("SELECT id FROM subscriptions WHERE user_id = ?").get(opts.userId);
  if (existing) {
    db.prepare(
      `UPDATE subscriptions SET plan=?, status='active', provider='stripe', stripe_customer_id=?,
       stripe_subscription_id=?, current_period_end=?, cancel_at_period_end=0, updated_at=? WHERE user_id=?`,
    ).run(opts.plan, opts.customerId, opts.subscriptionId, opts.currentPeriodEnd, now, opts.userId);
  } else {
    db.prepare(
      `INSERT INTO subscriptions (id, user_id, plan, status, provider, stripe_customer_id, stripe_subscription_id, current_period_end, created_at, updated_at)
       VALUES (?, ?, ?, 'active', 'stripe', ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), opts.userId, opts.plan, opts.customerId, opts.subscriptionId, opts.currentPeriodEnd, now, now);
  }
}

export function cancelSubscription(userId: string): boolean {
  const result = getDb()
    .prepare("UPDATE subscriptions SET cancel_at_period_end = 1, updated_at = ? WHERE user_id = ?")
    .run(Date.now(), userId);
  return result.changes > 0;
}

export function revokeSubscription(userId: string): boolean {
  const result = getDb().prepare("DELETE FROM subscriptions WHERE user_id = ?").run(userId);
  return result.changes > 0;
}
