import { describe, expect, it } from "vitest";
import { hasSupportPermission, requireSupportPermission, shouldRedactCustomerContact, type SupportPermission } from "@/lib/support-permissions";
import type { SessionUser } from "@/lib/server-auth";

function user(role: string): SessionUser {
  return { id: "u1", email: "a@b.com", name: "A", role, email_verified: 1, timezone: "", has_password: true };
}

const ADMIN_ONLY: SupportPermission[] = [
  "support.conversations.assign",
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

const SUPERADMIN_ONLY: SupportPermission[] = [
  "superadmin.system.manage",
  "superadmin.rbac.manage",
  "superadmin.audit.view",
  "superadmin.config.manage",
  "superadmin.emergency.manage",
  "superadmin.escalations.decide",
];

const BASE_SUPPORT: SupportPermission[] = [
  "support.conversations.view",
  "support.conversations.reply",
  "support.conversations.internal_note",
  "support.conversations.resolve",
  "support.conversations.reopen",
  "support.customers.view",
  "support.documents.view",
  "support.documents.download",
  "support.escalations.create",
  "support.emergency.trigger",
  "support.macros.use",
  "support.knowledge.view_internal",
  "support.shift_reports.submit",
];

describe("support permission matrix — role boundaries", () => {
  it("support has exactly the base support permissions, nothing from admin/superadmin tiers", () => {
    for (const p of BASE_SUPPORT) expect(hasSupportPermission("support", p)).toBe(true);
    for (const p of ADMIN_ONLY) expect(hasSupportPermission("support", p)).toBe(false);
    for (const p of SUPERADMIN_ONLY) expect(hasSupportPermission("support", p)).toBe(false);
  });

  it("admin has support + admin permissions but nothing superadmin-only", () => {
    for (const p of BASE_SUPPORT) expect(hasSupportPermission("admin", p)).toBe(true);
    for (const p of ADMIN_ONLY) expect(hasSupportPermission("admin", p)).toBe(true);
    for (const p of SUPERADMIN_ONLY) expect(hasSupportPermission("admin", p)).toBe(false);
  });

  it("superadmin has every permission", () => {
    for (const p of [...BASE_SUPPORT, ...ADMIN_ONLY, ...SUPERADMIN_ONLY]) {
      expect(hasSupportPermission("superadmin", p)).toBe(true);
    }
  });

  it("a plain user role has no support permissions at all", () => {
    for (const p of [...BASE_SUPPORT, ...ADMIN_ONLY, ...SUPERADMIN_ONLY]) {
      expect(hasSupportPermission("user", p)).toBe(false);
    }
  });

  it("an undefined/unknown role has no permissions", () => {
    expect(hasSupportPermission(undefined, "support.conversations.view")).toBe(false);
    expect(hasSupportPermission("bogus-role", "support.conversations.view")).toBe(false);
  });
});

describe("requireSupportPermission — route guard", () => {
  it("returns 401 when there is no session user", () => {
    const res = requireSupportPermission(null, "support.conversations.view");
    expect(res?.status).toBe(401);
  });

  it("returns 403 when support tries to use an admin-only permission", () => {
    const res = requireSupportPermission(user("support"), "admin.incidents.manage");
    expect(res?.status).toBe(403);
  });

  it("returns 403 when admin tries to use a superadmin-only permission", () => {
    const res = requireSupportPermission(user("admin"), "superadmin.emergency.manage");
    expect(res?.status).toBe(403);
  });

  it("returns null (proceed) when the role has the permission", () => {
    expect(requireSupportPermission(user("support"), "support.conversations.view")).toBeNull();
    expect(requireSupportPermission(user("admin"), "admin.incidents.manage")).toBeNull();
    expect(requireSupportPermission(user("superadmin"), "superadmin.emergency.manage")).toBeNull();
  });
});

describe("shouldRedactCustomerContact", () => {
  it("redacts for support only", () => {
    expect(shouldRedactCustomerContact("support")).toBe(true);
    expect(shouldRedactCustomerContact("admin")).toBe(false);
    expect(shouldRedactCustomerContact("superadmin")).toBe(false);
    expect(shouldRedactCustomerContact(undefined)).toBe(false);
  });
});
