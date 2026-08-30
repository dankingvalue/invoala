"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics";

export function Analytics() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_GA_ID) return;
    const timer = window.setTimeout(start, 60_000);

    function start() {
      window.clearTimeout(timer);
      window.removeEventListener("invoala:consent", start);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("pointerdown", onInteraction);
      initAnalytics();
    }
    function onInteraction() {
      start();
    }

    // Load only after the user accepts cookies (GDPR), or after interaction as a fallback.
    window.addEventListener("invoala:consent", start);
    window.addEventListener("scroll", onInteraction, { passive: true });
    window.addEventListener("pointerdown", onInteraction);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("invoala:consent", start);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("pointerdown", onInteraction);
    };
  }, []);

  return null;
}
