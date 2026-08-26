import { getSessionUser } from "@/lib/server-auth";
import { cancelSubscription, getSubscription } from "@/lib/billing";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const user = getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const canceled = cancelSubscription(user.id);
  if (!canceled) return Response.json({ error: "No subscription to cancel." }, { status: 404 });

  void sendEmail({
    to: user.email,
    subject: "Your Invoala Pro cancellation",
    text: "Your subscription will stay active until the end of the current billing period. You can re-subscribe anytime.",
  });

  return Response.json({ ok: true, subscription: getSubscription(user.id) });
}
