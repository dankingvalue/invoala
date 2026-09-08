import { dbAll, dbGet } from "@/lib/db";

export type CsatFilter = {
  from: number;
  to: number;
  agentId?: string;
  humanOnly?: boolean; // false/undefined = both, true = human-handled only
};

export type CsatSummary = {
  average: number | null;
  total: number;
  responseRate: number | null; // ratings / resolved conversations
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
};

// AI-only and human-support ratings are kept distinct throughout (spec
// section 4/14) via the human_handled flag already set on the conversation
// the first time a support/admin/superadmin message is sent to it.
export async function getCsatSummary(filter: CsatFilter): Promise<CsatSummary> {
  const conditions = ["c.rating IS NOT NULL", "c.rating_at BETWEEN ? AND ?"];
  const args: (string | number)[] = [filter.from, filter.to];
  if (filter.agentId) { conditions.push("c.assigned_to = ?"); args.push(filter.agentId); }
  if (filter.humanOnly) conditions.push("c.human_handled = 1");
  const where = conditions.join(" AND ");

  const [avgRow, distRows, resolvedRow] = await Promise.all([
    dbGet<{ avg: number | null; n: number }>(`SELECT AVG(c.rating) as avg, COUNT(*) as n FROM conversations c WHERE ${where}`, ...args),
    dbAll<{ rating: number; n: number }>(`SELECT c.rating as rating, COUNT(*) as n FROM conversations c WHERE ${where} GROUP BY c.rating`, ...args),
    dbGet<{ n: number }>(
      `SELECT COUNT(*) as n FROM conversations c WHERE c.status = 'resolved' AND c.resolved_at BETWEEN ? AND ? ${filter.agentId ? "AND c.assigned_to = ?" : ""} ${filter.humanOnly ? "AND c.human_handled = 1" : ""}`,
      filter.from, filter.to, ...(filter.agentId ? [filter.agentId] : []),
    ),
  ]);

  const distribution: CsatSummary["distribution"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of distRows) {
    if (row.rating >= 1 && row.rating <= 5) distribution[row.rating as 1 | 2 | 3 | 4 | 5] = row.n;
  }

  return {
    average: avgRow?.avg ?? null,
    total: avgRow?.n ?? 0,
    responseRate: resolvedRow && resolvedRow.n > 0 ? (avgRow?.n ?? 0) / resolvedRow.n : null,
    distribution,
  };
}

export async function getCsatTrend(filter: CsatFilter, buckets = 14): Promise<Array<{ bucketStart: number; average: number | null; count: number }>> {
  const bucketMs = Math.max(1, Math.round((filter.to - filter.from) / buckets));
  const rows = await dbAll<{ rating: number; rating_at: number }>(
    `SELECT rating, rating_at FROM conversations WHERE rating IS NOT NULL AND rating_at BETWEEN ? AND ? ${filter.agentId ? "AND assigned_to = ?" : ""}`,
    filter.from, filter.to, ...(filter.agentId ? [filter.agentId] : []),
  );
  const out: Array<{ bucketStart: number; average: number | null; count: number }> = [];
  for (let i = 0; i < buckets; i++) {
    const start = filter.from + i * bucketMs;
    const end = start + bucketMs;
    const inBucket = rows.filter((r) => r.rating_at >= start && r.rating_at < end);
    out.push({
      bucketStart: start,
      average: inBucket.length ? inBucket.reduce((s, r) => s + r.rating, 0) / inBucket.length : null,
      count: inBucket.length,
    });
  }
  return out;
}
