"use client";

import { useEffect, useRef, useState } from "react";

type PublicFlags = {
  aiComposer: boolean;
  printButton: boolean;
  logoUpload: boolean;
  quoteMode: boolean;
  recurringTerms: boolean;
};

const DEFAULT_FLAGS: PublicFlags = {
  aiComposer: true,
  printButton: true,
  logoUpload: true,
  quoteMode: true,
  recurringTerms: true,
};

// Dashboard "Edit"/"Receipt" hand off an invoice to edit via this
// localStorage key, then client-side navigate here. That navigation doesn't
// reliably trigger the hash-scroll needed for the IntersectionObserver below
// to fire, so the generator was staying unmounted — the edit payload sat in
// localStorage, never read, and the user saw a blank form. Computed directly
// as the initial state (not set from an effect) so it mounts immediately on
// first render whenever there's a pending edit, instead of waiting to be
// scrolled into view.
function hasPendingEdit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem("invoala.edit")) return true;
  } catch {
    // ignore
  }
  // Returning from /signup or /login after clicking "Save invoice" while
  // logged out (see InvoiceGenerator's signupHref) — mount immediately so
  // the generator's own autosave-on-return effect can run without first
  // requiring the user to scroll to it or interact with the page.
  try {
    return new URLSearchParams(window.location.search).get("autosave") === "1";
  } catch {
    return false;
  }
}

export function LazyInvoiceGenerator() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(hasPendingEdit);
  const [flags, setFlags] = useState<PublicFlags>(DEFAULT_FLAGS);
  const [user, setUser] = useState<{ email: string; isPro?: boolean } | null>(null);
  const [Comp, setComp] = useState<React.ComponentType<{
    ai: boolean;
    print: boolean;
    allowLogo: boolean;
    quoteMode: boolean;
    recurringTerms: boolean;
    user: { email: string; isPro?: boolean } | null;
  }> | null>(null);

  useEffect(() => {
    fetch("/api/flags-public")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { flags?: Partial<PublicFlags> } | null) => {
        if (data?.flags) setFlags((prev) => ({ ...prev, ...data.flags }));
      })
      .catch(() => {});

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: { email: string }; isPro?: boolean } | null) => {
        if (data?.user?.email) setUser({ email: data.user.email, isPro: !!data.isPro });
      })
      .catch(() => {});

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" }
    );
    if (wrapperRef.current) observer.observe(wrapperRef.current);

    function onInteraction() {
      setShouldMount(true);
      cleanup();
    }
    function cleanup() {
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      observer.disconnect();
    }
    window.addEventListener("scroll", onInteraction, { passive: true });
    window.addEventListener("pointerdown", onInteraction);
    window.addEventListener("keydown", onInteraction);

    return cleanup;
  }, []);

  useEffect(() => {
    if (!shouldMount || Comp) return;
    let mounted = true;
    import("@/components/InvoiceGenerator")
      .then((mod) => {
        if (mounted) setComp(() => mod.InvoiceGenerator);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [shouldMount, Comp]);

  return (
    <div ref={wrapperRef} id="generate" className="scroll-mt-20">
      {Comp ? (
        <Comp
          ai={flags.aiComposer}
          print={flags.printButton}
          allowLogo={flags.logoUpload}
          quoteMode={flags.quoteMode}
          recurringTerms={flags.recurringTerms}
          user={user}
        />
      ) : (
        <div className="flex min-h-[720px] items-center justify-center rounded-[28px] bg-white/60">
          <div className="flex flex-col items-center gap-3 text-[14px] text-[#6b7280]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" className="animate-spin" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Loading invoice generator…
          </div>
        </div>
      )}
    </div>
  );
}
