import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { TEMPLATES } from "@/lib/template-content";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Free Invoice Templates — Edit & Download as PDF | Invoala",
  description:
    "Free, editable invoice templates for freelancers, consultants, photographers, contractors, designers, and more. Fill in, preview, and download a PDF — no sign-up.",
  path: "/templates",
  keywords: ["invoice templates", "free invoice template", "invoice template PDF", "business invoice templates"],
});

export default function TemplatesPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Free Invoice Templates
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              Every template below is a real, working invoice — fill it in,
              preview it live, and download a clean PDF. No account, no
              watermark, no limits.
            </p>
          </section>

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <Link
                key={t.slug}
                href={`/templates/${t.slug}`}
                className="group rounded-xl border border-[#e5e7eb] bg-white p-6 transition hover:border-[#166534]/40 hover:shadow-md"
              >
                <h2 className="text-[18px] font-bold tracking-tight text-[#111827] group-hover:text-[#166534]">
                  {t.name}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
                  {t.description}
                </p>
                <span className="mt-3 inline-block text-[14px] font-semibold text-[#166534]">
                  Open template &rsaquo;
                </span>
              </Link>
            ))}
          </section>

          <section className="mt-16 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">None of these fit?</h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Start from a blank invoice and build your own layout in minutes.
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
