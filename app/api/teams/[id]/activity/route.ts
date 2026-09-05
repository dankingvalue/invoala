import { getSessionUser } from "@/lib/server-auth";
import { isTeamMember } from "@/lib/teams";
import { getTeamActivityFiltered, type ActivityEntry } from "@/lib/audit";

function csvEscape(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await isTeamMember(id, user.id))) {
    return Response.json({ error: "Not a member of this workspace." }, { status: 403 });
  }

  const url = new URL(req.url);
  const filter = {
    actorId: url.searchParams.get("actorId") || undefined,
    action: url.searchParams.get("action") || undefined,
    from: url.searchParams.get("from") ? Number(url.searchParams.get("from")) : undefined,
    to: url.searchParams.get("to") ? Number(url.searchParams.get("to")) : undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
    offset: url.searchParams.get("offset") ? Number(url.searchParams.get("offset")) : undefined,
  };

  if (url.searchParams.get("format") === "csv") {
    // Export is the same workspace-scoped, permission-protected query as the
    // page itself — just capped higher and rendered as CSV instead of JSON.
    const { entries } = await getTeamActivityFiltered(id, { ...filter, limit: 5000, offset: 0 });
    const header = "date,actor_name,actor_email,action,target_type,target_id\n";
    const rows = entries
      .map((e: ActivityEntry) =>
        [
          new Date(e.created_at).toISOString(),
          e.actor_name,
          e.actor_email,
          e.action,
          e.target_type ?? "",
          e.target_id ?? "",
        ].map(csvEscape).join(","),
      )
      .join("\n");
    return new Response(header + rows + "\n", {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="activity.csv"`,
      },
    });
  }

  const { entries, total } = await getTeamActivityFiltered(id, filter);
  return Response.json({ activity: entries, total });
}
