import { dbAll } from "@/lib/db";
import { getSubscription } from "@/lib/billing";
import { createUserPromo, getLatestPromo, markPromoReminderSent, markPromoWelcomeSent } from "@/lib/promo";
import { sendPromoReminderEmail, sendWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

// Daily job (see vercel.json). Two passes:
//  1. Catch users whose promo exists but whose welcome email never went out
//     (provider hiccup at signup) — send it now.
//  2. Users older than 48h with no paid plan get the reminder email carrying
//     their personal code (10-day validity, so most codes still have ~8 days
//     left when the reminder lands).
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const cutoff = now - 48 * 60 * 60 * 1000;
  const results = { welcomeCatchUp: 0, remindersSent: 0, failed: 0 };

  const users = await dbAll<{ id: string; email: string; name: string; created_at: number }>(
    "SELECT id, email, name, created_at FROM users WHERE created_at < ? ORDER BY created_at DESC LIMIT 200",
    cutoff,
  );

  for (const user of users) {
    try {
      const sub = await getSubscription(user.id);
      if (sub) continue;

      const promo = await getLatestPromo(user.id);

      if (promo && !promo.welcome_sent) {
        await sendWelcomeEmail({
          to: user.email,
          name: user.name,
          promoCode: promo.code,
          promoExpiresAt: promo.expires_at,
        });
        await markPromoWelcomeSent(promo.id);
        results.welcomeCatchUp += 1;
        continue;
      }

      if (promo && promo.welcome_sent && !promo.reminder_sent) {
        await sendPromoReminderEmail({
          to: user.email,
          name: user.name,
          code: promo.code,
          expiresAt: promo.expires_at,
        });
        await markPromoReminderSent(promo.id);
        results.remindersSent += 1;
        continue;
      }

      if (!promo) {
        // Promo creation failed at signup — try once more and email the code.
        const created = await createUserPromo(user);
        if (created) {
          await sendPromoReminderEmail({
            to: user.email,
            name: user.name,
            code: created.code,
            expiresAt: created.expires_at,
          });
          await markPromoReminderSent(created.id);
          results.remindersSent += 1;
        } else {
          results.failed += 1;
        }
      }
    } catch (err) {
      console.error("[cron:promo] user failed", user.email, err);
      results.failed += 1;
    }
  }

  return Response.json({ ok: true, ...results });
}
