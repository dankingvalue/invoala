import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { COMPARISONS_BY_SLUG } from "@/lib/compare-content";
import { ComparePage } from "@/components/seo/ComparePage";

export async function generateMetadata(): Promise<Metadata> {
  const comparison = COMPARISONS_BY_SLUG["invoala-vs-xero"];
  if (!comparison) return {};
  return pageMetadata({
    title: comparison.metaTitle,
    description: comparison.description,
    path: "/compare/invoala-vs-xero",
    keywords: ["invoicing software", "comparison", "invoice software"],
  });
}

export default function Page() {
  const comparison = COMPARISONS_BY_SLUG["invoala-vs-xero"];
  return <ComparePage comparison={comparison} />;
}
