import { getSessionUser } from "@/lib/server-auth";
import { TOOLS } from "@/lib/tool-content";
import { TEMPLATES } from "@/lib/template-content";
import { SOLUTIONS } from "@/lib/solution-content";
import { ARTICLES } from "@/lib/learn-content";
import { COMPARISONS } from "@/lib/compare-content";
import { listRedirects } from "@/lib/redirects";

export const dynamic = "force-dynamic";

const CORE_PAGES: { url: string; title: string; type: string; inSitemap: boolean; indexable: boolean }[] = [
  { url: "/", title: "Invoala — Free Invoice Generator for Freelancers", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/invoicing-software", title: "Invoicing Software", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/online-invoicing", title: "Online Invoicing", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/invoice-generator", title: "Free Invoice Generator", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/free-invoice-generator", title: "Free Invoice Generator — No Sign-Up", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/invoice-maker", title: "Invoice Maker", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/recurring-invoices", title: "Recurring Invoices", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/invoice-payment-tracking", title: "Invoice Payment Tracking", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/invoice-reminders", title: "Invoice Reminders", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/estimates-and-invoices", title: "Estimates and Invoices", type: "PRODUCT", inSitemap: true, indexable: true },
  { url: "/how-to-create-invoice", title: "How to Create an Invoice", type: "ARTICLE", inSitemap: true, indexable: true },
  { url: "/invoice-template", title: "Free Invoice Template", type: "TEMPLATE", inSitemap: true, indexable: true },
  { url: "/tools", title: "Free Invoicing Tools", type: "TOOL", inSitemap: true, indexable: true },
  { url: "/templates", title: "Free Invoice Templates", type: "TEMPLATE", inSitemap: true, indexable: true },
  { url: "/learn", title: "Invoicing Learning Center", type: "ARTICLE", inSitemap: true, indexable: true },
  { url: "/compare", title: "Invoicing Software Comparisons", type: "COMPARISON", inSitemap: true, indexable: true },
  { url: "/pricing", title: "Pricing", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/about", title: "About Invoala", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/security", title: "Security", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/contact", title: "Contact", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/help", title: "Help Center", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/privacy", title: "Privacy Policy", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/terms", title: "Terms of Service", type: "LEGAL", inSitemap: true, indexable: true },
  { url: "/dashboard", title: "Dashboard", type: "PRIVATE", inSitemap: false, indexable: false },
  { url: "/login", title: "Sign in", type: "PRIVATE", inSitemap: false, indexable: false },
  { url: "/signup", title: "Create account", type: "PRIVATE", inSitemap: false, indexable: false },
  { url: "/admin", title: "Admin", type: "PRIVATE", inSitemap: false, indexable: false },
  { url: "/superadmin", title: "Super Admin", type: "PRIVATE", inSitemap: false, indexable: false },
  { url: "/support", title: "Support", type: "PRIVATE", inSitemap: false, indexable: false },
];

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const fromRegistry = <T extends { slug: string; metaTitle?: string; name?: string }>(
    items: T[],
    prefix: string,
    type: string
  ) =>
    items.map((item) => ({
      url: `${prefix}/${item.slug}`,
      title: item.metaTitle || item.name || item.slug,
      type,
      inSitemap: true,
      indexable: true,
    }));

  const pages = [
    ...CORE_PAGES,
    ...fromRegistry(TOOLS, "/tools", "TOOL"),
    ...fromRegistry(TEMPLATES, "/templates", "TEMPLATE"),
    ...SOLUTIONS.map((s) => ({
      url: `/${s.slug}`,
      title: s.metaTitle,
      type: "SOLUTION" as const,
      inSitemap: true,
      indexable: true,
    })),
    ...ARTICLES.map((a) => ({
      url: `/learn/${a.slug}`,
      title: a.metaTitle,
      type: "ARTICLE" as const,
      inSitemap: true,
      indexable: true,
    })),
    ...COMPARISONS.map((c) => ({
      url: c.slug.startsWith("invoala-vs-") ? `/compare/${c.slug}` : `/${c.slug}`,
      title: c.metaTitle,
      type: "COMPARISON" as const,
      inSitemap: true,
      indexable: true,
    })),
  ];

  const redirects = await listRedirects(false);

  return Response.json({
    pages,
    redirects,
    sitemapUrl: "https://www.invoala.com/sitemap.xml",
    robotsUrl: "https://www.invoala.com/robots.txt",
    counts: {
      indexable: pages.filter((p) => p.indexable).length,
      inSitemap: pages.filter((p) => p.inSitemap).length,
      private: pages.filter((p) => !p.indexable).length,
      tools: TOOLS.length,
      templates: TEMPLATES.length,
      solutions: SOLUTIONS.length,
      articles: ARTICLES.length,
      comparisons: COMPARISONS.length,
      redirects: redirects.length,
    },
  });
}
