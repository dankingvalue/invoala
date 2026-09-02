import { describe, expect, it } from "vitest";
import { isoDaysBetween, isoPlusDays } from "@/lib/recurring";

describe("recurring date math (UTC-safe)", () => {
  it("adds days across month boundaries", () => {
    expect(isoPlusDays("2026-01-31", 30)).toBe("2026-03-02");
    expect(isoPlusDays("2026-02-28", 7)).toBe("2026-03-07");
    expect(isoPlusDays("2026-12-25", 10)).toBe("2027-01-04");
  });

  it("adds zero days identity", () => {
    expect(isoPlusDays("2026-07-19", 0)).toBe("2026-07-19");
  });

  it("keeps naive dates stable regardless of server timezone", () => {
    // No T00:00:00 local-parse drift: adding one day must never skip/dup.
    const d1 = isoPlusDays("2026-07-19", 1);
    const d2 = isoPlusDays(d1, 1);
    const d3 = isoPlusDays("2026-07-19", 2);
    expect(d2).toBe(d3);
  });

  it("counts days between dates", () => {
    expect(isoDaysBetween("2026-07-19", "2026-08-02")).toBe(14);
    expect(isoDaysBetween("2026-07-19", "2026-07-19")).toBe(1); // floored at 1
    expect(isoDaysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });

  it("falls back on garbage input", () => {
    expect(isoPlusDays("not-a-date", 7)).toBe("not-a-date");
    expect(isoDaysBetween("x", "y")).toBe(14);
  });
});
