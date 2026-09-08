import { dbAll, dbGet } from "@/lib/db";

// Balanced agent-performance model. Message count is tracked (ACTIVITY) but
// deliberately never used to rank or score an agent — see spec: "an agent
// sending 1,000 unnecessary messages should not appear better than an agent
// resolving 200 issues efficiently." Metrics are grouped and labeled exactly
// as ACTIVITY / QUALITY / SPEED / OUTCOMES / CUSTOMER SATISFACTION so the UI
// can render them under those headings without re-deriving the grouping.

export type AgentMetrics = {
  agentId: string;
  agentName: string;
  agentEmail: string;
  available: boolean;
  // ACTIVITY
  conversationsHandled: number;
  messagesSent: number;
  customersHelped: number;
  // OUTCOMES
  resolved: number;
  resolutionRate: number; // resolved / handled
  firstContactResolutionRate: number; // resolved, never reopened/escalated
  escalations: number;
  escalationRate: number;
  reopenedConversations: number;
  reopenRate: number;
  // SPEED
  avgFirstResponseMins: number | null;
  avgResolutionMins: number | null;
  slaComplianceRate: number | null;
  // QUALITY
  qaScore: number | null;
  qaReviewCount: number;
  // CUSTOMER SATISFACTION
  csatAverage: number | null;
  csatCount: number;
  positiveRatingRate: number | null; // 4-5 star share
  // WORKLOAD (current, not windowed)
  pendingWorkload: number;
};

export type MetricsWindow = { from: number; to: number };

async function listAgentUsers(): Promise<Array<{ id: string; name: string; email: string; agent_available: number }>> {
  return dbAll(`SELECT id, name, email, agent_available FROM users WHERE role IN ('support','admin','superadmin')`);
}

