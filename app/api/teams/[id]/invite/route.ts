import { getSessionUser } from "@/lib/server-auth";
import { acceptInvite, declineInvite } from "@/lib/teams";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const accepted = await acceptInvite(id, user.id);
  if (!accepted) {
    return Response.json({ error: "Invite not found, expired, or team is full." }, { status: 400 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const declined = await declineInvite(id, user.id);
  if (!declined) {
    return Response.json({ error: "Invite not found or expired." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
