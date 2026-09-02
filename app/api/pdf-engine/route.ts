import { invoiceEngineStatus } from "@/lib/invoice-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

// Public diagnostic: reports which PDF engine is available on this runtime so
// we can confirm the HTML/Chromium renderer (not the jsPDF fallback) is live.
export async function GET() {
  const status = await invoiceEngineStatus();
  return Response.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}
