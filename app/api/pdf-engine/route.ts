import { invoiceEngineStatus } from "@/lib/invoice-pdf";
import { invoicePdfBuffer } from "@/lib/invoice-pdf";
import type { Invoice } from "@/lib/invoice";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

// Public diagnostic: reports which PDF engine is available on this runtime and
// renders a full styled sample invoice through the exact production pipeline,
// so we can verify styled output (not just engine availability).
export async function GET() {
  const status = await invoiceEngineStatus();

  const sample: Invoice = {
    businessName: "TechNova Solutions Ltd",
    businessEmail: "billing@technova.co.ke",
    businessAddress: "125 Market Street\nNairobi, Kenya",
    logoDataUrl: null,
    clientName: "Acme Digital Agency Ltd",
    clientEmail: "billing@acme.com",
    clientAddress: "42 Riverside Drive\nNairobi, Kenya",
    invoiceNumber: "INV-2026-00427",
    issueDate: "2026-09-02",
    dueDate: "2026-09-16",
    currency: "KES",
    items: [
      { id: "a", description: "Website Development & UI Design Services", quantity: 1, rate: 185000 },
      { id: "b", description: "Brand identity & logo system", quantity: 1, rate: 45000 },
      { id: "c", description: "Search engine optimisation — 3 months", quantity: 3, rate: 12500 },
    ],
    taxRate: 16,
    discount: 0,
    discountMode: "fixed",
    discountAmount: 15000,
    shipping: 0,
    notes: "Thank you for your business. Please include invoice number INV-2026-00427 as your payment reference.",
    paymentInstructions: "Payment due within Net 14 days. Pay via M-Pesa / Bank Transfer.",
    paymentLink: "",
    docType: "invoice",
    recurring: "",
    customFields: [{ id: "f1", label: "PO Number", value: "PO-8821" }],
    theme: "green",
    amountPaid: 0,
  };

  let renderBytes = 0;
  let renderError: string | undefined;
  try {
    const { buffer } = await invoicePdfBuffer(sample);
    renderBytes = buffer.length;
  } catch (err) {
    renderError = err instanceof Error ? err.message.slice(0, 300) : String(err);
  }

  return Response.json(
    {
      ...status,
      styledRenderBytes: renderBytes,
      renderError,
      styledRenderPassed: renderBytes > 20000,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
