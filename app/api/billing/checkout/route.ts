import { getSessionUser } from "@/lib/server-auth";
import { isPlan, PLANS } from "@/lib/billing";
import { getUserTeams } from "@/lib/teams";
import { createPolarCheckout } from "@/lib/polar";
import { getActivePromo } from "@/lib/promo";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let plan = "";
  try {
    const body = (await req.json()) as { plan?: string };
    plan = typeof body.plan === "string" ? body.plan : "";
  } catch {}
  if (!isPlan(plan)) {
    return Response.json({ error: "Unknown plan." }, { status: 400 });
  }

  const isTeamsPlan = plan.startsWith("teams_");

  if (isTeamsPlan) {
    const teams = await getUserTeams(user.id);
    if (teams.length >= 3) {
      return Response.json({ error: "Maximum 3 teams per user." }, { status: 400 });
    }
  }

  // Auto-apply the new-account 50% Lifetime offer when it's still valid.
  // The discount only targets the Lifetime product, so it only attaches there.
  let discountId: string | null = null;
  if (plan === "lifetime") {
    const promo = await getActivePromo(user.id).catch(() => null);
    discountId = promo?.polar_discount_id ?? null;
  }

  const polarConfigured = !!process.env.POLAR_ACCESS_TOKEN;

  if (!polarConfigured) {
    return Response.json({
      error: "Payment processing is not configured yet. We're working on integrating a payment provider — stay tuned!",
      mode: "not_configured",
    });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const successUrl = `${origin}/dashboard?upgraded=1&plan=${plan}`;
  const returnUrl = `${origin}/dashboard?upgraded=0`;

  try {
    const url = await createPolarCheckout({
      plan,
      userId: user.id,
      email: user.email,
      name: user.name,
      successUrl,
      returnUrl,
      discountId,
    });
    return Response.json({ ok: true, mode: "polar", url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create a checkout.";
    return Response.json({ error: message }, { status: 502 });
  }
}
