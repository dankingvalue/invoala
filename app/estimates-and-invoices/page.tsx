/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { SeoFooter } from "@/components/seo/SeoPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Estimates and Invoices — What's the Difference? | Invoala",
  description:
    "Understand the difference between estimates and invoices, when to use each, and how to convert an estimate into a professional invoice with Invoala.",
  keywords: [
    "estimate vs invoice",
    "invoice vs estimate",
    "proforma invoice",
    "quote vs invoice",
    "estimate vs quote",
  ],
  alternates: {
    canonical: "https://invoala.com/estimates-and-invoices",
  },
  openGraph: {
    title: "Estimates and Invoices — What's the Difference? | Invoala",
    description:
      "Understand the difference between estimates and invoices, when to use each, and how to convert an estimate into a professional invoice.",
    url: "https://invoala.com/estimates-and-invoices",
    siteName: "Invoala",
    type: "website",
  },
};

const faqs = [
  {
    q: "What is the difference between an estimate and an invoice?",
    a: "An estimate is a non-binding price quote given to a client before work begins. It outlines expected costs but doesn't request payment. An invoice is a formal request for payment sent after the work is completed or during the billing cycle.",
  },
  {
    q: "Is an estimate a legally binding document?",
    a: "No. Estimates are projections, not commitments. They give clients a ballpark cost but aren't enforceable contracts. Invoices, however, represent a binding obligation to pay for services or goods delivered.",
  },
  {
    q: "What is a proforma invoice?",
    a: "A proforma invoice is a preliminary bill sent before work is completed. It looks like an invoice but isn't a payment request — it's used for customs, import/export, or to give the client a preview of what the final invoice will look like.",
  },
  {
    q: "When should I send an estimate vs an invoice?",
    a: "Send an estimate before starting work to get client approval on scope and cost. Send an invoice after completing the work (or per agreed milestones) to formally request payment.",
  },
  {
    q: "Can an estimate become an invoice?",
    a: "Yes. Many businesses use estimates as the basis for invoices. Once the client approves the estimate and the work is done, you convert the estimate into an invoice with the final amounts and payment terms.",
  },
  {
    q: "What should be included in an estimate?",
    a: "A clear description of the work, itemized costs, estimated timeline, payment terms, validity period (how long the estimate is good for), and any conditions or exclusions.",
  },
  {
    q: "Do estimates and invoices need different formats?",
    a: "They can use similar formats, but key differences exist. Estimates should clearly state they're non-binding and include a validity date. Invoices must include payment terms, due date, and payment instructions. Invoala handles both.",
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

export default function EstimatesAndInvoicesPage() {
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
              Estimates vs Invoices — What&apos;s the Difference?
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              They look similar but serve very different purposes. An estimate
              gives the client a price before work begins. An invoice requests
              payment after the work is done. Here&apos;s when to use each.
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
                See how it works &rsaquo;
              </Link>
            </div>
          </section>

          {/* What is an estimate */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What is an estimate?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                An estimate (also called a quote or proposal) is a document you
                send to a client before starting work. It outlines what you plan
                to do, how much it will cost, and how long it will take.
              </p>
              <p>
                The key point: an estimate is <strong>not a bill</strong>. It
                doesn&apos;t request payment. It&apos;s a projection of costs that helps the
                client decide whether to move forward with the project.
              </p>
              <p>
                Estimates are common in construction, consulting, freelancing,
                and professional services — anywhere the scope and cost might
                vary depending on the project details.
              </p>
            </div>
          </section>

          {/* What is an invoice */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              What is an invoice?
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                An invoice is a formal request for payment. You send it after
                delivering goods or services to tell the client exactly how much
                they owe and when it&apos;s due.
              </p>
              <p>
                Unlike an estimate, an invoice is a binding document. It creates
                a payment obligation. The client is expected to pay the amount
                listed within the specified timeframe.
              </p>
              <p>
                Invoices typically include payment terms (e.g., Net 30), due
                dates, payment methods, and may include late payment penalties.
                They serve as both a billing document and a legal record.
              </p>
            </div>
          </section>

          {/* Key differences table */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Key differences between estimates and invoices
            </h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left text-[15px]">
                <thead>
                  <tr className="border-b border-[#e5e7eb]">
                    <th className="py-3 pr-4 font-semibold text-[#111827]">
                      Feature
                    </th>
                    <th className="py-3 pr-4 font-semibold text-[#166534]">
                      Estimate
                    </th>
                    <th className="py-3 font-semibold text-[#111827]">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="text-[#374151]">
                  {[
                    {
                      feature: "Purpose",
                      estimate: "Quote a price before work",
                      invoice: "Request payment after work",
                    },
                    {
                      feature: "Legal status",
                      estimate: "Non-binding projection",
                      invoice: "Binding payment obligation",
                    },
                    {
                      feature: "When sent",
                      estimate: "Before the project starts",
                      invoice: "After delivery or per milestones",
                    },
                    {
                      feature: "Payment required?",
                      estimate: "No",
                      invoice: "Yes",
                    },
                    {
                      feature: "Includes due date?",
                      estimate: "No (includes validity period)",
                      invoice: "Yes",
                    },
                    {
                      feature: "Can change?",
                      estimate: "Yes — it's a projection",
                      invoice: "Only with adjustments or credits",
                    },
                    {
                      feature: "Tax treatment",
                      estimate: "No tax obligation",
                      invoice: "Triggers tax reporting",
                    },
                    {
                      feature: "Record keeping",
                      estimate: "Internal reference",
                      invoice: "Financial and legal record",
                    },
                  ].map((row) => (
                    <tr key={row.feature} className="border-b border-[#e5e7eb]">
                      <td className="py-3 pr-4 font-medium">{row.feature}</td>
                      <td className="py-3 pr-4">{row.estimate}</td>
                      <td className="py-3">{row.invoice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* When to use each */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              When to use each document
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="text-[17px] font-bold tracking-tight text-[#166534]">
                  Use an estimate when:
                </h3>
                <ul className="mt-3 space-y-2 text-[15px] text-[#6b7280]">
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>The client asks "how much will this cost?"</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>You need approval before starting work</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>The project scope is still being defined</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>You&apos;re competing for the project with other providers</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>The final cost may vary based on actual hours or materials</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-[17px] font-bold tracking-tight text-[#111827]">
                  Use an invoice when:
                </h3>
                <ul className="mt-3 space-y-2 text-[15px] text-[#6b7280]">
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>You&apos;ve completed the work or delivered the product</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>You need to collect payment from the client</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>A milestone has been reached in a multi-phase project</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>You need to create a financial record for tax purposes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    <span>Payment terms and due dates need to be formalized</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* How estimates convert to invoices */}
          <section className="mb-20">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              How estimates convert to invoices
            </h2>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <p>
                In many businesses, the estimate-to-invoice workflow is the
                standard process. Here&apos;s how it typically works:
              </p>
              <div className="mt-8 grid gap-12 sm:grid-cols-3">
                {[
                  {
                    n: "01",
                    title: "Send the estimate",
                    desc: "You send the client a detailed estimate with line items, costs, and a validity period. The client reviews and approves.",
                  },
                  {
                    n: "02",
                    title: "Do the work",
                    desc: "You deliver the agreed-upon service or product. If the scope changes, you may send an updated estimate for approval.",
                  },
                  {
                    n: "03",
                    title: "Convert to invoice",
                    desc: "Once the work is complete, you convert the approved estimate into a formal invoice — adding payment terms, due dates, and tax.",
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
            </div>
          </section>

          {/* Best practices */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 md:p-12">
            <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
              Best practices for estimates and invoices
            </h2>
            <div className="mt-8 space-y-4 text-[16px] leading-relaxed text-[#374151]">
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Always label documents clearly.</strong> Mark
                    estimates as &quot;Estimate&quot; or &quot;Quote&quot; and invoices as
                    &quot;Invoice&quot; to avoid confusion.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Set a validity period on estimates.</strong> Include
                    &quot;Valid for 30 days&quot; so the client knows when the quote
                    expires and you&apos;re protected from scope creep.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Get estimates approved in writing.</strong> A verbal
                    &quot;go ahead&quot; isn&apos;t enough. Require a signed estimate or
                    written confirmation before starting work.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Itemize everything on invoices.</strong> Break down
                    each service or product with its own line item. Transparency
                    reduces disputes and speeds up payment.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Use consistent numbering.</strong> Maintain separate
                    numbering sequences for estimates (EST-001) and invoices
                    (INV-001) for easy tracking.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  <span>
                    <strong>Keep estimates on file.</strong> Even after converting
                    to an invoice, keep the original estimate for reference in
                    case of scope or pricing disputes.
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-20 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">
              Create professional estimates and invoices
            </h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Use Invoala to send polished estimates and convert them into
              invoices when the work is done. Free, no sign-up required.
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
                <Link href="/online-invoicing" className="text-[#166534] hover:underline">
                  Online Invoicing
                </Link>
              </li>
              <li>
                <Link href="/how-to-create-invoice" className="text-[#166534] hover:underline">
                  How to Create an Invoice
                </Link>
              </li>
              <li>
                <Link href="/invoice-template" className="text-[#166534] hover:underline">
                  Invoice Templates
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
