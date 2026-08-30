import Link from "next/link";
import type { SolutionDef } from "@/lib/solution-content";
import { breadcrumbSchema } from "@/lib/seo";
import { JsonLd, SeoNav, Breadcrumb, FaqSection, CtaBlock, RelatedLinks, SeoFooter } from "@/components/seo/SeoPage";

export function SolutionPage({ solution }: { solution: SolutionDef }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Solutions", href: "/" },
          { label: solution.name, href: `/${solution.slug}` },
        ])}
      />
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: solution.name, href: `/${solution.slug}` },
            ]}
          />

          <section className="mb-12 text-center">
            <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
              Invoicing for {solution.name}
            </h1>
            <p className="mx-auto mt-4 max-w-[680px] text-[17px] leading-relaxed text-[#6b7280]">
              {solution.description}
            </p>
          </section>

          <section className="mb-12">
            <p className="text-[17px] leading-relaxed text-[#374151]">{solution.intro}</p>
          </section>

          {solution.sections.map((section) => (
            <section key={section.heading} className="mb-12">
              <h2 className="text-[26px] font-extrabold tracking-tight">{section.heading}</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">{section.body}</p>
            </section>
          ))}

          <section className="mb-12 rounded-xl bg-[#f3f4f6] p-6">
            <h2 className="text-[18px] font-bold tracking-tight">A typical invoice for this business</h2>
            <ul className="mt-4 space-y-2 text-[15px] text-[#374151]">
              {solution.sampleItems.map((item) => (
                <li key={item.description} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e7eb] pb-2 last:border-0">
                  <span>{item.description}</span>
                  <span className="font-medium text-[#111827]">
                    {item.quantity} × ${item.rate.toFixed(2)} = ${(item.quantity * item.rate).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[26px] font-extrabold tracking-tight">Common challenges</h2>
            <ul className="mt-5 space-y-3">
              {solution.challenges.map((c) => (
                <li key={c} className="flex gap-3 text-[15px] leading-relaxed text-[#374151]">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-[26px] font-extrabold tracking-tight">Checklist for getting paid</h2>
            <ul className="mt-5 space-y-3">
              {solution.checklist.map((c) => (
                <li key={c} className="flex gap-3 text-[15px] leading-relaxed text-[#374151]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-1 shrink-0" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <FaqSection items={solution.faqs} />
          </section>

          <section className="mb-12">
            <CtaBlock
              title={`Start invoicing for your ${solution.name.toLowerCase()} business`}
              description="Create your first professional invoice in under two minutes — free, no sign-up."
              buttonText="Create an invoice"
              buttonHref="/invoice-generator"
            />
          </section>

          <RelatedLinks title="Related" links={solution.related} />

          <div className="mt-8 text-[14px]">
            <Link href="/invoicing-software" className="text-[#166534] hover:underline">
              &larr; Explore invoicing software
            </Link>
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
