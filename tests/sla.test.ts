import { describe, expect, it } from "vitest";
import { addBusinessMinutes, computeSlaDueDates, DEFAULT_SLA_POLICY, slaState, type SlaPolicy } from "@/lib/sla";

const bizPolicy: SlaPolicy = { ...DEFAULT_SLA_POLICY, useBusinessHours: true };

describe("addBusinessMinutes", () => {
  it("adds minutes within the same business day", () => {
    // Mon 2026-09-07 10:00 EAT (UTC+3) -> 07:00 UTC
    const from = Date.UTC(2026, 8, 7, 7, 0, 0);
    const due = addBusinessMinutes(from, 60, bizPolicy);
    expect(new Date(due).toISOString()).toBe(new Date(from + 60 * 60_000).toISOString());
  });

  it("rolls over to the next business day when it would exceed today's window", () => {
    // Mon 2026-09-07 15:30 EAT -> 12:30 UTC. Window ends 16:00 EAT, 30 min left today.
    const from = Date.UTC(2026, 8, 7, 12, 30, 0);
    const due = addBusinessMinutes(from, 90, bizPolicy); // 30 today + 60 tomorrow
    const local = new Date(due + 180 * 60_000);
    expect(local.getUTCDay()).toBe(2); // Tuesday
    expect(local.getUTCHours()).toBe(10); // 09:00 start + 60 min
  });

  it("skips weekends", () => {
    // Fri 2026-09-11 15:30 EAT -> 12:30 UTC, 30 min left before 16:00.
    const from = Date.UTC(2026, 8, 11, 12, 30, 0);
    const due = addBusinessMinutes(from, 90, bizPolicy);
    const local = new Date(due + 180 * 60_000);
    expect(local.getUTCDay()).toBe(1); // Monday, not Sat/Sun
  });

  it("jumps a before-hours timestamp forward to the start of the business window", () => {
    // Mon 2026-09-07 06:00 EAT (before 09:00 start) -> 03:00 UTC
    const from = Date.UTC(2026, 8, 7, 3, 0, 0);
    const due = addBusinessMinutes(from, 30, bizPolicy);
    const local = new Date(due + 180 * 60_000);
    expect(local.getUTCHours()).toBe(9);
    expect(local.getUTCMinutes()).toBe(30);
  });
});

describe("computeSlaDueDates", () => {
  it("uses plain calendar time when useBusinessHours is false", () => {
    const now = Date.now();
    const { firstResponseDue } = computeSlaDueDates(now, "p1", DEFAULT_SLA_POLICY);
    expect(firstResponseDue).toBe(now + DEFAULT_SLA_POLICY.firstResponseMins.p1 * 60_000);
  });
});

describe("slaState", () => {
  it("reports met when the SLA has been satisfied", () => {
    expect(slaState(Date.now() - 1000, true)).toBe("met");
  });
  it("reports breached when overdue and not met", () => {
    expect(slaState(Date.now() - 1000, false)).toBe("breached");
  });
  it("reports at_risk when close to due", () => {
    expect(slaState(Date.now() + 10 * 60_000, false)).toBe("at_risk");
  });
  it("reports on_track otherwise", () => {
    expect(slaState(Date.now() + 5 * 60 * 60_000, false)).toBe("on_track");
  });
});
