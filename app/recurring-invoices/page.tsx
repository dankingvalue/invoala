import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recurring Invoices — Automate Repetitive Billing",
  description:
    "Set up recurring invoices to automate repetitive billing. Save time, never miss a billing cycle, and get paid on schedule with Invoala's free recurring invoicing.",
  keywords: [
    "recurring invoices",
    "recurring billing",
    "automatic invoices",
    "subscription invoicing",
    "recurring invoice template",
  ],
  alternates: {
    canonical: "https://www.invoala.com/recurring-invoices",
  },
  openGraph: {
    title: "Recurring Invoices — Automate Repetitive Billing",
    description:
      "Set up recurring invoices to automate repetitive billing. Save time, never miss a billing cycle, and get paid on schedule.",
    url: "https://www.invoala.com/recurring-invoices",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What are recurring invoices?",
    a: "Recurring invoices are automatically generated bills sent on a regular schedule — weekly, monthly, quarterly, or annually. Instead of creating the same invoice manually each period, you set it up once and the system handles the rest.",
  },
  {
    q: "How do recurring invoices work?",
    a: "You define the billing frequency (weekly, monthly, quarterly, or yearly), the client details, line items, and amount. The system then creates and sends the invoice automatically on each scheduled date without manual intervention.",
  },
  {
    q: "What types of businesses use recurring invoices?",
    a: "Any business with repeat billing benefits — agencies on retainer, SaaS companies with subscriptions, consultants with ongoing contracts, maintenance providers, coworking spaces, and property managers all rely on recurring invoices.",
  },
  {
    q: "Can I edit a recurring invoice before it goes out?",
    a: "Yes. You can review and modify a recurring invoice before each cycle. If you need to change the amount, add a new line item, or pause the schedule temporarily, you have full control.",
  },
  {
    q: "What happens if a client's payment method expires?",
    a: "Recurring invoicing sends the invoice on schedule regardless of payment method. You'll see the invoice status as overdue and can follow up with the client. If you also use recurring payments, you can configure alerts for failed charges.",
  },
  {
    q: "Are recurring invoices different from subscriptions?",
    a: "They're closely related. Subscriptions typically include automatic payment collection. Recurring invoices are about automatically generating and sending the bill. Invoala focuses on the invoicing side, so you create the bill and decide how to collect payment.",
  },
  {
    q: "Can I set up recurring invoices for free with Invoala?",
    a: "Yes. Invoala's free plan includes recurring invoice scheduling. Set up your client, define the frequency and line items, and let Invoala handle the rest — no credit card required.",
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

export default function RecurringInvoicesPage() {
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
              Recurring Invoices — Automate Repetitive Billing
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Stop sending the same invoice every month. Set up recurring
              invoices once and let Invoala handle the rest — automatically, on
              schedule, every time.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                href="/#generate"
                className="rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Set up recurring invoices
              </Link>
              <Link
                href="/invoice-generator"
                className="text-[16px] font-medium text-[#166534] hover:underline"
              >
                See how it works &rsaquo;
              </Link>
            </div>
          </section>

          {/* What are recurring invoices */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What are recurring invoices?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                Recurring invoices are bills that are automatically generated and
                sent to clients on a set schedule. Instead of manually creating
                the same invoice every week, month, or quarter, you configure it
                once — client details, line items, amounts, and frequency — and
                the system takes care of the rest.
              </p>
              <p>
                Think of it like setting up a subscription for your invoicing.
                Whether you bill a client $500 every month for retainer services
                or $200 every quarter for maintenance, recurring invoices ensure
                you never forget to send a bill or miss a payment cycle.
              </p>
              <p>
                Invoala makes this effortless. Create an invoice, set the
                frequency, and your client receives it on schedule — with no
                manual work on your end.
              </p>
            </div>
          </section>

          {/* Why use them */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Why use recurring invoices?
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              {[
                {
                  title: "Save hours every month",
                  desc: "Manual invoicing for repeat clients is tedious. Recurring invoices eliminate the repetition — set it up once and reclaim your time.",
                },
                {
                  title: "Never miss a billing cycle",
                  desc: "Life gets busy. Recurring invoices ensure you bill on time, every time, so cash flow doesn't suffer from forgotten invoices.",
                },
                {
                  title: "Get paid faster",
                  desc: "When invoices go out automatically, clients receive them sooner. Faster delivery means faster payment and a healthier cash flow.",
                },
                {
                  title: "Reduce human error",
                  desc: "No more copy-pasting line items or miscalculating totals. The system generates an identical invoice with accurate math every cycle.",
                },
                {
                  title: "Improve client experience",
                  desc: "Clients appreciate consistency. When they know exactly when and how they'll be billed, it builds trust and professionalism.",
                },
                {
                  title: "Scale your business",
                  desc: "As your client list grows, recurring invoicing scales with you. Manage 10 or 1,000 recurring clients without adding administrative overhead.",
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

          {/* How they work */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How recurring invoices work
            </h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Recurring invoices operate on a simple schedule. You choose how
              often you want to bill and Invoala handles the generation:
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  freq: "Weekly",
                  desc: "Ideal for ongoing services billed every week — cleaning, maintenance, or hourly consulting with a fixed weekly cap.",
                },
                {
                  freq: "Monthly",
                  desc: "The most common cycle. Perfect for retainer fees, subscriptions, rent, retainers, and ongoing service contracts.",
                },
                {
                  freq: "Quarterly",
                  desc: "Great for seasonal services, quarterly consulting, maintenance contracts, and businesses that prefer fewer but larger invoices.",
                },
                {
                  freq: "Annually",
                  desc: "Best for yearly subscriptions, annual retainers, insurance premiums, and license renewals billed once per year.",
                },
              ].map((item) => (
                <div
                  key={item.freq}
                  className="rounded-xl border border-[#e5e7eb] bg-white p-6"
                >
                  <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                    {item.freq}
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
              Recurring invoice features
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Flexible scheduling",
                  desc: "Choose weekly, monthly, quarterly, or annual billing — or set a custom interval that fits your business.",
                },
                {
                  title: "Client management",
                  desc: "Save client details once. Every recurring invoice pulls from the same client record — no retyping information.",
                },
                {
                  title: "Editable before send",
                  desc: "Review and adjust each invoice before it goes out. Add new line items, change amounts, or skip a cycle.",
                },
                {
                  title: "Automatic PDF generation",
                  desc: "Each cycle produces a professional, print-ready PDF that looks consistent with your brand.",
                },
                {
                  title: "Payment status tracking",
                  desc: "See at a glance which recurring invoices are paid, pending, or overdue across all your clients.",
                },
                {
                  title: "Multiple currencies",
                  desc: "Bill international clients in their currency. Invoala supports 154 currencies with proper formatting.",
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

          {/* Who benefits */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Who benefits from recurring invoices?
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {[
                {
                  title: "Agencies on retainer",
                  desc: "Marketing, design, and development agencies that bill clients a fixed monthly fee for ongoing work. Recurring invoices eliminate the repetitive manual step.",
                },
                {
                  title: "SaaS and subscription businesses",
                  desc: "Software companies billing monthly or annually for access. Recurring invoices keep the billing cycle running without a dedicated billing team.",
                },
                {
                  title: "Consultants and coaches",
                  desc: "Business consultants, life coaches, and advisors with ongoing client relationships. Bill monthly for access, calls, or strategic support.",
                },
                {
                  title: "Maintenance and service providers",
                  desc: "Landscapers, cleaners, HVAC technicians, and property managers who provide regular services on a fixed schedule.",
                },
                {
                  title: "Coworking spaces and rentals",
                  desc: "Workspace providers and property managers billing tenants monthly for desk space, storage, or usage fees.",
                },
                {
                  title: "Freelancers with long-term clients",
                  desc: "Freelancers who work with the same client month after month. Save time by automating the invoice that never changes.",
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

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Automate your billing today
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Set up your first recurring invoice in under two minutes. Free,
              no sign-up required.
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
