import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Free Invoice Template — Download & Customize",
  description:
    "Free invoice templates for freelancers and small businesses. Customize with your logo, line items, and payment terms. Download as PDF — no sign-up required.",
  keywords: [
    "invoice template",
    "free invoice template",
    "invoice template PDF",
    "freelance invoice template",
    "business invoice template",
    "custom invoice template",
  ],
  alternates: { canonical: "https://invoala.com/invoice-template" },
  openGraph: {
    title: "Free Invoice Template — Download & Customize",
    description:
      "Free invoice templates for freelancers. Customize and download as PDF.",
    url: "https://invoala.com/invoice-template",
  },
};

const industries = [
  {
    name: "Freelancers & Consultants",
    description:
      "Bill for hourly work, fixed projects, or retainer fees. Include scope of work, hours, and rate.",
    items: ["Hourly rate × hours", "Fixed project fee", "Mileage / expenses"],
  },
  {
    name: "Web Designers & Developers",
    description:
      "Itemize design, development, and revision phases. List each deliverable separately.",
    items: ["UI/UX design", "Frontend development", "Hosting setup"],
  },
  {
    name: "Photographers & Videographers",
    description:
      "Charge per session, per project, or per deliverable. Include usage rights if applicable.",
    items: ["Session fee", "Editing / post-production", "Prints / digital files"],
  },
  {
    name: "Contractors & Trades",
    description:
      "Break down materials, labor, and permits. Add project address and timeline.",
    items: ["Labor hours", "Materials", "Permits / fees"],
  },
  {
    name: "Small Businesses",
    description:
      "Product sales, service bundles, or recurring subscriptions. Include tax where required.",
    items: ["Product / SKU", "Service bundle", "Recurring subscription"],
  },
];

export default function InvoiceTemplate() {
  return (
    <div id="top" className="min-h-screen scroll-mt-20">
      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-[#e5e7eb] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1024px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-[#111827]">
            <svg width="20" height="20" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#166534" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <Link href="/#generate" className="rounded-lg bg-[#14532d] px-5 py-2 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]">
            Create Invoice
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pb-12 pt-32 md:pt-40">
        <div className="mx-auto max-w-[720px]">
          <p className="text-[14px] font-medium text-[#166534]">Templates</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
            Free Invoice Template
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[#6b7280]">
            Pick an industry, fill in the blanks, download a polished PDF. Every
            template is free — no sign-up, no watermark, no limits.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Start with a template
          </Link>
        </div>
      </section>

      {/* Industries */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Templates by Industry
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Every invoice follows the same structure — add the right line items
            for your field.
          </p>

          <div className="mt-10 space-y-8">
            {industries.map((ind) => (
              <div
                key={ind.name}
                className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-6"
              >
                <h3 className="text-[18px] font-bold tracking-tight">
                  {ind.name}
                </h3>
                <p className="mt-2 text-[15px] text-[#374151]">
                  {ind.description}
                </p>
                <ul className="mt-3 space-y-1">
                  {ind.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-[14px] text-[#6b7280]"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#166534"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to include */}
      <section className="bg-[#f3f4f6] px-6 py-16">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Every Good Invoice Includes
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {[
              {
                title: "Your info",
                desc: "Name, address, email, phone — so the client knows who to pay.",
              },
              {
                title: "Client info",
                desc: "Who you're billing. Name, email, and address.",
              },
              {
                title: "Invoice number",
                desc: "A unique ID for tracking. INV-001, INV-002, etc.",
              },
              {
                title: "Date & due date",
                desc: "When it was issued and when payment is due.",
              },
              {
                title: "Line items",
                desc: "What you did, how many, and how much per unit.",
              },
              {
                title: "Total & tax",
                desc: "Subtotal, tax percentage, and final amount owed.",
              },
              {
                title: "Payment terms",
                desc: "Net 15, Net 30, or on receipt. Include payment methods.",
              },
              {
                title: "Notes",
                desc: "Thank-you message, late fee policy, or special instructions.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#166534] text-[12px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <h3 className="text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-0.5 text-[14px] text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[28px] font-extrabold tracking-tight">
            Build your invoice now
          </h2>
          <p className="mt-2 text-[16px] text-[#6b7280]">
            Pick a template, fill in your details, download the PDF.
          </p>
          <Link
            href="/#generate"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Create your invoice
          </Link>
        </div>
      </section>

      {/* Internal links */}
      <section className="border-t border-[#e5e7eb] px-6 py-10">
        <div className="mx-auto max-w-[720px]">
          <h3 className="text-[16px] font-semibold">Keep reading</h3>
          <ul className="mt-3 space-y-2 text-[15px]">
            <li>
              <Link href="/how-to-create-invoice" className="text-[#166534] hover:underline">
                How to Create an Invoice — Step-by-Step Guide
              </Link>
            </li>
            <li>
              <Link href="/#features" className="text-[#166534] hover:underline">
                Invoala Features
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-[#166534] hover:underline">
                Frequently Asked Questions
              </Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-[#f3f4f6] px-6 py-10">
        <div className="mx-auto max-w-[1024px] text-center text-[13px] text-[#6b7280]">
          <Link href="/" className="font-bold text-[#111827]">
            Invoala
          </Link>{" "}
          &copy; 2026. Free invoice generator for freelancers.
        </div>
      </footer>
    </div>
  );
}
