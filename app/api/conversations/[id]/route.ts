import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { generateAiResponse, sendToTelegram } from "@/lib/ai";
import { detectPriority, detectCategory } from "@/lib/support-classify";
import { getSlaPolicy, computeSlaDueDates } from "@/lib/sla";
import { pickAgentForConversation, type Skill } from "@/lib/agent-skills";

// Maps an escalation category to the skill most likely to resolve it —
// used only to pick a routing candidate, never a hard requirement (a
// conversation with no clean mapping is simply left unassigned, per
// lib/agent-skills.ts pickAgentForConversation's own fallback).
const CATEGORY_SKILL: Partial<Record<string, Skill>> = {
  payment: "payments",
  billing: "billing",
  account: "account",
  technical_bug: "technical",
  infrastructure: "technical",
  security: "technical",
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(_req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const conversation = await dbGet<{
    id: string; user_id: string; status: string; subject: string;
    rating: number | null; rating_comment: string | null; rating_at: number | null;
    created_at: number; updated_at: number;
  }>(
    "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
    id, user.id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await dbAll<{
    id: string; conversation_id: string; sender_type: string; sender_id: string | null;
    content: string; created_at: number;
  } & { sender_name?: string }>(
    `SELECT m.*, u.name as sender_name
     FROM messages m
     LEFT JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    id
  );

  // Auto-close: if last support message was 10+ min ago and no user reply since, resolve
  if (conversation.status === "support" || conversation.status === "escalated") {
    const lastSupportMsg = [...messages].reverse().find(
      (m) => m.sender_type === "support" || m.sender_type === "system"
    );
    const lastUserMsg = [...messages].reverse().find((m) => m.sender_type === "user");
    if (lastSupportMsg && (!lastUserMsg || lastUserMsg.created_at < lastSupportMsg.created_at)) {
      const elapsed = Date.now() - lastSupportMsg.created_at;
      if (elapsed > 10 * 60 * 1000) {
        await dbRun("UPDATE conversations SET status = 'resolved', updated_at = ? WHERE id = ?", Date.now(), id);
        conversation.status = "resolved";
      }
    }
  }

  // Mark as read
  await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", Date.now(), id);

  return Response.json({ conversation, messages });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let content = "";
  try {
    const body = (await req.json()) as { content?: string };
    content = typeof body.content === "string" ? body.content.trim() : "";
  } catch {}

  if (!content) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const conversation = await dbGet<{ id: string; status: string }>(
    "SELECT * FROM conversations WHERE id = ? AND user_id = ?",
    id, user.id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  if (conversation.status === "resolved") {
    return Response.json({ error: "This conversation is resolved." }, { status: 400 });
  }

  const now = Date.now();

  // Add user message
  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
    VALUES (?, ?, 'user', ?, ?, ?)`,
    randomUUID(), id, user.id, content, now
  );

  await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now, id);

  // If conversation is in AI mode, generate AI response
  if (conversation.status === "ai") {
    const aiResponse = await generateAiResponse(content);

    if (aiResponse.escalate) {
      // Classify + start the SLA clock the moment a human is actually
      // needed — AI already answered instantly, so measuring "first
      // response" from account creation would be meaningless.
      const priority = detectPriority(content);
      const detected = detectCategory(content);
      const policy = await getSlaPolicy();
      const { firstResponseDue, resolutionDue } = computeSlaDueDates(now + 1, priority, policy);
      const requiredSkill = detected ? CATEGORY_SKILL[detected.category] ?? null : null;
      // Best-effort routing suggestion — workload-aware, skill-matched when
      // possible, never blocks escalation if nobody's available (spec
      // section 19/20: consider availability/workload/skill, don't force a
      // bad match; an unassigned conversation just sits in the open queue).
      const suggestedAgent = await pickAgentForConversation(requiredSkill).catch(() => null);
      await dbRun(
        `UPDATE conversations SET status = 'escalated', priority = ?, category = COALESCE(NULLIF(category, ''), ?), subcategory = COALESCE(NULLIF(subcategory, ''), ?), required_skill = ?, assigned_to = COALESCE(assigned_to, ?), sla_first_response_due = ?, sla_resolution_due = ?, updated_at = ? WHERE id = ?`,
        priority, detected?.category ?? "", detected?.subcategory ?? "", requiredSkill ?? "", suggestedAgent, firstResponseDue, resolutionDue, now + 1, id,
      );

      await dbRun(
        `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
        VALUES (?, ?, 'system', NULL, ?, ?)`,
        randomUUID(), id, "This conversation has been escalated to our support team. A team member will respond shortly.", now + 1
      );

      await sendToTelegram(user.email, content, id);
    } else {
      await dbRun(
        `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, created_at)
        VALUES (?, ?, 'ai', NULL, ?, ?)`,
        randomUUID(), id, aiResponse.message, now + 1
      );
    }

    await dbRun("UPDATE conversations SET updated_at = ? WHERE id = ?", now + 1, id);
  }

  return Response.json({ ok: true });
}
