import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Data Processing — How Invoala Handles Your Data | Invoala",
  description:
    "How Invoala processes, stores, and protects your data: browser-local drafts, encrypted transport, managed storage, and your rights.",
  path: "/data-processing",
  keywords: ["data processing", "invoala data", "data protection"],
});

export default function DataProcessingPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">
            Data Processing
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">
            A plain-English summary of what data Invoala processes and how.
          </p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#374151]">
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">Without an account</h2>
              <p className="mt-2">
                The invoice generator runs entirely in your browser. Drafts are
                saved to your device&rsquo;s local storage and are never uploaded.
                Your invoice data does not leave your machine until you create
                an account and choose to save it.
              </p>
            </section>
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">With an account</h2>
              <p className="mt-2">
                Account data (profile, invoices, clients, subscription status)
                is stored in a managed database (Turso), accessed over encrypted
                connections with token-based credentials that live only in
                server-side configuration. Your data is used solely to provide
                the service to you.
              </p>
            </section>
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">Shared invoices</h2>
              <p className="mt-2">
                Share links are protected by a secret token and expose only the
                specific invoice you choose to share. They are marked
                noindex and are never included in the sitemap.
              </p>
            </section>
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">Your rights</h2>
              <p className="mt-2">
                You can delete your account and all of its data at any time from
                your dashboard. For access, correction, or deletion requests,
                email{" "}
                <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                  hello@invoala.com
                </a>
                . Full details are in the{" "}
                <Link href="/privacy" className="text-[#166534] hover:underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
