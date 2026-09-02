"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Swaps "Sign in" for "Dashboard" once we know the visitor is authenticated.
// Client-side so the ~90 SEO pages that render SeoNav stay statically cached.
export function SeoNavAuth() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

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

  if (signedIn === null) {
    // Match the Sign in link's size so layout doesn't jump.
    return <span className="hidden text-[14px] text-transparent sm:block">Sign in</span>;
  }

  return signedIn ? (
    <Link
      href="/dashboard?tab=general"
      className="hidden items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] font-semibold text-[#14532d] transition hover:border-[#166534] sm:flex"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
      Dashboard
    </Link>
  ) : (
    <Link
      href="/login"
      className="hidden text-[14px] font-medium text-[#6b7280] hover:text-[#111827] sm:block"
    >
      Sign in
    </Link>
  );
}
