import { getSessionUser } from "@/lib/server-auth";
import { getTeam, getTeamMembers, getTeamMemberCount, inviteToTeam, removeMember, updateTeamMemberRole, isTeamAdmin } from "@/lib/teams";
import { sendTeamInviteEmail } from "@/lib/email";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  const members = getTeamMembers(id);
  const count = getTeamMemberCount(id);

  return Response.json({ members, count, maxMembers: 5 });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  if (!isTeamAdmin(id, user.id)) {
    return Response.json({ error: "Only team admins can invite members." }, { status: 403 });
  }

  let email = "";
  let role = "member";
  try {
    const body = (await req.json()) as { email?: string; role?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    role = typeof body.role === "string" ? body.role : "member";
  } catch {
    // falls through
  }

  if (!email || !email.includes("@")) {
    return Response.json({ error: "Valid email is required." }, { status: 400 });
  }

  if (!["member", "admin"].includes(role)) {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  const count = getTeamMemberCount(id);
  if (count >= 5) {
    return Response.json({ error: "Team is full (max 5 members)." }, { status: 400 });
  }

  const invite = inviteToTeam(id, email, role, user.id);
  if (!invite) {
    return Response.json({ error: "Could not create invite. User may already be a member." }, { status: 400 });
  }

  // Send invite email
  void sendTeamInviteEmail(email, invite.team_name, invite.inviter_name, invite.id);

  return Response.json({ ok: true, invite });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  if (!isTeamAdmin(id, user.id)) {
    return Response.json({ error: "Only team admins can update members." }, { status: 403 });
  }

  let userId = "";
  let role = "";
  try {
    const body = (await req.json()) as { userId?: string; role?: string };
    userId = typeof body.userId === "string" ? body.userId : "";
    role = typeof body.role === "string" ? body.role : "";
  } catch {
    // falls through
  }

  if (!userId || !role) {
    return Response.json({ error: "userId and role are required." }, { status: 400 });
  }

  if (!["member", "admin"].includes(role)) {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  const updated = updateTeamMemberRole(id, userId, role);
  if (!updated) {
    return Response.json({ error: "Could not update member." }, { status: 400 });
  }

  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  if (!isTeamAdmin(id, user.id)) {
    return Response.json({ error: "Only team admins can remove members." }, { status: 403 });
  }

  let userId = "";
  try {
    const body = (await req.json()) as { userId?: string };
    userId = typeof body.userId === "string" ? body.userId : "";
  } catch {
    // falls through
  }

  if (!userId) {
    return Response.json({ error: "userId is required." }, { status: 400 });
  }

  const removed = removeMember(id, userId);
  if (!removed) {
    return Response.json({ error: "Could not remove member. Owner cannot be removed." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
