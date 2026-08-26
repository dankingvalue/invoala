import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Invoala terms of service.",
};

export default function TermsPage() {
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
        <h1 className="text-[32px] font-extrabold tracking-tight text-ink">Terms of Service</h1>
        <p className="mt-2 text-[13px] text-[#6b7280]">Last updated: August 2026</p>

        <div className="prose mt-8 space-y-6 text-[15px] leading-relaxed text-[#374151]">
          <section>
            <h2 className="text-[18px] font-bold text-ink">1. Acceptance</h2>
            <p>
              By using Invoala, you agree to these terms. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">2. Description of service</h2>
            <p>
              Invoala is an online invoice and quote generator. The free tier allows you to create,
              preview, and download invoices without an account. Paid plans add features like client
              management, invoice history, recurring invoices, and team collaboration.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">3. Your content</h2>
            <p>
              You retain full ownership of all invoices, quotes, and client data you create. We do not
              claim any rights over your content. When you use the service without logging in, your data
              never leaves your browser.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">4. Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account. You must not share your
              credentials. We are not liable for any loss arising from unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">5. Paid plans</h2>
            <p>
              Paid plans are billed in advance on a monthly or yearly basis. You may cancel at any time
              from your dashboard. Cancellation takes effect at the end of the current billing period.
              Lifetime plans are a one-time payment with no recurring charges.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">6. Acceptable use</h2>
            <p>
              You must not use Invoala for any illegal purpose, to generate fraudulent invoices, or to
              abuse the service (e.g., automated scraping, spam). We reserve the right to suspend accounts
              that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">7. Limitation of liability</h2>
            <p>
              Invoala is provided &ldquo;as is&rdquo; without warranties. We are not liable for any
              indirect, incidental, or consequential damages. Our total liability shall not exceed the
              amount you paid us in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">8. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-[18px] font-bold text-ink">9. Contact</h2>
            <p>
              For questions about these terms, email{" "}
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
