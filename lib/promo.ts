import { randomBytes, randomUUID } from "crypto";
import { dbGet, dbRun } from "@/lib/db";
import { createPolarDiscount, getOrCreatePolarProduct } from "@/lib/polar";

// New-user offer: 50% off Lifetime, valid 10 days from signup.
export const PROMO_PERCENT = 50;
export const PROMO_DAYS_VALID = 10;
export const PROMO_LIFETIME_MS = PROMO_DAYS_VALID * 24 * 60 * 60 * 1000;

// Lifetime is now itself sold at a discount off its own compare-at price
// (see LIFETIME_COMPARE_AT_CENTS in lib/billing.ts) — stacking an additional
// automatic 50% off on top would cut the real charged price roughly in half
// again, undoing the point of that repricing. New issuance is switched off
// here; existing/in-flight promo records (createUserPromo returns them
// as-is below) keep working until they expire naturally.
const NEW_PROMO_ISSUANCE_ENABLED = false;

export type UserPromo = {
  id: string;
  user_id: string;
  code: string;
  polar_discount_id: string;
  percent: number;
  expires_at: number;
  created_at: number;
  welcome_sent: number;
  reminder_sent: number;
};

function promoCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += alphabet[randomBytes(1)[0] % alphabet.length];
  }
  return `INV50${s}`;
}

// Creates the Polar discount + local record for a brand-new user. Never
// throws: a promo failure must not break signup. Returns the promo or null.
export async function createUserPromo(user: {
  id: string;
  email: string;
  name: string;
}): Promise<UserPromo | null> {
  if (!process.env.POLAR_ACCESS_TOKEN) return null;

  const existing = await getActivePromo(user.id).catch(() => null);
  if (existing) return existing;
  if (!NEW_PROMO_ISSUANCE_ENABLED) return null;

  const now = Date.now();
  try {
    const productId = await getOrCreatePolarProduct("lifetime");
    const code = promoCode();
    const { id: discountId } = await createPolarDiscount({
      name: "New-user launch offer — 50% off Lifetime",
      code,
      basisPoints: PROMO_PERCENT * 100,
      productId,
      endsAtMs: now + PROMO_LIFETIME_MS,
    });

    const promoId = randomUUID();
    await dbRun(
      `INSERT INTO promos (id, user_id, code, polar_discount_id, percent, expires_at, created_at, welcome_sent, reminder_sent)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 0)`,
      promoId,
      user.id,
      code,
      discountId,
      PROMO_PERCENT,
      now + PROMO_LIFETIME_MS,
      now,
    );
    return (await getActivePromo(user.id)) ?? null;
  } catch (err) {
    console.error("[promo] create failed", err);
    return null;
  }
}

export async function getActivePromo(userId: string): Promise<UserPromo | null> {
  const row = await dbGet<UserPromo>(
    "SELECT * FROM promos WHERE user_id = ? AND expires_at > ? AND welcome_sent = 1 LIMIT 1",
    userId,
    Date.now(),
  );
  return row ?? null;
}

