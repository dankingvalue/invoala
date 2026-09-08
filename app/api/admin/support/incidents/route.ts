import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { createIncident, listIncidents, type IncidentSeverity, type IncidentStatus } from "@/lib/incidents";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.conversations.view");
  if (denied) return denied;

  const url = new URL(req.url);
  const status = (url.searchParams.get("status") as IncidentStatus | null) ?? undefined;
  const activeOnly = url.searchParams.get("active") === "1";
  const incidents = await listIncidents({ status, activeOnly });
  return Response.json({ incidents });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.incidents.manage");
  if (denied) return denied;

  let body: { title?: string; description?: string; severity?: IncidentSeverity } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.title || !body.severity) {
    return Response.json({ error: "Title and severity are required." }, { status: 400 });
  }

  const incident = await createIncident({ title: body.title, description: body.description, severity: body.severity, createdBy: user!.id });
  await logAudit({ action: "incident_created", targetId: incident.id, targetType: "incident", details: { ref: incident.ref, title: incident.title, severity: incident.severity }, req });
  return Response.json({ ok: true, incident });
}
