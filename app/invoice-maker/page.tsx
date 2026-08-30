import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice Maker — Create Professional Invoices in Seconds | Invoala",
  description:
    "Invoala is an invoice maker that helps you create professional invoices in seconds. Fast, free, and no sign-up required. Download a polished PDF now.",
  keywords: [
    "invoice maker",
    "make an invoice",
    "create invoice",
    "professional invoice",
    "invoice creator",
  ],
  alternates: {
    canonical: "https://invoala.com/invoice-maker",
  },
  openGraph: {
    title: "Invoice Maker — Create Professional Invoices in Seconds | Invoala",
    description:
      "Invoala is an invoice maker that helps you create professional invoices in seconds. Fast, free, and no sign-up required.",
    url: "https://invoala.com/invoice-maker",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "How fast can I make an invoice with Invoala?",
    a: "Most users create a complete invoice in under two minutes. If you've saved your business and client details before, it takes even less time — just select a client and add your line items.",
  },
  {
    q: "Is the invoice maker free to use?",
    a: "Yes. Invoala's invoice maker is completely free — no trials, no paywalls, no watermarks. Create unlimited invoices and download professional PDFs without paying anything.",
  },
  {
    q: "Do I need technical skills to make an invoice?",
    a: "Not at all. The invoice maker uses a simple form — fill in your details, add line items, and click download. No design skills, no spreadsheet formulas, no learning curve.",
  },
  {
    q: "Can I customize my invoice appearance?",
    a: "Yes. Add your logo, choose your currency, set your tax rate, and include payment notes. The invoice maker handles the professional layout automatically.",
  },
  {
    q: "What file format does the invoice maker produce?",
    a: "PDF — a clean, print-ready A4 document that looks identical on every device and prints perfectly on any printer. Attach it to an email or print it directly.",
  },
  {
    q: "Can I make invoices for different currencies?",
    a: "Yes. Invoala supports 154 world currencies. Select your currency from the dropdown and the invoice maker formats the symbol and decimals automatically.",
  },
  {
    q: "How is this different from using Word or Excel?",
    a: "Word and Excel require manual formatting and formula setup. Invoala's invoice maker is purpose-built — you get automatic totals, tax math, professional formatting, and a PDF download in one step.",
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

export default async function InvoiceMakerPage() {
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
              Invoice Maker — Create Professional Invoices in Seconds
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              The fastest way to make a professional invoice. No learning curve,
              no sign-up, no limits. Just fill in the form and download a
              polished PDF.
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

          {/* Speed & ease */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Make invoices in seconds, not minutes
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Type your details",
                  desc: "Business name, client info, line items. The form is short and intuitive — no training needed.",
                },
                {
                  n: "02",
                  title: "See the preview",
                  desc: "Watch your invoice take shape in real time as you type. Adjust anything before downloading.",
                },
                {
                  n: "03",
                  title: "Download the PDF",
                  desc: "One click gives you a print-ready A4 invoice. Send it to your client and get paid.",
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

          {/* Why use an invoice maker */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Why use an invoice maker instead of a spreadsheet?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "No formulas to maintain",
                  desc: "Spreadsheets break when you add rows or change tax rates. An invoice maker handles the math automatically.",
                },
                {
                  title: "Professional output",
                  desc: "Spreadsheets look like spreadsheets. An invoice maker produces a clean PDF that looks like it came from a designer.",
                },
                {
                  title: "Faster workflow",
                  desc: "No setup, no templates to configure. Open the tool, fill in the form, and download — done in minutes.",
                },
                {
                  title: "No file management",
                  desc: "No saving, naming, or organizing .xlsx files. Your invoice is generated fresh every time and downloaded as a PDF.",
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

          {/* Features */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Everything the invoice maker includes
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Logo upload",
                  desc: "Add your business logo for a branded look.",
                },
                {
                  title: "AI drafting",
                  desc: "Describe the job and AI creates the invoice for you.",
                },
                {
                  title: "Tax math",
                  desc: "VAT, GST, or sales tax — calculated automatically.",
                },
                {
                  title: "154 currencies",
                  desc: "Bill clients worldwide with proper formatting.",
                },
                {
                  title: "Live preview",
                  desc: "See your invoice update in real time as you type.",
                },
                {
                  title: "PDF export",
                  desc: "Print-ready A4 format for any device or printer.",
                },
                {
                  title: "Client saving",
                  desc: "Store client details for faster future invoicing.",
                },
                {
                  title: "Payment terms",
                  desc: "Set due dates, methods, and late fee notes.",
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
              Make your first invoice now
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Scroll up to the invoice maker and start filling in your details.
              A professional PDF is just a few clicks away.
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
                <Link href="/free-invoice-generator" className="text-[#166534] hover:underline">
                  Free Invoice Generator
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
