import type { jsPDF } from "jspdf";
import type { Invoice } from "@/lib/invoice";

// ---- Shared design tokens (mirror InvoicePreview / the downloaded PDF) ----
const INK: [number, number, number] = [29, 29, 31]; // #1d1d1f
const SUBTLE: [number, number, number] = [110, 110, 115]; // #6e6e73
const FAINT: [number, number, number] = [199, 199, 204]; // #c7c7cc
const HAIRLINE: [number, number, number] = [232, 232, 237]; // #e8e8ed

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function setColor(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function sectionLabel(doc: jsPDF, label: string, y: number, color: [number, number, number]): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setColor(doc, color);
  doc.text(label.toUpperCase(), 0, y, { charSpace: 0.4 });
  return y + 9.5;
}

function sectionRule(doc: jsPDF, x: number, width: number, y: number, color: [number, number, number], thickness = 0.7): void {
  doc.setDrawColor(color[0], color[1], color[2]);
  doc.setLineWidth(thickness);
  doc.line(x, y, x + width, y);
}

// Server-side A4 PDF used for email attachments. Structured to mirror the
// downloaded generator PDF: same accents, logo, tables, totals and spacing —
// no watermark or promotional footer on any account.
export async function invoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const { computeTotals, formatMoney, docTitle, themeColor } = await import("@/lib/invoice");
  const doc: jsPDF = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 48;
  const contentW = pageW - M * 2;
  const accent = rgb(themeColor(invoice.theme || "green"));
  const accentSoft: [number, number, number] = [
    accent[0],
    accent[1],
    accent[2],
  ];
  void accentSoft;

  const { subtotal, taxAmount, total, discountAmount, shipping } = computeTotals(invoice);
  const fmt = (n: number) => formatMoney(n, invoice.currency);
  const isQuote = invoice.docType === "quote" || invoice.docType === "estimate";
  const isReceipt = invoice.docType === "receipt";
  const title = docTitle(invoice.docType);
  const metaLabel = isReceipt ? "RECEIPT #" : `${title.toUpperCase()} #`;
  const dueLabel = isQuote ? "VALID UNTIL" : isReceipt ? "RECEIVED" : "DUE";

  let y = M + 6;

  // ---- Header: logo + business left, document title + meta right ----
  if (invoice.logoDataUrl) {
    try {
      const format = invoice.logoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
      const ratio = 160 / 42; // max width 160px@96dpi ≈ 120pt, max height 56px ≈ 42pt
      void ratio;
      // Compute scaled dims from the source image is not possible directly;
      // draw at the max box with proportional guess via JS-side dims below.
      const img = doc.getImageProperties(invoice.logoDataUrl);
      const maxW = 120;
      const maxH = 42;
      const scale = Math.min(maxW / img.width, maxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      doc.addImage(invoice.logoDataUrl, format, M, y, w, h);
      y += h + 12;
    } catch {
      // invalid image data — continue without the logo
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15); // text-xl ≈ 20px → 15pt
  setColor(doc, INK);
  const bizText = invoice.businessName.trim() || "Your Company";
  doc.text(bizText, M, y);
  const bizBaseline = y;

  const bizLines = (invoice.businessAddress || "").split("\n").filter(Boolean);
  if (invoice.businessEmail) bizLines.push(invoice.businessEmail);
  const shownBizLines = bizLines.length > 0 ? bizLines : ["Your address", "you@example.com"];
  let lineY = bizBaseline + 6;
  for (const line of shownBizLines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, SUBTLE);
    doc.text(line, M, lineY);
    lineY += 11;
  }
  y = Math.max(y + 14, lineY - 1);

  // Meta block (right side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(21); // [28px] ≈ 21pt
  setColor(doc, accent);
  doc.text(title.toUpperCase(), pageW - M, M + 12, { align: "right" });
  if (isReceipt && total > 0) {
    const badge = "PAID";
    const bw = doc.getTextWidth(badge) + 14;
    doc.setFillColor(accent[0], accent[1], accent[2]);
    doc.roundedRect(pageW - M - bw, M + 18, bw, 14, 7, 7, "F");
    doc.setFontSize(7);
    setColor(doc, [255, 255, 255]);
    doc.text(badge, pageW - M - bw / 2, M + 27.5, { align: "center" });
  }
  doc.setFontSize(9);
  const metaRows: Array<[string, string]> = [
    [metaLabel, invoice.invoiceNumber || "—"],
    [isReceipt ? "Date paid" : "Issued", fmtDate(invoice.issueDate) || "—"],
    [dueLabel, fmtDate(invoice.dueDate) || "—"],
  ];
  const metaX = pageW - M;
  let metaY = M + 46;
  for (const [leftRaw, rightRaw] of metaRows) {
    doc.setFont("helvetica", "normal");
    setColor(doc, SUBTLE);
    doc.text(leftRaw.toUpperCase(), metaX - 150, metaY);
    doc.setFont("helvetica", "medium");
    setColor(doc, INK);
    doc.text(rightRaw, metaX, metaY, { align: "right" });
    metaY += 13;
  }

  // ---- Billed to ----
  const billedTop = Math.max(y, metaY - 13) + 16;
  y = sectionLabel(doc, isReceipt ? "Received from" : "Billed to", billedTop, FAINT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  setColor(doc, INK);
  doc.text(invoice.clientName.trim() || "Client Name", M, y);
  y += 14;
  const clientLines = (invoice.clientAddress || "Client address").split("\n").filter(Boolean);
  if (invoice.clientEmail) clientLines.push(invoice.clientEmail);
  for (const line of clientLines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, SUBTLE);
    doc.text(line, M, y);
    y += 11;
  }
  y += 18;

  // ---- Items table ----
  const colQty = pageW - M - 205;
  const colRate = pageW - M - 140;
  const colAmt = pageW - M - 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setColor(doc, SUBTLE);
  doc.text("DESCRIPTION", M, y);
  doc.text("QTY", colQty + 25, y, { align: "right" });
  doc.text("RATE", colRate + 18, y, { align: "right" });
  doc.text("AMOUNT", colAmt, y, { align: "right" });
  sectionRule(doc, M, contentW, y + 3, accent, 1.4); // thead border in accent
  y += 14;

  const rows = invoice.items.length > 0 ? invoice.items : [{ description: "", quantity: 1, rate: 0 }];
  for (const item of rows) {
    const desc = item.description || "Item description";
    const descLines = doc.splitTextToSize(desc, colQty - M - 12);
    if (y + descLines.length * 12 > pageH - 120) {
      doc.addPage();
      y = M + 20;
      sectionRule(doc, M, contentW, y - 6, accent, 1.4);
    }
    for (const line of descLines) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor(doc, item.description ? INK : FAINT);
      doc.text(line, M, y);
      y += 11.5;
    }
    y -= 11.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, SUBTLE);
    doc.text(String(item.quantity), colQty + 25, y, { align: "right" });
    doc.text(fmt(Number(item.rate) || 0), colRate + 18, y, { align: "right" });
    setColor(doc, INK);
    doc.text(fmt((Number(item.quantity) || 0) * (Number(item.rate) || 0)), colAmt, y, { align: "right" });
    y += 17;
    sectionRule(doc, M, contentW, y - 8, HAIRLINE, 0.6);
  }
  y += 12;

  // ---- Totals (right, max ~240px ≈ 180pt wide) ----
  const sumW = 180;
  const sumX = pageW - M - sumW;
  const totalRows: Array<{ label: string; amount: number; strong: boolean; red?: boolean }> = [
    { label: "Subtotal", amount: subtotal, strong: false },
    ...(discountAmount > 0
      ? [{
          label:
            invoice.discountMode === "fixed"
              ? `Discount (${fmt(discountAmount)})`
              : `Discount (${invoice.discount}%)`,
          amount: -discountAmount,
          strong: false,
        }]
      : []),
    ...(shipping > 0 ? [{ label: "Shipping", amount: shipping, strong: false }] : []),
    ...(taxAmount > 0 ? [{ label: `Tax (${invoice.taxRate}%)`, amount: taxAmount, strong: false }] : []),
    { label: isReceipt ? "Amount received" : "Total due", amount: total, strong: true },
    ...(invoice.amountPaid && invoice.amountPaid > 0
      ? [{ label: "Paid", amount: -invoice.amountPaid, strong: false, red: true },
         { label: "Balance due", amount: Math.max(0, total - invoice.amountPaid), strong: true }]
      : []),
  ];
  for (const row of totalRows) {
    if (y > pageH - 90) {
      doc.addPage();
      y = M + 20;
    }
    if (row.strong && row.label !== "Paid") {
      sectionRule(doc, sumX, sumW, y - 6, INK, 1.6);
    }
    doc.setFont("helvetica", row.strong ? "bold" : "normal");
    doc.setFontSize(row.strong ? 10.5 : 9);
    setColor(doc, row.strong ? INK : SUBTLE);
    doc.text(row.label.toUpperCase(), sumX, y);
    setColor(doc, row.red ? [0, 134, 90] : INK);
    doc.text(fmt(row.amount), pageW - M, y, { align: "right" });
    y += row.strong ? 18 : 14;
  }

  // ---- Custom fields (2 columns, like the preview) ----
  const fields = (invoice.customFields ?? []).filter((f) => f.label.trim() || f.value.trim());
  if (fields.length > 0) {
    y += 12;
    sectionRule(doc, M, contentW, y - 6, HAIRLINE, 0.6);
    const halfW = contentW / 2 - 16;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const col = i % 2;
      const rowIdx = Math.floor(i / 2);
      const colX = col === 0 ? M : M + contentW / 2;
      const rowY = y + rowIdx * 34;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      setColor(doc, FAINT);
      doc.text((f.label.trim() || "Field").toUpperCase(), colX, rowY, { charSpace: 0.3 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setColor(doc, INK);
      const lines = doc.splitTextToSize(f.value.trim() || "—", halfW);
      let ly = rowY + 11;
      for (const line of lines.slice(0, 2)) {
        doc.text(line, colX, ly);
        ly += 11;
      }
    }
    y += Math.ceil(fields.length / 2) * 34 + 8;
  }

  // ---- Payment instructions (mirrors preview block incl. Pay online pill) ----
  if (invoice.paymentInstructions) {
    y += 8;
    sectionRule(doc, M, contentW, y - 6, HAIRLINE, 0.6);
    y = sectionLabel(doc, "How to pay", y, FAINT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, SUBTLE);
    for (const line of doc.splitTextToSize(invoice.paymentInstructions, contentW - 40)) {
      doc.text(line, M, y);
      y += 11.5;
    }
    y += 4;
    if (invoice.paymentLink) {
      const linkW = doc.getTextWidth("Pay online") + 22;
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.roundedRect(M, y, linkW, 17, 8.5, 8.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setColor(doc, [255, 255, 255]);
      doc.text("Pay online", M + linkW / 2, y + 11.5, { align: "center" });
      y += 24;
    }
  }

  // ---- Notes ----
  if (invoice.notes) {
    y += 10;
    sectionRule(doc, M, contentW, y - 6, HAIRLINE, 0.6);
    y = sectionLabel(doc, "Notes", y, FAINT);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, SUBTLE);
    for (const line of doc.splitTextToSize(invoice.notes, contentW - 40)) {
      if (y > pageH - 60) {
        doc.addPage();
        y = M + 20;
      }
      doc.text(line, M, y);
      y += 11.5;
    }
  }

  return Buffer.from(doc.output("arraybuffer") as ArrayBuffer);
}
