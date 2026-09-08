import { randomUUID } from "crypto";
import { dbAll, dbGet, dbRun } from "@/lib/db";

export type IncidentSeverity = "p1" | "p2" | "p3" | "p4";
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved" | "closed";

export type Incident = {
  id: string;
  ref: string;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  created_by: string;
  assigned_admin: string | null;
  started_at: number;
  detected_at: number;
  root_cause: string;
  investigation: string;
  workaround: string;
  resolution: string;
  created_at: number;
  updated_at: number;
  resolved_at: number | null;
};

function genRef(): string {
  const year = new Date().getFullYear();
  const suffix = Date.now().toString(36).toUpperCase().slice(-4);
  return `INC-${year}-${suffix}`;
}

export async function createIncident(opts: {
  title: string;
  description?: string;
  severity: IncidentSeverity;
  createdBy: string;
  startedAt?: number;
}): Promise<Incident> {
  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    `INSERT INTO incidents (id, ref, title, description, severity, status, created_by, started_at, detected_at, root_cause, investigation, workaround, resolution, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'investigating', ?, ?, ?, '', '', '', '', ?, ?)`,
    id, genRef(), opts.title, opts.description ?? "", opts.severity, opts.createdBy, opts.startedAt ?? now, now, now, now,
  );
  const row = await dbGet<Incident>("SELECT * FROM incidents WHERE id = ?", id);
  return row!;
}

export async function listIncidents(filter: { status?: IncidentStatus; activeOnly?: boolean }): Promise<Incident[]> {
  const conditions: string[] = [];
  const args: string[] = [];
  if (filter.status) { conditions.push("status = ?"); args.push(filter.status); }
  else if (filter.activeOnly) { conditions.push("status NOT IN ('resolved','closed')"); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return dbAll<Incident>(`SELECT * FROM incidents ${where} ORDER BY severity ASC, created_at DESC LIMIT 200`, ...args);
}

export async function getIncident(id: string): Promise<Incident | undefined> {
  return dbGet<Incident>("SELECT * FROM incidents WHERE id = ?", id);
}

export async function updateIncident(id: string, patch: Partial<{
  title: string; description: string; severity: IncidentSeverity; status: IncidentStatus;
  assignedAdmin: string; rootCause: string; investigation: string; workaround: string; resolution: string;
}>): Promise<void> {
  const now = Date.now();
  const fields: string[] = [];
  const args: (string | number)[] = [];
  const map: Record<string, string> = {
    title: "title", description: "description", severity: "severity", status: "status",
    assignedAdmin: "assigned_admin", rootCause: "root_cause", investigation: "investigation",
    workaround: "workaround", resolution: "resolution",
  };
  for (const [key, col] of Object.entries(map)) {
    const value = (patch as Record<string, unknown>)[key];
    if (value !== undefined) { fields.push(`${col} = ?`); args.push(value as string); }
  }
  if (patch.status === "resolved" || patch.status === "closed") {
    fields.push("resolved_at = ?");
    args.push(now);
  }
  if (fields.length === 0) return;
  fields.push("updated_at = ?");
  args.push(now);
  args.push(id);
  await dbRun(`UPDATE incidents SET ${fields.join(", ")} WHERE id = ?`, ...args);
}

export async function linkConversationToIncident(incidentId: string, conversationId: string, linkedBy: string): Promise<void> {
  await dbRun(
    `INSERT INTO incident_conversations (id, incident_id, conversation_id, linked_by, created_at)
     VALUES (?, ?, ?, ?, ?) ON CONFLICT(incident_id, conversation_id) DO NOTHING`,
    randomUUID(), incidentId, conversationId, linkedBy, Date.now(),
  );
}

export async function unlinkConversationFromIncident(incidentId: string, conversationId: string): Promise<void> {
  await dbRun("DELETE FROM incident_conversations WHERE incident_id = ? AND conversation_id = ?", incidentId, conversationId);
}

export async function getIncidentConversations(incidentId: string): Promise<Array<{ id: string; subject: string; status: string; user_email: string; created_at: number }>> {
  return dbAll(
    `SELECT c.id, c.subject, c.status, u.email as user_email, c.created_at
     FROM incident_conversations ic
     JOIN conversations c ON c.id = ic.conversation_id
     JOIN users u ON u.id = c.user_id
     WHERE ic.incident_id = ?
     ORDER BY c.created_at DESC`,
    incidentId,
  );
}

export async function addIncidentUpdate(opts: {
  incidentId: string;
  authorId: string;
  body: string;
  statusAtTime: IncidentStatus;
  isCustomerBroadcast?: boolean;
}): Promise<void> {
  await dbRun(
    `INSERT INTO incident_updates (id, incident_id, author_id, body, status_at_time, is_customer_broadcast, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    randomUUID(), opts.incidentId, opts.authorId, opts.body, opts.statusAtTime, opts.isCustomerBroadcast ? 1 : 0, Date.now(),
  );
}

export async function getIncidentUpdates(incidentId: string): Promise<Array<{ id: string; author_id: string; author_name: string; body: string; status_at_time: string; is_customer_broadcast: number; created_at: number }>> {
  return dbAll(
    `SELECT iu.id, iu.author_id, COALESCE(u.name, u.email) as author_name, iu.body, iu.status_at_time, iu.is_customer_broadcast, iu.created_at
     FROM incident_updates iu
     JOIN users u ON u.id = iu.author_id
     WHERE iu.incident_id = ?
     ORDER BY iu.created_at ASC`,
    incidentId,
  );
}

// Duplicate/related-issue suggestion: same category+subcategory conversations
// opened in the trailing window that aren't already linked to an incident —
// a plain SQL filter, not a similarity model, per the "smallest robust
// architecture" instruction.
export async function suggestRelatedConversations(category: string, subcategory: string, sinceMs: number): Promise<Array<{ id: string; subject: string; user_email: string; created_at: number }>> {
  if (!category) return [];
  return dbAll(
    `SELECT c.id, c.subject, u.email as user_email, c.created_at
     FROM conversations c
     JOIN users u ON u.id = c.user_id
     WHERE c.category = ? AND (c.subcategory = ? OR ? = '') AND c.created_at >= ?
       AND c.id NOT IN (SELECT conversation_id FROM incident_conversations)
     ORDER BY c.created_at DESC
     LIMIT 50`,
    category, subcategory, subcategory, sinceMs,
  );
}
