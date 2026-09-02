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

async function renderStyledPdf(html: string): Promise<Buffer> {
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
  // Do NOT degrade to a plain-text PDF. Escalate instead.
  await notifyPdfIncident(lastError);
  throw new Error("The invoice PDF engine is unavailable right now; no document was generated.");
}

export async function invoicePdfBuffer(invoice: Invoice): Promise<Buffer> {
  const html = buildInvoiceHtml(invoice, {
    money: (n) => formatMoney(n, invoice.currency || "USD"),
  });
  return renderStyledPdf(html);
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
