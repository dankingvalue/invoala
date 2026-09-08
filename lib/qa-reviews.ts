import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export type QaReview = {
  id: string;
  conversation_id: string;
  agent_id: string;
  reviewer_id: string;
  accuracy: number;
  helpfulness: number;
  professionalism: number;
  policy_compliance: number;
  correct_escalation: number;
  correct_resolution: number;
  documentation_quality: number;
  score: number;
  notes: string;
  created_at: number;
};

export type QaScores = {
  accuracy: number;
  helpfulness: number;
  professionalism: number;
  policyCompliance: number;
  correctEscalation: number;
  correctResolution: number;
  documentationQuality: number;
};

// Each criterion is scored 0-100; overall score is their simple average.
// Kept separate from the customer CSAT rating throughout — this is an
// internal quality assessment, CSAT is customer perception (spec section 23).
export async function createQaReview(opts: {
  conversationId: string;
  agentId: string;
  reviewerId: string;
  scores: QaScores;
  notes?: string;
}): Promise<QaReview> {
  const id = randomUUID();
  const now = Date.now();
  const values = Object.values(opts.scores);
  const score = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
  await dbRun(
    `INSERT INTO qa_reviews (id, conversation_id, agent_id, reviewer_id, accuracy, helpfulness, professionalism, policy_compliance, correct_escalation, correct_resolution, documentation_quality, score, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id, opts.conversationId, opts.agentId, opts.reviewerId,
    opts.scores.accuracy, opts.scores.helpfulness, opts.scores.professionalism, opts.scores.policyCompliance,
    opts.scores.correctEscalation, opts.scores.correctResolution, opts.scores.documentationQuality,
    score, opts.notes ?? "", now,
  );
  const row = await dbGet<QaReview>("SELECT * FROM qa_reviews WHERE id = ?", id);
  return row!;
}

export async function listQaReviews(filter: { agentId?: string; limit?: number }): Promise<QaReview[]> {
  const conditions: string[] = [];
  const args: string[] = [];
  if (filter.agentId) { conditions.push("agent_id = ?"); args.push(filter.agentId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = Math.min(Math.max(filter.limit ?? 100, 1), 500);
  return dbAll<QaReview>(`SELECT * FROM qa_reviews ${where} ORDER BY created_at DESC LIMIT ?`, ...args, limit);
}

// Prioritized random sampling: low-rated, reopened, escalated, and P1/P2
// conversations first, filling the remainder with a random sample of
// otherwise-ordinary resolved conversations not yet reviewed.
export async function sampleConversationsForQa(count: number): Promise<Array<{ id: string; subject: string; reason: string }>> {
  const priority = await dbAll<{ id: string; subject: string; reason: string }>(
    `SELECT c.id, c.subject,
        CASE
          WHEN c.rating IS NOT NULL AND c.rating <= 2 THEN 'low_rating'
          WHEN c.reopened_count > 0 THEN 'reopened'
          WHEN EXISTS (SELECT 1 FROM escalations e WHERE e.conversation_id = c.id) THEN 'escalated'
          WHEN c.priority IN ('p1','p2') THEN 'high_priority'
        END as reason
     FROM conversations c
     WHERE c.status = 'resolved' AND c.human_handled = 1
       AND c.id NOT IN (SELECT conversation_id FROM qa_reviews)
       AND (
         (c.rating IS NOT NULL AND c.rating <= 2)
         OR c.reopened_count > 0
         OR EXISTS (SELECT 1 FROM escalations e WHERE e.conversation_id = c.id)
         OR c.priority IN ('p1','p2')
       )
     ORDER BY c.resolved_at DESC
     LIMIT ?`,
    count,
  );
  if (priority.length >= count) return priority.slice(0, count);

  const remaining = count - priority.length;
  const excludeIds = priority.map((p) => p.id);
  const placeholders = excludeIds.length ? excludeIds.map(() => "?").join(",") : "''";
  const random = await dbAll<{ id: string; subject: string }>(
    `SELECT id, subject FROM conversations
     WHERE status = 'resolved' AND human_handled = 1
       AND id NOT IN (SELECT conversation_id FROM qa_reviews)
       AND id NOT IN (${placeholders})
     ORDER BY RANDOM()
     LIMIT ?`,
    ...excludeIds, remaining,
  );
  return [...priority, ...random.map((r) => ({ ...r, reason: "random_sample" }))];
}
