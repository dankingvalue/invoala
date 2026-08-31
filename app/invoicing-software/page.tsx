/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoicing Software — Simple Invoicing for Modern Businesses",
  description:
    "Invoala is simple invoicing software for freelancers and small businesses. Create professional invoices, track payments, and get paid faster — all for free.",
  keywords: [
    "invoicing software",
    "invoice software",
    "online invoicing",
    "billing software",
    "small business invoicing",
  ],
  alternates: {
    canonical: "https://invoala.com/invoicing-software",
  },
  openGraph: {
    title: "Invoicing Software — Simple Invoicing for Modern Businesses",
    description:
      "Invoala is simple invoicing software for freelancers and small businesses. Create professional invoices, track payments, and get paid faster — all for free.",
    url: "https://invoala.com/invoicing-software",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is invoicing software?",
    a: "Invoicing software is a tool that helps you create, send, and manage invoices for your business. It automates calculations, tracks payment status, and generates professional PDFs you can email to clients.",
  },
  {
    q: "Is Invoala free invoicing software?",
    a: "Yes. Invoala is completely free — no trials, no paywalls, no watermarks. Create unlimited invoices, download PDFs, and track payments without spending a cent.",
  },
  {
    q: "Can I use invoicing software for my small business?",
    a: "Absolutely. Invoicing software is designed for freelancers, consultants, agencies, contractors, and small businesses of all kinds. It saves time and looks more professional than spreadsheets.",
  },
  {
    q: "What features should good invoicing software have?",
    a: "Look for invoice creation, PDF export, payment tracking, client management, recurring invoices, tax calculations, and multiple currency support. Invoala includes all of these.",
  },
  {
    q: "How is invoicing software different from a spreadsheet?",
    a: "Spreadsheets require manual formatting and formula setup. Invoicing software gives you a polished template, automatic totals, tax math, PDF generation, and payment tracking in one tool.",
  },
  {
    q: "Can I send invoices directly from Invoala?",
    a: "Yes. If you have an account, you can email invoices directly to your clients from the dashboard. Free users can download the PDF and send it through their own email.",
  },
  {
    q: "Does Invoala support recurring invoices?",
    a: "Yes. You can save client details and invoice templates for quick reuse. Full recurring invoice scheduling is available on the Pro plan for regular billing cycles.",
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

export default function InvoicingSoftwarePage() {
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
        <div className="mx-auto max-w-[1024px] px-6">
          {/* Hero */}
          <section className="mb-20 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Simple Invoicing Software for Modern Businesses
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Stop wrestling with spreadsheets. Invoala gives you everything you
              need to create, send, and track invoices — without the complexity
              or the cost.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Create your first invoice
              </Link>
              <Link
                href="/invoice-generator"
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                Try the generator &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is invoicing software */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What is invoicing software?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Invoicing software is a digital tool that lets businesses create,
                send, and manage invoices from a single place. Instead of building
                invoices in a word processor or spreadsheet, you fill in a form and
                the software handles formatting, tax calculations, numbering, and
                PDF generation automatically.
              </p>
              <p>
                Good invoicing software also tracks payment status so you always
                know which invoices are paid, which are overdue, and how much
                revenue is outstanding. It replaces a patchwork of tools with one
                streamlined workflow.
              </p>
              <p>
                Invoala goes further by including AI-powered invoice drafting,
                client management, and recurring invoice support — all free of
                charge.
              </p>
            </div>
          </section>

          {/* Why use it */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Why use invoicing software?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Save time",
                  desc: "Templates, auto-fill, and saved client details mean you go from blank page to finished invoice in under two minutes.",
                },
                {
                  title: "Look professional",
                  desc: "Clean, branded PDFs signal credibility. Clients take your business more seriously when the invoice looks polished.",
                },
                {
                  title: "Get paid faster",
                  desc: "Clear payment terms, due dates, and instant delivery mean clients know exactly when and how to pay.",
                },
                {
                  title: "Stay organized",
                  desc: "Track every invoice by status — paid, pending, or overdue — so nothing falls through the cracks.",
                },
                {
                  title: "Reduce errors",
                  desc: "Automatic tax math and totals eliminate the calculation mistakes that happen with manual spreadsheets.",
                },
                {
                  title: "Work from anywhere",
                  desc: "Cloud-based invoicing software runs in your browser. Create invoices on your laptop, tablet, or phone.",
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
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Features that make Invoala different
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Track payments",
                  desc: "Mark invoices as paid, pending, or overdue. See your outstanding balance at a glance.",
                },
                {
                  title: "Manage clients",
                  desc: "Save client details once and select them from a dropdown on every future invoice.",
                },
                {
                  title: "Recurring invoices",
                  desc: "Set up repeating invoices for ongoing work. Never forget to bill for monthly retainers.",
                },
                {
                  title: "Payment reminders",
                  desc: "Automatic reminders keep your cash flow healthy without uncomfortable follow-up emails.",
                },
                {
                  title: "AI invoice drafting",
                  desc: "Describe what you did in plain words and AI turns it into a finished invoice with line items and totals.",
                },
                {
                  title: "Multiple currencies",
                  desc: "Bill clients in any of 154 world currencies with proper symbols and decimal formatting.",
                },
                {
                  title: "PDF download",
                  desc: "Export a clean, print-ready A4 PDF that looks perfect on any device or printer.",
                },
                {
                  title: "Tax calculations",
                  desc: "Enter your VAT, GST, or sales tax rate and the total updates live as you type.",
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

          {/* Who it's for */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Who is Invoala for?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Freelancers",
                  desc: "Send polished invoices for projects, milestones, and hourly work without paying for software you don't need.",
                },
                {
                  title: "Small businesses",
                  desc: "Manage billing for a growing team. Track who's paid and who owes you — all from one dashboard.",
                },
                {
                  title: "Consultants",
                  desc: "Bill for your expertise with professional invoices that reflect the quality of your work.",
                },
                {
                  title: "Agencies",
                  desc: "Handle multiple clients and projects with saved client details and recurring billing.",
                },
                {
                  title: "Contractors",
                  desc: "Create invoices on-site from your phone. Download the PDF and email it before you leave the job.",
                },
                {
                  title: "Side hustlers",
                  desc: "Get paid professionally for freelance work without investing in expensive invoicing tools.",
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

          {/* How Invoala compares */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How Invoala compares
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Most invoicing software falls into two camps: free tools with
                limited features, or expensive platforms with steep learning
                curves. Invoala sits in the sweet spot — fully featured and truly
                free.
              </p>
              <p>
                Unlike spreadsheet templates, Invoala handles formatting, tax
                math, and PDF generation automatically. Unlike paid tools like
                FreshBooks or QuickBooks, there's no subscription, no per-invoice
                fee, and no feature gating.
              </p>
              <p>
                You get professional invoices, client management, payment tracking,
                AI drafting, and 154-currency support — all without entering a
                credit card.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Ready to simplify your invoicing?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Create your first professional invoice in under two minutes. No
              sign-up required.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Create Invoice
            </Link>
          </section>

          {/* Related links */}
          <section className="mb-20 border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Related pages</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Online Invoicing
                </Link>
              </li>
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
                <Link href="/invoice-maker" className="text-[#166534] hover:underline">
                  Invoice Maker
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
          <section className="mb-20">
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
