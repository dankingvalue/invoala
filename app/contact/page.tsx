import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";
import { ContactForm } from "@/components/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
  title: "Contact Invoala",
  description:
    "Get in touch with Invoala: support, feedback, or partnerships. Email hello@invoala.com or use the live chat in the corner.",
  path: "/contact",
  keywords: ["contact invoala", "invoala support", "invoice help"],
});
}

export default function ContactPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <section className="mb-14 text-center">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Contact us
            </h1>
            <p className="mx-auto mt-6 max-w-[560px] text-[17px] leading-relaxed text-[#6b7280]">
              Signed in? The chat bubble in the corner already knows your account
              — Pro and Lifetime plans get 24/7 priority routing automatically,
              nothing to mention. Otherwise, send us a message below.
            </p>
          </section>

          <section className="mb-14 grid gap-6 sm:grid-cols-2">
            <ContactForm />
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
                <h2 className="text-[17px] font-bold tracking-tight text-[#111827]">Live chat</h2>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Use the chat bubble at the bottom-right of the screen. AI-powered
                  answers are instant; you can ask for a human when you need one.
                  Signed-in Pro and Lifetime customers are routed with priority
                  automatically — the account is already known, so there&apos;s
                  nothing to state.
                </p>
              </div>
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
                <h2 className="text-[17px] font-bold tracking-tight text-[#111827]">Support hours</h2>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  Monday–Friday, 9am–4pm EAT for all users.
                </p>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
                  <Link href="/pricing" className="text-[#166534] hover:underline">
                    Pro or Lifetime
                  </Link>{" "}
                  plans get priority support 24/7.
                </p>
              </div>
              <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
                <h2 className="text-[17px] font-bold tracking-tight text-[#111827]">Prefer email?</h2>
                <p className="mt-2 text-[15px] text-[#6b7280]">
                  <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                    hello@invoala.com
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-[24px] font-extrabold tracking-tight">Common questions</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              <li>
                <Link href="/help" className="text-[#166534] hover:underline">Visit the help center</Link>
              </li>
              <li>
                <Link href="/pricing" className="text-[#166534] hover:underline">Pricing & plans</Link>
              </li>
              <li>
                <Link href="/learn" className="text-[#166534] hover:underline">Guides & best practices</Link>
              </li>
            </ul>
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
