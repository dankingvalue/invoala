import { randomUUID, createHash } from "crypto";
import { dbGet, dbRun } from "@/lib/db";
import { hashIp } from "@/lib/usage";

// Self-serve, no-card-required 7-day Pro trial. Only Pro — Teams and
// Lifetime are never trialed (Teams because it's a collaboration feature
// with real seat cost, Lifetime because it's a one-time purchase with
// nothing to "try" beyond what Pro's trial already covers).
export const TRIAL_DAYS = 7;
export const TRIAL_PLAN = "pro_monthly" as const;

// Normalizes away the two classic "one inbox, N signups" tricks: the
// +alias suffix (any provider) and Gmail/Google's dot-insensitivity. Not
// applied to other providers' dots since most treat them as significant.
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  local = local.split("+")[0];
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
  }
  return `${local}@${domain}`;
}

export function hashEmail(email: string): string {
  const salt = process.env.AUTH_SECRET || "invoala-usage-salt";
  return createHash("sha256").update(`${salt}:${normalizeEmail(email)}`).digest("hex");
}

export { hashIp };

export type TrialEligibility =
  | { eligible: true }
  | { eligible: false; reason: "already_subscribed" | "already_trialed" | "duplicate_signal" };

export async function checkTrialEligibility(opts: {
  userId: string;
  email: string;
  ipHash: string | null;
  visitorId: string | null;
}): Promise<TrialEligibility> {
  const existingSub = await dbGet<{ id: string }>("SELECT id FROM subscriptions WHERE user_id = ?", opts.userId);
  if (existingSub) return { eligible: false, reason: "already_subscribed" };

  const ownClaim = await dbGet<{ id: string }>("SELECT id FROM trial_claims WHERE user_id = ?", opts.userId);
  if (ownClaim) return { eligible: false, reason: "already_trialed" };

  const emailHash = hashEmail(opts.email);
  const conditions = ["email_hash = ?"];
  const args: string[] = [emailHash];
  if (opts.ipHash) {
    conditions.push("ip_hash = ?");
    args.push(opts.ipHash);
  }
  if (opts.visitorId) {
    conditions.push("visitor_id = ?");
    args.push(opts.visitorId);
  }
  const match = await dbGet<{ id: string }>(
    `SELECT id FROM trial_claims WHERE ${conditions.join(" OR ")} LIMIT 1`,
    ...args,
  );
  if (match) return { eligible: false, reason: "duplicate_signal" };

  return { eligible: true };
}

export async function startProTrial(opts: {
  userId: string;
  email: string;
  ipHash: string | null;
  visitorId: string | null;
}): Promise<void> {
  const now = Date.now();
  const periodEnd = now + TRIAL_DAYS * 24 * 60 * 60 * 1000;

  await dbRun(
    `INSERT INTO subscriptions (id, user_id, plan, status, provider, current_period_end, created_at, updated_at)
     VALUES (?, ?, ?, 'trialing', 'trial', ?, ?, ?)`,
    randomUUID(), opts.userId, TRIAL_PLAN, periodEnd, now, now,
  );

  await dbRun(
    `INSERT INTO trial_claims (id, user_id, email_hash, ip_hash, visitor_id, plan, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    randomUUID(), opts.userId, hashEmail(opts.email), opts.ipHash, opts.visitorId, TRIAL_PLAN, now,
  );
}
