import { dbAll, dbGet, dbRun } from "@/lib/db";

// FX snapshots against USD, cached per day in the DB (fx_cache).
// open.er-api.com/v6/latest/USD: ~160 currencies incl. KES, refreshed daily.
// Historic per-day retrieval is only available on paid plans, so we snapshot
// every day going forward and fall back to the nearest stored day for older
// invoices (labelled as approximate).

export type RatesMap = Record<string, number>;

const LIVE_URL = "https://open.er-api.com/v6/latest/USD";
const STALE_AFTER_MS = 6 * 60 * 60 * 1000;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function fetchLiveRates(): Promise<RatesMap | null> {
  try {
    const res = await fetch(LIVE_URL, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: string; rates?: RatesMap };
    if (json.result !== "success" || !json.rates) return null;
    return { ...json.rates, USD: 1 };
  } catch {
    return null;
  }
}

export async function getStoredDay(dayIso: string): Promise<{ rates: RatesMap; day: string } | null> {
  const row = await dbGet<{ rates: string }>(
    "SELECT rates FROM fx_cache WHERE day = ?",
    dayIso,
  ).catch(() => null);
  if (!row) return null;
  try {
    return { rates: JSON.parse(row.rates) as RatesMap, day: dayIso };
  } catch {
    return null;
  }
}

async function refreshDay(dayIso: string, force = false): Promise<RatesMap | null> {
  if (!force) {
    const stored = await getStoredDay(dayIso);
    if (stored) return stored.rates;
  }
  const rates = await fetchLiveRates();
  if (!rates) return null;
  await dbRun(
    "INSERT INTO fx_cache (day, rates, fetched_at) VALUES (?, ?, ?) ON CONFLICT(day) DO UPDATE SET rates = excluded.rates, fetched_at = excluded.fetched_at",
    dayIso,
    JSON.stringify(rates),
    Date.now(),
  ).catch(() => {});
  return rates;
}

// Returns the best rate map for a given invoice date: exact stored day first,
// then the nearest stored day, finally a freshly fetched (or cached) snapshot
// of today.
export async function ratesForDay(dayIso: string): Promise<{ rates: RatesMap; asOf: string; exact: boolean }> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayIso)) dayIso = todayIso();

  const exact = await getStoredDay(dayIso);
  if (exact) return { rates: exact.rates, asOf: dayIso, exact: true };

  // Nearest stored day.
  const days = await dbAll<{ day: string }>(
    "SELECT day FROM fx_cache ORDER BY day",
  ).catch(() => [] as { day: string }[]);
  if (days.length > 0) {
    let best = days[0].day;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const d of days) {
      const dist = Math.abs(Date.parse(d.day) - Date.parse(dayIso));
      if (dist < bestDist) {
        bestDist = dist;
        best = d.day;
      }
    }
    const near = await getStoredDay(best);
    if (near) return { rates: near.rates, asOf: best, exact: false };
  }

  const fresh = await refreshDay(todayIso());
  if (fresh) return { rates: fresh, asOf: todayIso(), exact: false };
  return { rates: { USD: 1 }, asOf: todayIso(), exact: false };
}

// Latest snapshot (used for display-currency conversion + daily cron).
export async function ensureLatestRates(force = false): Promise<RatesMap> {
  const today = todayIso();
  const stored = await getStoredDay(today);
  if (stored && !force) return stored.rates;
  const row = await dbGet<{ rates: string; fetched_at: number }>(
    "SELECT rates, fetched_at FROM fx_cache WHERE day = ?",
    today,
  ).catch(() => null);
  if (row && Date.now() - row.fetched_at < STALE_AFTER_MS && !force) {
    try {
      return JSON.parse(row.rates) as RatesMap;
    } catch {}
  }
  const fresh = await refreshDay(today, true);
  return fresh ?? stored?.rates ?? { USD: 1 };
}

// Converts an amount in `from` currency to `to` currency.
// 1 USD = rates[currency] for every stored currency.
export function convertAmount(amount: number, from: string, to: string, rates: RatesMap): number {
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  if (from === to) return amount;
  return (amount / fromRate) * toRate;
}
