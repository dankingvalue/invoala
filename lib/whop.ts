import { createHmac, timingSafeEqual } from "crypto";
import type { PlanId } from "@/lib/billing";

export const WHOP_API = "https://api.whop.com/api/v1";

function token(): string | null {
  return process.env.WHOP_API_KEY || null;
}

async function whopFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const t = token();
  if (!t) throw new Error("Whop is not configured.");
  return fetch(`${WHOP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(15000),
  });
}

// Each plan is created once, by hand, in the Whop dashboard (Whop's own
// checkout model is built around pre-created plans, not dynamic per-request
// products like the previous Polar integration used) — its plan_id is set
// here as an env var, same convention the old POLAR_PRODUCT_ID_<PLAN> vars
// used.
const planIdEnv = (plan: PlanId): string | null =>
  process.env[`WHOP_PLAN_ID_${plan.toUpperCase()}`] || null;

export async function createWhopCheckout(opts: {
  plan: PlanId;
  userId: string;
  email: string;
  redirectUrl: string;
}): Promise<string> {
  const planId = planIdEnv(opts.plan);
  if (!planId) {
    throw new Error(
      `No Whop plan configured for ${opts.plan} — set WHOP_PLAN_ID_${opts.plan.toUpperCase()} to the plan_id created in the Whop dashboard.`
    );
  }

  const res = await whopFetch("/checkout-configurations", {
    method: "POST",
    body: JSON.stringify({
      plan_id: planId,
      redirect_url: opts.redirectUrl,
      metadata: {
        userId: opts.userId,
        plan: opts.plan,
      },
    }),
  });

  const json = (await res.json().catch(() => ({}))) as {
    purchase_url?: string;
    error?: unknown;
  };
  if (!res.ok || !json.purchase_url) {
    console.error("Whop checkout creation failed", res.status, JSON.stringify(json).slice(0, 300));
    throw new Error("Could not create a Whop checkout.");
  }

  return json.purchase_url;
}

// Standard Webhooks signature verification (https://standardwebhooks.com) —
// Whop signs the same way Polar did: webhook-id/-timestamp/-signature
// headers, HMAC-SHA256 of "<id>.<timestamp>.<raw body>", base64-encoded,
// delivered as "v1,<signature>". Kept as its own function (not reused from
// a shared lib) since the two providers' secret formats could diverge later
// even though the algorithm is identical today.
export function verifyWhopWebhook(body: string, headers: Headers): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) return false;

  const id = headers.get("webhook-id");
  const timestamp = headers.get("webhook-timestamp");
  const signatureHeader = headers.get("webhook-signature");
  if (!id || !timestamp || !signatureHeader) {
    console.error("[whop:webhook] missing headers", { id: !!id, ts: !!timestamp, sig: !!signatureHeader });
    return false;
  }

  // Replay protection: reject deliveries outside a ~5 minute window.
  const tsSec = Number(timestamp);
  if (!Number.isFinite(tsSec) || Math.abs(Date.now() / 1000 - tsSec) > 5 * 60) {
    console.error("[whop:webhook] timestamp out of window", timestamp);
    return false;
  }

  // Key candidates: raw secret bytes, and for ws_/whsec_-prefixed secrets,
  // the base64-decoded spec key — mirrors the Polar integration's handling
  // of both encodings since Whop's docs don't pin down which one applies.
  const keys: Buffer[] = [Buffer.from(secret, "utf8")];
  const prefixed = secret.match(/^(ws_|whsec_)(.+)$/);
  if (prefixed) {
    try {
      keys.push(Buffer.from(prefixed[2], "base64"));
    } catch {}
  }

  const tokens = signatureHeader.split(" ").filter(Boolean);
  for (const tok of tokens) {
    const [version, providedB64] = tok.split(",", 2);
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
  console.error("[whop:webhook] signature did not match");
  return false;
}
