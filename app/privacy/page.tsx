import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Invoala privacy policy — how we handle your data.",
  alternates: { canonical: "https://www.invoala.com/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#e5e7eb] px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="24" height="24" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14.5" fill="#166534" />
            <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
          </svg>
          <span className="text-[15px] font-bold text-ink">Invoala</span>
        </Link>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-2 text-[13px] text-[#6b7280]">Last updated: August 2026</p>

        <div className="prose mt-8 space-y-6 text-[15px] leading-relaxed text-[#374151]">
          <section>
            <h2 className="text-[18px] font-bold text-ink">1. Data we collect</h2>
            <p>
              <strong>Account information:</strong> When you create an account, we store your email address,
              name, and password (encrypted). If you sign in via Google, we store your Google ID and profile
              information.
            </p>
            <p className="mt-2">
              <strong>Invoices and clients:</strong> When you create invoices or save clients while logged in,
              this data is stored in our database. When not logged in, all data stays in your browser only.
            </p>
            <p className="mt-2">
              <strong>Billing:</strong> If you subscribe to a paid plan, we store your subscription status and
              plan. Payment processing is handled by Stripe — we never see or store your card number.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">2. How we use your data</h2>
            <p>
              We use your data to provide the Invoala service: generating invoices, managing your account,
              processing payments, and sending transactional emails (verification, password resets, team
              invitations).
            </p>
            <p className="mt-2">
              We do not sell your data. We do not use your data for advertising. We do not track your
              invoice content for any purpose beyond providing the service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">3. Data storage</h2>
            <p>
              Your data is stored on secure servers. We use SQLite as our database engine with encrypted
              connections. Backups are performed regularly.
            </p>
            <p className="mt-2">
              When you use Invoala without logging in, your invoice data is stored only in your browser&apos;s
              local storage and never reaches our servers.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">4. Cookies</h2>
            <p>
              We use a single session cookie (<code>invoala_session</code>) to keep you signed in. This
              cookie is HTTP-only, expires after 30 days, and is not used for tracking.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">5. Third-party services</h2>
            <ul className="list-disc pl-5">
              <li><strong>Payment processor</strong> — billing and subscription management</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Google OAuth</strong> — optional sign-in (if configured)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">6. Your rights</h2>
            <p>
              You can request deletion of your account and all associated data at any time from your
              dashboard settings. You can also export your data by downloading your invoices as PDFs.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">7. Contact</h2>
            <p>
              For privacy-related questions, email us at{" "}
              <a href="mailto:hello@invoala.com" className="text-[#166534] underline">
                hello@invoala.com
              </a>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
