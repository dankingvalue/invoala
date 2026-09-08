import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { getCsatSummary, getCsatTrend } from "@/lib/csat";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.csat.view");
  if (denied) return denied;

  const url = new URL(req.url);
  const from = parseInt(url.searchParams.get("from") || "", 10) || Date.now() - 30 * 864e5;
  const to = parseInt(url.searchParams.get("to") || "", 10) || Date.now();
  const agentId = url.searchParams.get("agentId") ?? undefined;
  const humanOnly = url.searchParams.get("humanOnly") !== "0";

  const [summary, trend] = await Promise.all([
    getCsatSummary({ from, to, agentId, humanOnly }),
    getCsatTrend({ from, to, agentId, humanOnly }),
  ]);
  return Response.json({ summary, trend });
}
