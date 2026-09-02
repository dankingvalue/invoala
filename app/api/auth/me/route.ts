import { getSessionUser } from "@/lib/server-auth";
import { dbGet } from "@/lib/db";
import { getSubscription, isUserPro } from "@/lib/billing";
import { getLatestPromo, markPromoReminderSent } from "@/lib/promo";
import { sendPromoReminderEmail } from "@/lib/email";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ user: null }, { status: 200 });
  const subscription = await getSubscription(user.id);
  const isPro = await isUserPro(user.id, user.role);

  // Lazy 48h reminder: this endpoint runs on every authenticated page load,
  // which keeps the nudge working even without a paid-plan cron. Guarded by
  // the promo record's reminder_sent flag, so it fires at most once.
  if (!subscription) {
    const createdRow = await dbGet<{ created_at: number }>(
      "SELECT created_at FROM users WHERE id = ?",
      user.id,
    ).catch(() => null);
    if (createdRow && createdRow.created_at < Date.now() - 48 * 60 * 60 * 1000) {
      const promo = await getLatestPromo(user.id).catch(() => null);
      if (promo && promo.welcome_sent && !promo.reminder_sent) {
        await markPromoReminderSent(promo.id);
        await sendPromoReminderEmail({
          to: user.email,
          name: user.name,
          code: promo.code,
          expiresAt: promo.expires_at,
        }).catch(() => {
          // If the send fails the flag is already set; the daily cron job can
          // still catch users with no promo/welcome state.
        });
      }
    }
  }

  return Response.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, email_verified: user.email_verified, timezone: user.timezone },
    isPro,
    subscription,
  });
}
