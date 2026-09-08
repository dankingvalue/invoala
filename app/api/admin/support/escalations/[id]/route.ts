import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission, hasSupportPermission } from "@/lib/support-permissions";
import { getEscalation, updateEscalationStatus, recordEscalationDecision, linkEscalationToIncident, type EscalationDecision, type EscalationStatus } from "@/lib/support-escalations";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { dbGet } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const escalation = await getEscalation(id);
  if (!escalation) return Response.json({ error: "Not found" }, { status: 404 });
  const canManage = hasSupportPermission(user.role, "support.escalations.manage");
  if (!canManage && escalation.created_by !== user.id) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json({ escalation });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const { id } = await params;
  const escalation = await getEscalation(id);
  if (!escalation) return Response.json({ error: "Not found" }, { status: 404 });

  // Only the tier this escalation was sent TO may act on it (accept/decide);
  // the tier that sent it may only view (checked elsewhere).
  const permission = escalation.to_role === "superadmin" ? "superadmin.escalations.decide" : "admin.escalations.decide";
  const denied = requireSupportPermission(user, permission);
  if (denied) return denied;

  let body: { status?: EscalationStatus; decision?: EscalationDecision; reason?: string; incidentId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.incidentId) {
    await linkEscalationToIncident(id, body.incidentId);
  }

  if (body.decision) {
    await recordEscalationDecision(id, { decision: body.decision, reason: body.reason ?? "", decidedBy: user!.id });
    await logAudit({ action: "escalation_decided", targetId: id, targetType: "escalation", details: { decision: body.decision, reason: body.reason }, req });
    await createNotification({
      userId: escalation.created_by,
      type: "escalation_decided",
      title: `Escalation ${escalation.ref} decided: ${body.decision}`,
      body: body.reason?.slice(0, 200) ?? "",
      meta: { escalationId: id },
    });
  } else if (body.status) {
    await updateEscalationStatus(id, body.status);
    await logAudit({ action: "escalation_status_changed", targetId: id, targetType: "escalation", details: { status: body.status }, req });
  }

  const updated = await dbGet("SELECT * FROM escalations WHERE id = ?", id);
  return Response.json({ ok: true, escalation: updated });
}
