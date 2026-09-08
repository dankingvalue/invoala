import { randomUUID } from "crypto";
import { dbAll, dbRun } from "@/lib/db";

export const SKILLS = ["general", "technical", "billing", "payments", "account", "api", "enterprise"] as const;
export type Skill = (typeof SKILLS)[number];

export async function getAgentSkills(userId: string): Promise<Skill[]> {
  const rows = await dbAll<{ skill: Skill }>("SELECT skill FROM agent_skills WHERE user_id = ?", userId);
  return rows.map((r) => r.skill);
}

export async function setAgentSkills(userId: string, skills: Skill[]): Promise<void> {
  await dbRun("DELETE FROM agent_skills WHERE user_id = ?", userId);
  const now = Date.now();
  for (const skill of skills) {
    if (!SKILLS.includes(skill)) continue;
    await dbRun(
      "INSERT INTO agent_skills (id, user_id, skill, created_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, skill) DO NOTHING",
      randomUUID(), userId, skill, now,
    );
  }
}

export async function setAgentAvailability(userId: string, available: boolean): Promise<void> {
  await dbRun("UPDATE users SET agent_available = ? WHERE id = ?", available ? 1 : 0, userId);
}

// Picks the best available agent for a conversation: must have the required
// skill (if any) and be marked available, then the lowest current open
// workload wins. Falls back to "any available agent, lowest workload" when
// no skill is required, and to null (unassigned) when nobody's available —
// callers should leave the conversation unassigned rather than force a bad
// match onto an overloaded or unqualified agent.
export async function pickAgentForConversation(requiredSkill: string | null): Promise<string | null> {
  const skillJoin = requiredSkill ? "JOIN agent_skills sk ON sk.user_id = u.id AND sk.skill = ?" : "";
  const args: string[] = requiredSkill ? [requiredSkill] : [];
  const rows = await dbAll<{ id: string; open: number }>(
    `SELECT u.id, (SELECT COUNT(*) FROM conversations c WHERE c.assigned_to = u.id AND c.status IN ('escalated','support')) as open
     FROM users u
     ${skillJoin}
     WHERE u.role IN ('support','admin') AND u.agent_available = 1
     ORDER BY open ASC
     LIMIT 1`,
    ...args,
  );
  return rows[0]?.id ?? null;
}
