/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Online Invoicing — Create & Send Invoices from Anywhere",
  description:
    "Create and send professional invoices from any device with Invoala's free online invoicing tool. No software to install — just open your browser and start billing.",
  keywords: [
    "online invoicing",
    "online invoice",
    "create invoice online",
    "send invoice online",
    "free online invoicing",
  ],
  alternates: {
    canonical: "https://www.invoala.com/online-invoicing",
  },
  openGraph: {
    title: "Online Invoicing — Create & Send Invoices from Anywhere",
    description:
      "Create and send professional invoices from any device with Invoala's free online invoicing tool. No software to install.",
    url: "https://www.invoala.com/online-invoicing",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is online invoicing?",
    a: "Online invoicing lets you create and send invoices through a web browser instead of desktop software. You fill in a form, the tool generates a professional PDF, and you can download or email it directly to your client.",
  },
  {
    q: "Is online invoicing secure?",
    a: "Yes. Invoala processes everything in your browser — your data never touches a server unless you choose to save it. Your business details and client information stay on your device.",
  },
  {
    q: "Can I use online invoicing on my phone?",
    a: "Absolutely. Invoala works on any device with a web browser — phone, tablet, or laptop. The interface adapts to your screen size so you can invoice from anywhere.",
  },
  {
    q: "Do I need to install anything for online invoicing?",
    a: "No. Online invoicing runs entirely in your browser. There's nothing to download, install, or update. Just open the website and start creating invoices.",
  },
  {
    q: "How fast can I send an invoice online?",
    a: "Most users create and download an invoice in under two minutes. If you've saved your client details before, it's even faster — just select the client and add your line items.",
  },
  {
    q: "Can I track online invoices after sending them?",
    a: "Yes. Invoala lets you mark invoices as paid, pending, or overdue so you always know your payment status. You can see all your invoices and their status in one view.",
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

export default function OnlineInvoicingPage() {
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
              Online Invoicing — Create &amp; Send Invoices from Anywhere
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Your laptop, your phone, your tablet — create professional
              invoices on any device with an internet connection. No software to
              install, no files to sync.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Start invoicing now
              </Link>
              <Link
                href="/invoice-generator"
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                See how it works &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is online invoicing */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What is online invoicing?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Online invoicing means creating, sending, and managing invoices
                through a web browser. Instead of relying on desktop software or
                spreadsheet templates, you use a dedicated online tool that handles
                formatting, calculations, and PDF generation for you.
              </p>
              <p>
                The biggest advantage is accessibility. You can create an invoice
                from any device — your office desktop, your home laptop, or your
                phone while you're on a job site. There's nothing to install,
                nothing to update, and nothing to sync between devices.
              </p>
              <p>
                Invoala takes this further by keeping all your data in your browser.
                Nothing is uploaded to a server unless you choose to save it to an
                account, so your business information stays private.
              </p>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Benefits of online invoicing with Invoala
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Access from anywhere",
                  desc: "Create invoices from any device with a browser. Work from home, the office, or a client's site — your invoicing goes with you.",
                },
                {
                  title: "No software to install",
                  desc: "Skip the downloads, updates, and compatibility headaches. Online invoicing runs entirely in your browser.",
                },
                {
                  title: "Instant delivery",
                  desc: "Download a PDF and email it to your client in seconds. No printing, no scanning, no postal delays.",
                },
                {
                  title: "Always up to date",
                  desc: "You're always using the latest version. No patch notes, no update prompts, no feature lag.",
                },
                {
                  title: "Works on any device",
                  desc: "Responsive design means the invoicing experience is smooth on phones, tablets, and desktops alike.",
                },
                {
                  title: "No data loss",
                  desc: "Your invoice data is saved in your browser's local storage automatically. Close the tab, come back later — it's still there.",
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

          {/* How it works */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How online invoicing works
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Open Invoala",
                  desc: "Navigate to the invoice generator in your browser. No sign-up needed — you're ready to go immediately.",
                },
                {
                  n: "02",
                  title: "Fill in the details",
                  desc: "Add your business info, client details, line items, and tax rate. The form saves your info for next time.",
                },
                {
                  n: "03",
                  title: "Download and send",
                  desc: "Click download to get a professional PDF. Attach it to an email, send it through Invoala, or share a link.",
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

          {/* Security */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Is online invoicing secure?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Security is a top concern when handling business and client data
                online. Invoala addresses this by processing everything locally in
                your browser. When you type invoice details, they never leave your
                device.
              </p>
              <p>
                Your data is stored in your browser's local storage — not on our
                servers. This means even if Invoala's servers were compromised, your
                business information wouldn't be at risk because it was never
                uploaded in the first place.
              </p>
              <p>
                If you choose to create an account and save invoices to the cloud,
                data is encrypted in transit (HTTPS) and at rest. You stay in
                control of what's stored and what stays local.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Online invoicing features
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Professional PDFs",
                  desc: "Download clean, print-ready A4 invoices with your logo, line items, and tax breakdown.",
                },
                {
                  title: "AI-powered drafting",
                  desc: "Describe the job in plain words and AI creates a finished invoice with items and totals.",
                },
                {
                  title: "154 currencies",
                  desc: "Bill clients worldwide with proper currency symbols and automatic decimal formatting.",
                },
                {
                  title: "Tax calculations",
                  desc: "Enter your VAT, GST, or sales tax rate and totals update live as you type.",
                },
                {
                  title: "Client management",
                  desc: "Save client details and select them from a dropdown on future invoices.",
                },
                {
                  title: "Payment tracking",
                  desc: "Mark invoices as paid, pending, or overdue to keep your cash flow visible.",
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
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Start invoicing online — free, today
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              No sign-up, no credit card, no limits. Create your first invoice
              right now.
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
                <Link href="/invoicing-software" className="text-[#166534] hover:underline">
                  Invoicing Software
                </Link>
              </li>
              <li>
                <Link href="/invoice-generator" className="text-[#166534] hover:underline">
                  Invoice Generator
                </Link>
              </li>
              <li>
                <Link href="/receipt-generator" className="text-[#166534] hover:underline">
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
