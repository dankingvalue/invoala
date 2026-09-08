import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { getAgentMetrics, computeOverallScore } from "@/lib/agent-metrics";
import { getAgentSkills, setAgentSkills, setAgentAvailability, SKILLS } from "@/lib/agent-skills";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.agents.manage");
  if (denied) return denied;

  const { id } = await params;
  const url = new URL(req.url);
  const from = parseInt(url.searchParams.get("from") || "", 10) || Date.now() - 30 * 864e5;
  const to = parseInt(url.searchParams.get("to") || "", 10) || Date.now();

  const [metrics, skills] = await Promise.all([getAgentMetrics(id, { from, to }), getAgentSkills(id)]);
  if (!metrics) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ agent: { ...metrics, ...computeOverallScore(metrics), skills } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.agents.manage");
  if (denied) return denied;

  const { id } = await params;
  let body: { skills?: string[]; available?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.skills !== undefined) {
    const valid = body.skills.filter((s): s is (typeof SKILLS)[number] => (SKILLS as readonly string[]).includes(s));
    await setAgentSkills(id, valid);
    await logAudit({ action: "agent_skills_updated", targetId: id, targetType: "user", details: { skills: valid }, req });
  }
  if (body.available !== undefined) {
    await setAgentAvailability(id, body.available);
    await logAudit({ action: "agent_availability_changed", targetId: id, targetType: "user", details: { available: body.available }, req });
  }

  return Response.json({ ok: true });
}
