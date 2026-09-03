import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser, verificationRequired } from "@/lib/server-auth";
import { getSubscription, isUserPro, isPlan } from "@/lib/billing";
import { getActivePromo } from "@/lib/promo";
import { runRecurringPass } from "@/lib/recurring";
import { ensureLatestRates, ratesForDay } from "@/lib/fx";
import { listInvoices, type InvoiceRow } from "@/lib/data";
import { DashboardClient } from "./DashboardClient";
import { Nav } from "@/components/Nav";
import { TrustStrip } from "@/components/TrustStrip";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; checkout?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const invoices = await listInvoices(user.id);
  const subscription = await getSubscription(user.id);
  const pro = await isUserPro(user.id, user.role);
  const promo = await getActivePromo(user.id).catch(() => null);

  // Lazy recurring trigger: generate any due recurring invoices for this
  // account when the dashboard loads, so Pro users get them even if the
  // daily cron isn't running (free Vercel plans don't support crons).
  if (pro) {
    await runRecurringPass(user.id, 25).catch(() => {});
  }

  // A pricing-page "Get Pro/Teams" button lands here with the chosen term.
  const checkoutPlan =
    typeof params.checkout === "string" && isPlan(params.checkout) ? params.checkout : null;

  // FX: latest snapshot for display-currency conversion + a per-invoice
  // USD factor at the invoice's creation date (nearest stored daily snapshot).
  let fxLatest: Record<string, number> = {};
  let fxInvoice: Record<string, { usd: number; asOf: string; exact: boolean }> = {};
  try {
    fxLatest = await ensureLatestRates();
    const dayCache: Record<string, { rates: Record<string, number>; asOf: string; exact: boolean }> = {};
    for (const inv of invoices) {
      const ccy = inv.currency || "USD";
      if (!ccy || ccy === "USD") {
        fxInvoice[inv.id] = { usd: 1, asOf: "", exact: true };
        continue;
      }
      const day =
        (inv.data?.issueDate as string | undefined) ||
        new Date(inv.created_at).toISOString().slice(0, 10);
      if (!dayCache[day]) {
        dayCache[day] = await ratesForDay(day).catch(() => ({
          rates: { USD: 1 },
          asOf: "",
          exact: false,
        }));
      }
      const entry = dayCache[day];
      const rate = entry.rates[ccy];
      if (typeof rate === "number" && rate > 0) {
        fxInvoice[inv.id] = { usd: 1 / rate, asOf: entry.asOf, exact: entry.exact };
      } else {
        fxInvoice[inv.id] = { usd: 1 / (fxLatest[ccy] ?? 1), asOf: "", exact: false };
      }
    }
  } catch {
    fxLatest = {};
    fxInvoice = {};
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Nav />
      <main className="pt-[72px]">
        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8">
          <DashboardClient
            userId={user.id}
            email={user.email}
            name={user.name}
            timezone={user.timezone}
            emailVerified={user.email_verified}
            initialInvoices={invoices}
            subscription={subscription}
            isPro={pro}
            promo={promo ? { code: promo.code, expires_at: promo.expires_at } : null}
            needsVerification={verificationRequired() && !user.email_verified}
            userRole={user.role}
            fxLatest={fxLatest}
            fxInvoice={fxInvoice}
            initialCheckoutPlan={checkoutPlan}
            initialTab={params.tab || "general"}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e7eb] bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="flex flex-col items-center justify-between gap-4 text-[13px] text-[#6b7280] md:flex-row">
            <div className="flex items-center gap-2 font-bold text-ink">
              <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
                <rect width="64" height="64" rx="14.5" fill="#166534" />
                <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
              </svg>
              Invoala
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="transition-colors hover:text-ink">Home</Link>
              <Link href="/dashboard?tab=general" className="transition-colors hover:text-ink">Dashboard</Link>
              <Link href="/privacy" className="transition-colors hover:text-ink">Privacy</Link>
              <Link href="/terms" className="transition-colors hover:text-ink">Terms</Link>
              <a href="mailto:hello@invoala.com" className="transition-colors hover:text-ink">
                Contact
              </a>
            </nav>
            <p>&copy; 2026 Invoala. All rights reserved.</p>
          </div>
          <div className="pt-5">
            <TrustStrip />
          </div>
        </div>
      </footer>
    </div>
  );
}
