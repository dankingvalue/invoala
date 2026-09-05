// Drives the Roles & permissions UI directly from the real, already-shipped
// authorization functions in lib/permissions.ts — never a second, hand-typed
// copy of "what each role can do" that could quietly drift from what the
// server actually enforces (canManageWorkspaceData, canManageMembers, etc.
// are the same functions lib/teams.ts and the API routes check against).
import {
  type TeamRole,
  canManageWorkspaceData,
  canManageMembers,
  canManageTeamSettings,
  canViewActivity,
  canManageBilling,
  canTransferOwnership,
  canDeleteWorkspace,
  canArchiveWorkspace,
} from "@/lib/permissions";

const ROLES: TeamRole[] = ["owner", "admin", "member"];

export type PermissionRow = { label: string; allowed: Record<TeamRole, boolean> };
export type PermissionGroup = { label: string; rows: PermissionRow[] };

function row(label: string, check: (role: TeamRole) => boolean): PermissionRow {
  return {
    label,
    allowed: Object.fromEntries(ROLES.map((r) => [r, check(r)])) as Record<TeamRole, boolean>,
  };
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    label: "Invoices, clients & quotes",
    rows: [
      row("View, create & edit invoices", canManageWorkspaceData),
      row("Delete invoices", canManageWorkspaceData),
      row("Record payments", canManageWorkspaceData),
      row("Manage clients", canManageWorkspaceData),
      row("Manage quotes", canManageWorkspaceData),
    ],
  },
  {
    label: "Team",
    rows: [
      row("View activity", canViewActivity),
      row("Manage members (invite, remove, change role)", canManageMembers),
      row("Manage workspace settings", canManageTeamSettings),
    ],
  },
  {
    label: "Workspace",
    rows: [
      row("Billing & subscription", canManageBilling),
      row("Transfer ownership", canTransferOwnership),
      row("Archive workspace", canArchiveWorkspace),
      row("Delete workspace", canDeleteWorkspace),
    ],
  },
];
