import { themeColor, type Invoice } from "@/lib/invoice";

// One source of truth for the *printed* invoice design — the same layout
// language as the generator preview / homepage download. Rendered to PDF via
// headless Chromium, so every output (dashboard download, email attachment,
// recurring) is identical.

const INK = "#1d1d1f";
const SUBTLE = "#6e6e73";
const FAINT = "#c7c7cc";
const HAIRLINE = "#e8e8ed";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime())
    ? esc(iso)
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function docTitle(docType: string): string {
  const map: Record<string, string> = {
    invoice: "Invoice",
    quote: "Quote",
    estimate: "Estimate",
    receipt: "Receipt",
  };
  return map[docType] || "Invoice";
}

export function buildInvoiceHtml(invoice: Invoice, { money }: { money: (n: number) => string }): string {
  const accent = themeColor(invoice.theme || "green");
  const isQuote = invoice.docType === "quote" || invoice.docType === "estimate";
  const isReceipt = invoice.docType === "receipt";
  const title = docTitle(invoice.docType);
  const dueLabel = isQuote ? "Valid until" : isReceipt ? "Received" : "Due";
  const metaLabel = isReceipt ? "Receipt #" : `${title} #`;

  const businessName = invoice.businessName.trim() || "Your Company";
  const clientName = invoice.clientName.trim() || "Client Name";

  const rows: Array<{ d: string; q: string; r: string; a: string }> = [];
  for (const item of invoice.items) {
    rows.push({
      d: esc(item.description || "Item description"),
      q: String(item.quantity),
      r: money(Number(item.rate) || 0),
      a: money((Number(item.quantity) || 0) * (Number(item.rate) || 0)),
    });
  }
  if (rows.length === 0) {
    rows.push({ d: "Item description", q: "1", r: money(0), a: money(0) });
  }

  // Same totals math as computeTotals.
  const sub = invoice.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.rate) || 0), 0);
  const shipping = Number(invoice.shipping) || 0;
  const taxRate = Number(invoice.taxRate) || 0;
  const disc = invoice.discountMode === "fixed" ? Math.min(Math.max(Number(invoice.discountAmount) || 0, 0), sub) : sub * ((Number(invoice.discount) || 0) / 100);
  const afterDiscount = sub - disc + shipping;
  const tax = afterDiscount * (taxRate / 100);
  const total = afterDiscount + tax;
  const paid = Number(invoice.amountPaid) || 0;
  const balance = Math.max(0, total - paid);

  const moneySub = money(sub);
  const moneyDisc = money(disc);
  const moneyShip = money(shipping);
  const moneyTax = money(tax);
  const moneyTotal = money(total);

  const lines = (s?: string) => (s || "").split("\n").filter(Boolean);

  const totalRowsHtml = `
    ${disc > 0 ? `<tr><td>${invoice.discountMode === "fixed" ? "Discount" : `Discount (${Number(invoice.discount) || 0}%)`}</td><td>−${moneyDisc}</td></tr>` : ""}
    ${shipping > 0 ? `<tr><td>Shipping</td><td>${moneyShip}</td></tr>` : ""}
    ${tax > 0 ? `<tr><td>Tax (${taxRate}%)</td><td>${moneyTax}</td></tr>` : ""}
    <tr class="total"><td>${isReceipt ? "Amount received" : "Total due"}</td><td>${moneyTotal}</td></tr>
    ${paid > 0 && !isReceipt ? `<tr><td>Paid</td><td class="paid">−${money(paid)}</td></tr><tr class="total"><td>Balance due</td><td>${money(balance)}</td></tr>` : ""}
  `;

  const customFields = (invoice.customFields || []).filter((f) => f.label.trim() || f.value.trim());
  const fieldsHtml = customFields
    .map(
      (f) => `
      <div class="field">
        <div class="field-label">${esc(f.label.trim() || "Field")}</div>
        <div class="field-value">${esc(f.value.trim() || "—")}</div>
      </div>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    width: 210mm;
    min-height: 297mm;
    color: ${INK};
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
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
  .paid-badge { display: inline-block; margin-top: 2mm; padding: 0.8mm 3mm; border-radius: 999px; background: ${accent}; color: #fff; font-size: 7.5pt; font-weight: 700; letter-spacing: 0.08em; }
  .billed { margin-top: 11mm; }
  .sec { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: ${FAINT}; }
  .billed .name { margin-top: 1.5mm; font-size: 10.5pt; font-weight: 600; }
  .billed .addr { margin-top: 1mm; font-size: 9pt; line-height: 1.5; color: ${SUBTLE}; white-space: pre-line; }
  table.items { margin-top: 8mm; width: 100%; border-collapse: collapse; }
  table.items th { padding-bottom: 1.8mm; font-size: 8pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: ${SUBTLE}; text-align: right; border-bottom: 1.2pt solid ${accent}; }
  table.items th:first-child { text-align: left; }
  table.items td { padding: 2.3mm 0; border-bottom: 0.6pt solid ${HAIRLINE}; vertical-align: top; }
  table.items td:nth-child(1) { font-size: 9.5pt; }
  table.items td:nth-child(n+2) { font-size: 9pt; text-align: right; white-space: nowrap; color: ${SUBTLE}; }
  table.items td:nth-child(1).placeholder { color: ${FAINT}; }
  table.items td:nth-child(n+2).money { color: ${INK}; }
  table.items td.n { width: 9%; }
  table.items td.r { width: 18%; }
  table.items td.a { width: 22%; }
  .totals { margin-top: 5mm; margin-left: auto; width: 48mm; }
  .totals table { width: 100%; border-collapse: collapse; }
  .totals td { padding: 1mm 0; font-size: 9pt; color: ${SUBTLE}; }
  .totals td:last-child { text-align: right; color: ${INK}; font-variant-numeric: tabular-nums; }
  .totals tr.total td { border-top: 1.6pt solid ${INK}; padding-top: 2mm; color: ${INK}; font-weight: 700; font-size: 9.5pt; }
  .totals tr.total td:last-child { text-align: right; }
  .totals td.paid { color: #00875a; }
  .pay { margin-top: 6mm; border-top: 0.6pt solid ${HAIRLINE}; padding-top: 4mm; page-break-inside: avoid; }
  .pay .body { margin-top: 1.5mm; font-size: 9pt; line-height: 1.5; color: ${SUBTLE}; white-space: pre-line; }
  .pay-link { display: inline-block; margin-top: 2mm; padding: 1.6mm 5mm; border-radius: 999px; background: ${accent}; color: #fff; font-size: 9pt; font-weight: 600; text-decoration: none; }
  .notes { margin-top: 6mm; border-top: 0.6pt solid ${HAIRLINE}; padding-top: 4mm; page-break-inside: avoid; }
  .notes .body { margin-top: 1.5mm; font-size: 9pt; line-height: 1.5; color: ${SUBTLE}; white-space: pre-line; }
  .fields { margin-top: 6mm; border-top: 0.6pt solid ${HAIRLINE}; padding-top: 4mm; display: grid; grid-template-columns: 1fr 1fr; column-gap: 8mm; row-gap: 3mm; }
  .field-label { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${FAINT}; }
  .field-value { margin-top: 0.6mm; font-size: 9pt; color: ${INK}; }
  .recurring { margin-top: 6mm; text-align: right; }
  .recurring span { display: inline-block; padding: 1.2mm 3.5mm; border-radius: 999px; background: #f5f5f7; color: ${SUBTLE}; font-size: 8.5pt; }
</style>
</head>
<body>
<div class="sheet">
  <div class="hdr">
    <div class="biz">
      ${invoice.logoDataUrl ? `<img src="${invoice.logoDataUrl}" alt="" style="max-height: 12mm; max-width: 42mm; margin-bottom: 2mm; object-fit: contain;" />` : ""}
      <div class="name">${esc(businessName)}</div>
      <div class="addr">${esc((invoice.businessAddress || "Your address") + (invoice.businessEmail ? `\n${invoice.businessEmail}` : ""))}</div>
    </div>
    <div class="doc">
      <h1>${esc(title)}</h1>
      ${isReceipt && total > 0 ? `<span class="paid-badge">Paid</span>` : ""}
      <div class="meta">
        <table>
          <tr><td class="k">${esc(metaLabel)}</td><td class="v">${esc(invoice.invoiceNumber || "—")}</td></tr>
          <tr><td class="k">${isReceipt ? "Date paid" : "Issued"}</td><td class="v">${fmtDate(invoice.issueDate)}</td></tr>
          <tr><td class="k">${esc(dueLabel)}</td><td class="v">${fmtDate(isReceipt ? invoice.dueDate || invoice.issueDate : invoice.dueDate)}</td></tr>
        </table>
      </div>
    </div>
  </div>

  <div class="billed">
    <div class="sec">${isReceipt ? "Received from" : "Billed to"}</div>
    <div class="name">${esc(clientName)}</div>
    <div class="addr">${esc((invoice.clientAddress || "Client address") + (invoice.clientEmail ? `\n${invoice.clientEmail}` : ""))}</div>
  </div>

  <table class="items">
    <thead><tr><th style="width:51%">Description</th><th class="n">Qty</th><th class="r">Rate</th><th class="a">Amount</th></tr></thead>
    <tbody>
      ${rows.map((row) => `<tr><td${row.d === "Item description" ? ' class="placeholder"' : ""}>${row.d}</td><td class="n money">${row.q}</td><td class="r money">${row.r}</td><td class="a money">${row.a}</td></tr>`).join("")}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td>Subtotal</td><td>${moneySub}</td></tr>
      ${totalRowsHtml}
    </table>
  </div>

  ${invoice.recurring ? `<div class="recurring"><span>${esc(invoice.recurring.charAt(0).toUpperCase() + invoice.recurring.slice(1))}</span></div>` : ""}

  ${customFields.length > 0 ? `<div class="fields">${fieldsHtml}</div>` : ""}

  ${invoice.paymentInstructions || invoice.paymentLink ? `
    <div class="pay">
      <div class="sec">How to pay</div>
      ${invoice.paymentInstructions ? `<div class="body">${esc(invoice.paymentInstructions)}</div>` : ""}
      ${invoice.paymentLink ? `<a class="pay-link" href="${esc(invoice.paymentLink)}">Pay online</a>` : ""}
    </div>` : ""}

  ${invoice.notes ? `<div class="notes"><div class="sec">Notes</div><div class="body">${esc(invoice.notes)}</div></div>` : ""}
</div>
</body>
</html>`;
}
