import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/auth/login": { limit: 10, windowMs: 15 * 60_000 },
  "/api/auth/signup": { limit: 5, windowMs: 60 * 60_000 },
  "/api/auth/forgot": { limit: 3, windowMs: 15 * 60_000 },
  "/api/auth/reset": { limit: 5, windowMs: 15 * 60_000 },
  "/api/auth/magic": { limit: 5, windowMs: 15 * 60_000 },
  "/api/auth/resend": { limit: 3, windowMs: 15 * 60_000 },
};

type RedirectEntry = { source: string; destination: string; statusCode: number };

let redirectCache: RedirectEntry[] | null = null;
let redirectCacheAt = 0;
const REDIRECT_CACHE_TTL = 60_000;

async function getRedirects(origin: string): Promise<RedirectEntry[]> {
  if (redirectCache && Date.now() - redirectCacheAt < REDIRECT_CACHE_TTL) {
    return redirectCache;
  }
  try {
    const res = await fetch(`${origin}/api/seo/redirects?public=1`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as { redirects?: RedirectEntry[] };
      if (Array.isArray(data.redirects)) {
        redirectCache = data.redirects;
        redirectCacheAt = Date.now();
        return redirectCache;
      }
    }
  } catch {
    // fall back to last known list
  }
  return redirectCache ?? [];
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Rate limiting on auth endpoints
  if (path.startsWith("/api/auth")) {
    const config = RATE_LIMITS[path];
    if (config) {
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const key = `${path}:${ip}`;
      const { ok, retryAfterMs } = checkRateLimit(key, config.limit, config.windowMs);
      if (!ok) {
        return NextResponse.json(
          {
            error: `Too many requests. Try again in ${Math.ceil(retryAfterMs / 60_000)} minutes.`,
          },
          {
            status: 429,
            headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
          }
        );
      }
    }
    return NextResponse.next();
  }

  // Apply admin-configured redirects (SEO 301/308)
  if (request.method === "GET" && !path.startsWith("/api/")) {
    try {
      const redirects = await getRedirects(request.nextUrl.origin);
      for (const r of redirects) {
        if (r.source === path) {
          return NextResponse.redirect(
            new URL(r.destination, request.url),
            r.statusCode === 308 ? 308 : 301
          );
        }
      }
    } catch {
      // never block the site on redirect lookup failure
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|manifest.json|icon.svg|apple-icon|.*\\..*).*)",
  ],
};
