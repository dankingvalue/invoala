import { dbAll, dbRun } from "@/lib/db";
import type { SeoOverride } from "@/lib/seo";

const PRIVATE_PREFIXES = [
  "/api/",
  "/dashboard",
  "/admin",
  "/superadmin",
  "/support",
  "/login",
  "/signup",
  "/verify",
  "/forgot-password",
  "/reset-password",
  "/teams/",
];

export function isEditablePath(path: string): boolean {
  const normalized = path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`;
  if (!normalized.startsWith("/")) return false;
  if (PRIVATE_PREFIXES.some((p) => normalized.startsWith(p))) return false;
  if (normalized.includes("//")) return false;
  return true;
}

type OverrideRow = {
  path: string;
  seo_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  robots_index: number | null;
  robots_follow: number | null;
  updated_at: number;
};

function rowToOverride(r: OverrideRow): SeoOverride {
  const o: SeoOverride = { path: r.path, updatedAt: r.updated_at };
  if (r.seo_title) o.seoTitle = r.seo_title;
  if (r.meta_description) o.metaDescription = r.meta_description;
  if (r.canonical_url) o.canonicalUrl = r.canonical_url;
  if (r.og_title) o.ogTitle = r.og_title;
  if (r.og_description) o.ogDescription = r.og_description;
  if (r.og_image) o.ogImage = r.og_image;
  if (r.robots_index === 0) o.robotsIndex = false;
  if (r.robots_follow === 0) o.robotsFollow = false;
  return o;
}

// generateMetadata() (lib/seo.ts's pageMetadata) is async and runs once per
// page — at build time for statically generated pages, per-request for
// dynamic ones. A short-TTL cache avoids one DB round trip per page during
// a single `next build` (which evaluates ~40 pages back to back) while
// still awaiting a real read whenever the cache is cold or stale, so a
// build always reflects the current overrides rather than racing an
// in-flight fetch that resolves after the metadata was already returned.
let cache: SeoOverride[] = [];
let cacheAt = 0;
let inflight: Promise<void> | null = null;
const TTL_MS = 20_000;

async function refresh(): Promise<void> {
  const rows = await dbAll<OverrideRow>("SELECT * FROM seo_overrides");
  cache = rows.map(rowToOverride);
  cacheAt = Date.now();
}

/** Used by pageMetadata() — awaits a real read whenever the cache is cold/stale. */
export async function getSeoOverrideAsync(path: string): Promise<SeoOverride | undefined> {
  if (Date.now() - cacheAt >= TTL_MS) {
    if (!inflight) {
      inflight = refresh()
        .catch(() => {})
        .finally(() => {
          inflight = null;
        });
    }
    await inflight;
  }
  return cache.find((o) => o.path === path);
}

/** Authoritative async read, used by the admin SEO tab. */
export async function listSeoOverrides(): Promise<SeoOverride[]> {
  await refresh();
  return cache;
}

export async function saveSeoOverride(
  path: string,
  fields: Partial<Omit<SeoOverride, "path" | "updatedAt">>
): Promise<SeoOverride> {
  if (!isEditablePath(path)) throw new Error("not-editable");

  const clean: typeof fields = { ...fields };
  (Object.keys(clean) as (keyof typeof clean)[]).forEach((k) => {
    if (typeof clean[k] === "string" && clean[k] === "") delete clean[k];
  });

  const meaningful =
    clean.seoTitle ||
    clean.metaDescription ||
    clean.canonicalUrl ||
    clean.ogTitle ||
    clean.ogDescription ||
    clean.ogImage ||
    clean.robotsIndex !== undefined ||
    clean.robotsFollow !== undefined;
  if (!meaningful) {
    await removeSeoOverride(path);
    return { path, updatedAt: Date.now() };
  }

  const now = Date.now();
  await dbRun(
    `INSERT INTO seo_overrides (path, seo_title, meta_description, canonical_url, og_title, og_description, og_image, robots_index, robots_follow, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET
       seo_title = excluded.seo_title,
       meta_description = excluded.meta_description,
       canonical_url = excluded.canonical_url,
       og_title = excluded.og_title,
       og_description = excluded.og_description,
       og_image = excluded.og_image,
       robots_index = excluded.robots_index,
       robots_follow = excluded.robots_follow,
       updated_at = excluded.updated_at`,
    path,
    clean.seoTitle ?? null,
    clean.metaDescription ?? null,
    clean.canonicalUrl ?? null,
    clean.ogTitle ?? null,
    clean.ogDescription ?? null,
    clean.ogImage ?? null,
    clean.robotsIndex === false ? 0 : null,
    clean.robotsFollow === false ? 0 : null,
    now
  );
  cacheAt = 0; // force the next sync read to pick up this write
  return { path, ...clean, updatedAt: now };
}

export async function removeSeoOverride(path: string): Promise<SeoOverride | null> {
  const existing = cache.find((o) => o.path === path) ?? null;
  await dbRun("DELETE FROM seo_overrides WHERE path = ?", path);
  cacheAt = 0;
  return existing;
}
