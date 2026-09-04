import { getSessionUser } from "@/lib/server-auth";
import { archiveTeam } from "@/lib/teams";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const ok = await archiveTeam(id, user.id, true);
  if (!ok) return Response.json({ error: "Only the team owner can archive this workspace." }, { status: 403 });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const ok = await archiveTeam(id, user.id, false);
  if (!ok) return Response.json({ error: "Only the team owner can reactivate this workspace." }, { status: 403 });
  return Response.json({ ok: true });
}
