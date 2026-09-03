"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { InvoicePreview } from "@/components/InvoicePreview";
import { docTitle, type Invoice } from "@/lib/invoice";

export function PublicInvoiceView({ invoice }: { invoice: Invoice }) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  async function downloadPdf() {
    if (downloading) return;
    setDownloading(true);
    try {
      const el = previewRef.current;
      if (!el) throw new Error("no preview");
      const { default: html2canvas } = await import("html2canvas-pro");

      const holder = document.createElement("div");
      holder.style.position = "fixed";
      holder.style.left = "-10000px";
      holder.style.top = "0";
      holder.style.width = "794px";
      holder.style.background = "#ffffff";
      document.body.appendChild(holder);
      const clone = el.cloneNode(true) as HTMLElement;
      holder.appendChild(clone);

      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(clone, { scale: 2, backgroundColor: "#ffffff", logging: false });
      } finally {
        holder.remove();
      }

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ unit: "pt", format: "a4", compress: true });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = pageW / canvas.width;
      const scaledH = canvas.height * ratio;
      if (scaledH <= pageH) {
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pageW, scaledH);
      } else {
        const scale = pageH / canvas.height;
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, canvas.width * scale, pageH);
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
    <div className="min-h-screen bg-fog px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-[720px]">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={downloading}
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-hover disabled:pointer-events-none disabled:opacity-60"
          >
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>

        <div className="rounded-[28px] bg-white p-3 shadow-lg ring-1 ring-black/5">
          <div className="overflow-hidden rounded-2xl ring-1 ring-black/5">
            <InvoicePreview invoice={invoice} innerRef={previewRef} />
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-subtle">
          This {docTitle(invoice.docType).toLowerCase()} was sent to you via{" "}
          <Link href="/" className="font-medium text-link hover:underline">
            Invoala
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
