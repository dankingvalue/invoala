import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { getAllAgentMetrics, computeOverallScore } from "@/lib/agent-metrics";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.agents.manage");
  if (denied) return denied;

  const url = new URL(req.url);
  const from = parseInt(url.searchParams.get("from") || "", 10) || Date.now() - 30 * 864e5;
  const to = parseInt(url.searchParams.get("to") || "", 10) || Date.now();

  const metrics = await getAllAgentMetrics({ from, to });
  const withScore = metrics.map((m) => ({ ...m, ...computeOverallScore(m) }));
  return Response.json({ agents: withScore });
}
