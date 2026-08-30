import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Invoala Invoice Payment Report — Original Research | Invoala",
  description:
    "Invoala's original research on invoice payment behavior: how long invoices really take to be paid, what predicts late payment, and what helps. Methodology published with every release.",
  path: "/research/invoice-payment-report",
  keywords: ["invoice payment statistics", "late payment report", "invoicing research"],
});

export default function ReportPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-[#166534]">
            Research
          </p>
          <h1 className="mt-2 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">
            Invoala Invoice Payment Report
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">
            Original, anonymized research on how small businesses and
            freelancers actually get paid — published openly, with full
            methodology.
          </p>

          <section className="mt-10 rounded-xl bg-[#f3f4f6] p-6">
            <h2 className="text-[18px] font-bold tracking-tight">Status: in preparation</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">
              We&rsquo;re building the dataset now. The first edition will report on
              invoice payment behavior — typical payment times, what predicts
              late payment, and which practices correlate with faster payment —
              drawn from anonymized, aggregated invoice data with the consent
              terms set out in our privacy policy. We will never publish
              anything that identifies a customer or their clients.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[24px] font-extrabold tracking-tight">What the report will include</h2>
            <ul className="mt-4 space-y-3 text-[15px] leading-relaxed text-[#374151]">
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                Average and median payment times by invoice amount, currency, and industry
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                The share of invoices paid late, and by how many days
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                Which invoice practices (payment terms, reminders, itemization) correlate with faster payment
              </li>
              <li className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                Full methodology: sample size, time window, aggregation rules, and limitations
              </li>
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-[24px] font-extrabold tracking-tight">Methodology commitments</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#374151]">
              Every edition is published with the methodology attached: how the
              data was collected, filtered, and aggregated, and what it does and
              doesn&rsquo;t represent. We don&rsquo;t publish statistics we can&rsquo;t explain.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-[24px] font-extrabold tracking-tight">Get notified</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#374151]">
              When the first report is published, it will appear here and be
              linked from the{" "}
              <Link href="/learn" className="text-[#166534] hover:underline">Learning Center</Link>.
              Questions or media inquiries:{" "}
              <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                hello@invoala.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
