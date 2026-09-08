import type { SessionUser } from "@/lib/server-auth";

// Granular, server-side-enforced permissions for the support-operations
// platform — checked on every sensitive route, never trusted from the
// frontend. A flat role->permission-set matrix (not a DB table): granular
// enough to check per-action, simple enough to read and change in one file.
// If a future need arises for per-agent permission overrides, this is the
// single place to extend without touching every call site.
export type SupportPermission =
  | "support.conversations.view"
  | "support.conversations.reply"
  | "support.conversations.internal_note"
  | "support.conversations.assign"
  | "support.conversations.reassign"
  | "support.conversations.resolve"
  | "support.conversations.reopen"
  | "support.customers.view"
  | "support.documents.view"
  | "support.documents.download"
  | "support.escalations.create"
  | "support.escalations.manage"
  | "support.emergency.trigger"
  | "support.macros.use"
  | "support.knowledge.view_internal"
  | "support.shift_reports.submit"
  | "admin.support.manage"
  | "admin.agents.manage"
  | "admin.reports.view"
  | "admin.incidents.manage"
  | "admin.knowledge.manage"
  | "admin.macros.manage"
  | "admin.qa.manage"
  | "admin.qa.review"
  | "admin.csat.view"
  | "admin.broadcasts.manage"
  | "admin.escalations.decide"
  | "superadmin.system.manage"
  | "superadmin.rbac.manage"
  | "superadmin.audit.view"
  | "superadmin.config.manage"
  | "superadmin.emergency.manage"
  | "superadmin.escalations.decide";

const SUPPORT_PERMS: SupportPermission[] = [
  "support.conversations.view",
  "support.conversations.reply",
  "support.conversations.internal_note",
  "support.conversations.resolve",
  "support.conversations.reopen",
  // Self-claim/unclaim only — the route itself restricts this permission to
  // assignedTo === self or null; reassigning to someone ELSE requires the
  // separate support.conversations.reassign permission (admin+ only).
  "support.conversations.assign",
  "support.customers.view",
  "support.documents.view",
  "support.documents.download",
  "support.escalations.create",
  "support.emergency.trigger",
  "support.macros.use",
  "support.knowledge.view_internal",
  "support.shift_reports.submit",
];

const ADMIN_PERMS: SupportPermission[] = [
  ...SUPPORT_PERMS,
  "support.conversations.reassign",
  "support.escalations.manage",
  "admin.support.manage",
  "admin.agents.manage",
  "admin.reports.view",
  "admin.incidents.manage",
  "admin.knowledge.manage",
  "admin.macros.manage",
  "admin.qa.manage",
  "admin.qa.review",
  "admin.csat.view",
  "admin.broadcasts.manage",
  "admin.escalations.decide",
];

const SUPERADMIN_PERMS: SupportPermission[] = [
  ...ADMIN_PERMS,
  "superadmin.system.manage",
  "superadmin.rbac.manage",
  "superadmin.audit.view",
  "superadmin.config.manage",
  "superadmin.emergency.manage",
  "superadmin.escalations.decide",
];

const ROLE_PERMISSIONS: Record<string, SupportPermission[]> = {
  support: SUPPORT_PERMS,
  admin: ADMIN_PERMS,
  superadmin: SUPERADMIN_PERMS,
};

export function hasSupportPermission(role: string | undefined, permission: SupportPermission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Route-guard helper: returns a ready-to-return 401/403 Response if the
// session user is missing or lacks the permission, otherwise null so the
// caller proceeds. Every sensitive support/admin/superadmin API route should
// call this — frontend tab visibility is not a security boundary.
export function requireSupportPermission(
  user: SessionUser | null,
  permission: SupportPermission,
): Response | null {
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSupportPermission(user.role, permission)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

// Support agents may only see conversation email addresses redacted (see
// lib/redact.ts) — admin/superadmin see them in full. Kept here (not
// re-derived per route) so the "who can see what" rule lives in one place.
export function shouldRedactCustomerContact(role: string | undefined): boolean {
  return role === "support";
}
