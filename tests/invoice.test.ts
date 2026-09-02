import { describe, expect, it } from "vitest";
import {
  computeTotals,
  createDefaultInvoice,
  docTitle,
  newId,
  type Invoice,
} from "@/lib/invoice";

function makeInvoice(over: Partial<Invoice> = {}): Invoice {
  const base = createDefaultInvoice();
  return {
    ...base,
    items: [{ id: "a", description: "Work", quantity: 2, rate: 100 }],
    taxRate: 0,
    discount: 0,
    shipping: 0,
    ...over,
  };
}

describe("computeTotals", () => {
  it("computes a plain subtotal", () => {
    const t = computeTotals(makeInvoice());
    expect(t.subtotal).toBe(200);
    expect(t.taxAmount).toBe(0);
    expect(t.total).toBe(200);
  });

  it("applies percentage discount before tax", () => {
    const t = computeTotals(makeInvoice({ discount: 10, taxRate: 16 }));
    expect(t.discountAmount).toBe(20);
    expect(t.taxAmount).toBeCloseTo(28.8);
    expect(t.total).toBeCloseTo(208.8);
  });

  it("adds shipping before tax", () => {
    const t = computeTotals(makeInvoice({ shipping: 25, taxRate: 10 }));
    expect(t.total).toBeCloseTo(247.5);
  });

  it("handles fractional quantities", () => {
    const t = computeTotals(
      makeInvoice({ items: [{ id: "a", description: "hours", quantity: 2.5, rate: 40 }] }),
    );
    expect(t.subtotal).toBe(100);
  });

  it("treats missing/NaN numbers as zero", () => {
    const t = computeTotals(makeInvoice({
      items: [{ id: "a", description: "", quantity: Number.NaN, rate: Number.NaN }],
      discount: Number.NaN,
      shipping: Number.NaN,
      taxRate: Number.NaN,
    }));
    expect(t.total).toBe(0);
  });
});

describe("defaults & docs", () => {
  it("createDefaultInvoice has a sane baseline", () => {
    const inv = createDefaultInvoice();
    expect(inv.docType).toBe("invoice");
    expect(inv.currency).toBe("USD");
    expect(inv.recurring).toBe("");
    expect(inv.notes).toContain("14 days");
    expect(Array.isArray(inv.items)).toBe(true);
    expect(inv.issueDate.length).toBe(10);
  });

  it("docTitle maps types", () => {
    expect(docTitle("invoice")).toBe("Invoice");
    expect(docTitle("quote")).toBe("Quote");
    expect(docTitle("receipt")).toBe("Receipt");
    expect(docTitle("nope")).toBe("Invoice");
  });

  it("newId produces distinct strings", () => {
    const a = newId();
    const b = newId();
    expect(typeof a).toBe("string");
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(5);
  });
});
