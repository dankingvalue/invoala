declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    _invoalaEvents?: { name: string; params: Record<string, unknown> }[];
  }
}

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined") return;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId || initialized) return;
  initialized = true;

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

  // Flush any events tracked before initialization
  const queued = window._invoalaEvents || [];
  window._invoalaEvents = [];
  queued.forEach(({ name, params }) => trackEvent(name, params));
}

// Events that count toward "an invoice got generated" also get a durable
// server-side record (see /api/track and lib/usage.ts) — GA alone can't
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
    navigator.sendBeacon("/api/track", blob);
  } else {
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
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
}
