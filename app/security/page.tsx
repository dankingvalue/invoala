import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SeoNav, SeoFooter } from "@/components/seo/SeoPage";

export const metadata: Metadata = pageMetadata({
  title: "Security — How Invoala Protects Your Data",
  description:
    "How Invoala keeps your invoices and client data safe: encrypted sessions, secure password hashing, private-by-default storage, and HTTPS everywhere.",
  path: "/security",
  keywords: ["invoala security", "invoice data privacy", "secure invoicing"],
});

const items = [
  {
    title: "HTTPS everywhere",
    body: "All traffic to Invoala is encrypted in transit with TLS, and HSTS is enabled so browsers refuse plain-HTTP connections.",
  },
  {
    title: "Private by default",
    body: "The generator stores your data in your browser until you create an account. Account data lives in your private dashboard only — never in search results or public pages.",
  },
  {
    title: "Secure authentication",
    body: "Passwords are hashed with scrypt and per-user salts, sessions use signed, HttpOnly cookies, and login endpoints are rate limited.",
  },
  {
    title: "Storage",
    body: "Account data is stored in a managed SQLite database (Turso) over encrypted connections. Databases are protected by access tokens that live only in server-side environment variables.",
  },
  {
    title: "Shared invoices",
    body: "Invoice share links require a secure token and expose only the specific invoice you choose to share — nothing else.",
  },
  {
    title: "No trackers",
    body: "Invoala does not use advertising trackers. Analytics, if enabled, are opt-in via our cookie consent and never sold.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <SeoNav />
      <main className="pt-28 pb-16">
        <div className="mx-auto max-w-[820px] px-6">
          <section className="mb-14">
            <h1 className="text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[56px]">
              Security
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-[#374151]">
              Invoicing data is financial data. Here&rsquo;s how we protect it.
            </p>
          </section>

          <section className="mb-14 grid gap-6 sm:grid-cols-2">
            {items.map((item) => (
              <div key={item.title} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
                <h2 className="text-[17px] font-bold tracking-tight text-[#111827]">{item.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">{item.body}</p>
              </div>
            ))}
          </section>

          <section className="mb-14">
            <h2 className="text-[24px] font-extrabold tracking-tight">Your responsibilities</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[#374151]">
              Use a strong, unique password for your Invoala account, and don&rsquo;t
              share invoice links beyond the people who should see them. See our{" "}
              <Link href="/privacy" className="text-[#166534] hover:underline">Privacy Policy</Link>{" "}
              and{" "}
              <Link href="/terms" className="text-[#166534] hover:underline">Terms of Service</Link>{" "}
              for the full picture.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-[24px] font-extrabold tracking-tight">Report a vulnerability</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-[#374151]">
              Found a security issue? Email{" "}
              <a href="mailto:hello@invoala.com" className="text-[#166534] hover:underline">
                hello@invoala.com
              </a>{" "}
              — we take reports seriously and respond promptly.
            </p>
          </section>
        </div>
      </main>
      <SeoFooter />
    </>
  );
}
