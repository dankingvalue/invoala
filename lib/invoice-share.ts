import { cache } from "react";
import { dbGet, dbRun } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { createDefaultInvoice, type Invoice } from "@/lib/invoice";

export type SharedInvoiceRow = {
  id: string;
  user_id: string;
  number: string;
  status: string;
  client_name: string;
  total: number;
  currency: string;
  data: string;
  viewed_at: number | null;
  share_token: string | null;
};

// Single source of truth for resolving a public share link (id + token) to
// an invoice, used by both the JSON API route (kept for backwards
// compatibility / programmatic access) and the styled public view page. Also
// owns the one-time "invoice was viewed" notification side effect so it
// can't drift between the two callers.
export const getSharedInvoice = cache(async function getSharedInvoice(id: string, token: string): Promise<{
  invoice: Invoice;
  meta: { number: string; clientName: string; total: number; currency: string; status: string };
} | null> {
  if (!token) return null;

  const row = await dbGet<SharedInvoiceRow>(
    "SELECT id, user_id, number, status, client_name, total, currency, data, viewed_at, share_token FROM invoices WHERE id = ?",
    id,
  );
  if (!row || !row.share_token || row.share_token !== token) return null;

  if (!row.viewed_at) {
    const now = Date.now();
    const { changes } = await dbRun(
      "UPDATE invoices SET viewed_at = ? WHERE id = ? AND viewed_at IS NULL",
      now,
      id,
    );
    if (changes > 0) {
      await createNotification({
        userId: row.user_id,
        type: "invoice_viewed",
        title: `Invoice #${row.number} was viewed`,
        body: `Your invoice for ${row.client_name || "a client"} (${row.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${row.currency}) was just opened.`,
        meta: { invoiceId: id },
      });
    }
  }

  let invoiceData: Partial<Invoice> = {};
  try {
    invoiceData = JSON.parse(row.data);
  } catch {}

  const invoice: Invoice = { ...createDefaultInvoice(), ...invoiceData };

  return {
    invoice,
    meta: {
      number: row.number,
      clientName: row.client_name,
      total: row.total,
      currency: row.currency,
      status: row.status,
    },
  };
});
