import { INTER_400_BASE64, INTER_600_BASE64, INTER_700_BASE64 } from "@/lib/invoice-font";
import type { ClientRow, InvoiceRow, PaymentRow } from "@/lib/data";
import type { WorkspaceSettings } from "@/lib/workspace-settings";
import { remainingBalance } from "@/lib/invoice-status";

// The printed/emailed statement design — same layout language as the invoice
// PDF (lib/invoice-html.ts), rendered via the same headless-Chromium pipeline
// (lib/invoice-pdf.ts's renderHtmlToPdf). Shows full client identification
// since one client record can be shared across multiple invoices/users on a
// team, and "which client is this" must never be ambiguous on a statement.

const INK = "#1d1d1f";
const SUBTLE = "#6e6e73";
const FAINT = "#c7c7cc";
const HAIRLINE = "#e8e8ed";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export type StatementRow = { date: number; label: string; debit: number; credit: number };

export type StatementData = {
  business: {
    name: string;
    addressLines: string; // pre-joined, "\n"-separated
    email: string;
    logoDataUrl: string;
    accent: string;
  };
  client: {
    name: string;
    contactName: string;
    email: string;
    phone: string;
    addressLines: string; // pre-joined, "\n"-separated
    taxNumber: string;
  };
  currency: string;
  rows: StatementRow[];
  openingBalance: number;
  closingBalance: number;
  generatedAt: number;
};

export function buildStatementHtml(data: StatementData, { money }: { money: (n: number) => string }): string {
  const accent = data.business.accent || "#166534";

  let running = data.openingBalance;
  const rowsHtml = data.rows
    .map((r) => {
      running += r.debit - r.credit;
      return `<tr>
        <td class="date">${fmtDate(r.date)}</td>
        <td>${esc(r.label)}</td>
        <td class="amt">${r.debit ? money(r.debit) : ""}</td>
        <td class="amt">${r.credit ? money(r.credit) : ""}</td>
        <td class="amt bal">${money(running)}</td>
      </tr>`;
    })
    .join("");

  const clientMetaRows = [
    data.client.contactName ? `<tr><td class="k">Contact</td><td class="v">${esc(data.client.contactName)}</td></tr>` : "",
    data.client.email ? `<tr><td class="k">Email</td><td class="v">${esc(data.client.email)}</td></tr>` : "",
    data.client.phone ? `<tr><td class="k">Phone</td><td class="v">${esc(data.client.phone)}</td></tr>` : "",
    data.client.taxNumber ? `<tr><td class="k">Tax #</td><td class="v">${esc(data.client.taxNumber)}</td></tr>` : "",
  ].join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  @font-face { font-family: "Inter"; font-weight: 400; font-style: normal; src: url(data:font/woff2;base64,${INTER_400_BASE64}) format("woff2"); }
  @font-face { font-family: "Inter"; font-weight: 600; font-style: normal; src: url(data:font/woff2;base64,${INTER_600_BASE64}) format("woff2"); }
  @font-face { font-family: "Inter"; font-weight: 700; font-style: normal; src: url(data:font/woff2;base64,${INTER_700_BASE64}) format("woff2"); }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 210mm;
    min-height: 297mm;
    color: ${INK};
    font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .sheet { padding: 11mm 13mm 14mm; }
  .hdr { display: flex; justify-content: space-between; align-items: flex-start; gap: 10mm; }
  .biz { max-width: 90mm; }
  .biz .name { font-size: 15pt; font-weight: 600; letter-spacing: -0.01em; }
  .biz .addr { margin-top: 2.5mm; font-size: 8.5pt; line-height: 1.55; color: ${SUBTLE}; white-space: pre-line; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 21pt; font-weight: 700; text-transform: uppercase; letter-spacing: -0.01em; color: ${accent}; }
  .meta { margin-top: 4mm; font-size: 8.5pt; }
  .meta table { margin-left: auto; border-collapse: collapse; }
  .meta td { padding: 0.8mm 0 0.8mm 4mm; }
  .meta td.k { color: ${SUBTLE}; text-align: right; }
  .meta td.v { color: ${INK}; font-weight: 500; text-align: right; }
  .billed { margin-top: 11mm; }
  .sec { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: ${FAINT}; }
  .billed .name { margin-top: 1.5mm; font-size: 12pt; font-weight: 600; }
  .billed .addr { margin-top: 1mm; font-size: 9pt; line-height: 1.5; color: ${SUBTLE}; white-space: pre-line; }
  .billed .meta2 { margin-top: 3mm; border-collapse: collapse; }
  .billed .meta2 td { padding: 0.6mm 0; font-size: 8.5pt; }
  .billed .meta2 td.k { color: ${FAINT}; padding-right: 4mm; white-space: nowrap; }
  .billed .meta2 td.v { color: ${SUBTLE}; }
  table.items { margin-top: 8mm; width: 100%; border-collapse: collapse; }
  table.items th { padding-bottom: 1.8mm; font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${SUBTLE}; text-align: right; border-bottom: 1.2pt solid ${accent}; }
  table.items th:nth-child(1), table.items th:nth-child(2) { text-align: left; }
  table.items td { padding: 2.3mm 0; border-bottom: 0.6pt solid ${HAIRLINE}; vertical-align: top; font-size: 9pt; }
  table.items td.date { color: ${SUBTLE}; white-space: nowrap; width: 22mm; }
  table.items td.amt { text-align: right; white-space: nowrap; color: ${SUBTLE}; font-variant-numeric: tabular-nums; width: 26mm; }
  table.items td.bal { color: ${INK}; font-weight: 600; }
  .totals { margin-top: 5mm; margin-left: auto; width: 60mm; }
  .totals table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 1mm 0; font-size: 9pt; color: ${SUBTLE}; }
  .totals td:last-child { text-align: right; color: ${INK}; font-variant-numeric: tabular-nums; }
  .totals tr.total td { border-top: 1.6pt solid ${INK}; padding-top: 2mm; color: ${INK}; font-weight: 700; font-size: 10.5pt; }
  .promo-footer { margin-top: 10mm; padding-top: 2.5mm; border-top: 0.4pt solid ${HAIRLINE}; text-align: center; color: ${FAINT}; font-size: 7pt; }
  .promo-footer a { color: ${FAINT}; text-decoration: none; }
