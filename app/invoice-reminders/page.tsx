/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice Reminders — Automated Follow-Ups That Get You Paid",
  description:
    "Send smart invoice reminders to get paid faster. Write friendly, firm, or final follow-ups with ready-to-use templates and timing strategies.",
  keywords: [
    "invoice reminders",
    "payment reminders",
    "follow up invoice",
    "late payment",
    "invoice follow up template",
  ],
  alternates: {
    canonical: "https://www.invoala.com/invoice-reminders",
  },
  openGraph: {
  title: "Invoice Reminders — Automated Follow-Ups That Get You Paid",
    description:
      "Send smart invoice reminders to get paid faster. Write friendly, firm, or final follow-ups with ready-to-use templates.",
    url: "https://www.invoala.com/invoice-reminders",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What are invoice reminders?",
    a: "Invoice reminders are follow-up messages sent to clients when an invoice is approaching its due date, is overdue, or needs attention. They prompt the client to review and pay the outstanding bill.",
  },
  {
    q: "When should I send an invoice reminder?",
    a: "Send a friendly reminder 1–2 days before the due date, a follow-up on the due date, a firmer message 3–7 days overdue, and a final notice at 14–30 days overdue. The key is to escalate tone gradually.",
  },
  {
    q: "How do I write an effective invoice reminder?",
    a: "Keep it short, professional, and specific. Include the invoice number, amount, due date, and a direct call to action. Start friendly, then escalate the tone as the invoice becomes more overdue.",
  },
  {
    q: "Are late payment reminders unprofessional?",
    a: "Not at all. Professional reminders show you take your business seriously. Clients expect follow-ups, and sending them promptly actually reinforces your credibility. Silence is what's unprofessional.",
  },
  {
    q: "Can I automate invoice reminders?",
    a: "Yes. Invoala lets you set up automatic reminders that trigger based on your schedule — before the due date, on the due date, and at intervals after it becomes overdue.",
  },
  {
    q: "What should I do if a client still doesn't pay after reminders?",
    a: "If multiple reminders have been ignored, escalate with a final written notice, consider pausing services, add late payment fees per your terms, or seek professional collections advice for larger amounts.",
  },
  {
    q: "How many reminders should I send before escalating?",
    a: "A typical sequence is 3–4 reminders: a friendly pre-due notice, a due-date reminder, a firm overdue notice, and a final demand. After that, consider collections or legal options depending on the amount.",
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

export default function InvoiceRemindersPage() {
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
              Invoice Reminders — Get Paid Faster
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Sending the invoice is step one. Following up is what actually gets
              you paid. Learn how to write and time invoice reminders that bring
              in revenue without damaging client relationships.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Create and send an invoice
              </Link>
              <Link
                href="/invoice-generator"
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                See how it works &rsaquo;
              </Link>
            </div>
          </section>

          {/* What are invoice reminders */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What are invoice reminders?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Invoice reminders are follow-up messages you send to clients
                about outstanding invoices. They can be automated or manual, and
                they serve a simple purpose: keep your invoice visible so it gets
                paid.
              </p>
              <p>
                The problem isn't usually that clients refuse to pay. It's that
                invoices get buried in email threads, forgotten in busy
                inboxes, or simply slip through the cracks. A well-timed reminder
                puts your invoice back on top of the priority list.
              </p>
              <p>
                According to research, businesses that send invoice reminders get
                paid up to 30% faster than those who don't. It's one of the
                highest-leverage activities you can do for your cash flow.
              </p>
            </div>
          </section>

          {/* Why they matter */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Why invoice reminders matter
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Late payments are a cash flow killer. According to industry data:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>62% of invoices</strong> are paid late by small
                    business clients.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    The <strong>average time to payment</strong> is 27–30 days
                    for freelancers.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>89% of businesses</strong> send at least one reminder
                    before an invoice is paid.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    Businesses that follow up within 24 hours of the due date
                    see <strong>significantly higher collection rates</strong>.
                  </span>
                </li>
              </ul>
              <p className="mt-4">
                The takeaway: reminders aren't optional. They're a core part of
                getting paid.
              </p>
            </div>
          </section>

          {/* How to write a reminder - 3 templates */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How to write an invoice reminder
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Your reminder tone should escalate based on how overdue the invoice
              is. Here are three templates you can adapt:
            </p>

            {/* Template 1: Friendly */}
            <div className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-[#166534]/10 px-3 py-1 text-[13px] font-semibold text-[#166534]">
                  Template 1
                </span>
                <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                  Friendly reminder (1–2 days before due)
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#6b7280]">
                Subject: Friendly reminder — Invoice #1234 due on [Date]
              </p>
              <div className="mt-3 rounded-lg bg-[#f3f4f6] p-4 text-[14px] leading-relaxed text-[#374151]">
                <p>Hi [Client Name],</p>
                <p className="mt-2">
                  Just a quick heads-up that Invoice #1234 for [amount] is due on
                  [date]. You can pay via [payment method] or let me know if you
                  have any questions.
                </p>
                <p className="mt-2">Thanks for your business!</p>
                <p className="mt-2">[Your Name]</p>
              </div>
            </div>

            {/* Template 2: Firm */}
            <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-yellow-100 px-3 py-1 text-[13px] font-semibold text-yellow-700">
                  Template 2
                </span>
                <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                  Firm follow-up (3–7 days overdue)
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#6b7280]">
                Subject: Invoice #1234 — Payment is now overdue
              </p>
              <div className="mt-3 rounded-lg bg-[#f3f4f6] p-4 text-[14px] leading-relaxed text-[#374151]">
                <p>Hi [Client Name],</p>
                <p className="mt-2">
                  I'm following up on Invoice #1234 for [amount], which was due
                  on [date]. It's now [X] days past due. Please process payment
                  at your earliest convenience.
                </p>
                <p className="mt-2">
                  If you've already sent payment, please disregard this message
                  and let me know so I can update my records.
                </p>
                <p className="mt-2">Best regards,</p>
                <p className="mt-2">[Your Name]</p>
              </div>
            </div>

            {/* Template 3: Final */}
            <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white p-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-full bg-red-100 px-3 py-1 text-[13px] font-semibold text-red-700">
                  Template 3
                </span>
                <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                  Final notice (14–30 days overdue)
                </h3>
              </div>
              <p className="text-[15px] leading-relaxed text-[#6b7280]">
                Subject: Final notice — Invoice #1234 is seriously overdue
              </p>
              <div className="mt-3 rounded-lg bg-[#f3f4f6] p-4 text-[14px] leading-relaxed text-[#374151]">
                <p>Hi [Client Name],</p>
                <p className="mt-2">
                  This is my final follow-up regarding Invoice #1234 for [amount],
                  which is now [X] days overdue. Payment was due on [date].
                </p>
                <p className="mt-2">
                  If payment is not received by [final deadline], I may need to
                  pause services and apply late payment fees as outlined in our
                  agreement.
                </p>
                <p className="mt-2">
                  Please resolve this at your earliest convenience. I'm happy to
                  discuss a payment plan if needed.
                </p>
                <p className="mt-2">Regards,</p>
                <p className="mt-2">[Your Name]</p>
              </div>
            </div>
          </section>

          {/* Timing */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              When to send each reminder
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  timing: "1–2 days before",
                  tone: "Friendly",
                  desc: "A gentle heads-up. Remind them the invoice is coming due and provide payment instructions.",
                },
                {
                  timing: "On the due date",
                  tone: "Neutral",
                  desc: "A same-day reminder. Confirm the invoice is due today and offer to answer questions.",
                },
                {
                  timing: "3–7 days overdue",
                  tone: "Firm",
                  desc: "A clear follow-up. State the amount, the due date, and request immediate payment.",
                },
                {
                  timing: "14–30 days overdue",
                  tone: "Final",
                  desc: "A last warning. Set a final deadline, mention consequences, and offer to discuss payment.",
                },
              ].map((item) => (
                <div
                  key={item.timing}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <p className="text-[13px] font-semibold text-[#166534]">
                    {item.timing}
                  </p>
                  <h3 className="mt-2 text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.tone} tone
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Invoice reminder features
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Automated scheduling",
                  desc: "Set up reminder sequences that trigger automatically based on your preferred timeline.",
                },
                {
                  title: "Customizable templates",
                  desc: "Write reminders in your own voice. Customize the tone, language, and details for each client.",
                },
                {
                  title: "Overdue tracking",
                  desc: "See at a glance which invoices are overdue and how many days past due, so you can prioritize follow-ups.",
                },
                {
                  title: "Multiple channels",
                  desc: "Send reminders via email, or use the dashboard to track when you've followed up and what the client's response was.",
                },
                {
                  title: "Escalation rules",
                  desc: "Define your own escalation path — when to escalate from friendly to firm, and when to send a final notice.",
                },
                {
                  title: "Payment status updates",
                  desc: "When a client pays, the status updates instantly and the reminder sequence stops automatically.",
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
              Stop chasing payments manually
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Create invoices, set up reminders, and get paid faster — all for
              free with Invoala.
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
                <Link href="/invoice-payment-tracking" className="text-[#166534] hover:underline">
                  Invoice Payment Tracking
                </Link>
              </li>
              <li>
                <Link href="/recurring-invoices" className="text-[#166534] hover:underline">
                  Recurring Invoices
                </Link>
              </li>
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
