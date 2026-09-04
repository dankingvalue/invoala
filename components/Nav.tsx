import { getCurrentUser, getImpersonatorAdmin } from "@/lib/server-auth";
import { NavAuthActions, NavAuthLinks, MobileMenuButton } from "./NavAuth";
import { ImpersonationBar } from "./ImpersonationBar";
import Link from "next/link";

export async function Nav() {
  const [user, impersonator] = await Promise.all([getCurrentUser(), getImpersonatorAdmin()]);

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#e5e7eb] bg-white">
      <nav className="mx-auto flex h-full max-w-[1400px] items-center px-5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14.5" fill="#166534" />
            <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
          </svg>
          <span className="text-[17px] font-bold tracking-tight text-ink">
            Invoala
          </span>
        </Link>

        {user ? (
          <>
            {/* A real flex-1 layout item, not an absolutely-centered overlay —
                it shares space with the logo and account cluster instead of
                floating over them, so it can't visually collide the way an
                absolute/translate-centered nav can at in-between widths.
                Carries both the marketing links (routed back to their anchor
                on the homepage, since a bare #hash would just scroll the
                current dashboard page) and the app's own sections, so a
                logged-in user still has a way back to Pricing/FAQ/etc.
                without opening the account menu. Tighter gap/text than the
                logged-out nav so all 8 links plus the divider still fit
                without wrapping into the Upgrade/Account cluster. */}
            <nav className="hidden flex-1 items-center justify-center gap-5 text-[13px] font-medium xl:flex">
              <Link href="/#features" className="text-subtle transition-colors hover:text-ink">
                Features
              </Link>
              <Link href="/#how" className="text-subtle transition-colors hover:text-ink">
                How it works
              </Link>
              <Link href="/pricing" className="text-subtle transition-colors hover:text-ink">
                Pricing
              </Link>
              <Link href="/#faq" className="text-subtle transition-colors hover:text-ink">
                FAQ
              </Link>
              <span className="h-4 w-px bg-[#e5e7eb]" />
              <Link href="/dashboard?tab=general" className="text-subtle transition-colors hover:text-ink">
                Dashboard
              </Link>
              <Link href="/dashboard?tab=documents" className="text-subtle transition-colors hover:text-ink">
                Documents
              </Link>
              <Link href="/dashboard?tab=clients" className="text-subtle transition-colors hover:text-ink">
                Clients
              </Link>
              <Link href="/dashboard?tab=general" className="text-subtle transition-colors hover:text-ink">
                Settings
              </Link>
            </nav>
            <div className="ml-auto flex shrink-0 items-center gap-3 xl:ml-0">
              <NavAuthActions role={user.role} />
              <MobileMenuButton role={user.role} />
            </div>
          </>
        ) : (
          <>
            <nav className="hidden flex-1 items-center justify-center gap-8 text-[14px] font-medium md:flex">
              <a href="#features" className="text-subtle transition-colors hover:text-ink">
                Features
              </a>
              <a href="#how" className="text-subtle transition-colors hover:text-ink">
                How it works
              </a>
              <a href="#pricing" className="text-subtle transition-colors hover:text-ink">
                Pricing
              </a>
              <a href="#faq" className="text-subtle transition-colors hover:text-ink">
                FAQ
              </a>
            </nav>
            <div className="ml-auto shrink-0 md:ml-0">
              <NavAuthLinks />
            </div>
          </>
        )}
      </nav>
    </header>
    {user && impersonator ? (
      <ImpersonationBar targetEmail={user.email} adminEmail={impersonator.email} />
    ) : null}
    </>
  );
}
