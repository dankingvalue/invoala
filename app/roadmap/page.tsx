import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";
import { RoadmapBoard } from "@/components/RoadmapBoard";

export const metadata: Metadata = pageMetadata({
  title: "Roadmap",
  description:
    "See what we're building next at Invoala — planned features, what's in progress, and what's shipped. Suggest an idea or vote on one.",
  path: "/roadmap",
  keywords: ["invoala roadmap", "feature requests", "product feedback"],
});

export default function RoadmapPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-12 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">
              What we&apos;re building
            </h1>
            <p className="mx-auto mt-5 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              A live look at what&apos;s planned, in progress, and shipped — plus a place to tell us
              what you actually need.
            </p>
          </section>
          <RoadmapBoard />
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
