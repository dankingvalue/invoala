import { getSessionUser } from "@/lib/server-auth";
import { isPlan } from "@/lib/billing";
import { getUserTeams } from "@/lib/teams";
import { createWhopCheckout } from "@/lib/whop";

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

  const whopConfigured = !!process.env.WHOP_API_KEY;

  if (!whopConfigured) {
    return Response.json({
      error: "Payment processing is not configured yet. We're working on integrating a payment provider — stay tuned!",
      mode: "not_configured",
    });
  }

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const redirectUrl = `${origin}/dashboard?upgraded=1&plan=${plan}`;

  try {
    const url = await createWhopCheckout({
      plan,
      userId: user.id,
      email: user.email,
      redirectUrl,
    });
    return Response.json({ ok: true, mode: "whop", url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create a checkout.";
    return Response.json({ error: message }, { status: 502 });
  }
}
