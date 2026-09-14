"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";
import { CONSENT_KEY } from "@/components/CookieConsent";

export function Analytics() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_ID && !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    // Strictly opt-in: only ever loads after an explicit "Accept" (matches
    // the promise in the cookie banner's copy). A returning visitor who
    // already accepted gets it immediately since CookieConsent won't
    // re-render (and so won't re-fire the event) for them; anyone who
    // declined, or hasn't answered yet, gets nothing until they accept.
    try {
      if (localStorage.getItem(CONSENT_KEY) === "accepted") {
        initAnalytics();
        return;
      }
    } catch {}

    function onConsent() {
      window.removeEventListener("invoala:consent", onConsent);
      initAnalytics();
    }
    window.addEventListener("invoala:consent", onConsent);
    return () => window.removeEventListener("invoala:consent", onConsent);
  }, []);

  return null;
}
