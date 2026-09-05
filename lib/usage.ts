import { randomUUID, createHash } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export const VISITOR_COOKIE = "invoala_vid";
export const VISITOR_MAX_AGE = 400 * 24 * 60 * 60; // 400 days — the browser-enforced cap.

// Events we actually want to count as "an invoice got generated". Kept as an
// allowlist so the usage table stays a clean funnel, not every UI click.
export const USAGE_EVENTS = [
  "invoice_downloaded",
  "invoice_printed",
  "invoice_emailed",
  "invoice_shared",
  "invoice_saved_to_account",
] as const;
export type UsageEvent = (typeof USAGE_EVENTS)[number];

export function isUsageEvent(value: unknown): value is UsageEvent {
  return typeof value === "string" && (USAGE_EVENTS as readonly string[]).includes(value);
}

export function hashIp(ip: string): string {
  const salt = process.env.AUTH_SECRET || "invoala-usage-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function newVisitorId(): string {
  return randomUUID();
}

export async function logUsageEvent(opts: {
  event: UsageEvent;
  visitorId: string;
  userId?: string | null;
  ipHash?: string | null;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await dbRun(
      "INSERT INTO usage_events (id, event, visitor_id, user_id, ip_hash, meta, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      randomUUID(),
      opts.event,
      opts.visitorId,
      opts.userId ?? null,
      opts.ipHash ?? null,
      opts.meta ? JSON.stringify(opts.meta) : null,
      Date.now(),
    );
  } catch {
    // usage logging must never break the request that triggered it
  }
}

export type UsageStats = {
  totalEvents: number;
  uniqueVisitors: number;
  signedInVisitors: number;
  guestVisitors: number;
  eventsByType: Record<string, number>;
  last30Days: Array<{ day: string; events: number; visitors: number }>;
};

// "Unique visitors" counts distinct visitor_id within the given range, not
// all-time — a visitor who generates an invoice today and again tomorrow is
// one visitor with two events, not two separate "new" visitors.
export async function getUsageStats(from = 0, to = Date.now()): Promise<UsageStats> {
  const [totalRow, visitorsRow, signedInRow, byType, daily] = await Promise.all([
    dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM usage_events WHERE created_at BETWEEN ? AND ?", from, to),
    dbGet<{ n: number }>(
      "SELECT COUNT(DISTINCT visitor_id) AS n FROM usage_events WHERE created_at BETWEEN ? AND ?", from, to,
    ),
    dbGet<{ n: number }>(
      "SELECT COUNT(DISTINCT visitor_id) AS n FROM usage_events WHERE user_id IS NOT NULL AND created_at BETWEEN ? AND ?",
      from, to,
    ),
    dbAll<{ event: string; n: number }>(
      "SELECT event, COUNT(*) AS n FROM usage_events WHERE created_at BETWEEN ? AND ? GROUP BY event ORDER BY n DESC",
      from, to,
    ),
    dbAll<{ day: string; events: number; visitors: number }>(
      `SELECT
         strftime('%Y-%m-%d', datetime(created_at / 1000, 'unixepoch')) AS day,
         COUNT(*) AS events,
         COUNT(DISTINCT visitor_id) AS visitors
       FROM usage_events
       WHERE created_at >= ?
       GROUP BY day
       ORDER BY day DESC`,
      Date.now() - 30 * 24 * 60 * 60 * 1000,
    ),
  ]);

  const totalEvents = totalRow?.n ?? 0;
  const uniqueVisitors = visitorsRow?.n ?? 0;
  const signedInVisitors = signedInRow?.n ?? 0;

  return {
    totalEvents,
    uniqueVisitors,
    signedInVisitors,
    guestVisitors: Math.max(0, uniqueVisitors - signedInVisitors),
    eventsByType: Object.fromEntries(byType.map((r) => [r.event, r.n])),
    last30Days: daily,
  };
}
