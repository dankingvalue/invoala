import type { jsPDF } from "jspdf";
import type { Invoice } from "@/lib/invoice";

const M = 48; // page margin pt

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const INK: [number, number, number] = [29, 29, 31];
const SUBTLE: [number, number, number] = [110, 110, 115];
const FAINT: [number, number, number] = [199, 199, 204];

function writeBlock(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, color: [number, number, number]): number {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(color[0], color[1], color[2]);
  for (const line of doc.splitTextToSize(text, maxWidth)) {
    doc.text(line, x, y);
    y += 12;
  }
  return y;
}

// Server-side A4 invoice PDF used for email attachments (the interactive
// generator's richer client-side render remains the download experience).
export async function invoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const { computeTotals, formatMoney, docTitle, themeColor } = await import("@/lib/invoice");
  const doc: jsPDF = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const contentW = pageW - M * 2;
  const accent = rgb(themeColor(invoice.theme || "green"));
  const { subtotal, taxAmount, total, discountAmount, shipping } = computeTotals(invoice);
  const fmt = (n: number) => formatMoney(n, invoice.currency);

  let y = M + 8;

  // Header: business left, meta right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(invoice.businessName.trim() || "Your Company", M, y);
  const bizTop = y;
  const addrLines = (invoice.businessAddress || "").split("\n").filter(Boolean);
  if (invoice.businessEmail) addrLines.push(invoice.businessEmail);
  y = bizTop + 13;
  for (const l of addrLines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(SUBTLE[0], SUBTLE[1], SUBTLE[2]);
    doc.text(l, M, y);
    y += 11;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(accent[0], accent[1], accent[2]);
  doc.text(docTitle(invoice.docType).toUpperCase(), pageW - M, bizTop + 4, { align: "right" });
  doc.setFontSize(9);
  const fmtDate = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const meta: Array<[string, string]> = [
    [`${docTitle(invoice.docType).toUpperCase()} #`, invoice.invoiceNumber || "—"],
    ["ISSUED", invoice.issueDate ? fmtDate(invoice.issueDate) : "—"],
    ["DUE", invoice.dueDate ? fmtDate(invoice.dueDate) : "—"],
  ];
  let my = bizTop + 22;
  for (const [k, v] of meta) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(SUBTLE[0], SUBTLE[1], SUBTLE[2]);
    doc.text(k, pageW - M - 150, my);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(v, pageW - M, my, { align: "right" });
    my += 12;
  }

  // Billed to
  y = Math.max(my, bizTop + 13 + addrLines.length * 11 + 26);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(FAINT[0], FAINT[1], FAINT[2]);
  doc.text("BILLED TO", M, y);
  y += 13;
  doc.setFontSize(10.5);
  doc.setTextColor(INK[0], INK[1], INK[2]);
  doc.text(invoice.clientName.trim() || "Client Name", M, y);
  y += 12;
  const clientAddrLines = (invoice.clientAddress || "").split("\n").filter(Boolean);
  if (invoice.clientEmail) clientAddrLines.push(invoice.clientEmail);
  for (const l of clientAddrLines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(SUBTLE[0], SUBTLE[1], SUBTLE[2]);
    doc.text(l, M, y);
    y += 11;
  }
  y += 22;

  // Items table
  const colQty = pageW - M - 210;
  const colRate = pageW - M - 140;
  const colAmt = pageW - M - 40;
  doc.setFillColor(accent[0], accent[1], accent[2]);
  doc.rect(M, y - 7, contentW, 0.9, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(SUBTLE[0], SUBTLE[1], SUBTLE[2]);
  doc.text("DESCRIPTION", M, y);
  doc.text("QTY", colQty + 20, y, { align: "right" });
  doc.text("RATE", colRate + 15, y, { align: "right" });
  doc.text("AMOUNT", colAmt, y, { align: "right" });
  y += 18;

  const items = invoice.items.length > 0 ? invoice.items : [{ description: "Item description", quantity: 1, rate: 0 }];
  for (const item of items) {
    const desc = item.description || "Item description";
    const descLines = doc.splitTextToSize(desc, colQty - M - 12);
    if (y + descLines.length * 12 > pageH - 90) {
      doc.addPage();
      y = M + 30;
    }
    for (const line of descLines) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(INK[0], INK[1], INK[2]);
      doc.text(line, M, y);
      y += 11.5;
    }
    y -= 11.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(SUBTLE[0], SUBTLE[1], SUBTLE[2]);
    doc.text(String(item.quantity), colQty + 20, y, { align: "right" });
    doc.text(fmt(Number(item.rate) || 0), colRate + 15, y, { align: "right" });
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(fmt((Number(item.quantity) || 0) * (Number(item.rate) || 0)), colAmt, y, { align: "right" });
    y += 18;
    doc.setDrawColor(230, 230, 235);
    doc.line(M, y - 8, pageW - M, y - 8);
  }
  y += 12;

  // Totals
  const sumX = pageW - M - 175;
  const totals: Array<[string, number, boolean]> = [
    ["Subtotal", subtotal, false],
    ...(discountAmount > 0 ? [["Discount", -discountAmount, false]] as Array<[string, number, boolean]> : []),
    ...(shipping > 0 ? [["Shipping", shipping, false]] as Array<[string, number, boolean]> : []),
    ...(taxAmount > 0 ? [[`Tax (${invoice.taxRate}%)`, taxAmount, false]] as Array<[string, number, boolean]> : []),
    ["Total due", total, true],
  ];
  for (const [label, amount, strong] of totals) {
    if (y > pageH - 80) {
      doc.addPage();
      y = M + 30;
    }
    doc.setFont("helvetica", strong ? "bold" : "normal");
    doc.setFontSize(strong ? 10 : 9.5);
    doc.setTextColor(strong ? INK[0] : SUBTLE[0], strong ? INK[1] : SUBTLE[1], strong ? INK[2] : SUBTLE[2]);
    doc.text(label.toUpperCase(), sumX, y);
    doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(fmt(amount), pageW - M, y, { align: "right" });
    y += strong ? 19 : 15;
  }
  y += 8;

  if (invoice.paymentInstructions) {
    if (y > pageH - 90) {
      doc.addPage();
      y = M + 30;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(FAINT[0], FAINT[1], FAINT[2]);
    doc.text("HOW TO PAY", M, y);
    y += 13;
    y = writeBlock(doc, invoice.paymentInstructions, M, y, contentW - 40, SUBTLE) + 10;
  }
  if (invoice.notes) {
    if (y > pageH - 90) {
      doc.addPage();
      y = M + 30;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(FAINT[0], FAINT[1], FAINT[2]);
    doc.text("NOTES", M, y);
    y += 13;
    y = writeBlock(doc, invoice.notes, M, y, contentW - 40, SUBTLE);
  }

  // Page footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(FAINT[0], FAINT[1], FAINT[2]);
    doc.text("Generated with Invoala — invoala.com", M, pageH - 26);
  }

  const buf = doc.output("arraybuffer") as ArrayBuffer;
  return Buffer.from(buf);
}
