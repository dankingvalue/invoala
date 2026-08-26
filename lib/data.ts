import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
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

export function listInvoices(userId: string): InvoiceRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, doc_type, number, currency, status, client_name, total, data, created_at, updated_at
       FROM invoices WHERE user_id = ? ORDER BY updated_at DESC LIMIT 500`,
    )
    .all(userId) as Array<Omit<InvoiceRow, "data"> & { data: string }>;
  return rows.map((r) => ({ ...r, data: safeParse(r.data) }));
}

export function getInvoice(userId: string, id: string): InvoiceRow | null {
  const row = getDb()
    .prepare(
      `SELECT id, doc_type, number, currency, status, client_name, total, data, created_at, updated_at
       FROM invoices WHERE user_id = ? AND id = ?`,
    )
    .get(userId, id) as (Omit<InvoiceRow, "data"> & { data: string }) | undefined;
  if (!row) return null;
  return { ...row, data: safeParse(row.data) };
}

export function upsertInvoice(
  userId: string,
  invoice: Invoice,
  opts: { id?: string; status?: string },
): { id: string } {
  const db = getDb();
  const now = Date.now();
  const total = computeTotals(invoice).total;
  let id = opts.id || "";

  if (id) {
    const owned = db
      .prepare("SELECT id FROM invoices WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!owned) throw new Error("not-found");
    db.prepare(
      `UPDATE invoices SET doc_type=?, number=?, currency=?, status=?, client_name=?, total=?, data=?, updated_at=? WHERE id=? AND user_id=?`,
    ).run(
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
  db.prepare(
    `INSERT INTO invoices (id, user_id, doc_type, number, currency, status, client_name, total, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
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

export function setInvoiceStatus(userId: string, id: string, status: string): boolean {
  const result = getDb()
    .prepare("UPDATE invoices SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?")
    .run(status, Date.now(), id, userId);
  return result.changes > 0;
}

export function deleteInvoice(userId: string, id: string): boolean {
  const result = getDb().prepare("DELETE FROM invoices WHERE id = ? AND user_id = ?").run(id, userId);
  return result.changes > 0;
}

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  created_at: number;
};

export function listClients(userId: string): ClientRow[] {
  return getDb()
    .prepare("SELECT id, name, email, address, created_at FROM clients WHERE user_id = ? ORDER BY name COLLATE NOCASE LIMIT 500")
    .all(userId) as ClientRow[];
}

export function upsertClient(
  userId: string,
  client: { name: string; email?: string; address?: string },
): ClientRow {
  const db = getDb();
  const existing = db
    .prepare("SELECT id, name, email, address, created_at FROM clients WHERE user_id = ? AND name = ? COLLATE NOCASE")
    .get(userId, client.name) as ClientRow | undefined;
  if (existing) {
    db.prepare("UPDATE clients SET email = ?, address = ? WHERE id = ?").run(
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
  db.prepare("INSERT INTO clients (id, user_id, name, email, address, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    row.id,
    userId,
    row.name,
    row.email,
    row.address,
    row.created_at,
  );
  return row;
}

export function deleteClient(userId: string, id: string): boolean {
  const result = getDb().prepare("DELETE FROM clients WHERE id = ? AND user_id = ?").run(id, userId);
  return result.changes > 0;
}

function safeParse(json: string): Invoice {
  try {
    return JSON.parse(json) as Invoice;
  } catch {
    return {} as Invoice;
  }
}
