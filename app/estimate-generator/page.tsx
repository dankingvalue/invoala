import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estimate Generator — Free Job Estimates & Quotes | Invoala",
  description:
    "Create a professional job estimate in seconds. Outline costs before work begins, win the project, then convert the estimate to an invoice in one click. Free, no sign-up.",
  keywords: [
    "estimate generator",
    "free estimate maker",
    "job estimate",
    "cost estimate",
    "estimate template",
  ],
  alternates: {
    canonical: "https://invoala.com/estimate-generator",
  },
  openGraph: {
    title: "Estimate Generator — Free Job Estimates & Quotes | Invoala",
    description:
      "Create a professional job estimate in seconds and convert it to an invoice when the work is approved. Free, no sign-up.",
    url: "https://invoala.com/estimate-generator",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is the difference between an estimate and a quote?",
    a: "Both outline costs before work starts. An estimate is usually a ballpark figure that can change; a quote is a fixed price the client can hold you to. Invoala's estimate mode shows an estimated total and a validity date.",
  },
  {
    q: "What should a job estimate include?",
    a: "Your business details, the client's details, a description of the work as line items, quantities and rates, an estimated total, and how long the estimate is valid for.",
  },
  {
    q: "Can I turn an estimate into an invoice?",
    a: "Yes. When the client approves, click \"Convert to invoice\" — the same line items carry over and a due date is set automatically. No retyping.",
  },
  {
    q: "Are estimates legally binding?",
    a: "Estimates are generally not binding unless you state otherwise. A quote is treated as a firm offer. Always note a validity period so old prices don't come back to haunt you.",
  },
  {
    q: "Is the estimate generator free?",
    a: "Yes — no sign-up, no watermark, no limits. Download as many estimate PDFs as you need.",
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

export default async function EstimateGeneratorPage() {
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
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Estimate Generator
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Price your next job before you start it. The generator below is
              set to estimate mode — outline the work, set a validity date, and
              convert it to an invoice when the client says yes.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Free forever &middot; No sign-up &middot; No watermark
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "estimate",
                invoiceNumber: "EST-001",
                notes: "This estimate is valid for 30 days.",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Estimate &rarr; approved &rarr; invoice
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Price the job",
                  desc: "Break the work into line items with quantities and rates. The estimated total updates live.",
                },
                {
                  n: "02",
                  title: "Send for approval",
                  desc: "Download a professional estimate PDF with a validity date. The client knows exactly what they're approving.",
                },
                {
                  n: "03",
                  title: "Convert when approved",
                  desc: "Click \"Convert to invoice\" and the estimate becomes a real invoice with a due date — nothing to retype.",
                },
              ].map((s) => (
                <div key={s.n}>
                  <p className="text-[56px] font-extrabold leading-none tracking-tight text-[#166534]/60">
                    {s.n}
                  </p>
                  <h3 className="mt-4 text-[18px] font-bold tracking-tight text-[#111827]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Estimates that win work
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Clear scope, fewer disputes",
                  desc: "A line-itemed estimate tells the client exactly what they're paying for — and what's not included.",
                },
                {
                  title: "Faster decisions",
                  desc: "Professional formatting and a validity date create gentle urgency without pressure tactics.",
                },
                {
                  title: "Consistent pricing",
                  desc: "Use saved items and clients so repeat jobs are priced the same way every time.",
                },
                {
                  title: "Zero retyping",
                  desc: "When the estimate is approved, convert it straight into an invoice with the same items and amounts.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-20 mx-auto max-w-[1024px] border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Related pages</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/invoice-generator" className="text-[#166534] hover:underline">
                  Invoice Generator
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
                  Receipt Generator
                </Link>
              </li>
              <li>
                <Link href="/estimates-and-invoices" className="text-[#166534] hover:underline">
                  Estimates &amp; Invoices
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-estimate" className="text-[#166534] hover:underline">
                  Invoice vs Estimate: When to Send Each
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-[#166534] hover:underline">
                  Invoice Templates
                </Link>
              </li>
            </ul>
          </section>

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
