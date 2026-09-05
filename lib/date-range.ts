// Shared by every admin stats endpoint so "today/7d/30d/month/custom" always
// resolves the same way — the bug this fixes was two cards on the same page
// silently using different windows (one all-time, one hardcoded 7 days) and
// looking like contradictory, made-up numbers next to each other.
export type RangeId = "today" | "7d" | "30d" | "month" | "all" | "custom";

export function resolveRange(
  range: string | null,
  fromParam: string | null,
  toParam: string | null,
): { from: number; to: number; range: RangeId } {
  const now = Date.now();

  if (range === "custom") {
    const from = Number(fromParam);
    const to = Number(toParam);
    return {
      from: Number.isFinite(from) ? from : now - 30 * 864e5,
      to: Number.isFinite(to) ? to : now,
      range: "custom",
    };
  }

  if (range === "today") {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return { from: start.getTime(), to: now, range: "today" };
  }

  if (range === "month") {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { from: start.getTime(), to: now, range: "month" };
  }

  if (range === "all") {
    return { from: 0, to: now, range: "all" };
  }

  if (range === "30d") {
    return { from: now - 30 * 864e5, to: now, range: "30d" };
  }

  // Default: last 7 days.
  return { from: now - 7 * 864e5, to: now, range: "7d" };
}
