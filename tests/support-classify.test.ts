import { describe, expect, it } from "vitest";
import { detectPriority, detectCategory } from "@/lib/support-classify";

describe("detectPriority", () => {
  it("flags urgent/security/payment-failure language as P1", () => {
    expect(detectPriority("This is urgent, my account was hacked")).toBe("p1");
    expect(detectPriority("Payment failed twice and I was charged twice")).toBe("p1");
    expect(detectPriority("The whole site is down right now")).toBe("p1");
  });

  it("flags bug/billing/refund language as P2", () => {
    expect(detectPriority("I found a bug in the invoice generator")).toBe("p2");
    expect(detectPriority("I need a refund for last month")).toBe("p2");
  });

  it("defaults ordinary questions to P3", () => {
    expect(detectPriority("How do I add my logo to an invoice?")).toBe("p3");
  });
});

describe("detectCategory", () => {
  it("categorizes payment failures", () => {
    expect(detectCategory("my card was declined")).toEqual({ category: "payment", subcategory: "payment_failed" });
  });

  it("categorizes PDF bugs specifically", () => {
    expect(detectCategory("the pdf is not generating")).toEqual({ category: "technical_bug", subcategory: "pdf_generation" });
  });

  it("categorizes login issues as account", () => {
    expect(detectCategory("I can't log in to my account")).toEqual({ category: "account", subcategory: "login" });
  });

  it("returns null when nothing matches", () => {
    expect(detectCategory("just saying hello")).toBeNull();
  });
});
