import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SOLUTIONS_BY_SLUG } from "@/lib/solution-content";
import { SolutionPage } from "@/components/seo/SolutionPage";

export const dynamicParams = false;

export async function generateMetadata(): Promise<Metadata> {
  const solution = SOLUTIONS_BY_SLUG["invoicing-for-consultants"];
  if (!solution) return {};
  return pageMetadata({
    title: solution.metaTitle,
    description: solution.description,
    path: `/${solution.slug}`,
    keywords: [solution.name.toLowerCase(), "invoicing", "invoice software"],
  });
}

export default function Page() {
  const solution = SOLUTIONS_BY_SLUG["invoicing-for-consultants"];
  return <SolutionPage solution={solution} />;
}
