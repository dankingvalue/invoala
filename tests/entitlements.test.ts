import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/billing", () => ({
  isUserPro: vi.fn(),
}));

import { isUserPro } from "@/lib/billing";
import { requireProFeature, PRO_FEATURE_LABELS } from "@/lib/entitlements";
import type { SessionUser } from "@/lib/server-auth";

function user(): SessionUser {
  return { id: "u1", email: "a@b.com", name: "A", role: "user", email_verified: 1, timezone: "", has_password: true };
}

describe("requireProFeature", () => {
  it("returns null (proceed) when the user is Pro", async () => {
    vi.mocked(isUserPro).mockResolvedValueOnce(true);
    const res = await requireProFeature(user(), "email_invoice");
    expect(res).toBeNull();
  });

  it("returns a 402 with a clear message when the user is not Pro", async () => {
    vi.mocked(isUserPro).mockResolvedValueOnce(false);
    const res = await requireProFeature(user(), "email_invoice");
    expect(res).not.toBeNull();
    expect(res!.status).toBe(402);
    const json = await res!.json();
    expect(json.code).toBe("PRO_REQUIRED");
    expect(json.feature).toBe("email_invoice");
    expect(json.error).toContain(PRO_FEATURE_LABELS.email_invoice);
  });

  it("labels every gated feature", () => {
    for (const key of Object.keys(PRO_FEATURE_LABELS)) {
      expect(PRO_FEATURE_LABELS[key as keyof typeof PRO_FEATURE_LABELS].length).toBeGreaterThan(0);
    }
  });
});
