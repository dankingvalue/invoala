import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { getCurrentUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Free Invoice Generator — Create Professional Invoices Online",
  description:
    "Use Invoala's free invoice generator to create professional invoices in seconds. No sign-up required — just fill in the form and download a polished PDF.",
  keywords: [
    "invoice generator",
    "free invoice generator",
    "online invoice generator",
    "invoice maker",
  ],
  alternates: {
    canonical: "https://invoala.com/invoice-generator",
  },
  openGraph: {
    title: "Free Invoice Generator — Create Professional Invoices Online",
    description:
      "Use Invoala's free invoice generator to create professional invoices in seconds. No sign-up required.",
    url: "https://invoala.com/invoice-generator",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "How do I use the invoice generator?",
    a: "Fill in your business details, add your client's information, enter line items with quantities and rates, set a tax rate if needed, and click download. You'll get a professional PDF in seconds.",
  },
  {
    q: "Is the invoice generator really free?",
    a: "Yes. There are no hidden fees, no watermarks, and no limits. Create as many invoices as you need — forever.",
  },
  {
    q: "Do I need to create an account to use the generator?",
    a: "No. The invoice generator works instantly without any sign-up. Open the page, fill in your details, and download your invoice.",
  },
  {
    q: "Can I add my logo to the invoice?",
    a: "Yes. Click the logo upload area in the form to add your business logo. It appears at the top of every invoice for a professional look.",
  },
  {
    q: "What currencies does the generator support?",
    a: "Invoala supports 154 world currencies including USD, EUR, GBP, JPY, CAD, AUD, and many more. The invoice formats the currency symbol and decimals automatically.",
  },
  {
    q: "Does the generator calculate tax?",
    a: "Yes. Enter your tax rate (VAT, GST, sales tax) and the total updates live as you type. You can see the breakdown on the preview.",
  },
  {
    q: "Can I save my invoices?",
    a: "Your data is saved in your browser's local storage automatically. If you create a free account, you can also save invoices to the cloud and access them from any device.",
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

export default async function InvoiceGeneratorPage() {
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
              Free Invoice Generator
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Create professional invoices in seconds. No sign-up, no credit
              card, no watermarks. Just a clean PDF ready to send to your
              client.
            </p>
          </section>

          {/* Embedded generator */}
          <section className="mb-20">
            <InvoiceGenerator
              user={user ? { email: user.email } : null}
            />
          </section>

          {/* How to use */}
          <section className="mb-20 mx-auto max-w-[1024px]">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How to use the invoice generator
            </h2>
            <div className="mt-8 grid gap-12 sm:grid-cols-3">
              {[
                {
                  n: "01",
                  title: "Add your details",
                  desc: "Enter your business name, email, and address. Upload your logo for a professional touch.",
                },
                {
                  n: "02",
                  title: "Describe your work",
                  desc: "Add line items with descriptions, quantities, and rates. Or use AI to draft them from plain text.",
                },
                {
                  n: "03",
                  title: "Download the PDF",
                  desc: "Click the download button to get a polished A4 invoice. Attach it to an email and send it to your client.",
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

          {/* What's included */}
          <section className="mb-20 mx-auto max-w-[1024px] rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What&apos;s included in every invoice
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Professional layout",
                  desc: "Clean typography and spacing that makes your work look premium.",
                },
                {
                  title: "Your branding",
                  desc: "Add your logo and business details for a consistent brand experience.",
                },
                {
                  title: "Line items",
                  desc: "Detailed breakdown of services or products with quantities and rates.",
                },
                {
                  title: "Tax breakdown",
                  desc: "Automatic calculation of VAT, GST, or sales tax with a clear summary.",
                },
                {
                  title: "Payment terms",
                  desc: "Due dates, payment methods, and notes so clients know exactly how to pay.",
                },
                {
                  title: "Print-ready PDF",
                  desc: "A4 format that prints perfectly and looks identical on every device.",
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
              Ready to create your invoice?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Scroll back up and start filling in the form. Your first
              professional invoice is minutes away.
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
