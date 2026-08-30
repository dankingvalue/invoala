/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Invoicing Software Comparisons — Find Your Fit | Invoala",
  description:
    "Honest, criteria-based guides to choosing invoicing software — including how Invoala compares and who each category of tool suits best.",
  path: "/compare",
  keywords: ["invoicing software comparison", "best invoicing software", "invoice software vs"],
});

export default function ComparePage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Comparisons, Honestly Done
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Software comparisons are only useful if they're honest. Our guides
              judge tools on the criteria that actually matter for your size of
              business — pricing, invoicing depth, and ease of use.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-[24px] font-extrabold tracking-tight">Our approach</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Criteria-based",
                  body: "We compare on pricing, invoicing features, recurring billing, payment tracking, client management, and ease of use — not on vibes.",
                },
                {
                  title: "Verified, not scraped",
                  body: "We link to official pricing pages instead of quoting numbers we can't verify. Product pages change constantly.",
                },
                {
                  title: "Fit over 'best'",
                  body: "There's no single best tool — there's the right tool for your stage. We say who each product suits and who should skip it.",
                },
              ].map((c) => (
                <div key={c.title} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
                  <h3 className="text-[16px] font-bold tracking-tight text-[#111827]">{c.title}</h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-[24px] font-extrabold tracking-tight">Guides</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Best Invoicing Software",
                  href: "/best-invoicing-software",
                  body: "The landscape in plain terms: accounting suites, invoicing-first tools, and free options — and who each serves.",
                },
                {
                  title: "Best Free Invoicing Software",
                  href: "/best-free-invoicing-software",
                  body: "Genuinely free ways to send invoices — with the fine print called out instead of hidden.",
                },
                {
                  title: "Best Invoicing Software for Freelancers",
                  href: "/best-invoicing-software-for-freelancers",
                  body: "What solo professionals actually need, and where to draw the line before upgrading.",
                },
                {
                  title: "Best Invoicing Software for Small Businesses",
                  href: "/best-invoicing-software-for-small-business",
                  body: "How small businesses should choose — including the upgrade path that doesn't waste money.",
                },
                {
                  title: "Invoala vs QuickBooks",
                  href: "/compare/invoala-vs-quickbooks",
                  body: "Invoicing-first vs full accounting suite: the honest division of labor.",
                },
                {
                  title: "Invoala vs FreshBooks",
                  href: "/compare/invoala-vs-freshbooks",
                  body: "Two service-business tools with very different price points.",
                },
                {
                  title: "Invoala vs Zoho Invoice",
                  href: "/compare/invoala-vs-zoho-invoice",
                  body: "Standalone billing vs a module inside a business suite.",
                },
                {
                  title: "Invoala vs Wave",
                  href: "/compare/invoala-vs-wave",
                  body: "Free options compared — where they overlap and where they diverge.",
                },
                {
                  title: "Invoala vs Xero",
                  href: "/compare/invoala-vs-xero",
                  body: "A full accounting platform vs focused invoicing — who each fits.",
                },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group rounded-xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#166534]/40 hover:shadow-md"
                >
                  <h3 className="text-[16px] font-bold tracking-tight text-[#111827] group-hover:text-[#166534]">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">{c.body}</p>
                  <span className="mt-3 inline-block text-[13px] font-semibold text-[#166534]">
                    Read comparison &rsaquo;
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">Just want to send an invoice?</h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Comparisons are useful — but so is starting. Invoala's generator is free, no sign-up.
            </p>
            <Link
              href="/invoice-generator"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Create an invoice
            </Link>
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
