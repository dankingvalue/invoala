import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { redactEmail } from "@/lib/redact";
import { createNotification } from "@/lib/notifications";
import { requireSupportPermission } from "@/lib/support-permissions";
import { recordMacroUsage } from "@/lib/support-macros";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(_req);
  const denied = requireSupportPermission(user, "support.conversations.view");
  if (denied) return denied;

  const { id } = await params;

  const conversation = await dbGet<{
    id: string; user_id: string; status: string; subject: string;
    rating: number | null; rating_comment: string | null; rating_at: number | null;
    priority: string; category: string; subcategory: string; assigned_to: string | null;
    first_response_at: number | null; resolved_at: number | null; reopened_count: number;
    human_handled: number; sla_first_response_due: number | null; sla_resolution_due: number | null;
    product_feedback_tag: string | null;
    user_email: string; user_name: string;
    created_at: number; updated_at: number;
  }>(
    `SELECT c.*, u.email as user_email, u.name as user_name
    FROM conversations c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = ?`,
    id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await dbAll<{
    id: string; conversation_id: string; sender_type: string; sender_id: string | null;
    content: string; is_internal_note: number; created_at: number;
  } & { sender_name?: string }>(
    `SELECT m.*, u.name as sender_name
     FROM messages m
     LEFT JOIN users u ON m.sender_id = u.id
     WHERE m.conversation_id = ?
     ORDER BY m.created_at ASC`,
    id
  );

  const isSupport = user!.role === "support";
  const incident = await dbGet<{ id: string; ref: string; title: string; status: string }>(
    `SELECT i.id, i.ref, i.title, i.status FROM incident_conversations ic JOIN incidents i ON i.id = ic.incident_id WHERE ic.conversation_id = ? LIMIT 1`,
    id,
  );

  return Response.json({
    conversation: {
      ...conversation,
      user_email: isSupport ? redactEmail(conversation.user_email) : conversation.user_email,
    },
    messages,
    incident: incident ?? null,
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "support.conversations.reply");
  if (denied) return denied;

  const { id } = await params;
  let content = "";
  let isInternalNote = false;
  let macroId: string | undefined;
  try {
    const body = (await req.json()) as { content?: string; isInternalNote?: boolean; macroId?: string };
    content = typeof body.content === "string" ? body.content.trim() : "";
    isInternalNote = !!body.isInternalNote;
    macroId = body.macroId;
  } catch {}

  if (isInternalNote) {
    const noteDenied = requireSupportPermission(user, "support.conversations.internal_note");
    if (noteDenied) return noteDenied;
  }

  if (!content) {
    return Response.json({ error: "Message is required." }, { status: 400 });
  }

  const conversation = await dbGet<{ id: string; status: string; first_response_at: number | null; user_id: string; sla_first_response_due: number | null }>(
    "SELECT id, status, first_response_at, user_id, sla_first_response_due FROM conversations WHERE id = ?",
    id
  );

  if (!conversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const now = Date.now();

  await dbRun(
    `INSERT INTO messages (id, conversation_id, sender_type, sender_id, content, is_internal_note, macro_id, created_at)
    VALUES (?, ?, 'support', ?, ?, ?, ?, ?)`,
    randomUUID(), id, user!.id, content, isInternalNote ? 1 : 0, macroId ?? null, now
  );

  if (macroId) await recordMacroUsage(macroId).catch(() => {});

  // Internal notes are never customer-visible and must not affect
  // status/SLA/first-response tracking or notify the customer.
  if (!isInternalNote) {
    const isFirstResponse = conversation.first_response_at === null;
    const nextStatus = conversation.status === "escalated" ? "support" : conversation.status;
    const breached = isFirstResponse && conversation.sla_first_response_due ? now > conversation.sla_first_response_due : false;
    await dbRun(
      `UPDATE conversations SET status = ?, updated_at = ?, human_handled = 1${isFirstResponse ? ", first_response_at = ?, sla_first_response_breached = ?" : ""} WHERE id = ?`,
      ...(isFirstResponse ? [nextStatus, now, now, breached ? 1 : 0, id] : [nextStatus, now, id]),
    );

    await createNotification({
      userId: conversation.user_id,
      type: "support_reply",
      title: "New support reply",
      body: content.slice(0, 200),
      meta: { conversationId: id },
    });
  }

  await logAudit({
    action: isInternalNote ? "conversation_internal_note" : "conversation_reply",
    targetId: id,
    targetType: "conversation",
    details: { contentPreview: content.slice(0, 200) },
    req,
  });

  return Response.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let patch: {
    status?: string; assignedTo?: string | null; priority?: string; category?: string;
    subcategory?: string; requiredSkill?: string; productFeedbackTag?: string | null;
  } = {};
  try {
    patch = await req.json();
  } catch {}

  const old = await dbGet<{ status: string; assigned_to: string | null; sla_resolution_due: number | null }>("SELECT status, assigned_to, sla_resolution_due FROM conversations WHERE id = ?", id);
  if (!old) return Response.json({ error: "Not found" }, { status: 404 });

  const now = Date.now();

  if (patch.status !== undefined) {
    const denied = requireSupportPermission(user, patch.status === "resolved" ? "support.conversations.resolve" : "support.conversations.view");
    if (denied) return denied;
    if (!["ai", "escalated", "support", "resolved"].includes(patch.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    const reopening = old.status === "resolved" && patch.status !== "resolved";
    if (reopening) {
      const reopenDenied = requireSupportPermission(user, "support.conversations.reopen");
      if (reopenDenied) return reopenDenied;
    }
    const resolving = patch.status === "resolved";
    const breached = resolving && old.sla_resolution_due ? now > old.sla_resolution_due : false;
    await dbRun(
      `UPDATE conversations SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_at END, reopened_count = reopened_count + ?, sla_resolution_breached = CASE WHEN ? = 'resolved' THEN ? ELSE sla_resolution_breached END WHERE id = ?`,
      patch.status, now, patch.status, now, reopening ? 1 : 0, patch.status, breached ? 1 : 0, id,
    );
    await logAudit({ action: reopening ? "conversation_reopened" : "conversation_status", targetId: id, targetType: "conversation", details: { from: old.status, to: patch.status }, req });
  }

  if (patch.assignedTo !== undefined) {
    // Support may only claim (assign to themselves) or unclaim their own
    // conversation; reassigning to someone else requires admin+.
    const isSelfClaim = patch.assignedTo === user.id || patch.assignedTo === null;
    const permission = isSelfClaim ? "support.conversations.assign" : "support.conversations.reassign";
    const denied = requireSupportPermission(user, permission);
    if (denied) return denied;
    await dbRun("UPDATE conversations SET assigned_to = ?, updated_at = ? WHERE id = ?", patch.assignedTo, now, id);
    await logAudit({ action: "conversation_assigned", targetId: id, targetType: "conversation", details: { from: old.assigned_to, to: patch.assignedTo }, req });
  }

  if (patch.priority !== undefined || patch.category !== undefined || patch.subcategory !== undefined || patch.requiredSkill !== undefined) {
    const denied = requireSupportPermission(user, "support.conversations.view");
    if (denied) return denied;
    const fields: string[] = [];
    const args: string[] = [];
    if (patch.priority !== undefined) { fields.push("priority = ?"); args.push(patch.priority); }
    if (patch.category !== undefined) { fields.push("category = ?"); args.push(patch.category); }
    if (patch.subcategory !== undefined) { fields.push("subcategory = ?"); args.push(patch.subcategory); }
    if (patch.requiredSkill !== undefined) { fields.push("required_skill = ?"); args.push(patch.requiredSkill); }
    fields.push("updated_at = ?");
    args.push(String(now));
    await dbRun(`UPDATE conversations SET ${fields.join(", ")} WHERE id = ?`, ...args, id);
    if (patch.priority !== undefined) {
      await logAudit({ action: "conversation_priority_changed", targetId: id, targetType: "conversation", details: { to: patch.priority }, req });
    }
  }

  if (patch.productFeedbackTag !== undefined) {
    const denied = requireSupportPermission(user, "support.conversations.view");
    if (denied) return denied;
    await dbRun("UPDATE conversations SET product_feedback_tag = ?, updated_at = ? WHERE id = ?", patch.productFeedbackTag, now, id);
  }

  return Response.json({ ok: true });
}
