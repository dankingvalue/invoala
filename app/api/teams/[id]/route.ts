import { getSessionUser } from "@/lib/server-auth";
import { getTeam, deleteTeam, leaveTeam } from "@/lib/teams";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { action?: string };

  if (body.action === "leave") {
    const left = await leaveTeam(id, user.id);
    if (!left) {
      return Response.json({ error: "Cannot leave. Owner must transfer ownership first." }, { status: 400 });
    }
    return Response.json({ ok: true });
  }

  // Delete team
  const deleted = await deleteTeam(id, user.id);
  if (!deleted) {
    return Response.json({ error: "Only the team owner can delete the team." }, { status: 403 });
  }

  return Response.json({ ok: true });
}
