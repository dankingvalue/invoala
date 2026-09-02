"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export function NavAuthActions({ role }: { role: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const adminLink = role === "superadmin" ? "/superadmin" : role === "admin" ? "/admin" : role === "support" ? "/support" : null;

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="hidden items-center gap-3 md:flex">
      <Link
        href="/pricing"
        className="hidden items-center gap-2 rounded-[6px] bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] md:flex"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        Upgrade
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-[13px] font-medium text-ink transition hover:bg-fog"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#166534] text-[11px] font-bold text-white">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <span className="hidden sm:inline">Account</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${menuOpen ? "rotate-180" : ""}`}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {menuOpen ? (
          <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg">
            <Link
              href="/dashboard?tab=general"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Dashboard
            </Link>
            {adminLink && (
              <Link
                href={adminLink}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                {role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Support"}
              </Link>
            )}
            <div className="my-1 border-t border-[#e5e7eb]" />
            <button
              type="button"
              onClick={() => void signOut()}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[#d70015] transition hover:bg-[#fef2f2]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign out
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function NavAuthLinks() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="text-[13px] font-medium text-subtle transition-colors hover:text-ink"
      >
        Sign in
      </Link>
      <a
        href="#generate"
        className="rounded-[6px] bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22]"
      >
        Create invoice
      </a>
    </div>
  );
}

export function MobileMenuButton({ role }: { role: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const adminLink = role === "superadmin" ? "/superadmin" : role === "admin" ? "/admin" : role === "support" ? "/support" : null;

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative md:hidden" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-ink transition hover:bg-fog"
        aria-label="Menu"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg">
          <Link href="/#features" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            Features
          </Link>
          <Link href="/#how" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            How it works
          </Link>
          <Link href="/#faq" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            FAQ
          </Link>
          <div className="my-1 border-t border-[#e5e7eb]" />
          <Link href="/dashboard?tab=general" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold text-[#14532d] transition hover:bg-fog">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14532d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="9" rx="1.5" />
              <rect x="14" y="3" width="7" height="5" rx="1.5" />
              <rect x="14" y="12" width="7" height="9" rx="1.5" />
              <rect x="3" y="16" width="7" height="5" rx="1.5" />
            </svg>
            Dashboard
          </Link>
          <Link href="/dashboard?tab=documents" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            Documents
          </Link>
          <Link href="/dashboard?tab=clients" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            Clients
          </Link>
          <Link href="/dashboard?tab=general" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            Settings
          </Link>
          {adminLink && (
            <Link href={adminLink} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
              {role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Support"}
            </Link>
          )}
          <div className="my-1 border-t border-[#e5e7eb]" />
          <Link href="/pricing" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-[13px] text-ink transition hover:bg-fog">
            Upgrade
          </Link>
          <div className="my-1 border-t border-[#e5e7eb]" />
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[#d70015] transition hover:bg-[#fef2f2]"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
