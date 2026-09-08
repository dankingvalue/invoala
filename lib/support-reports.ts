import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

// Shift + admin daily reports. "AI-generated draft" here means "computed
// from real data, human reviews/submits" (spec section 14: "AI must
// generate drafts, not silently make important administrative decisions") —
// no LLM call is needed to responsibly summarize numbers that are already
// exact; a generated narrative would just be re-describing them with added
// hallucination risk. The agent/admin still reviews before it's final.

export type ShiftReportData = {
  conversationsHandled: number;
  customersHelped: number;
  resolved: number;
  pending: number;
  waitingForCustomer: number;
  escalated: number;
  p1p2Count: number;
  slaBreaches: number;
  proConversations: number;
  topIssues: Array<{ category: string; count: number }>;
  complaints: number;
  featureRequests: number;
};

export async function buildShiftReportDraft(agentId: string, fromMs: number, toMs: number): Promise<ShiftReportData> {
  const [handled, resolved, pending, waiting, escalated, p1p2, sla, issues, complaints, featureRequests] = await Promise.all([
    dbGet<{ n: number; customers: number }>(
      `SELECT COUNT(*) as n, COUNT(DISTINCT user_id) as customers FROM conversations WHERE assigned_to = ? AND created_at BETWEEN ? AND ?`,
      agentId, fromMs, toMs,
    ),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND status = 'resolved' AND resolved_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND status IN ('escalated','support') AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND status = 'support' AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM escalations WHERE created_by = ? AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND priority IN ('p1','p2') AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND (sla_first_response_breached = 1 OR sla_resolution_breached = 1) AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbAll<{ category: string; n: number }>(
      `SELECT category, COUNT(*) as n FROM conversations WHERE assigned_to = ? AND category != '' AND created_at BETWEEN ? AND ? GROUP BY category ORDER BY n DESC LIMIT 5`,
      agentId, fromMs, toMs,
    ),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND product_feedback_tag = 'ux_problem' AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE assigned_to = ? AND product_feedback_tag = 'feature_request' AND created_at BETWEEN ? AND ?`, agentId, fromMs, toMs),
  ]);

  return {
    conversationsHandled: handled?.n ?? 0,
    customersHelped: handled?.customers ?? 0,
    resolved: resolved?.n ?? 0,
    pending: pending?.n ?? 0,
    waitingForCustomer: waiting?.n ?? 0,
    escalated: escalated?.n ?? 0,
    p1p2Count: p1p2?.n ?? 0,
    slaBreaches: sla?.n ?? 0,
    proConversations: 0, // filled by caller if plan-join is needed; kept simple here
    topIssues: issues.map((i) => ({ category: i.category, count: i.n })),
    complaints: complaints?.n ?? 0,
    featureRequests: featureRequests?.n ?? 0,
  };
}

export async function submitShiftReport(opts: {
  agentId: string;
  shiftDate: string;
  data: ShiftReportData;
  recommendations: string;
  amendedFrom?: string;
}): Promise<string> {
  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    `INSERT INTO shift_reports (id, agent_id, shift_date, data, recommendations, status, submitted_at, amended_from, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'submitted', ?, ?, ?, ?)`,
    id, opts.agentId, opts.shiftDate, JSON.stringify(opts.data), opts.recommendations, now, opts.amendedFrom ?? null, now, now,
  );
  return id;
}

export async function listShiftReports(filter: { agentId?: string; limit?: number }): Promise<Array<{
  id: string; agent_id: string; agent_name: string; shift_date: string; data: string; recommendations: string;
  status: string; submitted_at: number | null; created_at: number;
}>> {
  const conditions: string[] = [];
  const args: string[] = [];
  if (filter.agentId) { conditions.push("s.agent_id = ?"); args.push(filter.agentId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200);
  return dbAll(
    `SELECT s.id, s.agent_id, COALESCE(u.name, u.email) as agent_name, s.shift_date, s.data, s.recommendations, s.status, s.submitted_at, s.created_at
     FROM shift_reports s JOIN users u ON u.id = s.agent_id
     ${where} ORDER BY s.created_at DESC LIMIT ?`,
    ...args, limit,
  );
}

export type AdminDailyReport = {
  totalConversations: number;
  aiOnly: number;
  aiAssisted: number;
  humanOnly: number;
  resolved: number;
  open: number;
  pending: number;
  waiting: number;
  avgFirstResponseMins: number | null;
  avgResolutionMins: number | null;
  slaComplianceRate: number | null;
  slaBreaches: number;
  fcr: number;
  reopenRate: number;
  csatAverage: number | null;
  proVolume: number;
  freeVolume: number;
  escalationsToAdmin: number;
  escalationsToSuperadmin: number;
  topCategories: Array<{ category: string; count: number }>;
  anomalies: string[];
};

export async function buildAdminDailyReport(fromMs: number, toMs: number, prevFromMs: number, prevToMs: number): Promise<AdminDailyReport> {
  const [totals, aiOnly, resolvedRow, openRow, pendingRow, waitingRow, speed, sla, reopenRow, csatRow, escToAdmin, escToSuper, categories, prevCategories] = await Promise.all([
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE created_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ ai_only: number; human_handled: number }>(
      `SELECT COUNT(CASE WHEN human_handled = 0 THEN 1 END) as ai_only, COUNT(CASE WHEN human_handled = 1 THEN 1 END) as human_handled
       FROM conversations WHERE created_at BETWEEN ? AND ?`,
      fromMs, toMs,
    ),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE status = 'resolved' AND resolved_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE status IN ('escalated','support') AND created_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE status = 'escalated' AND created_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM conversations WHERE status = 'support' AND created_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ avg_first: number | null; avg_res: number | null }>(
      `SELECT AVG(CASE WHEN first_response_at IS NOT NULL THEN (first_response_at - created_at) / 60000.0 END) as avg_first,
              AVG(CASE WHEN resolved_at IS NOT NULL THEN (resolved_at - created_at) / 60000.0 END) as avg_res
       FROM conversations WHERE created_at BETWEEN ? AND ?`,
      fromMs, toMs,
    ),
    dbGet<{ total: number; met: number; breaches: number }>(
      `SELECT COUNT(CASE WHEN resolved_at IS NOT NULL THEN 1 END) as total,
              COUNT(CASE WHEN resolved_at IS NOT NULL AND sla_resolution_breached = 0 THEN 1 END) as met,
              COUNT(CASE WHEN sla_resolution_breached = 1 OR sla_first_response_breached = 1 THEN 1 END) as breaches
       FROM conversations WHERE created_at BETWEEN ? AND ?`,
      fromMs, toMs,
    ),
    dbGet<{ resolved: number; reopened: number }>(
      `SELECT COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved, COUNT(CASE WHEN reopened_count > 0 THEN 1 END) as reopened
       FROM conversations WHERE created_at BETWEEN ? AND ?`,
      fromMs, toMs,
    ),
    dbGet<{ avg: number | null }>(`SELECT AVG(rating) as avg FROM conversations WHERE rating IS NOT NULL AND rating_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM escalations WHERE to_role = 'admin' AND created_at BETWEEN ? AND ?`, fromMs, toMs),
    dbGet<{ n: number }>(`SELECT COUNT(*) as n FROM escalations WHERE to_role = 'superadmin' AND created_at BETWEEN ? AND ?`, fromMs, toMs),
    dbAll<{ category: string; n: number }>(`SELECT category, COUNT(*) as n FROM conversations WHERE category != '' AND created_at BETWEEN ? AND ? GROUP BY category ORDER BY n DESC LIMIT 8`, fromMs, toMs),
    dbAll<{ category: string; n: number }>(`SELECT category, COUNT(*) as n FROM conversations WHERE category != '' AND created_at BETWEEN ? AND ? GROUP BY category`, prevFromMs, prevToMs),
  ]);

  // Pro/Free volume needs a join to subscriptions; kept as a simple derived
  // query rather than pulling in the full billing module here.
  const proRow = await dbGet<{ n: number }>(
    `SELECT COUNT(*) as n FROM conversations c
     JOIN subscriptions s ON s.user_id = c.user_id AND s.status = 'active'
     WHERE c.created_at BETWEEN ? AND ?`,
    fromMs, toMs,
  );

  const anomalies: string[] = [];
  const prevMap = new Map(prevCategories.map((c) => [c.category, c.n]));
  for (const c of categories) {
    const prevN = prevMap.get(c.category) ?? 0;
    if (prevN >= 3 && c.n >= prevN * 2) {
      const pct = Math.round(((c.n - prevN) / prevN) * 100);
      anomalies.push(`${c.category} conversations increased ${pct}% vs. the prior period (${prevN} -> ${c.n}).`);
    } else if (prevN === 0 && c.n >= 5) {
      anomalies.push(`${c.category} is a new recurring category this period (${c.n} conversations, 0 previously).`);
    }
  }
  if (sla && sla.total > 0 && sla.met / sla.total < 0.8) {
    anomalies.push(`SLA compliance dropped to ${Math.round((sla.met / sla.total) * 100)}%, below the 80% target.`);
  }

  return {
    totalConversations: totals?.n ?? 0,
    aiOnly: aiOnly?.ai_only ?? 0,
    aiAssisted: 0,
    humanOnly: aiOnly?.human_handled ?? 0,
    resolved: resolvedRow?.n ?? 0,
    open: openRow?.n ?? 0,
    pending: pendingRow?.n ?? 0,
    waiting: waitingRow?.n ?? 0,
    avgFirstResponseMins: speed?.avg_first ?? null,
    avgResolutionMins: speed?.avg_res ?? null,
    slaComplianceRate: sla && sla.total > 0 ? sla.met / sla.total : null,
    slaBreaches: sla?.breaches ?? 0,
    fcr: reopenRow && reopenRow.resolved > 0 ? Math.max(0, reopenRow.resolved - reopenRow.reopened) / reopenRow.resolved : 0,
    reopenRate: reopenRow && reopenRow.resolved > 0 ? reopenRow.reopened / reopenRow.resolved : 0,
    csatAverage: csatRow?.avg ?? null,
    proVolume: proRow?.n ?? 0,
    freeVolume: (totals?.n ?? 0) - (proRow?.n ?? 0),
    escalationsToAdmin: escToAdmin?.n ?? 0,
    escalationsToSuperadmin: escToSuper?.n ?? 0,
    topCategories: categories.map((c) => ({ category: c.category, count: c.n })),
    anomalies,
  };
}
