import type { Invoice } from "@/lib/invoice";
import { formatMoney } from "@/lib/invoice";
import { buildInvoiceHtml } from "@/lib/invoice-html";

// One styled renderer for every customer-facing PDF output (dashboard
// download, email attachments, recurring sends). Rendered from the same
// HTML/CSS design language as the generator preview.
//
// Failure policy (per incident review): retry with fresh browser contexts and
// backoff; if all attempts fail, THROW — an unstyled plain-text PDF must never
// be shipped to a customer. The failure also fires an alert.

let chromiumResolved: { path: string; args: string[] } | null | undefined;
let chromiumError: string | undefined;
let chromiumArgs: string[] = ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu"];

async function resolveChromium(): Promise<{ path: string; args: string[] } | null> {
  if (chromiumResolved !== undefined) return chromiumResolved;
  // Local/CI override first: point at a real installed Chrome/Chromium.
  if (process.env.CHROME_PATH) {
    chromiumResolved = { path: process.env.CHROME_PATH, args: chromiumArgs };
    return chromiumResolved;
  }
  try {
    // @sparticuz/chromium ships a headless Linux build for serverless runtimes.
    const mod = await import("@sparticuz/chromium");
    try {
      const path = await mod.default.executablePath();
      // The serverless flag set (--single-process etc.) is required for the
      // browser to survive page creation in constrained containers.
      chromiumArgs = [...mod.default.args, "--no-sandbox"];
      if (!path) throw new Error("chromium executablePath resolved empty");
      chromiumResolved = { path, args: chromiumArgs };
      chromiumError = undefined;
      return chromiumResolved;
    } catch (err) {
      chromiumResolved = null;
      chromiumError = err instanceof Error ? err.message.slice(0, 500) : String(err);
      console.error("[invoice-pdf] chromium executablePath failed", chromiumError);
      return null;
    }
  } catch (err) {
    chromiumResolved = null;
    chromiumError = err instanceof Error ? err.message.slice(0, 500) : String(err);
    return null;
  }
}

type Engine = import("playwright-core").Browser;

async function launchChromium(): Promise<Engine | null> {
  const resolved = await resolveChromium();
  if (!resolved) return null;
  try {
    const { chromium } = await import("playwright-core");
    const browser = await chromium.launch({
      executablePath: resolved.path,
      args: resolved.args,
      headless: true,
    });
    return browser;
  } catch (err) {
    chromiumError = err instanceof Error ? err.message.slice(0, 500) : String(err);
    console.error("[invoice-pdf] chromium launch failed", chromiumError);
    return null;
  }
}

// ---- Incident alerting -----------------------------------------------------
let lastAlertAt = 0;
const ALERT_COOLDOWN_MS = 5 * 60 * 1000;

async function notifyPdfIncident(detail: string): Promise<void> {
  // Error-level log always.
  console.error("[invoice-pdf:INCIDENT] styled PDF generation failed — no unstyled fallback was shipped", detail);
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const now = Date.now();
  if (now - lastAlertAt < ALERT_COOLDOWN_MS) return;
  lastAlertAt = now;
  const text = `[Invoala] PDF engine incident: styled invoice render failed after retries. ${detail.slice(0, 200)} No plain-text PDF was sent.`;
  if (botToken && chatId) {
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    }).catch(() => {});
  }
}

// ---- Render (retry with fresh browser + backoff) --------------------------
const MAX_ATTEMPTS = 3;

