import type { Metadata } from "next";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

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

let overrideCache: Record<string, SeoOverride> | null = null;
let overrideCacheAt = 0;
const OVERRIDE_CACHE_TTL = 30_000;

function loadOverrides(): Record<string, SeoOverride> {
  const now = Date.now();
  if (overrideCache && now - overrideCacheAt < OVERRIDE_CACHE_TTL) {
    return overrideCache;
  }
  try {
    const file = join(process.cwd(), "data", "seo-overrides.json");
    if (existsSync(file)) {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as {
        overrides?: SeoOverride[];
      };
      const map: Record<string, SeoOverride> = {};
      for (const o of parsed.overrides ?? []) map[o.path] = o;
      overrideCache = map;
      overrideCacheAt = now;
      return map;
    }
  } catch {}
  overrideCache = {};
  overrideCacheAt = now;
  return overrideCache;
}

export function getSeoOverride(path: string): SeoOverride | undefined {
  return loadOverrides()[path];
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
};

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
  type = "website",
  noIndex = false,
  ogTitle = title,
  ogDescription = description,
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const ogImage = `${DEFAULT_OG_IMAGE}?${new URLSearchParams({
    title: ogTitle,
    description: ogDescription,
  }).toString()}`;

  const override = getSeoOverride(path);

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
    alternates: { canonical: finalCanonical },
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