export async function getAgentMetrics(agentId: string, window: MetricsWindow): Promise<AgentMetrics | null> {
  const agent = await dbGet<{ id: string; name: string; email: string; agent_available: number }>(
    "SELECT id, name, email, agent_available FROM users WHERE id = ?",
    agentId,
  );
  if (!agent) return null;

  const [handledRow, msgRow, resolvedRow, escRow, reopenRow, speedRow, qaRow, csatRow, pendingRow] = await Promise.all([
    dbGet<{ n: number; customers: number }>(
      `SELECT COUNT(DISTINCT c.id) as n, COUNT(DISTINCT c.user_id) as customers
       FROM conversations c
       WHERE c.assigned_to = ? AND c.created_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ n: number }>(
      `SELECT COUNT(*) as n FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE m.sender_id = ? AND m.sender_type = 'support' AND m.created_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ n: number }>(
      `SELECT COUNT(*) as n FROM conversations c
       WHERE c.assigned_to = ? AND c.status = 'resolved' AND c.resolved_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ n: number }>(
      `SELECT COUNT(DISTINCT e.conversation_id) as n FROM escalations e
       JOIN conversations c ON c.id = e.conversation_id
       WHERE c.assigned_to = ? AND e.from_role = 'support' AND e.created_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ n: number }>(
      `SELECT COUNT(*) as n FROM conversations c
       WHERE c.assigned_to = ? AND c.reopened_count > 0 AND c.created_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ avg_first: number | null; avg_res: number | null; sla_total: number; sla_met: number }>(
      `SELECT
        AVG(CASE WHEN c.first_response_at IS NOT NULL THEN (c.first_response_at - c.created_at) / 60000.0 END) as avg_first,
        AVG(CASE WHEN c.resolved_at IS NOT NULL THEN (c.resolved_at - c.created_at) / 60000.0 END) as avg_res,
        COUNT(CASE WHEN c.resolved_at IS NOT NULL THEN 1 END) as sla_total,
        COUNT(CASE WHEN c.resolved_at IS NOT NULL AND c.sla_resolution_breached = 0 THEN 1 END) as sla_met
       FROM conversations c
       WHERE c.assigned_to = ? AND c.created_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ avg_score: number | null; n: number }>(
      `SELECT AVG(score) as avg_score, COUNT(*) as n FROM qa_reviews WHERE agent_id = ? AND created_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ avg_rating: number | null; n: number; positive: number }>(
      `SELECT AVG(c.rating) as avg_rating, COUNT(c.rating) as n,
        COUNT(CASE WHEN c.rating >= 4 THEN 1 END) as positive
       FROM conversations c
       WHERE c.assigned_to = ? AND c.rating IS NOT NULL AND c.human_handled = 1 AND c.rating_at BETWEEN ? AND ?`,
      agentId, window.from, window.to,
    ),
    dbGet<{ n: number }>(
      `SELECT COUNT(*) as n FROM conversations c WHERE c.assigned_to = ? AND c.status IN ('escalated','support')`,
      agentId,
    ),
  ]);

  const handled = handledRow?.n ?? 0;
  const resolved = resolvedRow?.n ?? 0;
  const escalations = escRow?.n ?? 0;
  const reopened = reopenRow?.n ?? 0;
  const fcr = resolved > 0 ? Math.max(0, resolved - reopened - escalations) / resolved : 0;

  return {
    agentId: agent.id,
    agentName: agent.name || agent.email,
    agentEmail: agent.email,
    available: !!agent.agent_available,
    conversationsHandled: handled,
    messagesSent: msgRow?.n ?? 0,
    customersHelped: handledRow?.customers ?? 0,
    resolved,
    resolutionRate: handled > 0 ? resolved / handled : 0,
    firstContactResolutionRate: fcr,
    escalations,
    escalationRate: handled > 0 ? escalations / handled : 0,
    reopenedConversations: reopened,
    reopenRate: resolved > 0 ? reopened / resolved : 0,
    avgFirstResponseMins: speedRow?.avg_first ?? null,
    avgResolutionMins: speedRow?.avg_res ?? null,
    slaComplianceRate: speedRow && speedRow.sla_total > 0 ? speedRow.sla_met / speedRow.sla_total : null,
    qaScore: qaRow?.avg_score ?? null,
    qaReviewCount: qaRow?.n ?? 0,
    csatAverage: csatRow?.avg_rating ?? null,
    csatCount: csatRow?.n ?? 0,
    positiveRatingRate: csatRow && csatRow.n > 0 ? csatRow.positive / csatRow.n : null,
    pendingWorkload: pendingRow?.n ?? 0,
  };
}

export async function getAllAgentMetrics(window: MetricsWindow): Promise<AgentMetrics[]> {
  const agents = await listAgentUsers();
  const results = await Promise.all(agents.map((a) => getAgentMetrics(a.id, window)));
  return results.filter((r): r is AgentMetrics => !!r);
}

// Weighted overall score (spec section 36) — configurable weights, default
// matches the spec's suggested starting model. Every component is returned
// alongside the score so the UI can show why an agent scored what they did,
// per "never allow raw message count to dominate the score."
export type ScoreWeights = {
  csat: number;
  fcr: number;
  sla: number;
  qa: number;
  speed: number;
  reopen: number;
  workload: number;
};

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  csat: 0.3,
  fcr: 0.2,
  sla: 0.15,
  qa: 0.15,
  speed: 0.1,
  reopen: 0.05,
  workload: 0.05,
};

export function computeOverallScore(m: AgentMetrics, weights: ScoreWeights = DEFAULT_SCORE_WEIGHTS): { score: number; components: Record<string, number> } {
  const csatComponent = m.csatAverage !== null ? (m.csatAverage / 5) * 100 : 70; // neutral default when no ratings yet
  const fcrComponent = m.firstContactResolutionRate * 100;
  const slaComponent = m.slaComplianceRate !== null ? m.slaComplianceRate * 100 : 70;
  const qaComponent = m.qaScore !== null ? m.qaScore : 70;
  // Speed: faster than a 4-hour resolution target scores higher, floors at 0.
  const speedTargetMins = 240;
  const speedComponent = m.avgResolutionMins !== null ? Math.max(0, Math.min(100, 100 - ((m.avgResolutionMins - speedTargetMins) / speedTargetMins) * 50)) : 70;
  const reopenComponent = Math.max(0, 100 - m.reopenRate * 200);
  const workloadComponent = Math.max(0, 100 - m.pendingWorkload * 5);

  const components = {
    csat: csatComponent,
    fcr: fcrComponent,
    sla: slaComponent,
    qa: qaComponent,
    speed: speedComponent,
    reopen: reopenComponent,
    workload: workloadComponent,
  };

  const score =
    components.csat * weights.csat +
    components.fcr * weights.fcr +
    components.sla * weights.sla +
    components.qa * weights.qa +
    components.speed * weights.speed +
    components.reopen * weights.reopen +
    components.workload * weights.workload;

  return { score: Math.round(score * 10) / 10, components };
}
