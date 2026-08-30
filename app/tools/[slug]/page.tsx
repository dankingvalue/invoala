import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMetadata, breadcrumbSchema } from "@/lib/seo";
import { TOOLS, TOOLS_BY_SLUG, type ToolDef } from "@/lib/tool-content";
import { JsonLd, SeoNav, Breadcrumb, FaqSection, CtaBlock, RelatedLinks, SeoFooter } from "@/components/seo/SeoPage";
import { ToolWidget } from "@/components/tools/ToolWidget";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool: ToolDef | undefined = TOOLS_BY_SLUG[slug];
  if (!tool) return {};
  return pageMetadata({
    title: tool.name,
    description: tool.short,
    path: `/tools/${tool.slug}`,
    keywords: [tool.name.toLowerCase(), "free tool", "calculator", "invoice"],
  });
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = TOOLS_BY_SLUG[slug];
  if (!tool) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema([{ label: "Home", href: "/" }, { label: "Free tools", href: "/tools" }, { label: tool.name, href: `/tools/${tool.slug}` }])} />
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Free tools", href: "/tools" },
              { label: tool.name, href: `/tools/${tool.slug}` },
            ]}
          />

          <section className="mb-10">
            <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
              {tool.h1}
            </h1>
            <p className="mx-auto mt-4 max-w-[640px] text-[17px] leading-relaxed text-[#6b7280]">
              {tool.short}
            </p>
          </section>

          <section className="mb-14">
            {tool.kind === "invoice-template-generator" ? (
              <InvoiceGenerator ai={false} preset={{ invoiceNumber: "INV-001" }} />
            ) : (
              <ToolWidget kind={tool.kind} />
            )}
          </section>

          <section className="mb-14">
            <h2 className="text-[28px] font-extrabold tracking-tight">What this tool does</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">{tool.description}</p>
          </section>

          <section className="mb-14">
            <h2 className="text-[28px] font-extrabold tracking-tight">How to use it</h2>
            <ol className="mt-6 space-y-3">
              {tool.howTo.map((step, i) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-[#374151]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#166534] text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-14 rounded-xl bg-[#f3f4f6] p-6">
            <h2 className="text-[18px] font-bold tracking-tight">Worked example</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">{tool.example}</p>
          </section>

          <section className="mb-14">
            <FaqSection items={tool.faqs} />
          </section>

          <section className="mb-14">
            <CtaBlock
              title="Turn the result into a real invoice"
              description="Create a professional PDF from your numbers in under two minutes."
              buttonText="Create an invoice"
              buttonHref="/invoice-generator"
            />
          </section>

          <RelatedLinks title="Related" links={tool.related} />

          <div className="mt-8 text-[14px]">
            <Link href="/tools" className="text-[#166534] hover:underline">
              &larr; All free tools
            </Link>
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
