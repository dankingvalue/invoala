import { dbAll, dbRun } from "@/lib/db";
import { getSubscription } from "@/lib/billing";
import { setInvoiceStatus, upsertInvoice } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { invoicePdfBuffer } from "@/lib/invoice-pdf";
import type { Invoice } from "@/lib/invoice";

const INTERVAL_DAYS: Record<string, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
  quarterly: 91,
  yearly: 365,
};

type RecurringRow = {
  id: string;
  user_id: string;
  number: string;
  status: string;
  data: Invoice;
  recurring_next_at?: number;
};

function isoPlusDays(iso: string, days: number): string {
  const ms = Date.parse(iso + "T00:00:00Z");
  if (Number.isNaN(ms)) return iso;
  return new Date(ms + days * 864e5).toISOString().slice(0, 10);
}

function isoDaysBetween(fromIso: string, toIso: string): number {
  const a = Date.parse(fromIso + "T00:00:00Z");
  const b = Date.parse(toIso + "T00:00:00Z");
  if (Number.isNaN(a) || Number.isNaN(b)) return 14;
  return Math.max(1, Math.round((b - a) / 864e5));
}

function fmtAmount(invoice: Invoice): string {
  const sub = (invoice.items || []).reduce((s, item) => s + (Number(item.quantity) || 0) * (Number(item.rate) || 0), 0);
  const rate = Number(invoice.taxRate) || 0;
  const tax = sub * (rate / 100);
  const disc = (sub * (Number(invoice.discount) || 0)) / 100;
  const total = sub + tax - disc + (Number(invoice.shipping) || 0);
  return `${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${invoice.currency || "USD"}`;
}

// Generates + emails the next invoice for a saved recurring invoice when it
// is due. Returns true when an invoice was generated.
export async function generateDueRecurringInvoice(row: RecurringRow): Promise<boolean> {
  const recurring = row.data.recurring;
  if (!recurring || !INTERVAL_DAYS[recurring]) return false;

  // Recurring auto-send is a Pro feature.
  const sub = await getSubscription(row.user_id).catch(() => null);
  if (!sub || sub.status !== "active") return false;

  // Sending needs a client email on file.
  const clientEmail = row.data.clientEmail?.trim().toLowerCase();
  if (!clientEmail || !clientEmail.includes("@")) return false;

  // Guard against reprocessing within one interval.
  if (row.recurring_next_at && row.recurring_next_at > Date.now()) return false;

  const intervalDays = INTERVAL_DAYS[recurring];
  const baseDate = row.data.recurring_last_generated || row.data.issueDate || "";
  const nextDate = isoPlusDays(baseDate, intervalDays);
  if (!nextDate || nextDate > new Date().toISOString().slice(0, 10)) return false;

  const count = Number(row.data.recurring_count) || 1;
  const baseNumber = row.number || row.data.invoiceNumber || "INV";
  const childNumber = `${baseNumber}-${count + 1}`;

  const dueOffset = row.data.dueDate
    ? isoDaysBetween(row.data.issueDate || nextDate, row.data.dueDate)
    : 14;

  // Build the next invoice without propagating the recurrence settings.
  const childInvoice: Invoice = {
    ...row.data,
    invoiceNumber: childNumber,
    issueDate: nextDate,
    dueDate: isoPlusDays(nextDate, dueOffset),
    recurring: "",
  };
  delete (childInvoice as Partial<Invoice>).recurring_last_generated;
  delete (childInvoice as Partial<Invoice>).recurring_count;

  try {
    const { id: childId } = await upsertInvoice(row.user_id, childInvoice);
    await setInvoiceStatus(row.user_id, childId, "sent");

    const amount = fmtAmount(childInvoice);
    const businessName = childInvoice.businessName?.trim() || "Invoala";
    const pdf = await invoicePdfBuffer(childInvoice).catch(() => null);
    await sendEmail({
      to: clientEmail,
      subject: `Invoice ${childNumber} from ${businessName}`,
      text: `Hi ${childInvoice.clientName?.trim() || "there"},\n\nYour recurring invoice ${childNumber} is attached.\n\nAmount due: ${amount}.\n${childInvoice.notes ? `\nNotes: ${childInvoice.notes}\n` : ""}\nThank you for your business!\n\n— ${businessName}`,
      attachments: pdf
        ? [{ filename: `${childNumber.replace(/[^\w.-]+/g, "-")}.pdf`, content: pdf.toString("base64") }]
        : undefined,
    });

    // Mark the parent so the next occurrence is a full interval away.
    const updatedData: Invoice = { ...row.data, recurring_last_generated: nextDate, recurring_count: count + 1 };
    const nextAt = Date.parse(nextDate + "T00:00:00") + intervalDays * 864e5;
    await dbRun(
      "UPDATE invoices SET data = ?, recurring_next_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      JSON.stringify(updatedData),
      nextAt,
      Date.now(),
      row.id,
      row.user_id,
    );
    return true;
  } catch (err) {
    console.error("[recurring] generation failed", row.id, err);
    return false;
  }
}

export async function runRecurringPass(userId?: string, limit = 300): Promise<{ generated: number; scanned: number }> {
  const rows = await dbAll<{
    id: string;
    user_id: string;
    number: string;
    status: string;
    data: string;
    recurring_next_at: number | null;
  }>(
    `SELECT id, user_id, number, status, data, recurring_next_at
     FROM invoices
     WHERE doc_type = 'invoice' AND status IN ('sent', 'paid')
     ${userId ? "AND user_id = ?" : ""}
     ORDER BY updated_at DESC
     LIMIT ?`,
    ...(userId ? [userId, limit] : [limit]),
  );

  let generated = 0;
  for (const raw of rows) {
    let data: Invoice;
    try {
      data = JSON.parse(raw.data) as Invoice;
    } catch {
      continue;
    }
    try {
      const ok = await generateDueRecurringInvoice({
        id: raw.id,
        user_id: raw.user_id,
        number: raw.number,
        status: raw.status,
        data,
        recurring_next_at: raw.recurring_next_at ?? undefined,
      });
      if (ok) generated += 1;
    } catch (err) {
      console.error("[recurring] pass error", raw.id, err);
    }
  }
  return { generated, scanned: rows.length };
}
