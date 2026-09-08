import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission, hasSupportPermission } from "@/lib/support-permissions";
import { createKnowledgeArticle, listKnowledgeArticles, type KnowledgeAudience } from "@/lib/knowledge-base";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const audience = (url.searchParams.get("audience") as KnowledgeAudience | null) ?? undefined;

  // Internal articles require an explicit permission — never exposed to a
  // customer-facing surface (spec section 27: never let users access
  // internal knowledge).
  if (audience === "internal" && !hasSupportPermission(user.role, "support.knowledge.view_internal")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const articles = await listKnowledgeArticles({ audience, includeArchived: false });
  return Response.json({ articles });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.knowledge.manage");
  if (denied) return denied;

  let body: { title?: string; body?: string; category?: string; audience?: KnowledgeAudience } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.title || !body.body || !body.audience) return Response.json({ error: "Title, body, and audience are required." }, { status: 400 });

  const article = await createKnowledgeArticle({ title: body.title, body: body.body, category: body.category || "general", audience: body.audience, createdBy: user!.id });
  await logAudit({ action: "knowledge_article_created", targetId: article.id, targetType: "knowledge_article", details: { title: article.title, audience: article.audience }, req });
  return Response.json({ ok: true, article });
}
