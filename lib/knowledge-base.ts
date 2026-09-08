import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export type KnowledgeAudience = "customer" | "internal";

export type KnowledgeArticle = {
  id: string;
  title: string;
  body: string;
  category: string;
  audience: KnowledgeAudience;
  verified: number;
  archived: number;
  created_by: string;
  created_at: number;
  updated_at: number;
};

export async function listKnowledgeArticles(filter: { audience?: KnowledgeAudience; includeArchived?: boolean }): Promise<KnowledgeArticle[]> {
  const conditions: string[] = [];
  const args: string[] = [];
  if (filter.audience) { conditions.push("audience = ?"); args.push(filter.audience); }
  if (!filter.includeArchived) conditions.push("archived = 0");
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return dbAll<KnowledgeArticle>(`SELECT * FROM knowledge_articles ${where} ORDER BY category, title`);
}

export async function getKnowledgeArticle(id: string): Promise<KnowledgeArticle | undefined> {
  return dbGet<KnowledgeArticle>("SELECT * FROM knowledge_articles WHERE id = ?", id);
}

export async function createKnowledgeArticle(opts: {
  title: string; body: string; category: string; audience: KnowledgeAudience; createdBy: string;
}): Promise<KnowledgeArticle> {
  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    `INSERT INTO knowledge_articles (id, title, body, category, audience, verified, archived, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?)`,
    id, opts.title, opts.body, opts.category, opts.audience, opts.createdBy, now, now,
  );
  const row = await dbGet<KnowledgeArticle>("SELECT * FROM knowledge_articles WHERE id = ?", id);
  return row!;
}

export async function updateKnowledgeArticle(id: string, patch: Partial<{
  title: string; body: string; category: string; audience: KnowledgeAudience; verified: boolean; archived: boolean;
}>): Promise<void> {
  const fields: string[] = [];
  const args: (string | number)[] = [];
  for (const key of ["title", "body", "category", "audience"] as const) {
    if (patch[key] !== undefined) { fields.push(`${key} = ?`); args.push(patch[key] as string); }
  }
  if (patch.verified !== undefined) { fields.push("verified = ?"); args.push(patch.verified ? 1 : 0); }
  if (patch.archived !== undefined) { fields.push("archived = ?"); args.push(patch.archived ? 1 : 0); }
  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  args.push(Date.now());
  args.push(id);
  await dbRun(`UPDATE knowledge_articles SET ${fields.join(", ")} WHERE id = ?`, ...args);
}

// AI support must only draw on approved, customer-facing knowledge — never
// internal procedures, escalation notes, or admin-only content (spec
// sections 11 and 32). This is the one function the AI layer is allowed to
// call for knowledge lookup.
export async function searchCustomerKnowledge(query: string): Promise<KnowledgeArticle[]> {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2).slice(0, 5);
  if (words.length === 0) return [];
  const conditions = words.map(() => "(LOWER(title) LIKE ? OR LOWER(body) LIKE ?)").join(" OR ");
  const args = words.flatMap((w) => [`%${w}%`, `%${w}%`]);
  return dbAll<KnowledgeArticle>(
    `SELECT * FROM knowledge_articles WHERE audience = 'customer' AND archived = 0 AND verified = 1 AND (${conditions}) LIMIT 5`,
    ...args,
  );
}
