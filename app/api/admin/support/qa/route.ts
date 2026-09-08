import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { createQaReview, listQaReviews, type QaScores } from "@/lib/qa-reviews";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.qa.manage");
  if (denied) return denied;
  const url = new URL(req.url);
  const agentId = url.searchParams.get("agentId") ?? undefined;
  const reviews = await listQaReviews({ agentId });
  return Response.json({ reviews });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.qa.review");
  if (denied) return denied;

  let body: { conversationId?: string; agentId?: string; scores?: QaScores; notes?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.conversationId || !body.agentId || !body.scores) {
    return Response.json({ error: "conversationId, agentId, and scores are required." }, { status: 400 });
  }

  const review = await createQaReview({ conversationId: body.conversationId, agentId: body.agentId, reviewerId: user!.id, scores: body.scores, notes: body.notes });
  await logAudit({ action: "qa_review_created", targetId: review.id, targetType: "qa_review", details: { conversationId: body.conversationId, agentId: body.agentId, score: review.score }, req });
  return Response.json({ ok: true, review });
}