</style>
</head>
<body>
<div class="sheet">
  <div class="hdr">
    <div class="biz">
      ${data.business.logoDataUrl ? `<img src="${data.business.logoDataUrl}" alt="" style="max-height: 12mm; max-width: 42mm; margin-bottom: 2mm; object-fit: contain;" />` : ""}
      <div class="name">${esc(data.business.name || "Your Company")}</div>
      <div class="addr">${esc([data.business.addressLines, data.business.email].filter(Boolean).join("\n"))}</div>
    </div>
    <div class="doc">
      <h1>Statement</h1>
      <div class="meta">
        <table>
          <tr><td class="k">Statement date</td><td class="v">${fmtDate(data.generatedAt)}</td></tr>
          <tr><td class="k">Currency</td><td class="v">${esc(data.currency)}</td></tr>
        </table>
      </div>
    </div>
  </div>

  <div class="billed">
    <div class="sec">Statement for</div>
    <div class="name">${esc(data.client.name || "Client")}</div>
    <div class="addr">${esc(data.client.addressLines)}</div>
    ${clientMetaRows ? `<table class="meta2">${clientMetaRows}</table>` : ""}
  </div>

  <table class="items">
    <thead><tr><th>Date</th><th>Description</th><th class="amt">Debit</th><th class="amt">Credit</th><th class="amt">Balance</th></tr></thead>
    <tbody>
      ${rowsHtml || `<tr><td colspan="5" style="padding:6mm 0; color:${FAINT}; text-align:center;">No activity yet</td></tr>`}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Opening balance</td><td>${money(data.openingBalance)}</td></tr>
      <tr class="total"><td>Closing balance due</td><td>${money(data.closingBalance)}</td></tr>
    </table>
  </div>

  <div class="promo-footer">
    Made with Invoala — free invoice generator · <a href="https://invoala.com">invoala.com</a>
  </div>
</div>
</body>
</html>`;
}

// One place that turns the raw client/business/ledger records into the
// StatementData shape above — used by both the email-send route and the
// "download my own copy" route so they never drift apart.
export function buildStatementData(
  client: ClientRow,
  business: WorkspaceSettings,
  invoices: InvoiceRow[],
  payments: (PaymentRow & { invoice_number: string })[],
): StatementData {
  const currency = client.currency || business.defaultCurrency || "USD";
  const activeInvoices = invoices.filter((i) => i.status !== "void" && i.status !== "cancelled");

  const rows: StatementRow[] = [
    ...activeInvoices.map((i) => ({ date: i.created_at, label: `Invoice ${i.number}`, debit: i.total, credit: 0 })),
    ...payments.map((p) => ({
      date: p.created_at,
      label: `Payment received — ${p.invoice_number}${p.reference ? ` (${p.reference})` : ""}`,
      debit: 0,
      credit: p.amount,
    })),
  ].sort((a, b) => a.date - b.date);

  const totalInvoiced = activeInvoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const closingBalance = remainingBalance(totalInvoiced, totalPaid);

  const businessAddressLines = [business.businessAddress, [business.city, business.state, business.country].filter(Boolean).join(", "), business.postalCode]
    .filter(Boolean)
    .join("\n");
  const clientAddressLines = [client.address, [client.city, client.state, client.country].filter(Boolean).join(", "), client.postal_code]
    .filter(Boolean)
    .join("\n");

  return {
    business: {
      name: business.businessNameDisplay === "legal_business_name" && business.legalBusinessName ? business.legalBusinessName : business.businessName,
      addressLines: businessAddressLines,
      email: business.businessEmail,
      logoDataUrl: business.showLogoOnDocuments ? business.logo : "",
      accent: business.brandColor,
    },
    client: {
      name: client.name,
      contactName: client.contact_name,
      email: client.email,
      phone: client.phone,
      addressLines: clientAddressLines,
      taxNumber: client.tax_number,
    },
    currency,
    rows,
    openingBalance: 0,
    closingBalance,
    generatedAt: Date.now(),
  };
}
