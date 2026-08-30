import { randomUUID } from "crypto";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { computeTotals, type Invoice } from "@/lib/invoice";

export type InvoiceRow = {
  id: string;
  doc_type: string;
  number: string;
  currency: string;
  status: string;
  client_name: string;
  total: number;
  created_at: number;
  updated_at: number;
  data: Invoice;
};

export async function listInvoices(userId: string): Promise<InvoiceRow[]> {
  const rows = await dbAll<Omit<InvoiceRow, "data"> & { data: string }>(
    `SELECT id, doc_type, number, currency, status, client_name, total, data, created_at, updated_at
     FROM invoices WHERE user_id = ? ORDER BY updated_at DESC LIMIT 500`,
    userId
  );
  return rows.map((r) => ({ ...r, data: safeParse(r.data) }));
}

export async function getInvoice(userId: string, id: string): Promise<InvoiceRow | null> {
  const row = await dbGet<Omit<InvoiceRow, "data"> & { data: string }>(
    `SELECT id, doc_type, number, currency, status, client_name, total, data, created_at, updated_at
     FROM invoices WHERE user_id = ? AND id = ?`,
    userId, id
  );
  if (!row) return null;
  return { ...row, data: safeParse(row.data) };
}

export async function upsertInvoice(
  userId: string,
  invoice: Invoice,
  opts: { id?: string; status?: string },
): Promise<{ id: string }> {
  const now = Date.now();
  const total = computeTotals(invoice).total;
  let id = opts.id || "";

  if (id) {
    const owned = await dbGet(
      "SELECT id FROM invoices WHERE id = ? AND user_id = ?",
      id, userId
    );
    if (!owned) throw new Error("not-found");
    await dbRun(
      `UPDATE invoices SET doc_type=?, number=?, currency=?, status=?, client_name=?, total=?, data=?, updated_at=? WHERE id=? AND user_id=?`,
      invoice.docType,
      invoice.invoiceNumber,
      invoice.currency,
      opts.status || "draft",
      invoice.clientName,
      total,
      JSON.stringify(invoice),
      now,
      id,
      userId,
    );
    return { id };
  }

  id = randomUUID();
  await dbRun(
    `INSERT INTO invoices (id, user_id, doc_type, number, currency, status, client_name, total, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    invoice.docType,
    invoice.invoiceNumber,
    invoice.currency,
    "draft",
    invoice.clientName,
    total,
    JSON.stringify(invoice),
    now,
    now,
  );
  return { id };
}

export async function setInvoiceStatus(userId: string, id: string, status: string): Promise<boolean> {
  const { changes } = await dbRun(
    "UPDATE invoices SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    status, Date.now(), id, userId
  );
  return changes > 0;
}

export async function deleteInvoice(userId: string, id: string): Promise<boolean> {
  const { changes } = await dbRun("DELETE FROM invoices WHERE id = ? AND user_id = ?", id, userId);
  return changes > 0;
}

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  team_id: string | null;
  team_name: string | null;
  created_at: number;
};

export async function listClients(userId: string): Promise<ClientRow[]> {
  return await dbAll<ClientRow>(
    `SELECT c.id, c.name, c.email, c.address, c.team_id, t.name AS team_name, c.created_at
     FROM clients c
     LEFT JOIN teams t ON c.team_id = t.id
     WHERE c.user_id = ?
        OR c.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
     ORDER BY c.name COLLATE NOCASE LIMIT 500`,
    userId, userId
  );
}

export async function upsertClient(
  userId: string,
  client: { name: string; email?: string; address?: string },
  teamId?: string | null,
): Promise<ClientRow> {
  const existing = await dbGet<ClientRow>(
    `SELECT c.id, c.name, c.email, c.address, c.team_id, t.name AS team_name, c.created_at
     FROM clients c LEFT JOIN teams t ON c.team_id = t.id
     WHERE c.user_id = ? AND c.name = ? COLLATE NOCASE`,
    userId, client.name
  );
  if (existing) {
    const resolvedTeamId = teamId === undefined ? existing.team_id : teamId;
    await dbRun("UPDATE clients SET email = ?, address = ?, team_id = ? WHERE id = ?",
      client.email ?? existing.email,
      client.address ?? existing.address,
      resolvedTeamId,
      existing.id,
    );
    const teamName = resolvedTeamId
      ? (await dbGet<{ name: string }>("SELECT name FROM teams WHERE id = ?", resolvedTeamId))?.name ?? null
      : null;
    return {
      ...existing,
      email: client.email ?? existing.email,
      address: client.address ?? existing.address,
      team_id: resolvedTeamId,
      team_name: teamName,
    };
  }
  const row: ClientRow = {
    id: randomUUID(),
    name: client.name,
    email: client.email ?? "",
    address: client.address ?? "",
    team_id: teamId ?? null,
    team_name: teamId
      ? (await dbGet<{ name: string }>("SELECT name FROM teams WHERE id = ?", teamId))?.name ?? null
      : null,
    created_at: Date.now(),
  };
  await dbRun("INSERT INTO clients (id, user_id, team_id, name, email, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    row.id, userId, row.team_id, row.name, row.email, row.address, row.created_at,
  );
  return row;
}

export async function deleteClient(userId: string, id: string): Promise<boolean> {
  const { changes } = await dbRun("DELETE FROM clients WHERE id = ? AND user_id = ?", id, userId);
  return changes > 0;
}

export async function setClientTeam(userId: string, clientId: string, teamId: string | null): Promise<boolean> {
  const client = await dbGet<{ user_id: string; team_id: string | null }>(
    "SELECT user_id, team_id FROM clients WHERE id = ?", clientId
  );
  if (!client) return false;

  const isOwner = client.user_id === userId;
  const isTeamAdmin = teamId
    ? !!(await dbGet(
        `SELECT tm.id FROM team_members tm WHERE tm.team_id = ? AND tm.user_id = ? AND tm.role IN ('admin', 'owner')`,
        teamId, userId
      ))
    : false;
  const wasShared = client.team_id
    ? !!(await dbGet(
        `SELECT tm.id FROM team_members tm WHERE tm.team_id = ? AND tm.user_id = ? AND tm.role IN ('admin', 'owner')`,
        client.team_id, userId
      ))
    : false;

  if (!isOwner && !isTeamAdmin && !wasShared) return false;

  const { changes } = await dbRun("UPDATE clients SET team_id = ? WHERE id = ?", teamId, clientId);
  return changes > 0;
}

function safeParse(json: string): Invoice {
  try {
    return JSON.parse(json) as Invoice;
  } catch {
    return {} as Invoice;
  }
}
