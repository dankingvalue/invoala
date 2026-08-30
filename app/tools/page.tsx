/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { TOOLS } from "@/lib/tool-content";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Free Invoicing Tools & Calculators | Invoala",
  description:
    "Free tools for freelancers and small businesses: invoice number generator, VAT calculator, profit margin calculator, markup calculator, hourly rate calculator, and more.",
  path: "/tools",
  keywords: ["free invoice tools", "invoice calculators", "vat calculator", "profit margin calculator"],
});

export default function ToolsPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Free Invoicing Tools
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Practical tools that do one thing well — no sign-up, no credit
              card. Use them on their own, or move into the invoice generator
              when you're ready.
            </p>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:border-[#166534]/40 hover:shadow-md"
              >
                <h2 className="text-[18px] font-bold tracking-tight text-[#111827] group-hover:text-[#166534]">
                  {tool.name}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">{tool.short}</p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Open tool &rsaquo;
                </span>
              </Link>
            ))}
          </section>

          <section className="mt-16 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">Prefer the real thing?</h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Every tool above feeds into a professional, downloadable invoice.
            </p>
            <Link
              href="/invoice-generator"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Open the invoice generator
            </Link>
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
