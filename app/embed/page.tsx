import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { LazyInvoiceGenerator } from "@/components/LazyInvoiceGenerator";

export const metadata: Metadata = pageMetadata({
  title: "Free Invoice Generator — Powered by Invoala",
  description:
    "Embed this free invoice generator on your site. Professional invoices in seconds, powered by Invoala.",
  path: "/embed",
  noIndex: true,
});

export default function EmbedPage() {
  return (
    <main className="min-h-screen bg-[#f3f4f6] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <a
            href="/invoice-generator"
            className="text-[13px] font-medium text-[#166534] hover:underline"
          >
            Free invoice generator &rsaquo;
          </a>
        </div>
        <LazyInvoiceGenerator />
      </div>
    </main>
  );
}
