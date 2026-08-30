import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { ARTICLES_BY_CATEGORY } from "@/lib/learn-content";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Invoicing Learning Center — Guides & Best Practices | Invoala",
  description:
    "Practical invoicing guides for freelancers and small businesses: getting paid faster, invoices vs receipts, VAT, payment terms, and more.",
  path: "/learn",
  keywords: ["invoicing guide", "invoice tips", "get paid faster", "invoice best practices"],
});

export default function LearnPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Learning Center
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Practical guides on invoicing, payments, taxes, and cash flow —
              written for real businesses, not textbooks.
            </p>
          </section>

          <div className="space-y-12">
            {ARTICLES_BY_CATEGORY.map(({ category, articles }) =>
              articles.length === 0 ? null : (
                <section key={category}>
                  <Link
                    href={`/learn/${category.toLowerCase().replace(/ /g, "-")}`}
                    className="group mb-5 inline-block"
                  >
                    <h2 className="text-[22px] font-extrabold tracking-tight text-[#111827] group-hover:text-[#166534]">
                      {category} <span className="text-[#166534]">&rsaquo;</span>
                    </h2>
                  </Link>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/learn/${article.slug}`}
                        className="group flex flex-col rounded-xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#166534]/40 hover:shadow-md"
                      >
                        <h3 className="text-[16px] font-bold leading-snug tracking-tight text-[#111827] group-hover:text-[#166534]">
                          {article.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-[#6b7280]">
                          {article.description}
                        </p>
                        <span className="mt-3 text-[13px] font-semibold text-[#166534]">
                          Read guide &rsaquo;
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              )
            )}
          </div>

          <section className="mt-16 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">Read it, then do it</h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Every guide ends with the same next step: a professional invoice.
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
