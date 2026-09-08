import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { updateKnowledgeArticle } from "@/lib/knowledge-base";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.knowledge.manage");
  if (denied) return denied;
  const { id } = await params;
  let patch: Parameters<typeof updateKnowledgeArticle>[1] = {};
  try {
    patch = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  await updateKnowledgeArticle(id, patch);
  await logAudit({ action: "knowledge_article_updated", targetId: id, targetType: "knowledge_article", details: { patch }, req });
  return Response.json({ ok: true });
}
