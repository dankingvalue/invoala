import { getSessionUser } from "@/lib/server-auth";
import { resendTeamInvite, updateInviteRole } from "@/lib/teams";
import { sendTeamInviteEmail } from "@/lib/email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; inviteId: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id, inviteId } = await params;

  const result = await resendTeamInvite(inviteId, id, user.id);
  if (!result) return Response.json({ error: "Could not resend this invitation." }, { status: 400 });

  void sendTeamInviteEmail(result.email, result.team_name, result.inviter_name, result.id);
  return Response.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; inviteId: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id, inviteId } = await params;

  let role = "";
  try {
    const body = (await req.json()) as { role?: string };
    role = typeof body.role === "string" ? body.role : "";
  } catch {
    // falls through
  }
  if (!["member", "admin"].includes(role)) {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  const ok = await updateInviteRole(inviteId, id, role, user.id);
  if (!ok) return Response.json({ error: "Could not update this invitation." }, { status: 400 });
  return Response.json({ ok: true });
}
