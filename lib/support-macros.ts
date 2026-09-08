import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export type SupportMacro = {
  id: string;
  name: string;
  category: string;
  response_text: string;
  internal_instructions: string;
  applicable_plans: string;
  active: number;
  usage_count: number;
  created_by: string;
  created_at: number;
  updated_at: number;
};

export async function listMacros(activeOnly = true): Promise<SupportMacro[]> {
  return dbAll<SupportMacro>(
    `SELECT * FROM support_macros ${activeOnly ? "WHERE active = 1" : ""} ORDER BY category, name`,
  );
}

export async function createMacro(opts: {
  name: string;
  category: string;
  responseText: string;
  internalInstructions?: string;
  applicablePlans?: string;
  createdBy: string;
}): Promise<SupportMacro> {
  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    `INSERT INTO support_macros (id, name, category, response_text, internal_instructions, applicable_plans, active, usage_count, created_by, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, 0, ?, ?, ?)`,
    id, opts.name, opts.category, opts.responseText, opts.internalInstructions ?? "", opts.applicablePlans ?? "", opts.createdBy, now, now,
  );
  const row = await dbGet<SupportMacro>("SELECT * FROM support_macros WHERE id = ?", id);
  return row!;
}

export async function updateMacro(id: string, patch: Partial<{ name: string; category: string; responseText: string; internalInstructions: string; applicablePlans: string; active: boolean }>): Promise<void> {
  const fields: string[] = [];
  const args: (string | number)[] = [];
  const map: Record<string, string> = {
    name: "name", category: "category", responseText: "response_text",
    internalInstructions: "internal_instructions", applicablePlans: "applicable_plans",
  };
  for (const [key, col] of Object.entries(map)) {
    const value = (patch as Record<string, unknown>)[key];
    if (value !== undefined) { fields.push(`${col} = ?`); args.push(value as string); }
  }
  if (patch.active !== undefined) { fields.push("active = ?"); args.push(patch.active ? 1 : 0); }
  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  args.push(Date.now());
  args.push(id);
  await dbRun(`UPDATE support_macros SET ${fields.join(", ")} WHERE id = ?`, ...args);
}

export async function deleteMacro(id: string): Promise<void> {
  await dbRun("DELETE FROM support_macros WHERE id = ?", id);
}

export async function recordMacroUsage(id: string): Promise<void> {
  await dbRun("UPDATE support_macros SET usage_count = usage_count + 1 WHERE id = ?", id);
}

export async function getMacroUsageStats(): Promise<Array<{ id: string; name: string; usage_count: number }>> {
  return dbAll("SELECT id, name, usage_count FROM support_macros ORDER BY usage_count DESC LIMIT 20");
}
