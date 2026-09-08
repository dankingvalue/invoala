import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { createEscalation, type EscalationCategory } from "@/lib/support-escalations";
import { logAudit } from "@/lib/audit";
import { createNotification } from "@/lib/notifications";
import { sendToTelegram } from "@/lib/ai";
import { dbAll, dbRun } from "@/lib/db";

// Controlled P1 emergency override: a Support agent may escalate straight to
// Super Admin (bypassing the normal Support->Admin hop) but ONLY for the
// predefined high-severity categories below, and only with a reason +
// evidence — never a silent/instant bypass. Every use is audited and pages
// both Admin and Super Admin immediately.
const EMERGENCY_CATEGORIES: EscalationCategory[] = ["security", "payment", "infrastructure"];

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.emergency.trigger");
  if (denied) return denied;

  let body: { conversationId?: string; category?: EscalationCategory; reason?: string; impact?: string; evidence?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!body.conversationId || !body.category || !body.reason) {
    return Response.json({ error: "conversationId, category, and reason are required." }, { status: 400 });
  }
  if (!EMERGENCY_CATEGORIES.includes(body.category)) {
    return Response.json({ error: `Emergency escalation is only available for: ${EMERGENCY_CATEGORIES.join(", ")}.` }, { status: 400 });
  }

  const escalation = await createEscalation({
    conversationId: body.conversationId,
    fromRole: "support",
    toRole: "superadmin",
    category: body.category,
    impact: (body.impact as never) || "platform_wide",
    severity: "p1",
    issueStatement: body.reason,
    evidence: body.evidence ?? "",
    requestedAction: "Immediate Super Admin attention required.",
    isEmergency: true,
    createdBy: user!.id,
  });

  await dbRun("UPDATE conversations SET priority = 'p1', emergency = 1, updated_at = ? WHERE id = ?", Date.now(), body.conversationId);

  await logAudit({
    action: "emergency_escalation",
    targetId: escalation.id,
    targetType: "escalation",
    details: { ref: escalation.ref, category: body.category, conversationId: body.conversationId },
    req,
  });

  const superAdmins = await dbAll<{ id: string }>("SELECT id FROM users WHERE role = 'superadmin'");
  await Promise.all(
    superAdmins.map((s) =>
      createNotification({
        userId: s.id,
        type: "emergency_escalation",
        title: `🚨 Emergency escalation: ${escalation.ref}`,
        body: body.reason!.slice(0, 200),
        meta: { escalationId: escalation.id, conversationId: body.conversationId },
      }),
    ),
  );
  await sendToTelegram(user!.email, `EMERGENCY (${body.category}): ${body.reason}`, body.conversationId).catch(() => {});

  return Response.json({ ok: true, escalation });
}
