import type { PostHog } from "posthog-js";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _invoalaEvents?: { name: string; params: Record<string, unknown> }[];
  }
}

let initialized = false;
let posthogInstance: PostHog | null = null;

export async function initAnalytics() {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if ((!gaId && !phKey) || initialized) return;
  initialized = true;

  if (gaId) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer!.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", gaId, { anonymize_ip: true });
  }

  if (phKey) {
    // Dynamically imported so the ~50KB SDK never ships to a visitor who
    // hasn't consented — same lazy-load-only-after-consent rule the gtag.js
    // script above already follows.
    const { default: posthog } = await import("posthog-js");
    posthog.init(phKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      // Anonymous visitors are the vast majority of traffic here (the
      // free generator needs no account) — only identified users (signed
      // in, trackEvent's persistUsageEvent counterpart) create a billed
      // person profile, so anonymous browsing doesn't burn quota.
      person_profiles: "identified_only",
      capture_pageview: true,
      // Off by default: the invoice preview panel renders real client
      // names, emails, and amounts on screen, and this product's own
      // cookie banner already promises no more than essential tracking —
      // turning replay on requires deliberately configuring input/text
      // masking first, not just flipping this flag.
      disable_session_recording: true,
    });
    posthogInstance = posthog;
  }

  // Flush any events tracked before initialization
  const queued = window._invoalaEvents || [];
  window._invoalaEvents = [];
  queued.forEach(({ name, params }) => trackEvent(name, params));
}

// Events that count toward "an invoice got generated" also get a durable
// server-side record (see /api/usage and lib/usage.ts) — GA alone can't
// answer "how many invoices has this product generated" from our own admin.
const USAGE_EVENTS = new Set([
  "invoice_downloaded",
  "invoice_printed",
  "invoice_emailed",
  "invoice_shared",
  "invoice_saved_to_account",
]);

function persistUsageEvent(name: string) {
  if (typeof window === "undefined" || !USAGE_EVENTS.has(name)) return;
  const body = JSON.stringify({ event: name });
  // sendBeacon fires the request even if the page unloads immediately after
  // (download-then-close, or the OS share sheet taking over) — exactly the
  // "generates a PDF and goes offline" case this needs to survive.
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/usage", blob);
  } else {
    fetch("/api/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }
}

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  persistUsageEvent(name);
  if (!initialized) {
    window._invoalaEvents = window._invoalaEvents || [];
    window._invoalaEvents.push({ name, params });
    return;
  }
  window.gtag?.("event", name, params);
  posthogInstance?.capture(name, params);
}
