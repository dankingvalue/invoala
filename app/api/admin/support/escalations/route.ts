import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission, hasSupportPermission } from "@/lib/support-permissions";
import { createEscalation, listEscalations, type EscalationCategory, type EscalationImpact, type EscalationSeverity, type EscalationRole } from "@/lib/support-escalations";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { dbAll } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const canView = hasSupportPermission(user.role, "support.escalations.create") || hasSupportPermission(user.role, "support.escalations.manage");
  if (!canView) return Response.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const toRole = (url.searchParams.get("toRole") as EscalationRole | null) ?? undefined;
  const status = (url.searchParams.get("status") as never) ?? undefined;

  const escalations = await listEscalations({ toRole, status });
  // Support agents (who can only create, not manage) see only their own.
  const visible = hasSupportPermission(user.role, "support.escalations.manage")
    ? escalations
    : escalations.filter((e) => e.created_by === user.id);
  return Response.json({ escalations: visible });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.escalations.create");
  if (denied) return denied;

  let body: {
    conversationId?: string; toRole?: EscalationRole; category?: EscalationCategory; subcategory?: string;
    impact?: EscalationImpact; severity?: EscalationSeverity; issueStatement?: string; attempted?: string;
    evidence?: string; assessment?: string; requestedAction?: string; isEmergency?: boolean;
  } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.conversationId || !body.toRole || !body.category || !body.impact || !body.severity || !body.issueStatement || !body.requestedAction) {
    return Response.json({ error: "Missing required escalation fields." }, { status: 400 });
  }

  // Admin escalating to Super Admin requires admin.escalations.decide-tier
  // access; Support escalating to Admin only needs the base create
  // permission already checked above.
  if (body.toRole === "superadmin") {
    const superDenied = requireSupportPermission(user, "admin.escalations.decide");
    if (superDenied) return superDenied;
  }

  const escalation = await createEscalation({
    conversationId: body.conversationId,
    fromRole: user!.role as EscalationRole,
    toRole: body.toRole,
    category: body.category,
    subcategory: body.subcategory,
    impact: body.impact,
    severity: body.severity,
    issueStatement: body.issueStatement,
    attempted: body.attempted,
    evidence: body.evidence,
    assessment: body.assessment,
    requestedAction: body.requestedAction,
    isEmergency: body.isEmergency,
    createdBy: user!.id,
  });

  await logAudit({
    action: "escalation_created",
    targetId: escalation.id,
    targetType: "escalation",
    details: { ref: escalation.ref, conversationId: body.conversationId, toRole: body.toRole, severity: body.severity, isEmergency: !!body.isEmergency },
    req,
  });

  // Notify whichever tier this escalated to.
  const recipients = await dbAll<{ id: string }>("SELECT id FROM users WHERE role = ?", body.toRole);
  await Promise.all(
    recipients.map((r) =>
      createNotification({
        userId: r.id,
        type: body.isEmergency ? "emergency_escalation" : "escalation",
        title: body.isEmergency ? `Emergency escalation: ${escalation.ref}` : `New escalation: ${escalation.ref}`,
        body: body.issueStatement!.slice(0, 200),
        meta: { escalationId: escalation.id, conversationId: body.conversationId },
      }),
    ),
  );

  return Response.json({ ok: true, escalation });
}
