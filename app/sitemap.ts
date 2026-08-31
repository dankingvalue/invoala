import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { TOOLS } from "@/lib/tool-content";
import { TEMPLATES } from "@/lib/template-content";
import { SOLUTIONS } from "@/lib/solution-content";
import { ARTICLES, LEARN_CATEGORIES } from "@/lib/learn-content";
import { COMPARISONS } from "@/lib/compare-content";

const NOW = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages: MetadataRoute.Sitemap["0"][] = [
    { url: SITE_URL, lastModified: NOW, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/invoicing-software`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/online-invoicing`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/invoice-generator`, lastModified: NOW, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/receipt-generator`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/estimate-generator`, lastModified: NOW, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/invoice-maker`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/recurring-invoices`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/invoice-payment-tracking`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/invoice-reminders`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/estimates-and-invoices`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/how-to-create-invoice`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/invoice-template`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/tools`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/templates`, lastModified: NOW, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/industries`, lastModified: NOW, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/learn`, lastModified: NOW, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/compare`, lastModified: NOW, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/pricing`, lastModified: NOW, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/security`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: NOW, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/help`, lastModified: NOW, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: NOW, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: NOW, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookie-policy`, lastModified: NOW, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, lastModified: NOW, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/data-processing`, lastModified: NOW, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/research/invoice-payment-report`, lastModified: NOW, changeFrequency: "monthly", priority: 0.5 },
  ];

  const toolPages = TOOLS.map((tool) => ({
    url: `${SITE_URL}/tools/${tool.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const templatePages = TEMPLATES.map((t) => ({
    url: `${SITE_URL}/templates/${t.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const solutionPages = SOLUTIONS.map((s) => ({
    url: `${SITE_URL}/${s.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const articlePages = ARTICLES.map((a) => ({
    url: `${SITE_URL}/learn/${a.slug}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const categoryPages = LEARN_CATEGORIES.map((c) => ({
    url: `${SITE_URL}/learn/${c.toLowerCase().replace(/ /g, "-")}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const comparisonPages = COMPARISONS.map((c) => ({
    url: `${SITE_URL}${c.slug.startsWith("invoala-vs-") ? `/compare/${c.slug}` : `/${c.slug}`}`,
    lastModified: NOW,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...corePages,
    ...toolPages,
    ...templatePages,
    ...solutionPages,
    ...articlePages,
    ...categoryPages,
    ...comparisonPages,
  ];
}
