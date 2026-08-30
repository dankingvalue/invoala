import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Refund Policy | Invoala",
  description:
    "Invoala's refund policy for Pro, Teams, and Lifetime plans. What's refundable, how to request a refund, and how cancellations work.",
  path: "/refund-policy",
  keywords: ["refund policy", "invoala refunds", "cancel subscription"],
});

export default function RefundPolicyPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">
            Refund Policy
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">
            Last updated: August 2026.
          </p>

          <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#374151]">
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">Free tier</h2>
              <p className="mt-2">
                The invoice generator is free forever. There is nothing to
                refund on the free tier.
              </p>
            </section>
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">Paid plans</h2>
              <p className="mt-2">
                If you cancel a subscription, you keep access until the end of
                the current billing period. You will not be charged again after
                cancellation.
              </p>
              <p className="mt-2">
                If you believe you were charged in error, or a paid feature was
                unusable, email{" "}
                <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                  hello@invoala.com
                </a>{" "}
                within 14 days of the charge and we&rsquo;ll review the refund. One-time
                (Lifetime) purchases are refundable within 14 days of purchase
                if the product hasn&rsquo;t been used in a way that would prejudice
                the refund (per these terms).
              </p>
            </section>
            <section>
              <h2 className="text-[20px] font-bold tracking-tight">How to request a refund</h2>
              <p className="mt-2">
                Email <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">hello@invoala.com</a>{" "}
                with the email on your account, the plan name, and the reason.
                We aim to respond within 3 business days. Full terms are in the{" "}
                <Link href="/terms" className="text-[#166534] hover:underline">Terms of Service</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
