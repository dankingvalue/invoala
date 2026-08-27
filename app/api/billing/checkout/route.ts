import { getSessionUser } from "@/lib/server-auth";
import { activateDevSubscription, isPlan, PLANS } from "@/lib/billing";
import { createTeam, getUserTeams } from "@/lib/teams";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let plan = "";
  try {
    const body = (await req.json()) as { plan?: string };
    plan = typeof body.plan === "string" ? body.plan : "";
  } catch {
    // falls through to validation
  }
  if (!isPlan(plan)) {
    return Response.json({ error: "Unknown plan." }, { status: 400 });
  }

  const isTeamsPlan = plan.startsWith("teams_");

  // Check if user already has a team for teams plan
  if (isTeamsPlan) {
    const teams = await getUserTeams(user.id);
    if (teams.length >= 3) {
      return Response.json({ error: "Maximum 3 teams per user." }, { status: 400 });
    }
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeKey) {
    // Dev billing: no Stripe configured — activate instantly so the full
    // subscription lifecycle (renewal, cancel) stays testable.
    const sub = await activateDevSubscription(user.id, plan);

    // Auto-create team for teams plans
    let team = null;
    if (isTeamsPlan) {
      team = await createTeam(user.id, `${user.name || user.email}'s Team`);
    }

    void sendEmail({
      to: user.email,
      subject: `Invoala ${PLANS[plan].label} activated`,
      text: team
        ? `Your ${PLANS[plan].label} is active. Your team "${team.name}" has been created. Invite your team members from the dashboard!`
        : `Your ${PLANS[plan].label} is active. Thanks for supporting Invoala!`,
    });
    return Response.json({ ok: true, mode: "dev", subscription: sub, team });
  }

  try {
    const form = new URLSearchParams();
    const isLifetime = plan === "lifetime";
    form.set("mode", isLifetime ? "payment" : "subscription");
    form.set("success_url", `${origin}/dashboard?upgraded=1&plan=${plan}`);
    form.set("cancel_url", `${origin}/dashboard?upgraded=0`);
    form.set("customer_email", user.email);
    form.set("client_reference_id", user.id);
    form.set("line_items[0][quantity]", "1");
    form.set("line_items[0][price_data][currency]", "usd");
    form.set("line_items[0][price_data][unit_amount]", String(PLANS[plan].amountCents));
    if (!isLifetime) {
      form.set("line_items[0][price_data][recurring][interval]", PLANS[plan].interval as string);
    }
    form.set("line_items[0][price_data][product_data][name]", `Invoala ${PLANS[plan].label}`);
    form.set("metadata[userId]", user.id);
    form.set("metadata[plan]", plan);
    if (isTeamsPlan) {
      form.set("metadata[createTeam]", "true");
    }

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      signal: AbortSignal.timeout(20000),
    });
    const json = (await res.json()) as { url?: string; error?: { message?: string } };
    if (!res.ok || !json.url) {
      return Response.json(
        { error: json.error?.message || "Stripe checkout failed." },
        { status: 502 },
      );
    }
    return Response.json({ ok: true, mode: "stripe", url: json.url });
  } catch {
    return Response.json({ error: "Could not reach Stripe." }, { status: 502 });
  }
}
