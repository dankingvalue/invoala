import { getSessionUser } from "@/lib/server-auth";
import { isTeamMember } from "@/lib/teams";
import { getTeamActivity } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  if (!(await isTeamMember(id, user.id))) {
    return Response.json({ error: "Not a member of this workspace." }, { status: 403 });
  }

  const activity = await getTeamActivity(id, 100);
  return Response.json({ activity });
}
