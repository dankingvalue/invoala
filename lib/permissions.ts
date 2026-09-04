// Single source of truth for workspace (team) role capabilities. Every
// server route that touches a team-owned resource (clients, invoices,
// payments, members, settings) must resolve the caller's role through
// getTeamRole() and check it here — never infer permission from what the
// UI happened to show, per the "enforce server-side" requirement this
// module exists to satisfy.

export type TeamRole = "owner" | "admin" | "member";

const ROLE_RANK: Record<TeamRole, number> = { member: 0, admin: 1, owner: 2 };

export function isTeamRole(value: unknown): value is TeamRole {
  return value === "owner" || value === "admin" || value === "member";
}

// True if `role` is at least as privileged as `min` (owner > admin > member).
function atLeast(role: TeamRole, min: TeamRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

// Members, admins, and the owner can all operate on day-to-day workspace
// data — clients, invoices, quotes, payments — per the spec's MEMBER
// capability list. There's no narrower resource-level ACL: every non-owner
// team_members row is either 'admin' or 'member' and both get the same
// operational access, so a single check covers all of them today. Kept as
// its own named check (rather than inlining `isTeamMember`) so a future
// narrower role slots in without touching every call site.
export function canManageWorkspaceData(role: TeamRole): boolean {
  return role === "owner" || role === "admin" || role === "member";
}

// Members, invites, and non-danger-zone team settings.
export function canManageMembers(role: TeamRole): boolean {
  return atLeast(role, "admin");
}

export function canManageTeamSettings(role: TeamRole): boolean {
  return atLeast(role, "admin");
}

export function canViewActivity(role: TeamRole): boolean {
  return atLeast(role, "member");
}

// Owner-only: billing, ownership transfer, workspace deletion. Admins are
// explicitly excluded from all three per the spec.
export function canManageBilling(role: TeamRole): boolean {
  return role === "owner";
}

export function canTransferOwnership(role: TeamRole): boolean {
  return role === "owner";
}

export function canDeleteWorkspace(role: TeamRole): boolean {
  return role === "owner";
}

export function canArchiveWorkspace(role: TeamRole): boolean {
  return role === "owner";
}

// A role edit must never be how someone becomes owner, and an admin can't
// promote a peer past their own rank — only an owner can hand out 'admin',
// and 'owner' is never assignable through the ordinary role-change action
// at all (see lib/teams.ts transferOwnership for the real, separately
// confirmed path).
export function canAssignRole(actorRole: TeamRole, targetRole: TeamRole): boolean {
  if (targetRole === "owner") return false;
  return atLeast(actorRole, "admin") && ROLE_RANK[actorRole] > ROLE_RANK[targetRole];
}

// An admin can remove members and other admins, but never the owner — the
// owner can only leave by transferring ownership first (existing
// leaveTeam/removeMember guard, kept as-is).
export function canRemoveMember(actorRole: TeamRole, targetRole: TeamRole): boolean {
  if (targetRole === "owner") return false;
  return atLeast(actorRole, "admin");
}
