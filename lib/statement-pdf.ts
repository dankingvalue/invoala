import { formatMoney } from "@/lib/invoice";
import { renderHtmlToPdf } from "@/lib/invoice-pdf";
import { buildStatementHtml, type StatementData } from "@/lib/statement-html";

async function jsPdfEmergency(data: StatementData): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const M = 48;
  let y = M;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Statement", M, y);
  y += 26;

  doc.setFontSize(11);
  doc.text(data.business.name || "Your Company", M, y);
  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Statement for: ${data.client.name || "Client"}`, M, y);
  y += 14;
  if (data.client.email) {
    doc.text(data.client.email, M, y);
    y += 14;
  }
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Date", M, y);
  doc.text("Description", M + 70, y);
  doc.text("Amount", M + 330, y, { align: "right" });
  doc.text("Balance", M + 420, y, { align: "right" });
  y += 12;
  doc.setDrawColor(200);
  doc.line(M, y, M + 420, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  let running = data.openingBalance;
  for (const row of data.rows) {
    if (y > 760) {
      doc.addPage();
      y = M;
    }
    running += row.debit - row.credit;
    const date = new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const amount = row.debit ? formatMoney(row.debit, data.currency) : `-${formatMoney(row.credit, data.currency)}`;
    doc.text(date, M, y);
    doc.text(row.label.slice(0, 45), M + 70, y);
    doc.text(amount, M + 330, y, { align: "right" });
    doc.text(formatMoney(running, data.currency), M + 420, y, { align: "right" });
    y += 16;
  }

  y += 10;
  doc.setDrawColor(0);
  doc.line(M + 260, y, M + 420, y);
  y += 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Closing balance due:", M + 260, y);
  doc.text(formatMoney(data.closingBalance, data.currency), M + 420, y, { align: "right" });

  return Buffer.from(doc.output("arraybuffer"));
}

export async function statementPdfBuffer(
  data: StatementData,
): Promise<{ buffer: Buffer; engine: "chromium" | "emergency" }> {
  const html = buildStatementHtml(data, { money: (n) => formatMoney(n, data.currency) });
  try {
    const buffer = await renderHtmlToPdf(html);
    return { buffer, engine: "chromium" as const };
  } catch (err) {
    console.error("[statement-pdf] chromium failed, using emergency renderer", err);
    return { buffer: await jsPdfEmergency(data), engine: "emergency" as const };
  }
}
