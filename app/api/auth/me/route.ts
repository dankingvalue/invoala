import { getSessionUser } from "@/lib/server-auth";
import { getSubscription, isUserPro } from "@/lib/billing";
import { getImpersonatorAdmin } from "@/lib/server-auth";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ user: null }, { status: 200 });
  const [subscription, isPro, impersonator] = await Promise.all([
    getSubscription(user.id),
    isUserPro(user.id, user.role),
    getImpersonatorAdmin(),
  ]);

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified, timezone: user.timezone },
    isPro,
    subscription,
    impersonatorEmail: impersonator?.email ?? null,
  });
}
