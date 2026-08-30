import type { Metadata } from "next";
import Link from "next/link";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";
import { SOLUTIONS } from "@/lib/solution-content";

export const metadata: Metadata = {
  title: "Invoicing by Industry — Solutions for Every Trade | Invoala",
  description:
    "Invoicing guides built for your industry: freelancers, contractors, agencies, consultants, photographers, and more. See common billing models and recommended invoice fields.",
  keywords: [
    "invoicing by industry",
    "freelancer invoicing",
    "contractor invoicing",
    "agency invoicing",
    "consultant invoicing",
  ],
  alternates: {
    canonical: "https://invoala.com/industries",
  },
};

export default function IndustriesPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
      <div className="mx-auto max-w-[1024px] px-6">
        <section className="mb-14 text-center">
          <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
            Invoicing for your industry
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] text-[17px] leading-relaxed text-[#6b7280]">
            Every trade bills differently. Pick your industry to see the billing
            models, invoice fields, and templates that fit how you actually work.
          </p>
        </section>

        <section className="grid gap-5 sm:grid-cols-2">
          {SOLUTIONS.map((s) => (
            <Link
              key={s.slug}
              href={`/${s.slug}`}
              className="group rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:border-[#166534]/40 hover:shadow-md"
            >
              <h2 className="text-[18px] font-bold tracking-tight text-[#111827] group-hover:text-[#166534]">
                {s.name}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                {s.description}
              </p>
              <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                View guide &rsaquo;
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-14 rounded-xl bg-[#f3f4f6] p-8 text-center">
          <h2 className="text-[24px] font-bold tracking-tight">
            Not listed? The generator works for any trade.
          </h2>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            Pick the closest template and adjust it in seconds — or start from a
            blank invoice.
          </p>
          <Link
            href="/invoice-generator"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Create invoice
          </Link>
        </section>
      </div>
    </main>
    <SeoFooter />
  </>
  );
}
