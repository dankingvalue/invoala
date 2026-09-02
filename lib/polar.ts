import { createHmac, timingSafeEqual } from "crypto";
import { PLANS, type PlanId } from "@/lib/billing";
import { dbGet, dbRun } from "@/lib/db";

export const POLAR_API = "https://api.polar.sh/v1";

function token(): string | null {
  return process.env.POLAR_ACCESS_TOKEN || null;
}

async function polarFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const t = token();
  if (!t) throw new Error("Polar is not configured.");
  return fetch(`${POLAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
}

function planConfig(plan: PlanId): { name: string; interval: "month" | "year" | null; amount: number } {
  const def = PLANS[plan];
  return {
    name: `Invoala ${def.label}`,
    interval: def.interval === "month" ? "month" : def.interval === "year" ? "year" : null,
    amount: def.amountCents,
  };
}

const envProductId = (plan: PlanId): string | null =>
  process.env[`POLAR_PRODUCT_ID_${plan.toUpperCase()}`] || null;

export async function getOrCreatePolarProduct(plan: PlanId): Promise<string> {
  const fromEnv = envProductId(plan);
  if (fromEnv) return fromEnv;

  const key = `polar_product_${plan}`;
  const cached = await dbGet<{ value: string }>(
    "SELECT value FROM billing_config WHERE key = ?",
    key
  );
  if (cached?.value) return cached.value;

  const cfg = planConfig(plan);
  const body: Record<string, unknown> = {
    name: cfg.name,
    description: `${cfg.name} plan on Invoala (invoala.com).`,
    prices: [
      {
        amount_type: "fixed",
        price_amount: cfg.amount,
        price_currency: "usd",
      },
    ],
  };
  if (cfg.interval) {
    body.recurring_interval = cfg.interval;
  }

  const res = await polarFetch("/products/", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { id?: string; detail?: unknown };
  if (!res.ok || !json.id) {
    console.error("Polar product creation failed", res.status, JSON.stringify(json).slice(0, 300));
    throw new Error(
      `Could not create the ${cfg.name} product on Polar. Create it in the Polar dashboard and set POLAR_PRODUCT_ID_${plan.toUpperCase()}, or grant the token the products:write scope.`
    );
  }

  await dbRun(
    "INSERT INTO billing_config (key, value, created_at) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING",
    key, json.id, Date.now()
  );
  return json.id;
}

export async function createPolarDiscount(opts: {
  name: string;
  code: string;
  basisPoints: number;
  productId: string;
  endsAtMs: number;
}): Promise<{ id: string; code: string }> {
  const res = await polarFetch("/discounts/", {
    method: "POST",
    body: JSON.stringify({
      name: opts.name,
      type: "percentage",
      duration: "once",
      basis_points: opts.basisPoints,
      code: opts.code,
      ends_at: new Date(opts.endsAtMs).toISOString(),
      max_redemptions: 1,
      max_redemptions_per_customer: 1,
      products: [opts.productId],
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { id?: string; code?: string | null };
  if (!res.ok || !json.id) {
    console.error("Polar discount creation failed", res.status, JSON.stringify(json).slice(0, 300));
    throw new Error("Could not create a Polar discount.");
  }
  return { id: json.id, code: json.code || opts.code };
}

export async function createPolarCheckout(opts: {
  plan: PlanId;
  userId: string;
  email: string;
  name?: string;
  successUrl: string;
  returnUrl: string;
  discountId?: string | null;
}): Promise<string> {
  const productId = await getOrCreatePolarProduct(opts.plan);
  const isLifetime = opts.plan === "lifetime";

  const res = await polarFetch("/checkouts/", {
    method: "POST",
    body: JSON.stringify({
      products: [productId],
      success_url: opts.successUrl,
      return_url: opts.returnUrl,
      customer_email: opts.email,
      ...(opts.name ? { customer_name: opts.name } : {}),
      external_customer_id: opts.userId,
      metadata: {
        userId: opts.userId,
        plan: opts.plan,
      },
      allow_discount_codes: opts.discountId ? false : true,
      ...(opts.discountId ? { discount_id: opts.discountId } : {}),
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    url?: string;
    detail?: Array<{ msg?: string }> | string;
  };
  if (!res.ok || !json.url) {
    console.error("Polar checkout creation failed", res.status, JSON.stringify(json).slice(0, 300));
    const detail = Array.isArray(json.detail) ? json.detail.map((d) => d.msg).join("; ") : "";
    throw new Error(detail || "Could not create a Polar checkout.");
  }

  return json.url;
}

// Standard Webhooks signature verification (https://standardwebhooks.com).
// Accepts both the spec header names (webhook-id/-timestamp/-signature) and
// Polar's legacy names (polar-webhook-*). Handles the `v1,<base64>` envelope,
// space-delimited multi-signatures (secret rotation), and both key encodings:
// Polar currently signs with the raw secret bytes including `whsec_`, while
// Standard Webhooks libraries use the base64-decoded key after `whsec_`.
export function verifyPolarWebhook(body: string, headers: Headers): boolean {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) return false;

  const get = (...names: string[]) => {
    for (const n of names) {
      const v = headers.get(n);
      if (v) return v;
    }
    return null;
  };
  const id = get("webhook-id", "polar-webhook-id");
  const timestamp = get("webhook-timestamp", "polar-webhook-timestamp");
  const signatureHeader = get("webhook-signature", "polar-webhook-signature");
  if (!id || !timestamp || !signatureHeader) {
    console.error("[polar:webhook] missing headers", { id: !!id, ts: !!timestamp, sig: !!signatureHeader });
    return false;
  }

  // Replay protection: reject deliveries outside a ~5 minute window.
  const tsSec = Number(timestamp);
  if (!Number.isFinite(tsSec) || Math.abs(Date.now() / 1000 - tsSec) > 5 * 60) {
    console.error("[polar:webhook] timestamp out of window", timestamp);
    return false;
  }

  // Key candidates: raw secret bytes (Polar's current encoding) and, for
  // whsec_-prefixed secrets, the base64-decoded spec key.
  const keys: Buffer[] = [Buffer.from(secret, "utf8")];
  if (secret.startsWith("whsec_")) {
    try {
      keys.push(Buffer.from(secret.slice("whsec_".length), "base64"));
    } catch {}
  }

  const tokens = signatureHeader.split(" ").filter(Boolean);
  for (const token of tokens) {
    const [version, providedB64] = token.split(",", 2);
    if (version !== "v1" || !providedB64) continue;
    for (const key of keys) {
      try {
        const expected = createHmac("sha256", key)
          .update(`${id}.${timestamp}.${body}`)
          .digest("base64");
        const a = Buffer.from(expected);
        const b = Buffer.from(providedB64);
        if (a.length === b.length && timingSafeEqual(a, b)) return true;
      } catch {
        // try the next key/token
      }
    }
  }
  console.error("[polar:webhook] signature did not match");
  return false;
}
