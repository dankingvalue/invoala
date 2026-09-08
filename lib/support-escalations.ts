import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export type EscalationCategory =
  | "technical_bug"
  | "billing"
  | "payment"
  | "account"
  | "security"
  | "abuse"
  | "refund"
  | "feature_request"
  | "product_decision"
  | "infrastructure"
  | "customer_complaint"
  | "other";

export type EscalationImpact = "individual_customer" | "multiple_customers" | "platform_wide";
export type EscalationSeverity = "p1" | "p2" | "p3" | "p4";
export type EscalationStatus = "pending" | "accepted" | "returned" | "resolved" | "escalated";
export type EscalationRole = "support" | "admin" | "superadmin";
export type EscalationDecision = "approve" | "reject" | "request_info" | "return" | "completed";

export type Escalation = {
  id: string;
  ref: string;
  conversation_id: string;
  from_role: EscalationRole;
  to_role: EscalationRole;
  category: EscalationCategory;
  subcategory: string;
  impact: EscalationImpact;
  severity: EscalationSeverity;
  issue_statement: string;
  attempted: string;
  evidence: string;
  assessment: string;
  requested_action: string;
  is_emergency: number;
  status: EscalationStatus;
  incident_id: string | null;
  created_by: string;
  created_at: number;
  updated_at: number;
  decision: EscalationDecision | null;
  decision_reason: string | null;
  decision_by: string | null;
  decision_at: number | null;
  resolved_at: number | null;
};

function genRef(): string {
  return `ESC-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 36 ** 2).toString(36).toUpperCase().padStart(2, "0")}`;
}

export async function createEscalation(opts: {
  conversationId: string;
  fromRole: EscalationRole;
  toRole: EscalationRole;
  category: EscalationCategory;
  subcategory?: string;
  impact: EscalationImpact;
  severity: EscalationSeverity;
  issueStatement: string;
  attempted?: string;
  evidence?: string;
  assessment?: string;
  requestedAction: string;
  isEmergency?: boolean;
  createdBy: string;
}): Promise<Escalation> {
  const id = randomUUID();
  const now = Date.now();
  const ref = genRef();
  await dbRun(
    `INSERT INTO escalations (
      id, ref, conversation_id, from_role, to_role, category, subcategory, impact, severity,
      issue_statement, attempted, evidence, assessment, requested_action, is_emergency,
      status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
    id, ref, opts.conversationId, opts.fromRole, opts.toRole, opts.category, opts.subcategory ?? "",
    opts.impact, opts.severity, opts.issueStatement, opts.attempted ?? "", opts.evidence ?? "",
    opts.assessment ?? "", opts.requestedAction, opts.isEmergency ? 1 : 0, opts.createdBy, now, now,
  );
  const row = await dbGet<Escalation>("SELECT * FROM escalations WHERE id = ?", id);
  return row!;
}

export async function listEscalations(filter: {
  toRole?: EscalationRole;
  status?: EscalationStatus;
  category?: EscalationCategory;
  severity?: EscalationSeverity;
  incidentId?: string;
  limit?: number;
}): Promise<Escalation[]> {
  const conditions: string[] = [];
  const args: (string | number)[] = [];
  if (filter.toRole) { conditions.push("to_role = ?"); args.push(filter.toRole); }
  if (filter.status) { conditions.push("status = ?"); args.push(filter.status); }
  if (filter.category) { conditions.push("category = ?"); args.push(filter.category); }
  if (filter.severity) { conditions.push("severity = ?"); args.push(filter.severity); }
  if (filter.incidentId) { conditions.push("incident_id = ?"); args.push(filter.incidentId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filter.limit ?? 100, 1), 500);
  return dbAll<Escalation>(`SELECT * FROM escalations ${where} ORDER BY is_emergency DESC, severity ASC, created_at DESC LIMIT ?`, ...args, limit);
}

export async function getEscalation(id: string): Promise<Escalation | undefined> {
  return dbGet<Escalation>("SELECT * FROM escalations WHERE id = ?", id);
}

export async function updateEscalationStatus(id: string, status: EscalationStatus): Promise<void> {
  const now = Date.now();
  await dbRun(
    `UPDATE escalations SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_at END WHERE id = ?`,
    status, now, status, now, id,
  );
}

export async function recordEscalationDecision(id: string, opts: {
  decision: EscalationDecision;
  reason: string;
  decidedBy: string;
}): Promise<void> {
  const now = Date.now();
  const status: EscalationStatus = opts.decision === "return" ? "returned" : opts.decision === "request_info" ? "pending" : "resolved";
  await dbRun(
    `UPDATE escalations SET decision = ?, decision_reason = ?, decision_by = ?, decision_at = ?, status = ?, updated_at = ?, resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_at END WHERE id = ?`,
    opts.decision, opts.reason, opts.decidedBy, now, status, now, status, now, id,
  );
}

export async function linkEscalationToIncident(id: string, incidentId: string): Promise<void> {
  await dbRun("UPDATE escalations SET incident_id = ?, updated_at = ? WHERE id = ?", incidentId, Date.now(), id);
}

// Recurring-issue detection: groups pending/recent escalations by
// category+subcategory over the trailing window, surfacing anything that's
// showing up often enough to be a product problem rather than one-off
// tickets. Deliberately simple (a GROUP BY, not a clustering model) — see
// the spec's own "smallest robust architecture" instruction.
export type RecurringIssue = {
  category: string;
  subcategory: string;
  occurrences: number;
  affected_customers: number;
  escalated: number;
};

export async function getRecurringIssues(sinceMs: number): Promise<RecurringIssue[]> {
  return dbAll<RecurringIssue>(
    `SELECT c.category as category, c.subcategory as subcategory,
        COUNT(*) as occurrences,
        COUNT(DISTINCT c.user_id) as affected_customers,
        SUM(CASE WHEN EXISTS (SELECT 1 FROM escalations e WHERE e.conversation_id = c.id) THEN 1 ELSE 0 END) as escalated
     FROM conversations c
     WHERE c.created_at >= ? AND c.category != ''
     GROUP BY c.category, c.subcategory
     HAVING COUNT(*) >= 3
     ORDER BY occurrences DESC
     LIMIT 20`,
    sinceMs,
  );
}
