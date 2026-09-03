import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSharedInvoice } from "@/lib/invoice-share";
import { docTitle } from "@/lib/invoice";
import { PublicInvoiceView } from "@/components/PublicInvoiceView";

export const dynamic = "force-dynamic";

export default async function PublicInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const result = await getSharedInvoice(id, token || "");
  if (!result) notFound();

  return <PublicInvoiceView invoice={result.invoice} />;
}

// Shared invoices are private-by-link (valid only with the right token) and
// should never be indexed or crawled.
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { token } = await searchParams;
  const result = await getSharedInvoice(id, token || "");
  if (!result) return { robots: { index: false, follow: false } };
  return {
    title: `${docTitle(result.invoice.docType)} #${result.invoice.invoiceNumber || ""} — ${result.invoice.businessName || "Invoala"}`,
    robots: { index: false, follow: false },
  };
}
