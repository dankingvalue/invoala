import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";
import { SeoNavMobile } from "@/components/SeoNavMobile";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipt Generator — Create Professional Receipts Free",
  description:
    "Create a professional receipt in seconds. Record payments, show what was paid and when, and download a print-ready PDF receipt. Free, no sign-up.",
  keywords: [
    "receipt generator",
    "free receipt maker",
    "create receipt",
    "payment receipt",
    "sales receipt",
  ],
  alternates: {
    canonical: "https://www.invoala.com/receipt-generator",
  },
  openGraph: {
    title: "Receipt Generator — Create Professional Receipts Free",
    description:
      "Create a professional receipt in seconds. Record payments and download a print-ready PDF. Free, no sign-up.",
    url: "https://www.invoala.com/receipt-generator",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is the difference between an invoice and a receipt?",
    a: "An invoice requests payment; a receipt confirms payment was received. After a client pays your invoice, send a receipt that shows the amount paid, the date, and what it was for.",
  },
  {
    q: "When should I send a receipt?",
    a: "Send a receipt every time you receive a payment — partial or full. Clients often need receipts for their own bookkeeping, expense reports, and tax records.",
  },
  {
    q: "Is this receipt generator free?",
    a: "Yes. Create unlimited receipts with no watermark and no sign-up. Fill in the form, preview it live, and download a print-ready PDF.",
  },
  {
    q: "Can I add my logo and business details?",
    a: "Yes. Upload your logo, set your business name, address, and email. Your receipt includes a PAID mark and a clean itemized breakdown.",
  },
  {
    q: "Do receipts need an invoice number?",
    a: "Receipts usually reference their own number or the invoice they relate to. Use the number field for a receipt number (e.g. RCPT-001) or add the invoice number as a custom field.",
  },
  {
    q: "Can I record partial payments?",
    a: "Yes. List only the line items or amounts covered by this payment. For a partial payment, note the remaining balance in the notes section.",
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

export default async function ReceiptGeneratorPage() {
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
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                href="/dashboard?tab=general"
                className="hidden rounded-lg border border-[#e5e7eb] px-4 py-2 text-[14px] font-semibold text-[#111827] transition hover:border-[#166534] hover:text-[#166534] md:block"
              >
                Dashboard
              </Link>
            ) : null}
            <Link
              href="/#generate"
              className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Create Invoice
            </Link>
            <SeoNavMobile />
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Receipt Generator
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Confirm every payment with a professional receipt. The generator
              below is set to receipt mode — add what was paid, when, and by
              whom, then download a polished PDF.
            </p>
            <p className="mt-4 text-[14px] text-[#9ca3af]">
              Free forever &middot; No sign-up &middot; No watermark
            </p>
          </section>

          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
              preset={{
                docType: "receipt",
                invoiceNumber: "RCPT-001",
                notes: "Thanks for your business!",
              }}
              ai={false}
              quoteMode
            />
          </section>

          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              From invoice to receipt in one step
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Record the payment",
                  desc: "Enter what was paid and when. The receipt shows the payment date instead of a due date.",
                },
                {
                  n: "02",
                  title: "Itemize what was covered",
                  desc: "List the products or services the payment covers, exactly like the original invoice.",
                },
                {
                  n: "03",
                  title: "Download and send",
                  desc: "Get a print-ready PDF receipt with a PAID mark. Email it or hand it over on the spot.",
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
              Why send receipts at all?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Proof of payment",
                  desc: "Receipts document that money changed hands — protecting both you and your client if questions come up later.",
                },
                {
                  title: "Clients expect them",
                  desc: "Business clients need receipts for expense reports and tax filings. Sending one automatically makes you easy to work with.",
                },
                {
                  title: "Clean records",
                  desc: "A numbered receipt trail makes reconciliation simple at tax time, especially for cash and card payments.",
                },
                {
                  title: "Professional follow-through",
                  desc: "Confirming payment with a receipt is a professional touch that ends the transaction on a high note.",
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
                <Link href="/estimate-generator" className="text-[#166534] hover:underline">
                  Estimate Generator
                </Link>
              </li>
              <li>
                <Link href="/learn/invoice-vs-receipt" className="text-[#166534] hover:underline">
                  Invoice vs Receipt: What&apos;s the Difference?
                </Link>
              </li>
              <li>
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Invoice Payment Tracking
                </Link>
              </li>
              <li>
                <Link href="/learn/how-to-track-unpaid-invoices" className="text-[#166534] hover:underline">
                  How to Track Unpaid Invoices
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
