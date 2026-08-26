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
import type { ClientRow } from "@/lib/data";

export function InvoiceGenerator({
  ai = true,
  print = true,
  allowLogo = true,
  quoteMode = false,
  recurringTerms = false,
  user = null,
}: {
  ai?: boolean;
  print?: boolean;
  allowLogo?: boolean;
  quoteMode?: boolean;
  recurringTerms?: boolean;
  user?: { email: string } | null;
}) {
  const [invoice, setInvoice] = useState<Invoice>(() => createDefaultInvoice());
  const [hydrated, setHydrated] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveNote, setSaveNote] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const base = loadDraft() ?? createDefaultInvoice();
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
  }, []);

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
    if (!hydrated) return;
    const t = setTimeout(() => saveDraft(invoice), 400);
    return () => clearTimeout(t);
  }, [invoice, hydrated]);

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
        setSaveNote("Saved to your dashboard ✓");
      } else {
        setSaveNote(json.error || "Could not save.");
      }
    } catch {
      setSaveNote("Network error while saving.");
    }
    setTimeout(() => setSaveNote(""), 4000);
  }

  async function downloadPdf() {
    const el = previewRef.current;
    if (!el || downloading) return;
    setDownloading(true);
    try {
      const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas-pro"),
      ]);
      const canvas = await html2canvas(el, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
      });
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
    } catch (err) {
      console.error(err);
      alert("Something went wrong generating the PDF. Please try again.");
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

          <div className="mt-5 flex gap-3">
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
                onClick={() => window.print()}
                className="rounded-full bg-[#e8e8ed] px-6 py-3.5 text-[17px] font-medium text-ink transition hover:bg-[#dcdce1] active:scale-[0.99]"
              >
                Print
              </button>
            ) : null}
          </div>
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
          <p className="mt-3 text-center text-xs text-subtle">
            Free · No watermark · No credit card required
          </p>
        </div>
      </div>
    </div>
  );
}
