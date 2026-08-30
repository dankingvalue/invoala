import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { COMPARISONS_BY_SLUG } from "@/lib/compare-content";
import { ComparePage } from "@/components/seo/ComparePage";

export async function generateMetadata(): Promise<Metadata> {
  const comparison = COMPARISONS_BY_SLUG["best-free-invoicing-software"];
  if (!comparison) return {};
  return pageMetadata({
    title: comparison.metaTitle,
    description: comparison.description,
    path: `/${comparison.slug}`,
    keywords: ["invoicing software", "comparison", "invoice software"],
  });
}

export default function Page() {
  const comparison = COMPARISONS_BY_SLUG["best-free-invoicing-software"];
  return <ComparePage comparison={comparison} />;
}
