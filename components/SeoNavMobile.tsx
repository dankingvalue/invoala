"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { label: "Product", href: "/invoicing-software" },
  { label: "Free tools", href: "/tools" },
  { label: "Templates", href: "/templates" },
  { label: "Learn", href: "/learn" },
  { label: "Pricing", href: "/pricing" },
];

// Mobile hamburger for the SEO header. Auth-aware: logged-in users get a
// Dashboard entry instead of Sign in, mirroring the desktop bar.
export function SeoNavMobile() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: { email?: string } } | null) => {
        if (mounted) setSignedIn(!!data?.user?.email);
      })
      .catch(() => {
        if (mounted) setSignedIn(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative md:hidden" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#111827]"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg">
          {signedIn === true ? (
            <>
              <Link
                href="/dashboard?tab=general"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-[14px] font-semibold text-[#14532d]"
              >
                Dashboard
              </Link>
              <div className="my-1 border-t border-[#e5e7eb]" />
            </>
          ) : null}
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] text-[#374151] transition hover:bg-[#f9fafb]"
            >
              {l.label}
            </Link>
          ))}
          <div className="my-1 border-t border-[#e5e7eb]" />
          {signedIn === true ? (
            <Link
              href="/dashboard?tab=billing"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] font-medium text-[#14532d]"
            >
              Upgrade
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-[14px] font-medium text-[#6b7280]"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/invoice-generator"
            onClick={() => setOpen(false)}
            className="block rounded-lg bg-[#14532d] px-4 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Create invoice
          </Link>
        </div>
      ) : null}
    </div>
  );
}
