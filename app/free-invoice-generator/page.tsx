import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Invoice Generator — No Sign-Up Required",
  description:
    "Create unlimited invoices for free with Invoala's invoice generator. No account, no credit card, no watermarks. Just a professional PDF in seconds.",
  keywords: [
    "free invoice generator",
    "free invoice maker",
    "free invoice template",
    "no sign up invoice",
  ],
  alternates: {
    canonical: "https://invoala.com/free-invoice-generator",
  },
  openGraph: {
    title: "Free Invoice Generator — No Sign-Up Required",
    description:
      "Create unlimited invoices for free with Invoala's invoice generator. No account, no credit card, no watermarks.",
    url: "https://invoala.com/free-invoice-generator",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "Is this invoice generator really free?",
    a: "Yes — completely free. No trials, no hidden fees, no watermarks on your PDFs. You can create unlimited invoices without ever paying a cent.",
  },
  {
    q: "Do I need to sign up to use the free invoice generator?",
    a: "No. There's no sign-up, no email required, and no account to create. Just open the page, fill in your details, and download your invoice.",
  },
  {
    q: "What can I include in my free invoice?",
    a: "Everything you need: your business details, client information, line items with quantities and rates, tax calculations, payment terms, notes, and your logo.",
  },
  {
    q: "Is there a limit on how many free invoices I can make?",
    a: "No limit at all. Create one invoice or one thousand — it's always free with no caps on usage.",
  },
  {
    q: "Will my free invoice have a watermark?",
    a: "No. Every invoice you download from Invoala is clean and watermark-free, even on the free plan.",
  },
  {
    q: "Can I use free invoices for my business?",
    a: "Absolutely. Freelancers, small businesses, consultants, and agencies all use Invoala's free invoice generator for professional billing.",
  },
  {
    q: "How does Invoala make money if it's free?",
    a: "Invoala offers optional Pro features like recurring invoice scheduling and advanced client management. The core invoice generator remains free forever.",
  },
];

function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function FreeInvoiceGeneratorPage() {
  const user = await getCurrentUser();

  return (
    <>
      <FaqJsonLd />

      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <Link
            href="/#generate"
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Create Invoice
          </Link>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          {/* Hero */}
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Free Invoice Generator — No Sign-Up Required
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              The fastest way to create a professional invoice — completely
              free. No account, no credit card, no watermarks. Just fill in the
              form and download.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Free forever &middot; No sign-up &middot; No credit card required
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* Why free */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Why is Invoala free?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                We believe freelancers and small businesses shouldn&apos;t have
                to pay for basic invoicing tools. Spreadsheets are clunky,
                desktop software is expensive, and most &quot;free&quot; tools
                are crippled with watermarks and limits.
              </p>
              <p>
                Invoala&apos;s invoice generator is genuinely free — no trials,
                no feature gates, no per-invoice fees. You get the full
                experience: professional layouts, tax math, logo upload, AI
                drafting, and 154-currency support.
              </p>
              <p>
                We make money from optional Pro features like recurring invoice
                scheduling and advanced client management. The core tool that
                90% of users need stays free forever.
              </p>
            </div>
          </section>

          {/* What you get */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Everything you get — for free
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Unlimited invoices",
                  desc: "Create as many as you need with no daily or monthly caps.",
                },
                {
                  title: "No watermarks",
                  desc: "Every PDF is clean and professional — your brand, not ours.",
                },
                {
                  title: "Professional layout",
                  desc: "Clean typography, proper spacing, and a polished design.",
                },
                {
                  title: "Logo upload",
                  desc: "Add your business logo for a branded experience.",
                },
                {
                  title: "Tax calculations",
                  desc: "VAT, GST, sales tax — automatic with a clear breakdown.",
                },
                {
                  title: "AI drafting",
                  desc: "Describe the job in plain words and AI builds the invoice.",
                },
                {
                  title: "154 currencies",
                  desc: "Bill clients worldwide with proper currency formatting.",
                },
                {
                  title: "PDF download",
                  desc: "Print-ready A4 format that works on any device or printer.",
                },
                {
                  title: "Saved details",
                  desc: "Your info is stored in your browser for faster future invoicing.",
                },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Start creating free invoices now
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Scroll up to the generator above and start filling in your
              details. Your first professional invoice is minutes away.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Create Invoice
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Related pages</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/invoice-generator" className="text-[#166534] hover:underline">
                  Invoice Generator
                </Link>
              </li>
              <li>
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Invoice Maker
                </Link>
              </li>
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Online Invoicing
                </Link>
              </li>
              <li>
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Invoicing Software
                </Link>
              </li>
              <li>
                <Link href="/invoicing-for-freelancers" className="text-[#166534] hover:underline">
                  Invoicing for Freelancers
                </Link>
              </li>
            </ul>
          </section>

          {/* FAQ */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Frequently asked questions
            </h2>
            <div className="mt-8 border-t border-[#e5e7eb]">
              {faqs.map((f) => (
                <details
                  key={f.q}
                  className="group border-b border-[#e5e7eb]"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-left">
                    <span className="text-[17px] font-semibold tracking-tight text-[#111827]">
                      {f.q}
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </summary>
                  <p className="-mt-1 pb-6 pr-8 text-[15px] leading-relaxed text-[#6b7280]">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SeoFooter />
    </>
  );
}
