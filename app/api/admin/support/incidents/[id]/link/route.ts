import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { linkConversationToIncident, unlinkConversationFromIncident } from "@/lib/incidents";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.incidents.manage");
  if (denied) return denied;
  const { id } = await params;
  let body: { conversationId?: string } = {};
  try {
    body = await req.json();
  } catch {}
  if (!body.conversationId) return Response.json({ error: "conversationId required." }, { status: 400 });

  await linkConversationToIncident(id, body.conversationId, user!.id);
  await logAudit({ action: "incident_conversation_linked", targetId: id, targetType: "incident", details: { conversationId: body.conversationId }, req });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.incidents.manage");
  if (denied) return denied;
  const { id } = await params;
  const url = new URL(req.url);
  const conversationId = url.searchParams.get("conversationId");
  if (!conversationId) return Response.json({ error: "conversationId required." }, { status: 400 });

  await unlinkConversationFromIncident(id, conversationId);
  await logAudit({ action: "incident_conversation_unlinked", targetId: id, targetType: "incident", details: { conversationId }, req });
  return Response.json({ ok: true });
}
