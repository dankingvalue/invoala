import { getSessionUser } from "@/lib/server-auth";
import { getClientProfile } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { formatMoney } from "@/lib/invoice";
import { remainingBalance } from "@/lib/invoice-status";

// Builds a running-balance statement from the real invoice/payment ledger
// and sends it with the existing email infrastructure (lib/email.ts) — no
// second email system, no new PDF renderer.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const profile = await getClientProfile(user.id, id);
  if (!profile) return Response.json({ error: "Client not found." }, { status: 404 });

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const toEmail = (body.to || profile.client.email || "").trim().toLowerCase();
  if (!toEmail || !toEmail.includes("@")) {
    return Response.json({ error: "Valid recipient email required." }, { status: 400 });
  }

  const currency = profile.client.currency || "USD";
  const activeInvoices = profile.invoices.filter((i) => i.status !== "void" && i.status !== "cancelled");

  type Line = { date: number; label: string; debit: number; credit: number };
  const lines: Line[] = [
    ...activeInvoices.map((i) => ({ date: i.created_at, label: `Invoice ${i.number}`, debit: i.total, credit: 0 })),
    ...profile.payments.map((p) => ({
      date: p.created_at,
      label: `Payment received — ${p.invoice_number}${p.reference ? ` (${p.reference})` : ""}`,
      debit: 0,
      credit: p.amount,
    })),
  ].sort((a, b) => a.date - b.date);

  let running = 0;
  const rows = lines.map((l) => {
    running += l.debit - l.credit;
    const date = new Date(l.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const amount = l.debit ? formatMoney(l.debit, currency) : `-${formatMoney(l.credit, currency)}`;
    return `${date}  ${l.label.padEnd(40)} ${amount.padStart(14)}  bal: ${formatMoney(running, currency)}`;
  });

  const totalInvoiced = activeInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = profile.payments.reduce((s, p) => s + p.amount, 0);
  const closingBalance = remainingBalance(totalInvoiced, totalPaid);

  const text = [
    `Statement for ${profile.client.name}`,
    `Opening balance: ${formatMoney(0, currency)}`,
    "",
    ...rows,
    "",
    `Closing balance due: ${formatMoney(closingBalance, currency)}`,
    "",
    `— sent via Invoala`,
  ].join("\n");

  const result = await sendEmail({
    to: toEmail,
    subject: `Statement — ${profile.client.name}`,
    text,
  });
  if (result.status === "failed") {
    return Response.json({ error: "Failed to send statement." }, { status: 500 });
  }
  return Response.json({ ok: true, status: result.status });
}
