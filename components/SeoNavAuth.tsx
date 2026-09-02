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
      className="hidden text-[14px] font-medium text-[#14532d] hover:underline sm:block"
    >
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
