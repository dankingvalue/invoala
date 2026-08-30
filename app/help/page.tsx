import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Help Center — Getting Started with Invoala | Invoala",
  description:
    "Answers to common Invoala questions: creating invoices, saving clients, quotes, teams, billing, and getting paid faster.",
  path: "/help",
  keywords: ["invoala help", "invoice help", "how to use invoala"],
});

const helpGroups = [
  {
    title: "Getting started",
    links: [
      { label: "How to create an invoice", href: "/how-to-create-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "Invoice template generator", href: "/tools/invoice-template-generator" },
      { label: "How to send an invoice", href: "/learn/how-to-send-an-invoice" },
    ],
  },
  {
    title: "Accounts & billing",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create an account", href: "/signup" },
      { label: "Pricing and plans", href: "/pricing" },
    ],
  },
  {
    title: "Getting paid",
    links: [
      { label: "Invoice reminders", href: "/invoice-reminders" },
      { label: "Payment tracking", href: "/invoice-payment-tracking" },
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "Late payment calculator", href: "/tools/late-payment-calculator" },
    ],
  },
  {
    title: "Templates & tools",
    links: [
      { label: "Templates library", href: "/templates" },
      { label: "Free tools", href: "/tools" },
      { label: "VAT calculator", href: "/tools/vat-calculator" },
      { label: "Hourly rate calculator", href: "/tools/hourly-rate-calculator" },
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[1024px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Help Center
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-[#6b7280]">
              Quick answers and guides. For anything else, email{" "}
              <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                hello@invoala.com
              </a>{" "}
              or use the live chat in the corner.
            </p>
          </section>

          <section className="grid gap-8 sm:grid-cols-2">
            {helpGroups.map((group) => (
              <div key={group.title} className="rounded-xl border border-[#e5e7eb] bg-white p-6">
                <h2 className="text-[18px] font-bold tracking-tight text-[#111827]">{group.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-[15px] text-[#166534] hover:underline">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="mt-14 rounded-xl bg-[#f3f4f6] p-8 text-center">
            <h2 className="text-[24px] font-bold tracking-tight">Still stuck?</h2>
            <p className="mt-2 text-[16px] text-[#6b7280]">
              Start with the invoice generator — it only takes two minutes.
            </p>
            <Link
              href="/invoice-generator"
              className="mt-6 inline-block rounded-lg bg-[#14532d] px-7 py-3.5 text-[16px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              Create an invoice
            </Link>
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
