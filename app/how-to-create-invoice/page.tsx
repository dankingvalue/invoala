import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Create an Invoice — Step-by-Step Guide",
  description:
    "Learn how to create a professional invoice in minutes. Free step-by-step guide with examples for freelancers, contractors, and small businesses.",
  keywords: [
    "how to create an invoice",
    "how to make an invoice",
    "invoice tutorial",
    "create invoice online",
    "freelance invoice guide",
  ],
  alternates: { canonical: "https://www.invoala.com/how-to-create-invoice" },
  openGraph: {
    title: "How to Create an Invoice — Step-by-Step Guide",
    description:
      "Learn how to create a professional invoice in minutes. Free step-by-step guide for freelancers.",
    url: "https://www.invoala.com/how-to-create-invoice",
  },
};

const steps = [
  {
    step: 1,
    title: "Add Your Business Details",
    content:
      "Start with your name or business name, address, and contact information. This goes at the top of the invoice so your client knows exactly who to pay. If you have a logo, add it here — it makes your invoice look more professional and helps clients recognize your brand.",
    tip: "Save these details once and they auto-fill on every future invoice.",
  },
  {
    step: 2,
    title: "Enter Client Information",
    content:
      "Add your client's name, email, and address. This is usually the person or company who hired you. If you work with the same clients repeatedly, save them as a contact so you never have to re-type their details.",
    tip: "Double-check the client name — invoices addressed to the wrong person delay payment.",
  },
  {
    step: 3,
    title: "Add Line Items",
    content:
      "List each service or product you're billing for. Include a description, quantity, and unit price. For example: 'Website design — 40 hours × $75/hr'. Keep descriptions clear so your client understands exactly what they're paying for.",
    tip: "Be specific. 'Design work' is vague. 'Homepage wireframe and mockup' gets you paid faster.",
  },
  {
    step: 4,
    title: "Set Tax and Currency",
    content:
      "If your jurisdiction requires sales tax, VAT, or GST, add the percentage and the tool calculates the total automatically. Choose from 154 world currencies — the invoice formats the symbol and decimals for you.",
    tip: "Not sure about tax? Most freelancers don't charge VAT until they register for it. Check your local rules.",
  },
  {
    step: 5,
    title: "Add Payment Terms",
    content:
      "Specify when the payment is due — Net 15, Net 30, or on receipt. You can also include your preferred payment method (bank transfer, PayPal, Stripe) and any late fee policies.",
    tip: "Net 15 gets you paid faster than Net 30. Many clients won't push back if you set clear terms upfront.",
  },
  {
    step: 6,
    title: "Download and Send",
    content:
      "Click download to get a clean, print-ready A4 PDF. Attach it to an email, send via your invoicing platform, or hand it over in person. The PDF looks the same on every device and prints perfectly.",
    tip: "Send the invoice within 24 hours of completing the work. The faster you bill, the faster you get paid.",
  },
];

export default function HowToCreateInvoice() {
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
          <p className="text-[14px] font-medium text-[#166534]">Guide</p>
          <h1 className="mt-3 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
            How to Create an Invoice
          </h1>
          <p className="mt-4 text-[18px] leading-relaxed text-[#6b7280]">
            A step-by-step guide to creating professional invoices that get you paid
            faster. No jargon, no fluff — just the exact process.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-[720px]">
          {steps.map((s) => (
            <div key={s.step} className="mb-12 border-l-2 border-[#e5e7eb] pl-8">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#166534] text-[14px] font-bold text-white">
                  {s.step}
                </span>
                <h2 className="text-[22px] font-bold tracking-tight">{s.title}</h2>
              </div>
              <p className="mt-3 text-[16px] leading-relaxed text-[#374151]">
                {s.content}
              </p>
              <div className="mt-3 rounded-lg bg-[#f0fdf4] px-4 py-3 text-[14px] text-[#166534]">
                <span className="font-semibold">Tip:</span> {s.tip}
              </div>
            </div>
          ))}

          <div className="mt-16 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Ready to create your first invoice?
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Free, instant, no sign-up required.
            </p>
            <Link
              href="/#generate"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Create your invoice
            </Link>
          </div>

          {/* Internal links */}
          <div className="mt-16 border-t border-[#e5e7eb] pt-8">
            <h3 className="text-[16px] font-semibold">Related</h3>
            <ul className="mt-3 space-y-2 text-[15px]">
              <li>
                <Link href="/invoice-template" className="text-[#166534] hover:underline">
                  Invoice Template — Free Download
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
