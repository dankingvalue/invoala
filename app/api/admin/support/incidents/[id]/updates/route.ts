import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { addIncidentUpdate, getIncidentUpdates, getIncident, getIncidentConversations } from "@/lib/incidents";
import { logAudit } from "@/lib/audit";
import { sendEmail } from "@/lib/email";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.conversations.view");
  if (denied) return denied;
  const { id } = await params;
  const updates = await getIncidentUpdates(id);
  return Response.json({ updates });
}

// Customer broadcasts require explicit Admin approval per update (spec
// section 31/10: "Do not automatically broadcast without Admin approval") —
// isCustomerBroadcast is a deliberate, audited, one-at-a-time action, never
// a background job that fires on its own.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.incidents.manage");
  if (denied) return denied;

  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) return Response.json({ error: "Not found" }, { status: 404 });

  let body: { body?: string; isCustomerBroadcast?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.body?.trim()) return Response.json({ error: "Update text is required." }, { status: 400 });

  await addIncidentUpdate({ incidentId: id, authorId: user!.id, body: body.body, statusAtTime: incident.status, isCustomerBroadcast: body.isCustomerBroadcast });

  let sentTo = 0;
  if (body.isCustomerBroadcast) {
    const denied2 = requireSupportPermission(user, "admin.broadcasts.manage");
    if (denied2) return denied2;
    const conversations = await getIncidentConversations(id);
    const uniqueEmails = [...new Set(conversations.map((c) => c.user_email))];
    for (const email of uniqueEmails) {
      const r = await sendEmail({
        to: email,
        subject: `Update on: ${incident.title}`,
        text: `Hi,\n\n${body.body}\n\n— Invoala Support`,
        kind: "other",
      });
      if (r.status !== "failed") sentTo += 1;
    }
    await logAudit({
      action: "incident_broadcast",
      targetId: id,
      targetType: "incident",
      details: { audienceSize: uniqueEmails.length, sentTo, preview: body.body.slice(0, 200) },
      req,
    });
  }

  const updates = await getIncidentUpdates(id);
  return Response.json({ ok: true, updates, sentTo });
}
