import { getSessionUser } from "@/lib/server-auth";
import { isPlan, PLANS } from "@/lib/billing";
import { getUserTeams } from "@/lib/teams";

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

  const paymentConfigured = !!process.env.PAYMENT_API_KEY;

  if (!paymentConfigured) {
    return Response.json({
      error: "Payment processing is not configured yet. We're working on integrating a payment provider — stay tuned!",
      mode: "not_configured",
    });
  }

  // TODO: Integrate payment processor here
  // Example flow:
  // 1. Create a payment session with your processor
  // 2. Return the checkout URL for redirect
  // 3. Handle webhooks for payment confirmation
  //
  // const session = await paymentClient.createSession({ ... });
  // return Response.json({ ok: true, mode: "payment", url: session.url });

  return Response.json({ error: "Payment processor not yet connected." }, { status: 501 });
}
