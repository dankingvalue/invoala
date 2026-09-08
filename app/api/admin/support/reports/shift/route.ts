import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { buildShiftReportDraft, submitShiftReport, listShiftReports } from "@/lib/support-reports";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.shift_reports.submit");
  if (denied) return denied;

  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");
  // "own" agents see only themselves; admin.reports.view unlocks everyone's.
  const canViewAll = url.searchParams.get("agentId") && url.searchParams.get("agentId") !== user!.id;
  if (canViewAll) {
    const adminDenied = requireSupportPermission(user, "admin.reports.view");
    if (adminDenied) return adminDenied;
  }
  const agentId = url.searchParams.get("agentId") || user!.id;

  if (mode === "draft") {
    const to = parseInt(url.searchParams.get("to") || "", 10) || Date.now();
    const from = parseInt(url.searchParams.get("from") || "", 10) || to - 8 * 3600_000;
    const draft = await buildShiftReportDraft(agentId, from, to);
    return Response.json({ draft });
  }

  const reports = await listShiftReports({ agentId });
  return Response.json({ reports });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.shift_reports.submit");
  if (denied) return denied;

  let body: { shiftDate?: string; data?: Parameters<typeof submitShiftReport>[0]["data"]; recommendations?: string; amendedFrom?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.shiftDate || !body.data) return Response.json({ error: "shiftDate and data are required." }, { status: 400 });

  // Submitted reports are locked (no PATCH/edit route exists) — an amendment
  // is a new row referencing the original via amendedFrom, preserving the
  // audit trail rather than silently editing history (spec section 15/16).
  const id = await submitShiftReport({ agentId: user!.id, shiftDate: body.shiftDate, data: body.data, recommendations: body.recommendations ?? "", amendedFrom: body.amendedFrom });
  await logAudit({ action: "shift_report_submitted", targetId: id, targetType: "shift_report", details: { shiftDate: body.shiftDate, amendedFrom: body.amendedFrom }, req });
  return Response.json({ ok: true, id });
}
