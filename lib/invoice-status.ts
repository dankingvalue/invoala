// Payments are the ledger of record; invoice status and amountPaid are always
// derived from them (see lib/data.ts recalcInvoiceFromPayments), never set
// directly. This module is the single place that turns (ledger status,
// amount paid, total, due date, viewed_at) into what the UI shows.

// What we actually store in invoices.status — states we set explicitly.
export const LEDGER_STATUSES = ["draft", "sent", "partial", "paid", "void"] as const;
export type LedgerStatus = (typeof LEDGER_STATUSES)[number];

// What the UI can show — the ledger statuses, plus states derived purely at
// read time from due date / view tracking (never persisted as such).
export type DisplayStatus = LedgerStatus | "viewed" | "overdue" | "cancelled";

export function isLedgerStatus(value: unknown): value is LedgerStatus {
  return typeof value === "string" && (LEDGER_STATUSES as readonly string[]).includes(value);
}

// Invoala is used across many countries, so the method list stays limited to
// genuinely universal rails — no region-specific mobile-money schemes (those
// don't apply outside their home market). "Other" covers everything else,
// paired with a free-text field so the client can note what was actually used.
const PAYMENT_METHOD_DEFS = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
] as const;

export const PAYMENT_METHODS = PAYMENT_METHOD_DEFS.map((m) => m.value);
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === "string" && (PAYMENT_METHODS as readonly string[]).includes(value);
}

export function paymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_DEFS.find((m) => m.value === method)?.label ?? method;
}

// payments.payment_method is a plain TEXT column (no CHECK constraint), so a
// free-text label typed for "Other" (e.g. "Mobile money", "Cheque") is stored
// verbatim instead of being collapsed to the literal word "other" — that's
// what lets the UI show what the client actually wrote.
export function sanitizePaymentMethod(value: unknown): string {
  if (isPaymentMethod(value)) return value;
  if (typeof value === "string" && value.trim()) return value.trim().slice(0, 60);
  return "other";
}

// Round to cents so repeated add/subtract across payment records can't drift
// (the app's existing money representation is a float `total REAL` column —
// this keeps that representation, just guards against float noise).
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Ledger status to store on the invoices row after a payment is
// recorded/edited/deleted. Draft and void are terminal from this function's
// point of view — payments can't be recorded against them (enforced in
// lib/data.ts), so their stored status never changes here.
export function ledgerStatusForAmount(
  amountPaid: number,
  total: number,
  previousStatus: string,
): LedgerStatus {
  if (previousStatus === "void" || previousStatus === "draft") return previousStatus;
  if (total > 0 && amountPaid >= total) return "paid";
  if (amountPaid > 0) return "partial";
  return "sent";
}

// What the Documents table (and any other UI) should actually display —
// layers "overdue" and "viewed" on top of the stored ledger status without
// ever writing them back, so nothing needs a cron job to keep them accurate.
export function deriveDisplayStatus(input: {
  status: string;
  total: number;
  amountPaid: number;
  dueDate?: string | null;
  viewedAt?: number | null;
}): DisplayStatus {
  const { status, total, amountPaid, dueDate, viewedAt } = input;

  if (status === "void" || status === "cancelled") return status;
  if (status === "draft") return "draft";

  // Paid always wins, even past due — matches how every invoicing tool treats it.
  if (total > 0 && amountPaid >= total) return "paid";

  const today = new Date().toISOString().slice(0, 10);
  if (dueDate && dueDate < today) return "overdue";

  if (amountPaid > 0) return "partial";
  if (viewedAt) return "viewed";
  return "sent";
}

export function remainingBalance(total: number, amountPaid: number): number {
  return Math.max(0, round2(total - amountPaid));
}
