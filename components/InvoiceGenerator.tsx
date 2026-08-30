"use client";

import { useEffect, useRef, useState } from "react";
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
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNote, setEmailNote] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);

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
    if (!user || downloading) return;
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
    if (!user) return;
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

  async function downloadPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const canvas = await captureInvoiceCanvas();
      if (!canvas) throw new Error("no preview");
      const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = pageW / canvas.width;

      if (canvas.height * ratio <= pageH) {
        pdf.addImage(
          canvas.toDataURL("image/jpeg", 0.95),
          "JPEG",
          0,
          0,
          pageW,
          canvas.height * ratio,
        );
      } else {
        const sliceH = Math.floor(canvas.width * (pageH / pageW));
        let y = 0;
        let first = true;
        while (y < canvas.height) {
          const h = Math.min(sliceH, canvas.height - y);
          const slice = document.createElement("canvas");
          slice.width = canvas.width;
          slice.height = h;
          const ctx = slice.getContext("2d");
          if (!ctx) break;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
          if (!first) pdf.addPage();
          pdf.addImage(
            slice.toDataURL("image/jpeg", 0.95),
            "JPEG",
            0,
            0,
            pageW,
            h * ratio,
          );
          first = false;
          y += h;
        }
      }
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
      const w = window.open("", "_blank");
      if (!w) {
        window.print();
        return;
      }
      w.document.write(`<!DOCTYPE html><html><head><title>Print invoice</title><style>
        html, body { margin: 0; padding: 0; background: #fff; }
        img { width: 100%; display: block; }
        @media print { @page { margin: 8mm; } }
      </style></head><body><img src="${canvas.toDataURL("image/jpeg", 0.95)}" alt="Invoice" /></body></html>`);
      w.document.close();
      const img = w.document.querySelector("img");
      if (img) {
        img.onload = () => {
          w.focus();
          setTimeout(() => w.print(), 200);
        };
      }
      setTimeout(() => w.print(), 1500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong preparing the print view. Please try again.");
    } finally {
      setDownloading(false);
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
            {user ? (
              <button
                type="button"
                onClick={() => void emailInvoice()}
                disabled={sendingEmail}
                className="rounded-full bg-[#e8e8ed] px-6 py-3.5 text-[17px] font-medium text-ink transition hover:bg-[#dcdce1] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
              >
                {sendingEmail ? "Sending…" : "Email"}
              </button>
            ) : null}
            {user && savedId ? (
              <button
                type="button"
                onClick={async () => {
                  let url = "";
                  try {
                    const res = await fetch(`/api/invoices/${savedId}/share`, { method: "POST" });
                    const json = (await res.json()) as { url?: string };
                    url = json.url || "";
                  } catch {}
                  if (!url) return;
                  const text = `Invoice #${invoice.invoiceNumber || ""} — ${invoice.clientName || "Invoala"}`;
                  if (navigator.share) {
                    try { await navigator.share({ title: text, text, url }); } catch {}
                  } else {
                    try { await navigator.clipboard.writeText(url); } catch { window.open(url, "_blank"); }
                  }
                }}
                className="rounded-full bg-[#e8e8ed] px-6 py-3.5 text-[17px] font-medium text-ink transition hover:bg-[#dcdce1] active:scale-[0.99]"
              >
                Share
              </button>
            ) : null}
          </div>
          {emailNote ? <p className="mt-2 text-center text-xs text-[#166534]">{emailNote}</p> : null}
          {user ? (
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => void saveToAccount()}
                className="rounded-full border border-hairline px-5 py-2 text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
              >
                {savedId ? "Update saved invoice" : "Save to dashboard"}
              </button>
              {saveNote ? <span className="text-xs text-subtle">{saveNote}</span> : null}
            </div>
          ) : null}
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
