import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { getIncident, updateIncident, getIncidentConversations, getIncidentUpdates } from "@/lib/incidents";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.conversations.view");
  if (denied) return denied;

  const { id } = await params;
  const incident = await getIncident(id);
  if (!incident) return Response.json({ error: "Not found" }, { status: 404 });

  const [conversations, updates] = await Promise.all([getIncidentConversations(id), getIncidentUpdates(id)]);
  return Response.json({ incident, conversations, updates });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.incidents.manage");
  if (denied) return denied;

  const { id } = await params;
  const before = await getIncident(id);
  if (!before) return Response.json({ error: "Not found" }, { status: 404 });

  let patch: Parameters<typeof updateIncident>[1] = {};
  try {
    patch = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  await updateIncident(id, patch);
  await logAudit({ action: "incident_updated", targetId: id, targetType: "incident", details: { from: before, patch }, req });

  const updated = await getIncident(id);
  return Response.json({ ok: true, incident: updated });
}
