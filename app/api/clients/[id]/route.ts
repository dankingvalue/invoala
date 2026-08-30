import { getSessionUser } from "@/lib/server-auth";
import { deleteClient, setClientTeam } from "@/lib/data";
import { getTeamMemberRole } from "@/lib/teams";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteClient(user.id, id);
  if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: { teamId?: string | null };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const teamId = typeof body.teamId === "string" && body.teamId ? body.teamId : null;
  if (teamId) {
    const role = await getTeamMemberRole(teamId, user.id);
    if (!role) {
      return Response.json({ error: "You are not a member of that team." }, { status: 403 });
    }
  }

  const updated = await setClientTeam(user.id, id, teamId);
  if (!updated) {
    return Response.json({ error: "Could not update client sharing." }, { status: 400 });
  }
  return Response.json({ ok: true });
}
