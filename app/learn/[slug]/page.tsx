import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMetadata, breadcrumbSchema, articleSchema, type FaqItem } from "@/lib/seo";
import { ARTICLES, ARTICLES_BY_SLUG, LEARN_CATEGORIES, type ArticleDef } from "@/lib/learn-content";
import { JsonLd, SeoNav, Breadcrumb, FaqSection, CtaBlock, RelatedLinks, SeoFooter } from "@/components/seo/SeoPage";

export function generateStaticParams() {
  return [
    ...ARTICLES.map((a) => ({ slug: a.slug })),
    ...LEARN_CATEGORIES.map((c) => ({ slug: c.toLowerCase().replace(/ /g, "-") })),
  ];
}

function isCategory(slug: string): boolean {
  return LEARN_CATEGORIES.some((c) => c.toLowerCase().replace(/ /g, "-") === slug);
}

function categoryLabel(slug: string): string {
  return LEARN_CATEGORIES.find((c) => c.toLowerCase().replace(/ /g, "-") === slug) ?? slug;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (isCategory(slug)) {
    const label = categoryLabel(slug);
    return pageMetadata({
      title: `${label} — Invoicing Guides | Invoala`,
      description: `Practical ${label.toLowerCase()} guides for freelancers and small businesses: invoicing best practices, payment tips, and tax basics.`,
      path: `/learn/${slug}`,
      keywords: [label.toLowerCase(), "invoicing", "invoice guide"],
    });
  }
  const article: ArticleDef | undefined = ARTICLES_BY_SLUG[slug];
  if (!article) return {};
  return pageMetadata({
    title: article.metaTitle,
    description: article.description,
    path: `/learn/${article.slug}`,
    keywords: [article.category.toLowerCase(), "invoicing", "invoice guide"],
    type: "article",
  });
}

export default async function LearnSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (isCategory(slug)) {
    const label = categoryLabel(slug);
    const articles = ARTICLES.filter((a) => a.category === label);
    return (
      <>
        <JsonLd
          data={breadcrumbSchema([
            { label: "Home", href: "/" },
            { label: "Learning Center", href: "/learn" },
            { label, href: `/learn/${slug}` },
          ])}
        />
        <SeoNav />
        <main className="pt-28 pb-16">
          <div className="mx-auto max-w-[1024px] px-6">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Learning Center", href: "/learn" },
                { label, href: `/learn/${slug}` },
              ]}
            />
            <section className="mb-10">
              <h1 className="text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
                {label} Guides
              </h1>
              <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">
                Practical guides on {label.toLowerCase()} for freelancers and small businesses.
              </p>
            </section>
            <section className="grid gap-4 sm:grid-cols-2">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/learn/${article.slug}`}
                  className="group rounded-xl border border-[#e5e7eb] bg-white p-5 transition hover:border-[#166534]/40 hover:shadow-md"
                >
                  <h2 className="text-[16px] font-bold leading-snug tracking-tight text-[#111827] group-hover:text-[#166534]">
                    {article.title}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-[14px] leading-relaxed text-[#6b7280]">
                    {article.description}
                  </p>
                  <span className="mt-3 inline-block text-[13px] font-semibold text-[#166534]">
                    Read guide &rsaquo;
                  </span>
                </Link>
              ))}
            </section>
            <div className="mt-10 text-[14px]">
              <Link href="/learn" className="text-[#166534] hover:underline">
                &larr; All guides
              </Link>
            </div>
          </div>
        </main>
        <SeoFooter />
      </>
    );
  }

  const article = ARTICLES_BY_SLUG[slug];
  if (!article) notFound();

  const faqs: FaqItem[] = article.faqs.map((f) => ({ question: f.question, answer: f.answer }));

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { label: "Home", href: "/" },
          { label: "Learning Center", href: "/learn" },
          { label: article.title, href: `/learn/${article.slug}` },
        ])}
      />
      <JsonLd
        data={articleSchema({
          title: article.title,
          description: article.description,
          path: `/learn/${article.slug}`,
          published: article.published,
          updated: article.updated,
        })}
      />
      <SeoNav />
      <main className="pt-28 pb-16">
        <article className="mx-auto max-w-[820px] px-6">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Learning Center", href: "/learn" },
              { label: article.title, href: `/learn/${article.slug}` },
            ]}
          />

          <header className="mb-10">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-[#166534]">
              {article.category}
            </p>
            <h1 className="mt-2 text-[36px] font-extrabold leading-[1.1] tracking-tight md:text-[48px]">
              {article.title}
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">{article.intro}</p>
            <p className="mt-4 text-[12px] text-[#6b7280]">
              By Invoala Editorial Team · Published {article.published} · Updated {article.updated}
            </p>
          </header>

          {article.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="text-[24px] font-extrabold tracking-tight">{section.heading}</h2>
              <p className="mt-3 text-[16px] leading-relaxed text-[#374151]">{section.body}</p>
            </section>
          ))}

          {article.example ? (
            <section className="mb-10 rounded-xl bg-[#f3f4f6] p-6">
              <h2 className="text-[18px] font-bold tracking-tight">Example</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">{article.example}</p>
            </section>
          ) : null}

          <section className="mb-10">
            <FaqSection items={faqs} />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Put it into practice"
              description="Create a professional invoice in under two minutes — free, no sign-up."
              buttonText="Create an invoice"
              buttonHref="/invoice-generator"
            />
          </section>

          <RelatedLinks title="Keep reading" links={article.related} />

          <div className="mt-8 text-[14px]">
            <Link href="/learn" className="text-[#166534] hover:underline">
              &larr; All guides
            </Link>
          </div>
        </article>
      </main>
      <SeoFooter />
    </>
  );
}
