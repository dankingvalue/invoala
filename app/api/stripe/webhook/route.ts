import { verifyStripeSignature } from "@/lib/email";
import { activateStripeSubscription, isPlan } from "@/lib/billing";
import { createTeam, getUserTeams } from "@/lib/teams";

export async function POST(req: Request) {
  const payload = await req.text();
  if (!verifyStripeSignature(payload, req.headers.get("stripe-signature"))) {
    return Response.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const object = event.data?.object ?? {};

  const metadata = (object.metadata ?? {}) as { userId?: string; plan?: string; createTeam?: string };

  if (event.type === "checkout.session.completed") {
    const userId = String(object.client_reference_id || metadata.userId || "");
    const plan = metadata.plan;
    if (userId && isPlan(plan)) {
      await activateStripeSubscription({
        userId,
        plan,
        customerId: typeof object.customer === "string" ? object.customer : null,
        subscriptionId: typeof object.subscription === "string" ? object.subscription : null,
        currentPeriodEnd: Date.now() + (plan === "pro_yearly" ? 365 : 30) * 864e5,
      });

      // Auto-create team for teams plans
      if (plan.startsWith("teams_") && metadata.createTeam === "true") {
        const existingTeams = await getUserTeams(userId);
        if (existingTeams.length < 3) {
          const { dbGet } = await import("@/lib/db");
          const user = await dbGet<{ name: string; email: string }>("SELECT name, email FROM users WHERE id = ?", userId);
          if (user) {
            await createTeam(userId, `${user.name || user.email}'s Team`);
          }
        }
      }
    }
  }

  if (event.type === "invoice.paid") {
    const subscriptionId =
      typeof object.subscription === "string" ? object.subscription : null;
    if (subscriptionId) {
      const { dbGet, dbRun } = await import("@/lib/db");
      const lines = (object.lines as { data?: Array<{ price?: unknown }> })?.data ?? [];
      const periodEnd = (object.period_end as number | undefined) ?? undefined;
      const row = await dbGet<{ id: string }>(
        "SELECT id FROM subscriptions WHERE stripe_subscription_id = ?",
        subscriptionId
      );
      if (row && periodEnd) {
        await dbRun(
          "UPDATE subscriptions SET status='active', current_period_end=?, updated_at=? WHERE id=?",
          periodEnd * 1000, Date.now(), row.id
        );
      }
      void lines;
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscriptionId = typeof object.id === "string" ? object.id : "";
    if (subscriptionId) {
      const { dbRun } = await import("@/lib/db");
      await dbRun(
        "UPDATE subscriptions SET status='canceled', updated_at=? WHERE stripe_subscription_id=?",
        Date.now(), subscriptionId
      );
    }
  }

  return Response.json({ received: true });
}
