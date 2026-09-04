// Reusable line-item templates ("Website design", "Monthly retainer" — name
// + description + rate) a user can save once and add to any invoice with
// one click, instead of retyping the same item every time. Workspace-scoped
// the same way as clients: team_id null = private to the creator, set =
// shared with that team.
import { randomUUID } from "crypto";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { isTeamMember } from "@/lib/teams";

export type ServiceItem = {
  id: string;
  user_id: string;
  team_id: string | null;
  name: string;
  description: string;
  rate: number;
  created_at: number;
  updated_at: number;
};

async function canAccess(userId: string, row: { user_id: string; team_id: string | null } | undefined): Promise<boolean> {
  if (!row) return false;
  if (row.user_id === userId) return true;
  if (!row.team_id) return false;
  return await isTeamMember(row.team_id, userId);
}

// teamId omitted: everything the user can see (their own + every team's) —
// used as a safe default. null: Personal only. A team id: that team only,
// membership re-verified here regardless of what the caller already checked.
export async function listServiceItems(userId: string, teamId?: string | null): Promise<ServiceItem[]> {
  if (teamId === undefined) {
    return await dbAll<ServiceItem>(
      `SELECT * FROM service_items WHERE user_id = ? OR team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
       ORDER BY name COLLATE NOCASE`,
      userId, userId,
    );
  }
  if (teamId === null) {
    return await dbAll<ServiceItem>(
      "SELECT * FROM service_items WHERE user_id = ? AND team_id IS NULL ORDER BY name COLLATE NOCASE",
      userId,
    );
  }
  if (!(await isTeamMember(teamId, userId))) return [];
  return await dbAll<ServiceItem>(
    "SELECT * FROM service_items WHERE team_id = ? ORDER BY name COLLATE NOCASE",
    teamId,
  );
}

export type ServiceItemInput = { name: string; description?: string; rate?: number };

export async function createServiceItem(
  userId: string,
  input: ServiceItemInput,
  teamId?: string | null,
): Promise<ServiceItem | { error: "invalid_name" }> {
  const name = input.name.trim();
  if (!name || name.length > 120) return { error: "invalid_name" };

  if (teamId && !(await isTeamMember(teamId, userId))) return { error: "invalid_name" };

  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    "INSERT INTO service_items (id, user_id, team_id, name, description, rate, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    id, userId, teamId ?? null, name, (input.description ?? "").trim(), input.rate ?? 0, now, now,
  );
  return (await dbGet<ServiceItem>("SELECT * FROM service_items WHERE id = ?", id))!;
}

export async function updateServiceItem(
  userId: string,
  id: string,
  input: ServiceItemInput,
): Promise<ServiceItem | { error: "invalid_name" } | null> {
  const owned = await dbGet<{ user_id: string; team_id: string | null }>(
    "SELECT user_id, team_id FROM service_items WHERE id = ?", id,
  );
  if (!(await canAccess(userId, owned ?? undefined))) return null;

  const name = input.name.trim();
  if (!name || name.length > 120) return { error: "invalid_name" };

  await dbRun(
    "UPDATE service_items SET name = ?, description = ?, rate = ?, updated_at = ? WHERE id = ?",
    name, (input.description ?? "").trim(), input.rate ?? 0, Date.now(), id,
  );
  return (await dbGet<ServiceItem>("SELECT * FROM service_items WHERE id = ?", id)) ?? null;
}

export async function deleteServiceItem(userId: string, id: string): Promise<boolean> {
  const owned = await dbGet<{ user_id: string; team_id: string | null }>(
    "SELECT user_id, team_id FROM service_items WHERE id = ?", id,
  );
  if (!(await canAccess(userId, owned ?? undefined))) return false;
  const { changes } = await dbRun("DELETE FROM service_items WHERE id = ?", id);
  return changes > 0;
}
