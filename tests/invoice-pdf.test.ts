import { describe, expect, it } from "vitest";
import { invoicePdfBuffer } from "@/lib/invoice-pdf";
import { createDefaultInvoice, type Invoice } from "@/lib/invoice";

function sampleInvoice(over: Partial<Invoice> = {}, itemCount = 3): Invoice {
  return {
    ...createDefaultInvoice(),
    businessName: "Acme Studio",
    businessEmail: "hello@acme.studio",
    businessAddress: "123 Main St\nNairobi",
    clientName: "Globex Corp",
    clientEmail: "bill@globex.com",
    clientAddress: "1 Loop Rd",
    invoiceNumber: "INV-001",
    currency: "USD",
    items: Array.from({ length: itemCount }, (_, i) => ({
      id: "i" + i,
      description: `Service line ${i + 1} with a long description to exercise wrapping`,
      quantity: 1,
      rate: 100 + i,
    })),
    taxRate: 16,
    notes: "Payment due within 14 days. Thank you!",
    paymentInstructions: "Bank transfer — account 1234",
    ...over,
  } as Invoice;
}

describe("invoicePdfBuffer", () => {
  it("produces a valid-looking PDF buffer", async () => {
    const { buffer: buf } = await invoicePdfBuffer(sampleInvoice());
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(1000);
    expect(buf.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("renders short and very long invoices without throwing", async () => {
    const { buffer: short } = await invoicePdfBuffer(sampleInvoice({}, 1));
    const { buffer: long } = await invoicePdfBuffer(sampleInvoice({}, 60));
    expect(short.length).toBeGreaterThan(500);
    expect(long.length).toBeGreaterThan(short.length);
  });

  it("renders quotes and receipts too", async () => {
    const { buffer: q } = await invoicePdfBuffer(sampleInvoice({ docType: "quote" }));
    const { buffer: r } = await invoicePdfBuffer(sampleInvoice({ docType: "receipt" }));
    expect(q.length).toBeGreaterThan(500);
    expect(r.length).toBeGreaterThan(500);
  });

  it("renders with a logo, fixed discount, partial payment and custom fields", async () => {
    // 1x1 transparent PNG
    const logo =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const { buffer: pdf } = await invoicePdfBuffer(
      sampleInvoice({
        logoDataUrl: logo,
        discountMode: "fixed",
        discountAmount: 15000,
        discount: 0,
        amountPaid: 50000,
        customFields: [{ id: "f", label: "PO", value: "PO-1" }],
      }),
    );
    expect(pdf.length).toBeGreaterThan(500);
  });
});
