import { getCurrentUser } from "@/lib/server-auth";
import { NavAuthActions, NavAuthLinks, MobileMenuButton } from "./NavAuth";
import Link from "next/link";

export async function Nav() {
  const user = await getCurrentUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-[#e5e7eb] bg-white">
      <nav className="mx-auto flex h-full max-w-[1400px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
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
            <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-8 text-[14px] font-medium md:flex">
              <Link href="/#features" className="text-subtle transition-colors hover:text-ink">
                Features
              </Link>
              <Link href="/#how" className="text-subtle transition-colors hover:text-ink">
                How it works
              </Link>
              <Link href="/#faq" className="text-subtle transition-colors hover:text-ink">
                FAQ
              </Link>
              <span className="h-4 w-px bg-[#e5e7eb]" />
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
            <div className="flex items-center gap-3">
              <NavAuthActions role={user.role} />
              <MobileMenuButton role={user.role} />
            </div>
          </>
        ) : (
          <>
            <nav className="hidden items-center gap-8 text-[14px] font-medium md:flex">
              <a href="#features" className="text-subtle transition-colors hover:text-ink">
                Features
              </a>
              <a href="#how" className="text-subtle transition-colors hover:text-ink">
                How it works
              </a>
              <a href="#faq" className="text-subtle transition-colors hover:text-ink">
                FAQ
              </a>
            </nav>
            <NavAuthLinks />
          </>
        )}
      </nav>
    </header>
  );
}
