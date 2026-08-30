import type { CompareDef } from "@/lib/compare-content";
import { breadcrumbSchema } from "@/lib/seo";
import { JsonLd, SeoNav, Breadcrumb, FaqSection, CtaBlock, RelatedLinks, SeoFooter } from "@/components/seo/SeoPage";

export function ComparePage({ comparison }: { comparison: CompareDef }) {
  const path = comparison.slug.startsWith("invoala-vs-")
    ? `/compare/${comparison.slug}`
    : `/${comparison.slug}`;

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Comparisons", href: "/compare" },
          { label: comparison.title, href: path },
        ])}
      />
      <SeoNav />
      <main className="pt-28 pb-16">
        <article className="mx-auto max-w-[820px] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Comparisons", href: "/compare" },
              { label: comparison.title, href: path },
            ]}
          />

          <header className="mb-10">
            <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
              {comparison.title}
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">{comparison.intro}</p>
          </header>

          {comparison.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="text-[24px] font-extrabold tracking-tight">{section.heading}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-[#374151]">{section.body}</p>
              {section.bullets ? (
                <ul className="mt-4 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex gap-3 text-[15px] text-[#374151]">
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                      {b}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="mb-10 rounded-xl bg-[#f3f4f6] p-6">
            <h2 className="text-[18px] font-bold tracking-tight">The verdict</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">{comparison.verdict}</p>
          </section>

          <section className="mb-10">
            <FaqSection items={comparison.faqs.map((f) => ({ question: f.question, answer: f.answer }))} />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Stop comparing, start billing"
              description="Send your first invoice in under two minutes — free, no sign-up."
              buttonText="Create an invoice"
              buttonHref="/invoice-generator"
            />
          </section>

          <RelatedLinks title="Keep reading" links={comparison.related} />
        </article>
      </main>
      <SeoFooter />
    </>
  );
}
