import type { Metadata } from "next";
import { getSeoOverrideAsync } from "@/lib/seo-overrides.server";

export const SITE_URL = "https://www.invoala.com";
export const SITE_NAME = "Invoala";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/api/og`;

export type SeoOverride = {
  path: string;
  seoTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robotsIndex?: boolean;
  robotsFollow?: boolean;
  updatedAt?: number;
};

export function getSeoOverride(path: string): Promise<SeoOverride | undefined> {
  return getSeoOverrideAsync(path);
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  /** hreflang alternates, e.g. { en: "...", es: "...", "x-default": "..." } — see lib/i18n.ts's hreflangAlternates(). */
  hreflang?: Record<string, string>;
  /** BCP 47 locale for og:locale (e.g. "es_ES"). Defaults to English. */
  ogLocale?: string;
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  type = "website",
  noIndex = false,
  ogTitle = title,
  ogDescription = description,
  hreflang,
  ogLocale,
}: PageMetadataInput): Promise<Metadata> {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImage = `${DEFAULT_OG_IMAGE}?${new URLSearchParams({
    title: ogTitle,
    description: ogDescription,
  }).toString()}`;

  const override = await getSeoOverride(path);

  const finalTitle = override?.seoTitle
    ? override.seoTitle.includes(SITE_NAME)
      ? override.seoTitle
      : `${override.seoTitle} | ${SITE_NAME}`
    : fullTitle;
  const finalDescription = override?.metaDescription ?? description;
  const finalCanonical = override?.canonicalUrl ?? canonical;
  const finalOgTitle = override?.ogTitle ?? ogTitle;
  const finalOgDescription = override?.ogDescription ?? ogDescription;
  const finalOgImage = override?.ogImage
    ? /^https?:\/\//.test(override.ogImage)
      ? override.ogImage
      : `${SITE_URL}${override.ogImage}`
    : ogImage;
  const index = override?.robotsIndex === false ? false : !noIndex;
  const follow = override?.robotsFollow === false ? false : true;

  return {
    title: { absolute: finalTitle },
    description: finalDescription,
    keywords,
    alternates: {
      canonical: finalCanonical,
      ...(hreflang ? { languages: hreflang } : {}),
    },
    robots: !index || !follow
      ? { index, follow, noarchive: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type,
      url: finalCanonical,
      siteName: SITE_NAME,
      title: finalTitle,
      description: finalOgDescription,
      images: [{ url: finalOgImage, width: 1200, height: 630, alt: finalOgTitle }],
      ...(ogLocale ? { locale: ogLocale } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalOgDescription,
      images: [finalOgImage],
    },
  };
}

export type BreadcrumbItem = { label: string; href: string };
export type FaqItem = { question: string; answer: string };

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  published: string;
  updated: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.published,
    dateModified: input.updated,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    },
  };
}
