import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { TEMPLATES, TEMPLATES_BY_SLUG, type TemplateDef } from "@/lib/template-content";
import { JsonLd, SeoNav, Breadcrumb, FaqSection, CtaBlock, RelatedLinks, SeoFooter } from "@/components/seo/SeoPage";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";

export function generateStaticParams() {
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t: TemplateDef | undefined = TEMPLATES_BY_SLUG[slug];
  if (!t) return {};
  return pageMetadata({
    title: t.metaTitle,
    description: t.description,
    path: `/templates/${t.slug}`,
    keywords: [t.name.toLowerCase(), "invoice template", "free invoice"],
  });
}

export default async function TemplatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = TEMPLATES_BY_SLUG[slug];
  if (!t) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Templates", href: "/templates" },
          { label: t.name, href: `/templates/${t.slug}` },
        ])}
      />
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1200px] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Templates", href: "/templates" },
              { label: t.name, href: `/templates/${t.slug}` },
            ]}
          />

          <section className="mb-10 text-center">
            <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
              {t.name}
            </h1>
            <p className="mx-auto mt-4 max-w-[680px] text-[17px] leading-relaxed text-[#6b7280]">
              {t.description} Example amounts are illustrative — replace them
              with your own.
            </p>
          </section>

          <section className="mb-16">
            <InvoiceGenerator preset={t.preset} ai={false} recurringTerms={false} />
          </section>

          <div className="mx-auto max-w-[1024px]">
            <section className="mb-14">
              <h2 className="text-[28px] font-extrabold tracking-tight">When to use this template</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">{t.whenToUse}</p>
            </section>

            <section className="mb-14">
              <h2 className="text-[28px] font-extrabold tracking-tight">Fields to include</h2>
              <ul className="mt-6 space-y-3">
                {t.fields.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-[15px] text-[#374151]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-14 rounded-xl bg-[#f3f4f6] p-6">
              <h2 className="text-[18px] font-bold tracking-tight">Sample line items</h2>
              <ul className="mt-3 space-y-2 text-[15px] text-[#374151]">
                {t.sampleItems.map((item) => (
                  <li key={item.description} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e5e7eb] pb-2 last:border-0">
                    <span>{item.description}</span>
                    <span className="font-medium text-[#111827]">
                      {item.quantity} × ${item.rate.toFixed(2)} = ${(item.quantity * item.rate).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-14">
              <h2 className="text-[28px] font-extrabold tracking-tight">Practical tips</h2>
              <ul className="mt-6 space-y-3">
                {t.tips.map((tip) => (
                  <li key={tip} className="flex gap-3 text-[15px] leading-relaxed text-[#374151]">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#166534]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-14">
              <FaqSection items={t.faqs} />
            </section>

            <section className="mb-14">
              <CtaBlock
                title={`Create your own ${t.name.toLowerCase()}`}
                description="The template above is already loaded — just fill in your details and download."
                buttonText="Create invoice"
                buttonHref="/invoice-generator"
              />
            </section>

            <RelatedLinks title="Related" links={t.related} />
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
