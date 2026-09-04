import { getSessionUser } from "@/lib/server-auth";
import { getTeam, getTeamMembers, getTeamMemberCount, getTeamInvites, cancelTeamInvite, inviteToTeam, removeMember, updateTeamMemberRole, isTeamAdmin, isTeamMember, getTeamRole } from "@/lib/teams";
import { canAssignRole, canRemoveMember, isTeamRole } from "@/lib/permissions";
import { sendTeamInviteEmail } from "@/lib/email";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  // Anyone who can look up a team id was otherwise able to read its member
  // roster — this is the actual access boundary, not just the UI hiding it.
  if (!(await isTeamMember(id, user.id))) {
    return Response.json({ error: "Not a member of this workspace." }, { status: 403 });
  }

  const members = await getTeamMembers(id);
  const count = await getTeamMemberCount(id);
  const invites = await getTeamInvites(id);

  return Response.json({ members, count, maxMembers: 5, invites });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  if (!(await isTeamAdmin(id, user.id))) {
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

  const count = await getTeamMemberCount(id);
  if (count >= 5) {
    return Response.json({ error: "Team is full (max 5 members)." }, { status: 400 });
  }

  const invite = await inviteToTeam(id, email, role, user.id);
  if (!invite) {
    return Response.json({ error: "Could not create invite. They may already be a member, or already have a pending invitation." }, { status: 400 });
  }

  // Send invite email
  void sendTeamInviteEmail(email, invite.team_name, invite.inviter_name, invite.id);

  return Response.json({ ok: true, invite });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const team = await getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  const actorRole = await getTeamRole(id, user.id);
  if (!actorRole || !isTeamRole(actorRole)) {
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

  if (!isTeamRole(role) || !canAssignRole(actorRole, role)) {
    return Response.json({ error: "You can't assign that role." }, { status: 403 });
  }

  const updated = await updateTeamMemberRole(id, userId, role, user.id);
  if (!updated) {
    return Response.json({ error: "Could not update member." }, { status: 400 });
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
  const team = await getTeam(id);
  if (!team) return Response.json({ error: "Team not found." }, { status: 404 });

  const actorRole = await getTeamRole(id, user.id);
  if (!actorRole) {
    return Response.json({ error: "Only team admins can remove members." }, { status: 403 });
  }

  let userId = "";
  let inviteId = "";
  try {
    const body = (await req.json()) as { userId?: string; inviteId?: string };
    userId = typeof body.userId === "string" ? body.userId : "";
    inviteId = typeof body.inviteId === "string" ? body.inviteId : "";
  } catch {
    // falls through
  }

  if (inviteId) {
    if (actorRole !== "owner" && actorRole !== "admin") {
      return Response.json({ error: "Only team admins can cancel invitations." }, { status: 403 });
    }
    const cancelled = await cancelTeamInvite(inviteId, id, user.id);
    if (!cancelled) {
      return Response.json({ error: "Invite not found." }, { status: 404 });
    }
    return Response.json({ ok: true });
  }

  if (!userId) {
    return Response.json({ error: "userId is required." }, { status: 400 });
  }

  const targetRole = await getTeamRole(id, userId);
  if (!targetRole || !canRemoveMember(actorRole, targetRole)) {
    return Response.json({ error: "Could not remove member. The owner can't be removed." }, { status: 400 });
  }

  const removed = await removeMember(id, userId, user.id);
  if (!removed) {
    return Response.json({ error: "Could not remove member. Owner cannot be removed." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
