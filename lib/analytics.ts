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

export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!initialized) {
    window._invoalaEvents = window._invoalaEvents || [];
    window._invoalaEvents.push({ name, params });
    return;
  }
  window.gtag?.("event", name, params);
}
