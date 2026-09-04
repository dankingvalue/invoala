"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { jsPDF } from "jspdf";
import {
  clearDraft,
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
import { copyToClipboard } from "@/lib/clipboard";
import type { ClientRow } from "@/lib/data";
import type { ServiceItem } from "@/lib/service-items";

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
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  // The workspace this invoice belongs to — set via the invoala.edit
  // handoff (from a specific client's or the active workspace's "+ New
  // invoice"/Edit) or, for a session started fresh in the generator itself,
  // derived from whichever client the user picks in the dropdown (see
  // handleClientSelect below). undefined means "don't change" on an
  // update, null means Personal, a string is that team's id.
  const [selectedTeamId, setSelectedTeamId] = useState<string | null | undefined>(undefined);
  // True once a handoff has explicitly set selectedTeamId (including an
  // edit, which explicitly sets it to undefined to mean "don't change") —
  // once locked, picking a client from the dropdown must not silently move
  // an existing invoice to a different workspace.
  const teamIdLockedRef = useRef(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailNote, setEmailNote] = useState("");
  const [formKey, setFormKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);
  // Guards the hydration effect below against React's dev-mode double-invoke
  // of mount effects: that effect does a destructive read (get-then-remove)
  // of the "invoala.edit" localStorage key, so running it twice would have
  // the second pass find the key already gone and silently reset the form
  // to blank right after the first pass correctly loaded it.
  const hydratedOnceRef = useRef(false);
  const autosaveHandledRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();
  // "autosave=1" round-trips through /signup and /login (both preserve
  // `next` verbatim) so that landing back here — logged in — can finish the
  // save the user actually asked for, instead of just showing them their
  // draft again and leaving them to notice it wasn't saved.
  const signupHref = `/signup?next=${encodeURIComponent(`${pathname || "/invoice-generator"}?autosave=1`)}`;

  useEffect(() => {
    trackEvent("invoice_started");
  }, []);

  useEffect(() => {
    if (hydratedOnceRef.current) return;
    hydratedOnceRef.current = true;
    const base = preset
      ? { ...createDefaultInvoice(), ...preset }
      : (loadDraft() ?? createDefaultInvoice());
    const editRaw =
      typeof window !== "undefined" ? window.localStorage.getItem("invoala.edit") : null;
    let next = base;
    if (editRaw) {
      window.localStorage.removeItem("invoala.edit");
      try {
        const parsed = JSON.parse(editRaw) as { id?: string; invoice?: Partial<Invoice>; clientId?: string | null; teamId?: string | null };
        if (parsed.invoice && Array.isArray(parsed.invoice.items)) {
          next = { ...base, ...parsed.invoice };
          // A handoff (edit or "+ New invoice for this client") already
          // establishes the workspace — an edit deliberately leaves
          // selectedTeamId as undefined ("don't change"), which the picker
          // below must not override with a casually re-selected client.
          teamIdLockedRef.current = true;
          if (parsed.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSavedId(parsed.id);
          }
          if (parsed.clientId !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedClientId(parsed.clientId);
          }
          if (parsed.teamId !== undefined) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedTeamId(parsed.teamId);
          }
        }
      } catch {
        // corrupted edit payload — fall back to draft
      }
    } else if (!preset) {
      // Fresh generator session: autofill dates to today (keeping the user's
      // own due-date offset from a previously saved draft, if any).
      const today = new Date();
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const issued = next.issueDate ? Date.parse(next.issueDate + "T00:00:00Z") : Number.NaN;
      const due = next.dueDate ? Date.parse(next.dueDate + "T00:00:00Z") : Number.NaN;
      const offsetDays =
        Number.isFinite(issued) && Number.isFinite(due)
          ? Math.max(1, Math.round((due - issued) / 864e5))
          : 14;
      if (!Number.isFinite(issued) || issued < Date.parse(iso(today) + "T00:00:00Z")) {
        const newIssue = new Date();
        const newDue = new Date();
        newDue.setUTCDate(newDue.getUTCDate() + offsetDays);
        next = { ...next, issueDate: iso(newIssue), dueDate: iso(newDue) };
      }
    }
     
    setInvoice(next);

    setHydrated(true);
  }, [preset]);

  // Applies the user's saved business profile (Settings → General →
  // Business profile) as defaults for a genuinely fresh invoice — never
  // overwrites a resumed draft or edit payload, both of which already have
  // a non-empty businessName by the time this checks. Templates supply
  // their own placeholder business info, so this skips presets entirely.
  const profileAppliedRef = useRef(false);
  useEffect(() => {
    if (!hydrated || !user || preset || profileAppliedRef.current) return;
    profileAppliedRef.current = true;
    fetch("/api/workspace-settings?workspace=personal")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { settings?: {
        businessName: string; businessEmail: string; businessAddress: string; logo: string;
        defaultTaxRate: number | null; defaultNotes: string; defaultPaymentInstructions: string;
        defaultPaymentTermsDays: number;
      } } | null) => {
        const s = data?.settings;
        if (!s) return;
        setInvoice((inv) => {
          if (inv.businessName.trim()) return inv;
          const patch: Partial<Invoice> = {};
          if (s.businessName) patch.businessName = s.businessName;
          if (s.businessEmail) patch.businessEmail = s.businessEmail;
          if (s.businessAddress) patch.businessAddress = s.businessAddress;
          if (s.logo) patch.logoDataUrl = s.logo;
          if (typeof s.defaultTaxRate === "number") patch.taxRate = s.defaultTaxRate;
          if (s.defaultNotes) patch.notes = s.defaultNotes;
          if (s.defaultPaymentInstructions) {
            patch.paymentInstructions = s.defaultPaymentInstructions;
            patch.paymentEnabled = true;
          }
          return Object.keys(patch).length ? { ...inv, ...patch } : inv;
        });
      })
      .catch(() => {});
  }, [hydrated, user, preset]);

  // Finishes the save a logged-out user asked for before being sent to
  // /signup or /login — see signupHref. Their draft survives the round trip
  // in localStorage regardless (loadDraft, above), but without this they'd
  // land back here still logged in with an unsaved form and no indication
  // anything was left to do.
  useEffect(() => {
    if (!hydrated || !user || autosaveHandledRef.current) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("autosave") !== "1") return;
    autosaveHandledRef.current = true;
    params.delete("autosave");
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    void saveToAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, pathname, router]);

  useEffect(() => {
    if (!user) return;
    // The generator has no live workspace switcher of its own — it reads
    // the dashboard's last-chosen workspace out of localStorage (same key
    // DashboardClient persists to) so the client/service pickers match
    // whatever workspace the user was last looking at, instead of merging
    // every team's data into one dropdown.
    let workspace = "personal";
    try {
      const saved = window.localStorage.getItem("invoala.workspace");
      if (saved === "personal" || saved?.startsWith("team:")) workspace = saved;
    } catch {}
    fetch(`/api/clients?workspace=${encodeURIComponent(workspace)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.clients) setClients(data.clients);
      })
      .catch(() => {});
    fetch(`/api/service-items?workspace=${encodeURIComponent(workspace)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.services) setServices(data.services);
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

  // Which workspace a newly-saved service should belong to — same
  // last-chosen-workspace localStorage read the client/service fetch effect
  // above uses, independent of this invoice's own team (saving a reusable
  // service is a "my client book" style action, not tied to one invoice).
  function activeWorkspaceTeamId(): string | null {
    try {
      const saved = window.localStorage.getItem("invoala.workspace");
      if (saved?.startsWith("team:")) return saved.slice(5);
    } catch {}
    return null;
  }

  // "Add from saved services" — appends a new line item pre-filled from a
  // saved service instead of an empty one. Description combines name +
  // description (when set) so the invoice line reads naturally without
  // requiring a second field on the printed document.
  function addServiceItem(service: ServiceItem) {
    setInvoice((inv) => ({
      ...inv,
      items: [
        ...inv.items,
        {
          id: newId(),
          description: service.description ? `${service.name} — ${service.description}` : service.name,
          quantity: 1,
          rate: service.rate,
        },
      ],
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
      invoiceNumber: data.invoiceNumber ?? inv.invoiceNumber,
      taxRate:
        typeof data.taxRate === "number" && !Number.isNaN(data.taxRate)
          ? data.taxRate
          : inv.taxRate,
      discount:
        typeof data.discount === "number" && !Number.isNaN(data.discount)
          ? data.discount
          : inv.discount,
      discountAmount:
        typeof data.discountAmount === "number" && !Number.isNaN(data.discountAmount)
          ? data.discountAmount
          : inv.discountAmount ?? 0,
      discountMode:
        typeof data.discountAmount === "number" && data.discountAmount > 0
          ? "fixed"
          : typeof data.discount === "number" && data.discount > 0
            ? "percent"
            : inv.discountMode || "percent",
      amountPaid:
        typeof data.amountPaid === "number" && !Number.isNaN(data.amountPaid)
          ? data.amountPaid
          : inv.amountPaid,
      issueDate: data.issueDate ?? inv.issueDate,
      dueDate: data.dueDate ?? inv.dueDate,
      paymentInstructions: data.paymentInstructions ?? inv.paymentInstructions,
      // The AI only fills this in when the user actually described payment
      // terms, so surface the section instead of leaving it silently hidden.
      paymentEnabled: data.paymentInstructions ? true : inv.paymentEnabled,
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
        body: JSON.stringify({ id: savedId ?? undefined, invoice, clientId: selectedClientId, teamId: selectedTeamId }),
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
          body: JSON.stringify({ invoice, clientId: selectedClientId, teamId: selectedTeamId }),
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

  // Picking a client from InvoiceForm's dropdown also decides which
  // workspace a brand-new invoice belongs to — the client's own team_id is
  // the source of truth (same rule ClientsTab/ClientProfile's "+ New
  // invoice" already follows), not whatever workspace happened to be last
  // active. Locked out during an edit/handoff session (see
  // teamIdLockedRef) so re-picking a client can't silently move an
  // existing invoice to a different workspace.
  function handleClientSelect(id: string | null) {
    setSelectedClientId(id);
    if (teamIdLockedRef.current) return;
    if (!id) {
      setSelectedTeamId(null);
      return;
    }
    const client = clients.find((c) => c.id === id);
    setSelectedTeamId(client ? client.team_id : null);
  }

  function clearInvoice() {
    if (!confirm("Clear all fields and start a new invoice? This can't be undone.")) return;
    clearDraft();
    setInvoice(createDefaultInvoice());
    setSavedId(null);
    setSaveNote("");
    setEmailNote("");
    setSelectedClientId(null);
    setSelectedTeamId(undefined);
    teamIdLockedRef.current = false;
    // Remounts InvoiceForm so its own internal state (selected client,
    // payment-details toggle) resets along with the invoice data.
    setFormKey((k) => k + 1);
    trackEvent("invoice_cleared");
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

      trackEvent("invoice_printed", { invoiceNumber: invoice.invoiceNumber });

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
          const copied = await copyToClipboard(url);
          if (!copied) {
            // Never fail silently — a blocked clipboard write previously
            // fell through to window.open, which many browsers also block
            // this far from the original click, leaving nothing visible.
            window.prompt("Copy this link:", url);
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
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={clearInvoice}
              className="rounded-full border border-hairline px-4 py-2 text-sm font-medium text-subtle transition hover:border-accent hover:text-accent"
            >
              New invoice
            </button>
          </div>
          <div className="mb-10">{ai ? <AiComposer onResult={applyParsed} /> : null}</div>
          <InvoiceForm
            key={formKey}
            invoice={invoice}
            onChange={update}
            onItemChange={updateItem}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            allowLogo={allowLogo}
            showQuoteMode={quoteMode}
            showRecurring={recurringTerms}
            clients={clients}
            onClientSelect={handleClientSelect}
            onClientSaved={(client) => setClients((rows) => [...rows, client].sort((a, b) => a.name.localeCompare(b.name)))}
            services={services}
            onAddService={addServiceItem}
            onServiceSaved={(service) => setServices((rows) => [...rows, service].sort((a, b) => a.name.localeCompare(b.name)))}
            serviceWorkspaceTeamId={activeWorkspaceTeamId()}
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
