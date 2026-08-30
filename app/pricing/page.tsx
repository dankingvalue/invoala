import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter, FaqSection, CtaBlock, JsonLd } from "@/components/seo/SeoPage";
import { ProPricing } from "@/components/ProPricing";
import { faqSchema } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — Free Forever, Upgrade When You're Ready | Invoala",
  description:
    "Invoala pricing: a genuinely free invoice generator, plus Pro and Teams plans for saved clients, quotes, and team billing. No credit card required to start.",
  path: "/pricing",
  keywords: ["invoala pricing", "free invoice software", "invoice generator cost"],
});

const faqs = [
  {
    question: "Is Invoala really free?",
    answer:
      "Yes. The invoice generator is free forever: unlimited invoices, professional PDFs, no watermark, no sign-up required. There's no trial that ends.",
  },
  {
    question: "What does the Pro plan add?",
    answer:
      "Pro adds saved client profiles and history, quotes and estimates, multi-business profiles, and priority support. You keep everything in the free tier.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. Subscriptions can be cancelled at any time from your dashboard, and you keep access until the end of the billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Checkout is available once a payment provider is configured for the account. Until then, subscriptions are not charged.",
  },
  {
    question: "Do you offer refunds?",
    answer: "Refunds are handled per the Terms of Service. Contact hello@invoala.com with any billing questions.",
  },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Start free. Upgrade when you need it.
            </h1>
            <p className="mx-auto mt-6 max-w-[640px] text-[18px] leading-relaxed text-[#6b7280]">
              The invoice generator is free forever — no trial, no credit card.
              Pro and Teams plans add power for growing businesses.
            </p>
          </section>

          <section className="mb-16">
            <ProPricing />
          </section>

          <section className="mb-14">
            <FaqSection items={faqs} />
          </section>

          <section className="mb-10">
            <CtaBlock
              title="Try the free generator first"
              description="Create your first invoice in under two minutes — decide on plans later."
              buttonText="Create an invoice"
              buttonHref="/invoice-generator"
            />
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
