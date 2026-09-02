import { describe, expect, it } from "vitest";
import { invoicePdfBuffer } from "@/lib/invoice-pdf";
import { createDefaultInvoice, type Invoice } from "@/lib/invoice";

// Smoke test for the standard HTML/CSS renderer (Chromium). On machines with
// neither CHROME_PATH nor a serverless chromium build this exercises the
// jsPDF fallback instead, so it only asserts a valid PDF results.
describe("invoicePdfBuffer engine", () => {
  it("produces a paginated A4 PDF for a long invoice", async () => {
    const inv: Invoice = {
      ...createDefaultInvoice(),
      businessName: "Acme Studio",
      businessEmail: "billing@acme.studio",
      businessAddress: "123 Main St",
      clientName: "Globex Corp",
      clientEmail: "client@globex.com",
      currency: "KES",
      items: Array.from({ length: 55 }, (_, i) => ({
        id: "i" + i,
        description: `Recurring retainer line item number ${i + 1}`,
        quantity: 1,
        rate: 120 + i,
      })),
      notes: "Payment due within 14 days. Thank you for your business!",
    };
    const buf = await invoicePdfBuffer(inv);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  }, 120000);
});
