import { getSessionUser } from "@/lib/server-auth";
import { isTeamMember, getTeamOverviewStats } from "@/lib/teams";
import { getTeamActivity } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await isTeamMember(id, user.id))) {
    return Response.json({ error: "Not a member of this workspace." }, { status: 403 });
  }

  const [stats, recentActivity] = await Promise.all([
    getTeamOverviewStats(id),
    getTeamActivity(id, 6),
  ]);

  return Response.json({ stats, recentActivity });
}
