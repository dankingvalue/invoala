"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { jsPDF } from "jspdf";
import {
  createDefaultInvoice,
  loadDraft,
  newId,
  saveDraft,
  type Invoice,
  type LineItem,
} from "@/lib/invoice";
import { InvoiceForm } from "@/components/InvoiceForm";
import { InvoicePreview } from "@/components/InvoicePreview";
import { AiComposer } from "@/components/AiComposer";
import type { ParsedInvoice } from "@/lib/parseInvoice";
import { trackEvent } from "@/lib/analytics";
import type { ClientRow } from "@/lib/data";

// Printable area on an A4 page with 8mm margins (print flow).
const PRINT_W_MM = 194;
const PRINT_H_MM = 281;
// Invoices that overflow a page by less than this are scaled down to fit a
// single page instead of emitting a nearly-empty trailing page.
const FIT_ONE_PAGE_OVERFLOW = 1.2;

function sliceCanvasIntoPages(canvas: HTMLCanvasElement, sliceHeight: number): HTMLCanvasElement[] {
  const slices: HTMLCanvasElement[] = [];
  let y = 0;
  while (y < canvas.height) {
    const h = Math.min(sliceHeight, canvas.height - y);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = h;
    const ctx = slice.getContext("2d");
    if (!ctx) break;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    slices.push(slice);
    y += h;
  }
  return slices;
}

// Draws the captured invoice canvas into a jsPDF A4 document. Page breaks are
// aligned to the A4 page grid, and borderline overflows are scaled to a single
// page so the PDF never contains an empty trailing page.
function addCanvasToPdf(pdf: jsPDF, canvas: HTMLCanvasElement) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = pageW / canvas.width;
  const scaledH = canvas.height * ratio;

  if (scaledH <= pageH) {
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, scaledH);
    return;
  }
  if (scaledH < pageH * FIT_ONE_PAGE_OVERFLOW) {
    const scale = pageH / canvas.height;
    pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, canvas.width * scale, pageH);
    return;
  }
  const sliceH = Math.floor(canvas.width * (pageH / pageW));
  sliceCanvasIntoPages(canvas, sliceH).forEach((slice, i) => {
    if (i > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, slice.height * ratio);
  });
}

type PrintPage = { dataUrl: string; widthMm: number; heightMm: number };

// navigator.share can hang indefinitely where no share sheet exists (some
// desktop/embedded browsers). Race it with a timeout so we can fall back.
function shareTimed(data: ShareData, timeoutMs = 3000): Promise<void> {
  return new Promise((resolve, reject) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new DOMException("Timed out", "TimeoutError"));
    }, timeoutMs);
    navigator.share(data).then(
      () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      },
      (err) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}

// Layouts the captured canvas as A4 print pages. Each page fills the printable
// area (A4 minus 8mm margins) exactly, so printing never produces empty pages.
function layoutPrintPages(canvas: HTMLCanvasElement): PrintPage[] {
  const cssWidth = canvas.width / 2;
  const mmPerCssPx = PRINT_W_MM / cssWidth;
  const fullPageCssH = PRINT_H_MM / mmPerCssPx;
  const cssHeight = canvas.height / 2;

  const asPage = (c: HTMLCanvasElement): PrintPage => ({
    dataUrl: c.toDataURL("image/jpeg", 0.95),
    widthMm: PRINT_W_MM,
    heightMm: (c.height / 2) * mmPerCssPx,
  });

  if (cssHeight <= fullPageCssH) return [asPage(canvas)];
  if (cssHeight < fullPageCssH * FIT_ONE_PAGE_OVERFLOW) {
    const s = Math.min(PRINT_W_MM / cssWidth, PRINT_H_MM / cssHeight);
    return [{ dataUrl: canvas.toDataURL("image/jpeg", 0.95), widthMm: cssWidth * s, heightMm: cssHeight * s }];
  }
  const sliceH = Math.floor(canvas.width * (fullPageCssH / cssWidth));
  return sliceCanvasIntoPages(canvas, sliceH).map(asPage);
}

