import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { buildAdminDailyReport } from "@/lib/support-reports";
import { getRecurringIssues } from "@/lib/support-escalations";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.reports.view");
  if (denied) return denied;

  const url = new URL(req.url);
  const to = parseInt(url.searchParams.get("to") || "", 10) || Date.now();
  const from = parseInt(url.searchParams.get("from") || "", 10) || to - 864e5;
  const windowMs = to - from;

  const [report, recurring] = await Promise.all([
    buildAdminDailyReport(from, to, from - windowMs, from),
    getRecurringIssues(to - 30 * 864e5),
  ]);
  return Response.json({ report, recurring });
}
