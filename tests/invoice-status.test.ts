import { describe, expect, it } from "vitest";
import { deriveDisplayStatus, ledgerStatusForAmount, remainingBalance, round2 } from "@/lib/invoice-status";

describe("ledgerStatusForAmount", () => {
  it("keeps draft and void terminal regardless of amount paid", () => {
    expect(ledgerStatusForAmount(0, 100, "draft")).toBe("draft");
    expect(ledgerStatusForAmount(100, 100, "draft")).toBe("draft");
    expect(ledgerStatusForAmount(0, 100, "void")).toBe("void");
    expect(ledgerStatusForAmount(100, 100, "void")).toBe("void");
  });

  it("derives paid when amount paid reaches or exceeds total", () => {
    expect(ledgerStatusForAmount(100, 100, "sent")).toBe("paid");
    expect(ledgerStatusForAmount(150, 100, "sent")).toBe("paid");
  });

  it("derives partial for a nonzero amount under total", () => {
    expect(ledgerStatusForAmount(40, 100, "sent")).toBe("partial");
  });

  it("falls back to sent when amount paid drops to zero", () => {
    expect(ledgerStatusForAmount(0, 100, "paid")).toBe("sent");
    expect(ledgerStatusForAmount(0, 100, "partial")).toBe("sent");
  });
});

describe("deriveDisplayStatus", () => {
  const base = { total: 1000, amountPaid: 0 };

  it("shows draft as-is, ignoring due date", () => {
    expect(deriveDisplayStatus({ ...base, status: "draft", dueDate: "2000-01-01" })).toBe("draft");
  });

  it("shows void/cancelled as-is, ignoring due date and payments", () => {
    expect(deriveDisplayStatus({ ...base, status: "void", dueDate: "2000-01-01" })).toBe("void");
    expect(deriveDisplayStatus({ ...base, status: "cancelled", amountPaid: 1000, dueDate: "2000-01-01" })).toBe(
      "cancelled",
    );
  });

  it("paid always wins, even past due date", () => {
    expect(
      deriveDisplayStatus({ status: "paid", total: 1000, amountPaid: 1000, dueDate: "2000-01-01" }),
    ).toBe("paid");
  });

  it("an unpaid invoice past due is overdue", () => {
    expect(deriveDisplayStatus({ ...base, status: "sent", dueDate: "2000-01-01" })).toBe("overdue");
  });

  it("a partially paid invoice past due is overdue, not partial", () => {
    expect(
      deriveDisplayStatus({ status: "partial", total: 1000, amountPaid: 400, dueDate: "2000-01-01" }),
    ).toBe("overdue");
  });

  it("a partially paid invoice not yet due is partial", () => {
    expect(
      deriveDisplayStatus({ status: "partial", total: 1000, amountPaid: 400, dueDate: "2999-01-01" }),
    ).toBe("partial");
  });

  it("an issued, unpaid, unviewed invoice not yet due is sent", () => {
    expect(deriveDisplayStatus({ ...base, status: "sent", dueDate: "2999-01-01" })).toBe("sent");
  });

  it("an issued, unpaid, viewed invoice not yet due is viewed", () => {
    expect(
      deriveDisplayStatus({ ...base, status: "sent", dueDate: "2999-01-01", viewedAt: Date.now() }),
    ).toBe("viewed");
  });

  it("treats a missing due date as never overdue", () => {
    expect(deriveDisplayStatus({ ...base, status: "sent", dueDate: null })).toBe("sent");
  });
});

describe("remainingBalance / round2", () => {
  it("never goes negative", () => {
    expect(remainingBalance(100, 150)).toBe(0);
  });

  it("computes total minus paid", () => {
    expect(remainingBalance(1000, 400)).toBe(600);
  });

  it("guards against float drift across repeated additions", () => {
    const sum = round2(round2(0.1 + 0.2) + round2(0.3));
    expect(sum).toBe(0.6);
  });
});
