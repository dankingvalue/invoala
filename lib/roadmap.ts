import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export type RoadmapStatus = "open" | "planned" | "in_progress" | "done" | "declined";

export type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  votes: number;
  submitted_name: string;
  submitted_email: string;
  created_at: number;
  updated_at: number;
};

const VALID_STATUSES: RoadmapStatus[] = ["open", "planned", "in_progress", "done", "declined"];
export function isRoadmapStatus(v: unknown): v is RoadmapStatus {
  return typeof v === "string" && (VALID_STATUSES as string[]).includes(v);
}

// Public board: the curated planned/in_progress/done columns, plus the
// open feedback queue (sorted by votes so the most-wanted ideas surface
// first) — declined items never appear publicly.
export async function listPublicRoadmap(): Promise<RoadmapItem[]> {
  return dbAll<RoadmapItem>(
    `SELECT * FROM roadmap_items WHERE status != 'declined'
     ORDER BY
       CASE status WHEN 'in_progress' THEN 0 WHEN 'planned' THEN 1 WHEN 'done' THEN 2 ELSE 3 END,
       votes DESC, sort_order ASC, created_at DESC`,
  );
}

// Admin triage view: everything, including declined.
export async function listAllRoadmapItems(): Promise<RoadmapItem[]> {
  return dbAll<RoadmapItem>(`SELECT * FROM roadmap_items ORDER BY created_at DESC`);
}

export async function submitRoadmapItem(input: {
  title: string;
  description: string;
  name: string;
  email: string;
}): Promise<RoadmapItem> {
  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    `INSERT INTO roadmap_items (id, title, description, status, votes, submitted_name, submitted_email, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, 'open', 0, ?, ?, 0, ?, ?)`,
    id, input.title.trim(), input.description.trim(), input.name.trim(), input.email.trim(), now, now,
  );
  const row = await dbGet<RoadmapItem>("SELECT * FROM roadmap_items WHERE id = ?", id);
  if (!row) throw new Error("Failed to create roadmap item.");
  return row;
}

// One vote per voter_key per item (anonymous id stored client-side) —
// the UNIQUE constraint on roadmap_votes is the real guard; this is just
// a friendly pre-check so we can tell the caller "already voted" instead
// of a generic error.
export async function voteForItem(itemId: string, voterKey: string): Promise<{ ok: boolean; votes: number; alreadyVoted?: boolean }> {
  const item = await dbGet<{ id: string; votes: number }>("SELECT id, votes FROM roadmap_items WHERE id = ?", itemId);
  if (!item) return { ok: false, votes: 0 };

  const existing = await dbGet<{ id: string }>(
    "SELECT id FROM roadmap_votes WHERE item_id = ? AND voter_key = ?",
    itemId, voterKey,
  );
  if (existing) return { ok: true, votes: item.votes, alreadyVoted: true };

  try {
    await dbRun(
      "INSERT INTO roadmap_votes (id, item_id, voter_key, created_at) VALUES (?, ?, ?, ?)",
      randomUUID(), itemId, voterKey, Date.now(),
    );
  } catch {
    // Unique constraint race — someone else's request beat this one.
    return { ok: true, votes: item.votes, alreadyVoted: true };
  }
  await dbRun("UPDATE roadmap_items SET votes = votes + 1 WHERE id = ?", itemId);
  const updated = await dbGet<{ votes: number }>("SELECT votes FROM roadmap_items WHERE id = ?", itemId);
  return { ok: true, votes: updated?.votes ?? item.votes + 1 };
}

export async function updateRoadmapItem(
  id: string,
  patch: { title?: string; description?: string; status?: RoadmapStatus },
): Promise<boolean> {
  const item = await dbGet<{ id: string }>("SELECT id FROM roadmap_items WHERE id = ?", id);
  if (!item) return false;

  const sets: string[] = [];
  const args: (string | number)[] = [];
  if (patch.title !== undefined) { sets.push("title = ?"); args.push(patch.title.trim()); }
  if (patch.description !== undefined) { sets.push("description = ?"); args.push(patch.description.trim()); }
  if (patch.status !== undefined) { sets.push("status = ?"); args.push(patch.status); }
  if (sets.length === 0) return true;

  sets.push("updated_at = ?");
  args.push(Date.now());
  args.push(id);
  await dbRun(`UPDATE roadmap_items SET ${sets.join(", ")} WHERE id = ?`, ...args);
  return true;
}

export async function deleteRoadmapItem(id: string): Promise<boolean> {
  const { changes } = await dbRun("DELETE FROM roadmap_items WHERE id = ?", id);
  return changes > 0;
}
