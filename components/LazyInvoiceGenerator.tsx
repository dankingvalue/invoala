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

export function LazyInvoiceGenerator() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [flags, setFlags] = useState<PublicFlags>(DEFAULT_FLAGS);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [Comp, setComp] = useState<React.ComponentType<{
    ai: boolean;
    print: boolean;
    allowLogo: boolean;
    quoteMode: boolean;
    recurringTerms: boolean;
    user: { email: string } | null;
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
      .then((data: { user?: { email: string } } | null) => {
        if (data?.user?.email) setUser({ email: data.user.email });
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
