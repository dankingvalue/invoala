import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { SeoOverride } from "@/lib/seo";

const FILE = join(process.cwd(), "data", "seo-overrides.json");

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

function readAll(): SeoOverride[] {
  try {
    if (existsSync(FILE)) {
      const parsed = JSON.parse(readFileSync(FILE, "utf8")) as {
        overrides?: SeoOverride[];
      };
      return Array.isArray(parsed.overrides) ? parsed.overrides : [];
    }
  } catch {}
  return [];
}

function writeAll(overrides: SeoOverride[]): void {
  writeFileSync(
    FILE,
    JSON.stringify({ overrides }, null, 2) + "\n",
    "utf8"
  );
}

export function listSeoOverrides(): SeoOverride[] {
  return readAll();
}

export function saveSeoOverride(
  path: string,
  fields: Partial<Omit<SeoOverride, "path" | "updatedAt">>
): SeoOverride {
  if (!isEditablePath(path)) throw new Error("not-editable");
  const overrides = readAll();
  const existing = overrides.find((o) => o.path === path);
  const next: SeoOverride = {
    ...(existing ?? { path }),
    path,
    ...fields,
    updatedAt: Date.now(),
  };
  // Drop empty strings so they don't shadow defaults
  (Object.keys(next) as (keyof SeoOverride)[]).forEach((k) => {
    if (typeof next[k] === "string" && next[k] === "") {
      delete next[k];
    }
  });
  if (!next.seoTitle && !next.metaDescription && !next.canonicalUrl && !next.ogTitle && !next.ogDescription && !next.ogImage && next.robotsIndex === undefined && next.robotsFollow === undefined) {
    // nothing meaningful left — treat as delete
    return removeSeoOverride(path) ?? { path, updatedAt: Date.now() };
  }
  const idx = overrides.findIndex((o) => o.path === path);
  if (idx >= 0) overrides[idx] = next;
  else overrides.push(next);
  writeAll(overrides);
  return next;
}

export function removeSeoOverride(path: string): SeoOverride | null {
  const overrides = readAll();
  const idx = overrides.findIndex((o) => o.path === path);
  if (idx < 0) return null;
  const [removed] = overrides.splice(idx, 1);
  writeAll(overrides);
  return removed;
}
