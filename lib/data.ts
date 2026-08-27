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
  created_at: number;
};

export async function listClients(userId: string): Promise<ClientRow[]> {
  return await dbAll<ClientRow>(
    "SELECT id, name, email, address, created_at FROM clients WHERE user_id = ? ORDER BY name COLLATE NOCASE LIMIT 500",
    userId
  );
}

export async function upsertClient(
  userId: string,
  client: { name: string; email?: string; address?: string },
): Promise<ClientRow> {
  const existing = await dbGet<ClientRow>(
    "SELECT id, name, email, address, created_at FROM clients WHERE user_id = ? AND name = ? COLLATE NOCASE",
    userId, client.name
  );
  if (existing) {
    await dbRun("UPDATE clients SET email = ?, address = ? WHERE id = ?",
      client.email ?? existing.email,
      client.address ?? existing.address,
      existing.id,
    );
    return { ...existing, email: client.email ?? existing.email, address: client.address ?? existing.address };
  }
  const row: ClientRow = {
    id: randomUUID(),
    name: client.name,
    email: client.email ?? "",
    address: client.address ?? "",
    created_at: Date.now(),
  };
  await dbRun("INSERT INTO clients (id, user_id, name, email, address, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    row.id, userId, row.name, row.email, row.address, row.created_at,
  );
  return row;
}

export async function deleteClient(userId: string, id: string): Promise<boolean> {
  const { changes } = await dbRun("DELETE FROM clients WHERE id = ? AND user_id = ?", id, userId);
  return changes > 0;
}

function safeParse(json: string): Invoice {
  try {
    return JSON.parse(json) as Invoice;
  } catch {
    return {} as Invoice;
  }
}