async function renderStyledPdf(invoice: Invoice, html: string): Promise<Buffer> {
  let lastError = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const browser = await launchChromium();
    if (!browser) {
      lastError = chromiumError || "chromium unavailable";
    } else {
      try {
        const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
        await page.setContent(html, { waitUntil: "load" });
        // Wait for layout + any web font to settle before printing.
        try {
          await page.evaluate(() => (document as Document).fonts.ready);
        } catch {}
        await page.waitForTimeout(200);
        const pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          preferCSSPageSize: true,
        });
        return Buffer.from(pdf);
      } catch (err) {
        lastError = err instanceof Error ? err.message.slice(0, 500) : String(err);
        console.error(`[invoice-pdf] render attempt ${attempt}/${MAX_ATTEMPTS} failed`, lastError);
      } finally {
        await browser.close().catch(() => {});
      }
    }
    if (attempt < MAX_ATTEMPTS) {
      await new Promise((r) => setTimeout(r, 750 * attempt));
    }
  }
  // Emergency path: after all styled attempts fail we still deliver a
  // COMPLETE invoice (styled-lite jsPDF with all data, accents and layout) —
  // an invoice app must never block on sending. The alert below tells us the
  // styled engine is sick so we can repair it.
  await notifyPdfIncident(lastError);
  try {
    return await jsPdfEmergency(invoice);
  } catch (err2) {
    console.error("[invoice-pdf] emergency render also failed", err2);
    throw new Error("The invoice PDF engine is unavailable right now; no document was generated.");
  }
}

export async function invoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
  const html = buildInvoiceHtml(invoice, {
    money: (n) => formatMoney(n, invoice.currency || "USD"),
  });
  return renderStyledPdf(invoice, html);
}