export function InvoiceGenerator({
  ai = true,
  print = true,
  allowLogo = true,
  quoteMode = false,
  recurringTerms = false,
  preset = null,
  user = null,
}: {
  ai?: boolean;
  print?: boolean;
  allowLogo?: boolean;
  quoteMode?: boolean;
  recurringTerms?: boolean;
  preset?: Partial<Invoice> | null;
  user?: { email: string; isPro?: boolean } | null;
}) {
  const [invoice, setInvoice] = useState<Invoice>(() => createDefaultInvoice());
  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNote, setEmailNote] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const signupHref = `/signup?next=${encodeURIComponent(pathname || "/invoice-generator")}`;

  useEffect(() => {
    trackEvent("invoice_started");
  }, []);

  useEffect(() => {
    const base = preset
      ? { ...createDefaultInvoice(), ...preset }
      : (loadDraft() ?? createDefaultInvoice());
    const editRaw =
      typeof window !== "undefined" ? window.localStorage.getItem("invoala.edit") : null;
    let next = base;
    if (editRaw) {
      window.localStorage.removeItem("invoala.edit");
      try {
        const parsed = JSON.parse(editRaw) as { id?: string; invoice?: Partial<Invoice> };
        if (parsed.invoice && Array.isArray(parsed.invoice.items)) {
          next = { ...base, ...parsed.invoice };
          if (parsed.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSavedId(parsed.id);
          }
        }
      } catch {
        // corrupted edit payload — fall back to draft
      }
    }
     
    setInvoice(next);
     
    setHydrated(true);
  }, [preset]);

  useEffect(() => {
    if (!user) return;
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.clients) setClients(data.clients);
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!hydrated || preset) return;
    const t = setTimeout(() => saveDraft(invoice), 400);
    return () => clearTimeout(t);
  }, [invoice, hydrated, preset]);

  function update(patch: Partial<Invoice>) {
    setInvoice((inv) => ({ ...inv, ...patch }));
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setInvoice((inv) => ({
      ...inv,
      items: inv.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    setInvoice((inv) => ({
      ...inv,
      items: [...inv.items, { id: newId(), description: "", quantity: 1, rate: 0 }],
    }));
  }

  function removeItem(id: string) {
    setInvoice((inv) => ({
      ...inv,
      items: inv.items.filter((item) => item.id !== id),
    }));
  }

  function applyParsed(data: ParsedInvoice) {
    setInvoice((inv) => ({
      ...inv,
      businessName: data.businessName ?? inv.businessName,
      businessEmail: data.businessEmail ?? inv.businessEmail,
      businessAddress: data.businessAddress ?? inv.businessAddress,
      clientName: data.clientName ?? inv.clientName,
      clientEmail: data.clientEmail ?? inv.clientEmail,
      clientAddress: data.clientAddress ?? inv.clientAddress,
      currency: data.currency ?? inv.currency,
      taxRate:
        typeof data.taxRate === "number" && !Number.isNaN(data.taxRate)
          ? data.taxRate
          : inv.taxRate,
      issueDate: data.issueDate ?? inv.issueDate,
      dueDate: data.dueDate ?? inv.dueDate,
      notes: data.notes ?? inv.notes,
      items:
        data.items && data.items.length > 0
          ? data.items.map((item) => ({
              id: newId(),
              description: item.description || "Item",
              quantity: Number(item.quantity) || 1,
              rate: Number(item.rate) || 0,
            }))
          : inv.items,
    }));
  }

  async function saveToAccount() {
    if (!user) {
      router.push(signupHref);
      return;
    }
    if (downloading) return;
    setSaveNote("Saving…");
    try {
      const res = await fetch("/api/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: savedId ?? undefined, invoice }),
      });
      if (res.status === 401) {
        setSaveNote("");
        return;
      }
      const json = (await res.json()) as { ok?: boolean; id?: string; error?: string };
      if (res.ok && json.ok && json.id) {
        setSavedId(json.id);
        trackEvent("invoice_saved_to_account", { invoiceNumber: invoice.invoiceNumber });
        setSaveNote("Saved to your dashboard ✓");
      } else {
        setSaveNote(json.error || "Could not save.");
      }
    } catch {
      setSaveNote("Network error while saving.");
    }
    setTimeout(() => setSaveNote(""), 4000);
  }

  async function emailInvoice() {
    if (!user) {
      router.push(signupHref);
      return;
    }
    const toEmail = prompt("Send invoice to (client email):");
    if (!toEmail || !toEmail.includes("@")) return;
    setSendingEmail(true);
    setEmailNote("");
    try {
      let id = savedId;
      if (!id) {
        const saveRes = await fetch("/api/invoices", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoice }),
        });
        const saveJson = (await saveRes.json()) as { id?: string };
        if (saveJson.id) {
          id = saveJson.id;
          setSavedId(id);
        }
      }
      if (!id) { setEmailNote("Save invoice first."); return; }
      const res = await fetch(`/api/invoices/${id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toEmail }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) trackEvent("invoice_emailed", { invoiceNumber: invoice.invoiceNumber });
      setEmailNote(json.ok ? "Invoice sent!" : json.error || "Failed to send.");
    } catch {
      setEmailNote("Network error.");
    }
    setTimeout(() => setEmailNote(""), 4000);
    setSendingEmail(false);
  }

  function convertToInvoice() {
    if (invoice.docType === "invoice") return;
    const due = new Date();
    due.setDate(due.getDate() + 14);
    setInvoice((inv) => ({
      ...inv,
      docType: "invoice",
      dueDate: due.toISOString().slice(0, 10),
    }));
    trackEvent("quote_converted_to_invoice", { from: invoice.docType });
  }

  async function captureInvoiceCanvas(): Promise<HTMLCanvasElement | null> {
    const el = previewRef.current;
    if (!el) return null;
    const { default: html2canvas } = await import("html2canvas-pro");

    // Render at A4 aspect width (794px @96dpi) so PDF/print fonts come out
    // at natural invoice sizes instead of being blown up from the small preview.
    const holder = document.createElement("div");
    holder.style.position = "fixed";
    holder.style.left = "-10000px";
    holder.style.top = "0";
    holder.style.width = "794px";
    holder.style.background = "#ffffff";
    document.body.appendChild(holder);
    const clone = el.cloneNode(true) as HTMLElement;
    holder.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
      });
      return canvas;
    } finally {
      holder.remove();
    }
  }

  async function buildInvoicePdf(canvas: HTMLCanvasElement) {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
    addCanvasToPdf(pdf, canvas);
    return pdf;
  }

  async function downloadPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await captureInvoiceCanvas();
      if (!canvas) throw new Error("no preview");
      const pdf = await buildInvoicePdf(canvas);
      const name = (invoice.invoiceNumber || "invoice").replace(/[^\w.-]+/g, "-");
      pdf.save(`${name}.pdf`);
      trackEvent("invoice_downloaded", { invoiceNumber: invoice.invoiceNumber, currency: invoice.currency, amount: invoice.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.rate) || 0), 0) });
      trackEvent("invoice_completed", { invoiceNumber: invoice.invoiceNumber });
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function printInvoice() {
    if (downloading) return;
    setDownloading(true);
    try {
      const canvas = await captureInvoiceCanvas();
      if (!canvas) throw new Error("no preview");
      const pages = layoutPrintPages(canvas);
      const imgs = pages
        .map((p, i) => {
          const brk = i < pages.length - 1 ? "page-break-after:always;break-after:page;" : "";
          return `<img src="${p.dataUrl}" alt="" style="display:block;width:${p.widthMm.toFixed(2)}mm;height:${p.heightMm.toFixed(2)}mm;margin:0 auto;${brk}"/>`;
        })
        .join("");

      // Print from a hidden iframe (not a popup) so popup blockers never
      // swallow the print window on mobile browsers.
      const frame = document.createElement("iframe");
      frame.style.position = "fixed";
      frame.style.right = "0";
      frame.style.bottom = "0";
      frame.style.width = "0";
      frame.style.height = "0";
      frame.style.border = "0";
      document.body.appendChild(frame);
      const doc = frame.contentDocument;
      if (!doc) throw new Error("no print document");
      doc.open();
      doc.write(`<!DOCTYPE html><html><head><title>Print invoice</title><style>
        html, body { margin: 0; padding: 0; background: #fff; }
        @media print { @page { size: A4; margin: 8mm; } }
      </style></head><body>${imgs}</body></html>`);
      doc.close();

      let printed = false;
      const triggerPrint = () => {
        if (printed) return;
        printed = true;
        const win = frame.contentWindow;
        if (win) {
          win.focus();
          win.print();
        }
        frame.remove();
      };
      const imagesReady = Promise.all(
        Array.from(doc.images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            }),
        ),
      );
      imagesReady.then(() => setTimeout(triggerPrint, 150)).catch(() => setTimeout(triggerPrint, 300));
      setTimeout(triggerPrint, 2500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong preparing the print view. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function shareInvoice() {
    if (sharing || downloading) return;
    setSharing(true);
    try {
      const canvas = await captureInvoiceCanvas();
      if (!canvas) throw new Error("no preview");
      const pdf = await buildInvoicePdf(canvas);
      const name = (invoice.invoiceNumber || "invoice").replace(/[^\w.-]+/g, "-");
      const text = `Invoice #${invoice.invoiceNumber || ""} — ${invoice.businessName.trim() || "Invoala"}`;
      const file = new File([pdf.output("blob")], `${name}.pdf`, { type: "application/pdf" });

      // Preferred: share the actual PDF file (opens every app on a phone).
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await shareTimed({ files: [file], title: text, text });
          trackEvent("invoice_shared", { method: "file" });
          return;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Share sheet unavailable or timed out — fall through to fallbacks.
        }
      }

      // Fallback for signed-in users: share the online view link.
      if (savedId) {
        let url = "";
        try {
          const res = await fetch(`/api/invoices/${savedId}/share`, { method: "POST" });
          const json = (await res.json()) as { url?: string };
          url = json.url || "";
        } catch {}
        if (url && typeof navigator.share === "function") {
          try {
            await shareTimed({ title: text, text, url });
            trackEvent("invoice_shared", { method: "link" });
            return;
          } catch {
            // Fall through to clipboard below.
          }
        }
        if (url) {
          try {
            await navigator.clipboard.writeText(url);
          } catch {
            window.open(url, "_blank");
          }
          return;
        }
      }

      // Last resort: download the PDF.
      pdf.save(`${name}.pdf`);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      console.error(err);
      alert("Something went wrong sharing the invoice. Please try again.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div id="generate" className="scroll-mt-20">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-10">
          <div className="mb-10">{ai ? <AiComposer onResult={applyParsed} /> : null}</div>
          <InvoiceForm
            invoice={invoice}
            onChange={update}
            onItemChange={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            allowLogo={allowLogo}
            showQuoteMode={quoteMode}
            showRecurring={recurringTerms}
            clients={clients}
          />
        </div>

        <div className="lg:sticky lg:top-20">
          <div className="rounded-[28px] bg-white p-3 shadow-lg ring-1 ring-black/5">
            <div id="invoice-paper" className="overflow-hidden rounded-2xl ring-1 ring-black/5">
              <InvoicePreview invoice={invoice} innerRef={previewRef} />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={downloading}
              className="flex-1 rounded-full bg-accent px-6 py-3.5 text-[17px] font-medium text-white shadow-sm transition hover:bg-accent-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {downloading ? "Generating PDF…" : "Download PDF"}
            </button>
            {print ? (
              <button
                type="button"
                onClick={() => void printInvoice()}
                disabled={downloading}
                className="rounded-full bg-[#e8e8ed] px-6 py-3.5 text-[17px] font-medium text-ink transition hover:bg-[#dcdce1] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
              >
                Print
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void emailInvoice()}
              disabled={sendingEmail || downloading}
              className="rounded-full bg-[#e8e8ed] px-6 py-3.5 text-[17px] font-medium text-ink transition hover:bg-[#dcdce1] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {sendingEmail ? "Sending…" : "Email"}
            </button>
            <button
              type="button"
              onClick={() => void shareInvoice()}
              disabled={sharing || downloading}
              className="rounded-full bg-[#e8e8ed] px-6 py-3.5 text-[17px] font-medium text-ink transition hover:bg-[#dcdce1] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {sharing ? "Sharing…" : "Share"}
            </button>
          </div>
          {emailNote ? <p className="mt-2 text-center text-xs text-[#166534]">{emailNote}</p> : null}
          {!user ? (
            <p className="mt-3 text-center text-xs text-subtle">
              Create a free account to save invoices to your dashboard and email them to clients.
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => void saveToAccount()}
              className="rounded-full border border-hairline px-5 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
            >
              {savedId ? "Update saved invoice" : user ? "Save to dashboard" : "Save to account"}
            </button>
            {saveNote ? <span className="text-xs text-subtle">{saveNote}</span> : null}
          </div>
          {(invoice.docType === "quote" || invoice.docType === "estimate") && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f0fdf4] px-4 py-3">
              <p className="text-[13px] text-[#166534]">
                {invoice.docType === "quote" ? "Quote accepted?" : "Estimate approved?"} Turn it into an invoice and set a due date.
              </p>
              <button
                type="button"
                onClick={convertToInvoice}
                className="shrink-0 rounded-full bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Convert to invoice
              </button>
            </div>
          )}
          {!user?.isPro ? (
            <p className="mt-3 text-center text-xs text-subtle">
              Free · No watermark · No credit card required
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
