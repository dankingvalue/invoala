import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Policy — How Invoala Uses Cookies",
  description:
    "Invoala's cookie policy: we use essential cookies only, no advertising or tracking cookies. You control consent in the banner.",
  path: "/cookie-policy",
  keywords: ["cookie policy", "invoala cookies", "privacy"],
});

const items = [
  {
    title: "Essential cookies",
    body: "Session cookies keep you signed in. Without them, authentication (including magic links and password logins) can't work. These are strictly necessary and always set.",
  },
  {
    title: "No advertising cookies",
    body: "Invoala does not use advertising or third-party tracking cookies. We never sell data and we don't build advertising profiles.",
  },
  {
    title: "Analytics (optional)",
    body: "If analytics are enabled on the account, measurement scripts load only after you accept the cookie banner — and never before. You can decline and nothing will be tracked.",
  },
  {
    title: "Local storage",
    body: "The invoice generator saves your draft in your browser's local storage so your work isn't lost. This stays on your device and is never transmitted unless you create an account.",
  },
  {
    title: "Managing cookies",
    body: "You can clear cookies and local storage for invoala.com in your browser settings at any time. Clearing them signs you out and removes locally saved drafts.",
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">
            Cookie Policy
          </h1>
          <p className="mt-4 text-[17px] leading-relaxed text-[#6b7280]">
            Last updated: August 2026. This policy explains how invoala.com
            uses cookies and local storage.
          </p>
          <div className="mt-10 space-y-8">
            {items.map((item) => (
              <section key={item.title}>
                <h2 className="text-[20px] font-bold tracking-tight">{item.title}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">{item.body}</p>
              </section>
            ))}
          </div>
          <p className="mt-10 text-[14px] text-[#6b7280]">
            Questions? Email{" "}
            <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
              hello@invoala.com
            </a>{" "}
            or read the{" "}
            <Link href="/privacy" className="text-[#166534] hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