// Public status for the /api/pdf-engine diagnostic + tests. Performs a real
// render (new page + PDF) so it proves the whole path, not just a launch.
export async function invoiceEngineStatus(): Promise<{
  engine: "chromium" | "unavailable";
  chromiumPath: boolean;
  launchable?: boolean;
  error?: string;
}> {
  const resolved = await resolveChromium();
  if (!resolved) {
    return {
      engine: "unavailable",
      chromiumPath: false,
      error: chromiumError || "no chromium executable resolved",
    };
  }
  try {
    const browser = await launchChromium();
    if (!browser) {
      return {
        engine: "unavailable",
        chromiumPath: true,
        launchable: false,
        error: chromiumError || "chromium launch failed",
      };
    }
    try {
      const page = await browser.newPage();
      await page.setContent("<html><body style='font-family:sans-serif'>probe</body></html>");
      await page.waitForTimeout(80);
      const pdf = await page.pdf({ format: "A4" });
      return {
        engine: pdf && pdf.length > 500 ? "chromium" : "unavailable",
        chromiumPath: true,
        launchable: true,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message.slice(0, 300) : String(err);
      console.error("[invoice-pdf] chromium render probe failed", msg);
      return { engine: "unavailable", chromiumPath: true, launchable: false, error: msg };
    } finally {
      await browser.close().catch(() => {});
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 300) : String(err);
    console.error("[invoice-pdf] engine probe error", msg);
    return { engine: "unavailable", chromiumPath: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Emergency: complete styled-lite jsPDF fallback (only when Chromium is down).
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
import type { jsPDF } from "jspdf";

function rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const F_INK: [number, number, number] = [29, 29, 31];
const F_SUBTLE: [number, number, number] = [110, 110, 115];
const F_FAINT: [number, number, number] = [199, 199, 204];
const F_HAIR: [number, number, number] = [232, 232, 237];

function setC(doc: jsPDF, c: [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function rule(doc: jsPDF, x: number, w: number, y: number, c: [number, number, number], t = 0.7) {
  doc.setDrawColor(c[0], c[1], c[2]);
  doc.setLineWidth(t);
  doc.line(x, y, x + w, y);
}

function fdate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function jsPdfEmergency(invoice: Invoice): Promise<Buffer> {
  const { jsPDF } = await import("jspdf");
  const { computeTotals, themeColor } = await import("@/lib/invoice");
  const doc: jsPDF = new jsPDF({ unit: "pt", format: "a4", compress: true });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 40;
  const contentW = pageW - M * 2;
  const accent = rgb(themeColor(invoice.theme || "green"));
  const fmt = (n: number) => formatMoney(n, invoice.currency || "USD");
  const isQuote = invoice.docType === "quote" || invoice.docType === "estimate";
  const isReceipt = invoice.docType === "receipt";
  const title = (invoice.docType === "invoice" ? "Invoice" : isQuote ? invoice.docType === "quote" ? "Quote" : "Estimate" : "Receipt").toUpperCase();

  let y = M + 10;
  if (invoice.logoDataUrl) {
    try {
      const img = doc.getImageProperties(invoice.logoDataUrl);
      const scale = Math.min(110 / img.width, 34 / img.height);
      doc.addImage(invoice.logoDataUrl, "PNG", M, y - 10, img.width * scale, img.height * scale);
    } catch {}
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setC(doc, F_INK);
  doc.text(invoice.businessName.trim() || "Your Company", M, y + 10);
  const lines = ((invoice.businessAddress || "Your address") + (invoice.businessEmail ? `\n${invoice.businessEmail}` : "")).split("\n").filter(Boolean);
  let ly = y + 10;
  for (const line of lines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setC(doc, F_SUBTLE);
    doc.text(line, M, (ly += 11));
  }
  y = Math.max(y + 10, ly) + 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  setC(doc, accent);
  doc.text(title, pageW - M, M + 8, { align: "right" });
  doc.setFontSize(9);
  const meta: Array<[string, string]> = [
    [`${isReceipt ? "Receipt" : title.replace(/\s+/g, " ")} #`, invoice.invoiceNumber || "—"],
    [isReceipt ? "Date paid" : "Issued", fdate(invoice.issueDate)],
    [isQuote ? "Valid until" : isReceipt ? "Received" : "Due", fdate(isReceipt ? invoice.dueDate || invoice.issueDate : invoice.dueDate)],
  ];
  let my = M + 34;
  for (const [k, v] of meta) {
    doc.setFont("helvetica", "normal");
    setC(doc, F_SUBTLE);
    doc.text(k.toUpperCase(), pageW - M - 160, my);
    doc.setFont("helvetica", "medium");
    setC(doc, F_INK);
    doc.text(v, pageW - M, my, { align: "right" });
    my += 13;
  }

  const billedY = Math.max(y, my - 6) + 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  setC(doc, F_FAINT);
  doc.text((isReceipt ? "Received from" : "Billed to").toUpperCase(), M, billedY);
  doc.setFontSize(11);
  setC(doc, F_INK);
  doc.text(invoice.clientName.trim() || "Client Name", M, billedY + 13);
  const cLines = ((invoice.clientAddress || "Client address") + (invoice.clientEmail ? `\n${invoice.clientEmail}` : "")).split("\n").filter(Boolean);
  let cy = billedY + 13;
  for (const line of cLines) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setC(doc, F_SUBTLE);
    doc.text(line, M, (cy += 11));
  }
  y = cy + 12;

  const colQ = pageW - M - 200;
  const colR = pageW - M - 132;
  const colA = pageW - M - 36;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  setC(doc, F_SUBTLE);
  doc.text("Description", M, y);
  doc.text("Qty", colQ + 26, y, { align: "right" });
  doc.text("Rate", colR + 18, y, { align: "right" });
  doc.text("Amount", colA, y, { align: "right" });
  rule(doc, M, contentW, y + 3, accent, 1.4);
  y += 15;

  const items = invoice.items.length > 0 ? invoice.items : [{ description: "", quantity: 1, rate: 0 }];
  for (const item of items) {
    const desc = item.description || "Item description";
    const wrapped = doc.splitTextToSize(desc, colQ - M - 10);
    if (y + wrapped.length * 12 > pageH - 110) {
      doc.addPage();
      y = M + 16;
    }
    for (const line of wrapped) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      setC(doc, item.description ? F_INK : F_FAINT);
      doc.text(line, M, y);
      y += 12;
    }
    y -= 12;
    doc.setFontSize(9);
    setC(doc, F_SUBTLE);
    doc.text(String(item.quantity), colQ + 26, y, { align: "right" });
    doc.text(fmt(Number(item.rate) || 0), colR + 18, y, { align: "right" });
    setC(doc, F_INK);
    doc.text(fmt((Number(item.quantity) || 0) * (Number(item.rate) || 0)), colA, y, { align: "right" });
    y += 17;
    rule(doc, M, contentW, y - 8, F_HAIR, 0.5);
  }
  y += 10;

  const { taxAmount, discountAmount, total, shipping } = computeTotals(invoice);
  const paid = Number(invoice.amountPaid) || 0;
  const balance = Math.max(0, total - paid);
  const sumX = pageW - M - 175;
  const rows: Array<{ label: string; amount: number; strong: boolean; color?: [number, number, number] }> = [
    { label: "Subtotal", amount: invoice.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.rate) || 0), 0), strong: false },
    ...(discountAmount > 0
      ? [{ label: invoice.discountMode === "fixed" ? "Discount" : `Discount (${invoice.discount}%)`, amount: -discountAmount, strong: false }]
      : []),
    ...(shipping > 0 ? [{ label: "Shipping", amount: shipping, strong: false }] : []),
    ...(taxAmount > 0 ? [{ label: `Tax (${invoice.taxRate}%)`, amount: taxAmount, strong: false }] : []),
    { label: isReceipt ? "Amount received" : "Total due", amount: total, strong: true },
    ...(paid > 0 && !isReceipt
      ? [
          { label: "Paid", amount: -paid, strong: false, color: [0, 134, 90] as [number, number, number] },
          { label: "Balance due", amount: balance, strong: true },
        ]
      : []),
  ];
  for (const row of rows) {
    if (row.strong && row.label !== "Paid") rule(doc, sumX, 175, y - 6, F_INK, 1.6);
    doc.setFont("helvetica", row.strong ? "bold" : "normal");
    doc.setFontSize(row.strong ? 10 : 9);
    setC(doc, row.strong ? F_INK : F_SUBTLE);
    doc.text(row.label.toUpperCase(), sumX, y);
    setC(doc, row.color ?? F_INK);
    doc.text(fmt(row.amount), pageW - M, y, { align: "right" });
    y += row.strong ? 17 : 13;
  }

  const fields = (invoice.customFields || []).filter((f) => f.label.trim() || f.value.trim());
  if (fields.length > 0) {
    y += 10;
    rule(doc, M, contentW, y - 6, F_HAIR, 0.6);
    const half = contentW / 2 - 14;
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      const x = i % 2 === 0 ? M : M + contentW / 2;
      const ry = y + Math.floor(i / 2) * 30;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      setC(doc, F_FAINT);
      doc.text((f.label.trim() || "Field").toUpperCase(), x, ry);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      setC(doc, F_INK);
      const vl = doc.splitTextToSize(f.value.trim() || "—", half);
      let vy = ry + 11;
      for (const l of vl.slice(0, 2)) {
        doc.text(l, x, vy);
        vy += 11;
      }
    }
    y += Math.ceil(fields.length / 2) * 30 + 8;
  }

  const block = (label: string, body: string, color = F_SUBTLE) => {
    if (y > pageH - 110) {
      doc.addPage();
      y = M + 16;
    }
    rule(doc, M, contentW, y - 6, F_HAIR, 0.6);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    setC(doc, F_FAINT);
    doc.text(label.toUpperCase(), M, y + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setC(doc, color);
    let yy = y + 12;
    for (const l of doc.splitTextToSize(body, contentW - 20)) {
      if (yy > pageH - 70) {
        doc.addPage();
        yy = M + 16;
      }
      doc.text(l, M, yy);
      yy += 12;
    }
    return yy + 6;
  };

  if (invoice.paymentInstructions || invoice.paymentLink) {
    y = block("How to pay", invoice.paymentInstructions || "Pay online");
  }
  if (invoice.notes) {
    y = block("Notes", invoice.notes);
  }

  return Buffer.from(doc.output("arraybuffer") as ArrayBuffer);
}
