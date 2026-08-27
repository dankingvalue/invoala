import { getSessionUser } from "@/lib/server-auth";
import { getSubscription, isUserPro, PLANS } from "@/lib/billing";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const subscription = await getSubscription(user.id);
  return Response.json({
    subscription,
    isPro: await isUserPro(user.id, user.role),
    liveBilling: !!process.env.STRIPE_SECRET_KEY,
    plans: PLANS,
  });
}
