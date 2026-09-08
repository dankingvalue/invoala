import { dbGet, dbRun } from "@/lib/db";

export type Priority = "p1" | "p2" | "p3" | "p4";
export const PRIORITIES: Priority[] = ["p1", "p2", "p3", "p4"];
export const PRIORITY_LABEL: Record<Priority, string> = {
  p1: "P1 · Critical",
  p2: "P2 · High",
  p3: "P3 · Normal",
  p4: "P4 · Low",
};

export type SlaPolicy = {
  firstResponseMins: Record<Priority, number>;
  resolutionMins: Record<Priority, number>;
  // Business hours, in the configured local offset — used only when
  // useBusinessHours is true. Spec requirement: SLA math must be able to
  // distinguish calendar time from business-hours time; calendar time is the
  // simpler, safer default so a P1 filed at 11pm Friday isn't silently
  // treated as "not breached until Monday morning."
  useBusinessHours: boolean;
  businessStartHour: number; // 0-23, local
  businessEndHour: number; // 0-23, local
  businessDays: number[]; // 0=Sun .. 6=Sat
  timezoneOffsetMins: number; // e.g. 180 for EAT (UTC+3)
};

export const DEFAULT_SLA_POLICY: SlaPolicy = {
  firstResponseMins: { p1: 15, p2: 60, p3: 240, p4: 1440 },
  resolutionMins: { p1: 240, p2: 480, p3: 1440, p4: 4320 },
  useBusinessHours: false,
  businessStartHour: 9,
  businessEndHour: 16,
  businessDays: [1, 2, 3, 4, 5],
  timezoneOffsetMins: 180,
};

export async function getSlaPolicy(): Promise<SlaPolicy> {
  const row = await dbGet<{ value: string }>("SELECT value FROM app_settings WHERE key = 'sla_policy'");
  if (!row) return DEFAULT_SLA_POLICY;
  try {
    return { ...DEFAULT_SLA_POLICY, ...JSON.parse(row.value) };
  } catch {
    return DEFAULT_SLA_POLICY;
  }
}

export async function setSlaPolicy(policy: SlaPolicy): Promise<void> {
  await dbRun(
    `INSERT INTO app_settings (key, value, updated_at) VALUES ('sla_policy', ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    JSON.stringify(policy),
    Date.now(),
  );
}

function startOfNextBusinessWindow(ms: number, policy: SlaPolicy): number {
  const { businessStartHour, businessDays, timezoneOffsetMins } = policy;
  let cursor = ms;
  for (let i = 0; i < 14; i++) {
    const local = new Date(cursor + timezoneOffsetMins * 60_000);
    const dow = local.getUTCDay();
    if (businessDays.includes(dow)) {
      const startOfDayLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), businessStartHour, 0, 0);
      const startOfDayUtc = startOfDayLocal - timezoneOffsetMins * 60_000;
      if (startOfDayUtc >= ms) return startOfDayUtc;
    }
    // advance to the next day's midnight (local) and retry
    const nextMidnightLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + 1, 0, 0, 0);
    cursor = nextMidnightLocal - timezoneOffsetMins * 60_000;
  }
  return cursor;
}

// Adds `minutesNeeded` of business-hours time to `fromMs`. Day-stepping (not
// minute-stepping) so it stays fast for multi-day SLA windows.
export function addBusinessMinutes(fromMs: number, minutesNeeded: number, policy: SlaPolicy): number {
  const { businessStartHour, businessEndHour, businessDays, timezoneOffsetMins } = policy;
  let remaining = minutesNeeded;
  let cursor = fromMs;

  for (let i = 0; i < 3650 && remaining > 0; i++) {
    const local = new Date(cursor + timezoneOffsetMins * 60_000);
    const dow = local.getUTCDay();
    const minsOfDay = local.getUTCHours() * 60 + local.getUTCMinutes();
    const isBizDay = businessDays.includes(dow);

    if (!isBizDay || minsOfDay >= businessEndHour * 60) {
      cursor = startOfNextBusinessWindow(cursor, policy);
      continue;
    }
    if (minsOfDay < businessStartHour * 60) {
      cursor = startOfNextBusinessWindow(cursor, policy);
      continue;
    }
    const availableTodayMins = businessEndHour * 60 - minsOfDay;
    if (remaining <= availableTodayMins) {
      cursor += remaining * 60_000;
      remaining = 0;
    } else {
      remaining -= availableTodayMins;
      cursor = startOfNextBusinessWindow(cursor + availableTodayMins * 60_000, policy);
    }
  }
  return cursor;
}

export function computeSlaDueDates(
  createdAt: number,
  priority: Priority,
  policy: SlaPolicy,
): { firstResponseDue: number; resolutionDue: number } {
  const frMins = policy.firstResponseMins[priority];
  const resMins = policy.resolutionMins[priority];
  if (policy.useBusinessHours) {
    return {
      firstResponseDue: addBusinessMinutes(createdAt, frMins, policy),
      resolutionDue: addBusinessMinutes(createdAt, resMins, policy),
    };
  }
  return {
    firstResponseDue: createdAt + frMins * 60_000,
    resolutionDue: createdAt + resMins * 60_000,
  };
}

export type SlaState = "on_track" | "at_risk" | "breached" | "met";

// "At risk" = within 20% of the remaining window. Used for dashboard badges.
export function slaState(dueAt: number | null | undefined, met: boolean, now = Date.now()): SlaState {
  if (met) return "met";
  if (!dueAt) return "on_track";
  if (now > dueAt) return "breached";
  const remaining = dueAt - now;
  if (remaining < 30 * 60_000) return "at_risk";
  return "on_track";
}
