import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter, CtaBlock } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "About Invoala — Free Invoicing for Small Business",
  description:
    "Invoala is a free online invoice generator for freelancers and small businesses. Learn what we're building and why we keep the core tool free.",
  path: "/about",
  keywords: ["about invoala", "invoicing for freelancers", "free invoice software"],
});

export default function AboutPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <section className="mb-14">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Invoicing shouldn&rsquo;t be a chore.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-[#374151]">
              Invoala started from a simple observation: freelancers and small
              businesses spend too much time and money turning finished work
              into money. Templates fight you, spreadsheets break, and
              enterprise software charges for features you&rsquo;ll never open.
            </p>
          </section>

          <section className="mb-14">
            <h2 className="text-[26px] font-extrabold tracking-tight">What we&rsquo;re building</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              An invoicing tool that does the job in minutes: fill in the
              details, watch the preview update live, and download a
              professional PDF. No sign-up, no watermark, no invoice limits —
              because the core act of billing should be free.
            </p>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              When you grow — saved clients, quotes, teams, multi-business
              profiles — there are affordable plans for that too. But the
              generator itself stays free forever.
            </p>
          </section>

          <section className="mb-14">
            <h2 className="text-[26px] font-extrabold tracking-tight">How we think about your data</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              If you use the generator without an account, your data stays in
              your browser — nothing is uploaded. Account data is stored
              securely and never sold. See our{" "}
              <Link href="/privacy" className="text-[#166534] hover:underline">Privacy Policy</Link>{" "}
              for details, and our{" "}
              <Link href="/security" className="text-[#166534] hover:underline">Security page</Link>{" "}
              for how we protect it.
            </p>
          </section>

          <section className="mb-14">
            <h2 className="text-[26px] font-extrabold tracking-tight">Contact</h2>
            <p className="mt-4 text-[16px] leading-relaxed text-[#374151]">
              Questions, feedback, or partnership ideas? Email us at{" "}
              <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                hello@invoala.com
              </a>
              .
            </p>
          </section>

          <CtaBlock
            title="See it for yourself"
            description="Create your first invoice in under two minutes — free."
            buttonText="Create an invoice"
            buttonHref="/invoice-generator"
          />
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
