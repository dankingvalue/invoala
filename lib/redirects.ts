import { dbGet, dbAll, dbRun } from "@/lib/db";

export type RedirectRow = {
  id: string;
  source: string;
  destination: string;
  status_code: number;
  active: number;
  created_by: string | null;
  created_at: number;
};

export type PublicRedirect = {
  source: string;
  destination: string;
  statusCode: number;
};

export async function listRedirects(activeOnly = false): Promise<RedirectRow[]> {
  if (activeOnly) {
    return dbAll<RedirectRow>(
      "SELECT * FROM seo_redirects WHERE active = 1 ORDER BY source",
    );
  }
  return dbAll<RedirectRow>("SELECT * FROM seo_redirects ORDER BY created_at DESC");
}

export function normalizeSource(source: string): string | null {
  const trimmed = source.trim();
  if (!trimmed) return null;
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  const url = new URL(`https://www.invoala.com${withSlash}`);
  const normalized = url.pathname.replace(/\/+$/, "") || "/";
  if (!normalized.startsWith("/") || normalized.includes("//")) return null;
  return normalized;
}

export async function upsertRedirect(input: {
  id?: string;
  source: string;
  destination: string;
  statusCode?: number;
  active?: boolean;
  createdBy?: string | null;
}): Promise<RedirectRow> {
  const source = normalizeSource(input.source);
  const destination = normalizeSource(input.destination);
  if (!source || !destination) throw new Error("invalid-source-or-destination");
  if (source === destination) throw new Error("loop");
  if (source === "/") throw new Error("cannot-redirect-home");
  if (/^\/api\//.test(source) || /^\/api\//.test(destination)) {
    throw new Error("cannot-redirect-api");
  }

  const now = Date.now();
  if (input.id) {
    await dbRun(
      "UPDATE seo_redirects SET source = ?, destination = ?, status_code = ?, active = ?, created_by = ?, created_at = ? WHERE id = ?",
      source,
      destination,
      input.statusCode ?? 301,
      input.active === false ? 0 : 1,
      input.createdBy ?? null,
      now,
      input.id,
    );
    return (await dbGet<RedirectRow>("SELECT * FROM seo_redirects WHERE id = ?", input.id))!;
  }

  const { randomUUID } = await import("crypto");
  const id = randomUUID();
  await dbRun(
    "INSERT INTO seo_redirects (id, source, destination, status_code, active, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    id,
    source,
    destination,
    input.statusCode ?? 301,
    input.active === false ? 0 : 1,
    input.createdBy ?? null,
    now,
  );
  return (await dbGet<RedirectRow>("SELECT * FROM seo_redirects WHERE id = ?", id))!;
}

export async function deleteRedirect(id: string): Promise<boolean> {
  const { changes } = await dbRun("DELETE FROM seo_redirects WHERE id = ?", id);
  return changes > 0;
}

export async function toPublicRedirects(rows: RedirectRow[]): Promise<PublicRedirect[]> {
  return rows.map((r) => ({
    source: r.source,
    destination: r.destination,
    statusCode: r.status_code,
  }));
}
