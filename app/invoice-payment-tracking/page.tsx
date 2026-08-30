/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice Payment Tracking — Know Who Owes You | Invoala",
  description:
    "Track every invoice from sent to paid. Know who owes you, when it's due, and what's overdue with Invoala's free invoice payment tracking.",
  keywords: [
    "invoice payment tracking",
    "track invoices",
    "unpaid invoices",
    "invoice tracking",
    "payment tracking software",
  ],
  alternates: {
    canonical: "https://invoala.com/invoice-payment-tracking",
  },
  openGraph: {
    title: "Invoice Payment Tracking — Know Who Owes You | Invoala",
    description:
      "Track every invoice from sent to paid. Know who owes you, when it's due, and what's overdue.",
    url: "https://invoala.com/invoice-payment-tracking",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is invoice payment tracking?",
    a: "Invoice payment tracking is the process of monitoring the status of every invoice you send — whether it's been paid, is still pending, or is overdue. It gives you a clear picture of your outstanding revenue and who owes you money.",
  },
  {
    q: "Why is tracking invoice payments important?",
    a: "Without tracking, invoices can slip through the cracks. You might forget to follow up on an overdue bill, misjudge your cash flow, or lose track of which clients have paid. Tracking keeps your finances organized and your revenue flowing.",
  },
  {
    q: "How do I track invoices without accounting software?",
    a: "You can use a spreadsheet with columns for invoice number, client, amount, date sent, due date, and status. However, spreadsheets require manual updates and are prone to errors. Dedicated invoicing tools like Invoala automate status tracking and give you a real-time dashboard.",
  },
  {
    q: "What should an invoice tracker include?",
    a: "At minimum: invoice number, client name, amount, issue date, due date, and payment status. Advanced trackers also include payment history, overdue alerts, and the ability to filter by status or date range.",
  },
  {
    q: "How does Invoala track invoice payments?",
    a: "When you create an invoice in Invoala, you can mark it as paid, pending, or overdue from the dashboard. The status updates in real time so you always know where your money stands.",
  },
  {
    q: "Can I set up automatic payment reminders?",
    a: "Yes. Invoala lets you configure reminders that notify you when an invoice is approaching its due date or has become overdue, so you can follow up before the payment is late.",
  },
  {
    q: "What is the average time to get paid on an invoice?",
    a: "According to industry data, the average small business waits 27–30 days for invoice payment. Using clear payment terms, early payment discounts, and timely reminders can reduce this significantly.",
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

export default function InvoicePaymentTrackingPage() {
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
              Invoice Payment Tracking — Know Who Owes You
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Stop guessing who's paid and who hasn't. Track every invoice from
              sent to settled so you always know your outstanding revenue and
              never let a payment slip through.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Start tracking invoices
              </Link>
              <Link
                href="/invoice-generator"
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                See how it works &rsaquo;
              </Link>
            </div>
          </section>

          {/* Why track payments */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Why track invoice payments?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Sending an invoice is only half the job. Without tracking, you
                have no visibility into whether it's been paid. You're left
                checking your bank account, wondering if the client forgot, and
                manually counting outstanding amounts.
              </p>
              <p>
                Payment tracking solves this by giving you a real-time dashboard
                of every invoice's status. You can instantly see how much revenue
                is outstanding, which clients are overdue, and what cash to expect
                in the coming weeks.
              </p>
              <p>
                For freelancers and small businesses without a dedicated
                accounts receivable team, this visibility is critical. It
                prevents lost revenue, reduces late follow-ups, and gives you
                the data to make smarter financial decisions.
              </p>
            </div>
          </section>

          {/* Common payment problems */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Common payment tracking problems
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Lost invoices",
                  desc: "Emails get buried, PDFs get lost. Without a central system, invoices fall through the cracks and you never get paid.",
                },
                {
                  title: "No visibility into status",
                  desc: "You send an invoice but have no idea if it was received, opened, or paid until you manually check or ask the client.",
                },
                {
                  title: "Missed follow-ups",
                  desc: "Without reminders, overdue invoices sit for weeks before you notice. The longer you wait, the harder it is to collect.",
                },
                {
                  title: "Cash flow surprises",
                  desc: "You think you're owed $5,000 but really you're owed $8,000 because three invoices slipped through. Inaccurate tracking distorts your financial picture.",
                },
                {
                  title: "Spreadsheet errors",
                  desc: "Manual data entry leads to wrong amounts, wrong dates, and wrong statuses. A single formula mistake can throw off your entire accounts receivable.",
                },
                {
                  title: "No payment history",
                  desc: "When a client disputes an amount or you need to reconcile accounts, you have no record of what was sent or when.",
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

          {/* How to track */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How to track invoice payments
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
                <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                  Spreadsheet method
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                  Create a table with columns for invoice number, client, amount,
                  date sent, due date, and status. Update the status manually as
                  payments come in. This works for very small operations but
                  becomes unmanageable as your client list grows.
                </p>
              </div>
              <div className="rounded-xl border border-[#166534]/20 bg-[#f3f4f6] p-6">
                <h3 className="text-[17px] font-bold tracking-tight text-[#166534]">
                  Dedicated invoicing software
                </h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                  Tools like Invoala automatically track every invoice's status.
                  You create the invoice, and the system shows you whether it's
                  paid, pending, or overdue — no manual updates needed. You get a
                  real-time dashboard of your entire accounts receivable.
                </p>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Payment tracking features
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Status tracking",
                  desc: "Mark invoices as paid, pending, or overdue. See your collection rate at a glance without digging through emails.",
                },
                {
                  title: "Overdue alerts",
                  desc: "Get notified when an invoice passes its due date so you can follow up promptly instead of discovering it weeks later.",
                },
                {
                  title: "Payment history",
                  desc: "See the full lifecycle of every invoice — when it was sent, when it was paid, and any notes from the client.",
                },
                {
                  title: "Client-level view",
                  desc: "See all invoices for a single client in one place. Know if a client has outstanding balances or a history of late payments.",
                },
                {
                  title: "Dashboard overview",
                  desc: "A single view showing total outstanding, overdue, and paid amounts across all your invoices and clients.",
                },
                {
                  title: "PDF record keeping",
                  desc: "Every invoice is saved as a PDF you can download, print, or share — creating a complete paper trail for accounting.",
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

          {/* Tips for getting paid faster */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Tips for getting paid faster
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Tracking payments is essential, but you can also reduce the time
                between sending and receiving payment by following these
                practices:
              </p>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Set clear payment terms.</strong> Include the due
                    date on every invoice (e.g., "Net 15" or "Due within 30
                    days"). Vague terms like "due upon receipt" delay payment.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Send invoices immediately.</strong> Don't wait until
                    the end of the month. The sooner the invoice lands, the
                    sooner the payment clock starts.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Offer early payment discounts.</strong> A 2% discount
                    for payment within 10 days (2/10 Net 30) incentivizes
                    clients to pay quickly.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Follow up promptly.</strong> Send a friendly reminder
                    the day after the due date. The longer you wait, the lower
                    your chances of collecting.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Make payment easy.</strong> Accept multiple payment
                    methods — bank transfer, card, PayPal. The more options you
                    offer, the faster clients can pay.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Track every invoice, get paid faster
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Create an invoice and track its status from sent to paid — all for
              free.
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
                <Link href="/recurring-invoices" className="text-[#166534] hover:underline">
                  Recurring Invoices
                </Link>
              </li>
              <li>
                <Link href="/invoice-reminders" className="text-[#166534] hover:underline">
                  Invoice Reminders
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
