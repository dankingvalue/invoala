import { getSessionUser } from "@/lib/server-auth";
import { getSubscription, isUserPro } from "@/lib/billing";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ user: null }, { status: 200 });
  const subscription = await getSubscription(user.id);
  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified, timezone: user.timezone },
    isPro: await isUserPro(user.id, user.role),
    subscription,
  });
}
