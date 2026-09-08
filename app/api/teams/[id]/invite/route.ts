import { getSessionUser } from "@/lib/server-auth";
import { acceptInvite, declineInvite, getInviteOwnerId } from "@/lib/teams";
import { requireActiveTeamsPlan } from "@/lib/entitlements";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const ownerId = await getInviteOwnerId(id);
  if (ownerId) {
    const planDenied = await requireActiveTeamsPlan(ownerId);
    if (planDenied) return planDenied;
  }

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
