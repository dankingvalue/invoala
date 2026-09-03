import { randomUUID } from "crypto";
import { dbGet, dbAll, dbRun } from "@/lib/db";
import { computeTotals, type Invoice } from "@/lib/invoice";
import { ledgerStatusForAmount, round2, type PaymentMethod } from "@/lib/invoice-status";

export type InvoiceRow = {
  id: string;
  doc_type: string;
  number: string;
  currency: string;
  status: string;
  client_name: string;
  client_id: string | null;
  total: number;
  created_at: number;
  updated_at: number;
  viewed_at: number | null;
  data: Invoice;
};

const INVOICE_COLUMNS = "id, doc_type, number, currency, status, client_name, client_id, total, data, created_at, updated_at, viewed_at";

export async function listInvoices(userId: string): Promise<InvoiceRow[]> {
  const rows = await dbAll<Omit<InvoiceRow, "data"> & { data: string }>(
    `SELECT ${INVOICE_COLUMNS} FROM invoices WHERE user_id = ? ORDER BY updated_at DESC LIMIT 500`,
    userId
  );
  return rows.map((r) => ({ ...r, data: safeParse(r.data) }));
}

export async function getInvoice(userId: string, id: string): Promise<InvoiceRow | null> {
  const row = await dbGet<Omit<InvoiceRow, "data"> & { data: string }>(
    `SELECT ${INVOICE_COLUMNS} FROM invoices WHERE user_id = ? AND id = ?`,
    userId, id
  );
  if (!row) return null;
  return { ...row, data: safeParse(row.data) };
}

// Everything needed for a client's profile page in one round trip: the
// client record, its invoices (for the Invoices/Quotes tabs and financial
// summary), and the payments on those invoices (for the Payments tab).
export async function getClientProfile(userId: string, clientId: string): Promise<{
  client: ClientRow;
  invoices: InvoiceRow[];
  payments: (PaymentRow & { invoice_number: string })[];
} | null> {
  const client = await dbGet<ClientRow>(
    `SELECT ${CLIENT_COLUMNS} FROM clients c LEFT JOIN teams t ON c.team_id = t.id WHERE c.id = ? AND c.user_id = ?`,
    clientId, userId,
  );
  if (!client) return null;

  const invoiceRows = await dbAll<Omit<InvoiceRow, "data"> & { data: string }>(
    `SELECT ${INVOICE_COLUMNS} FROM invoices WHERE user_id = ? AND client_id = ? ORDER BY updated_at DESC`,
    userId, clientId,
  );
  const invoices = invoiceRows.map((r) => ({ ...r, data: safeParse(r.data) }));

  const payments = invoices.length
    ? await dbAll<PaymentRow & { invoice_number: string }>(
        `SELECT p.id, p.invoice_id, p.amount, p.payment_method, p.payment_date, p.reference, p.notes, p.created_at, p.updated_at, i.number AS invoice_number
         FROM payments p JOIN invoices i ON i.id = p.invoice_id
         WHERE p.user_id = ? AND p.invoice_id IN (${invoices.map(() => "?").join(",")})
         ORDER BY p.payment_date DESC, p.created_at DESC`,
        userId, ...invoices.map((i) => i.id),
      )
    : [];

  return { client, invoices, payments };
}

export async function upsertInvoice(
  userId: string,
  invoice: Invoice,
  opts: { id?: string; status?: string; clientId?: string | null } = {},
): Promise<{ id: string }> {
  const now = Date.now();
  const total = computeTotals(invoice).total;
  let id = opts.id || "";

  // A saved client_id always wins for relational rollups; when none is
  // passed, fall back to matching the typed client name so invoices created
  // before this field existed (or without picking a saved client) still
  // link up wherever the name matches exactly.
  const clientId =
    opts.clientId !== undefined
      ? opts.clientId
      : invoice.clientName
        ? (await dbGet<{ id: string }>(
            "SELECT id FROM clients WHERE user_id = ? AND name = ? COLLATE NOCASE",
            userId, invoice.clientName,
          ))?.id ?? null
        : null;

  if (id) {
    const owned = await dbGet(
      "SELECT id FROM invoices WHERE id = ? AND user_id = ?",
      id, userId
    );
    if (!owned) throw new Error("not-found");
    await dbRun(
      `UPDATE invoices SET doc_type=?, number=?, currency=?, status=?, client_name=?, client_id=?, total=?, data=?, updated_at=? WHERE id=? AND user_id=?`,
      invoice.docType,
      invoice.invoiceNumber,
      invoice.currency,
      opts.status || "draft",
      invoice.clientName,
      clientId,
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
    `INSERT INTO invoices (id, user_id, doc_type, number, currency, status, client_name, client_id, total, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    invoice.docType,
    invoice.invoiceNumber,
    invoice.currency,
    "draft",
    invoice.clientName,
    clientId,
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
  // payments.invoice_id has ON DELETE CASCADE, so this can never leave
  // orphaned payment rows behind.
  const { changes } = await dbRun("DELETE FROM invoices WHERE id = ? AND user_id = ?", id, userId);
  return changes > 0;
}

// Voiding keeps the invoice (and its payment history) around but marks it as
// no longer an active receivable — never a hard delete.
export async function voidInvoice(userId: string, id: string): Promise<boolean> {
  const { changes } = await dbRun(
    "UPDATE invoices SET status = 'void', updated_at = ? WHERE id = ? AND user_id = ? AND status != 'draft'",
    Date.now(),
    id,
    userId,
  );
  return changes > 0;
}

// Reopens a void invoice back to a normal ledger status (derived from
// whatever payments already exist against it — same recalculation every
// other payment mutation uses, so this can't disagree with the payments sum).
export async function reopenInvoice(userId: string, id: string): Promise<InvoiceSummary | null> {
  // Flip out of 'void' into a neutral ledger status first — recalc's guard
  // treats 'void' as terminal (so a payment mutation on a void invoice can't
  // accidentally un-void it), which would otherwise make this a no-op.
  const { changes } = await dbRun(
    "UPDATE invoices SET status = 'sent', updated_at = ? WHERE id = ? AND user_id = ? AND status = 'void'",
    Date.now(),
    id,
    userId,
  );
  if (changes === 0) return null;
  return recalcInvoiceFromPayments(userId, id);
}

// Copies an invoice's content into a new draft. Never carries over payment
// records, paid amount, view state, or the share token — a duplicate is a
// fresh, unpaid, unissued document.
export async function duplicateInvoice(userId: string, id: string): Promise<InvoiceRow | null> {
  const source = await dbGet<{ data: string; client_id: string | null }>(
    "SELECT data, client_id FROM invoices WHERE id = ? AND user_id = ?",
    id,
    userId,
  );
  if (!source) return null;

  const original = safeParse(source.data);
  const invoiceNumber = await uniqueInvoiceNumber(userId, original.invoiceNumber);
  const invoice: Invoice = {
    ...original,
    invoiceNumber,
    amountPaid: undefined,
    paymentEnabled: original.paymentEnabled,
  };

  const newId = randomUUID();
  const now = Date.now();
  const total = computeTotals(invoice).total;
  await dbRun(
    `INSERT INTO invoices (id, user_id, doc_type, number, currency, status, client_name, client_id, total, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?)`,
    newId,
    userId,
    invoice.docType,
    invoice.invoiceNumber,
    invoice.currency,
    invoice.clientName,
    source.client_id,
    total,
    JSON.stringify(invoice),
    now,
    now,
  );
  return {
    id: newId,
    doc_type: invoice.docType,
    number: invoiceNumber,
    currency: invoice.currency,
    status: "draft",
    client_name: invoice.clientName,
    client_id: source.client_id,
    total,
    created_at: now,
    updated_at: now,
    viewed_at: null,
    data: invoice,
  };
}

// "INV-014" -> "INV-014-COPY", then "-COPY-2", "-COPY-3"... until it's free.
// There's no sequence generator elsewhere in the app to reuse (invoice
// numbers are free text the user edits directly), so this is the smallest
// scheme that guarantees uniqueness per user without inventing a full
// numbering system.
async function uniqueInvoiceNumber(userId: string, base: string): Promise<string> {
  const root = (base || "INV").trim() || "INV";
  const existing = new Set(
    (await dbAll<{ number: string }>("SELECT number FROM invoices WHERE user_id = ?", userId)).map(
      (r) => r.number,
    ),
  );
  let candidate = `${root}-COPY`;
  let n = 2;
  while (existing.has(candidate)) {
    candidate = `${root}-COPY-${n}`;
    n += 1;
  }
  return candidate;
}

export type InvoiceSummary = { amountPaid: number; total: number; status: string };

// The one place that turns the payments ledger into the invoice's cached
// amountPaid + status. Every payment create/edit/delete, and reopening a
// void invoice, goes through this so the two can never disagree.
async function recalcInvoiceFromPayments(userId: string, invoiceId: string): Promise<InvoiceSummary | null> {
  const inv = await dbGet<{ total: number; status: string; data: string }>(
    "SELECT total, status, data FROM invoices WHERE id = ? AND user_id = ?",
    invoiceId,
    userId,
  );
  if (!inv) return null;

  const sumRow = await dbGet<{ sum: number | null }>(
    "SELECT SUM(amount) AS sum FROM payments WHERE invoice_id = ?",
    invoiceId,
  );
  const amountPaid = round2(sumRow?.sum || 0);
  const status = ledgerStatusForAmount(amountPaid, inv.total, inv.status);

  const data = safeParse(inv.data) as Invoice & Record<string, unknown>;
  data.amountPaid = amountPaid > 0 ? amountPaid : undefined;

  await dbRun(
    "UPDATE invoices SET status = ?, data = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    status,
    JSON.stringify(data),
    Date.now(),
    invoiceId,
    userId,
  );

  return { amountPaid, total: inv.total, status };
}

export type PaymentRow = {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string;
  notes: string;
  created_at: number;
  updated_at: number;
};

export async function listPayments(userId: string, invoiceId: string): Promise<PaymentRow[] | null> {
  const owned = await dbGet<{ id: string }>(
    "SELECT id FROM invoices WHERE id = ? AND user_id = ?",
    invoiceId,
    userId,
  );
  if (!owned) return null;
  return dbAll<PaymentRow>(
    "SELECT id, invoice_id, amount, payment_method, payment_date, reference, notes, created_at, updated_at FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC, created_at DESC",
    invoiceId,
  );
}

export type PaymentInput = {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
};

export type PaymentMutationError = "not-found" | "draft" | "void" | "invalid-amount" | "exceeds-balance";

export async function createPayment(
  userId: string,
  invoiceId: string,
  input: PaymentInput,
): Promise<{ payment: PaymentRow; invoice: InvoiceSummary } | { error: PaymentMutationError }> {
  const inv = await dbGet<{ total: number; status: string }>(
    "SELECT total, status FROM invoices WHERE id = ? AND user_id = ?",
    invoiceId,
    userId,
  );
  if (!inv) return { error: "not-found" };
  if (inv.status === "draft") return { error: "draft" };
  if (inv.status === "void") return { error: "void" };

  const amount = round2(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "invalid-amount" };

  const sumRow = await dbGet<{ sum: number | null }>(
    "SELECT SUM(amount) AS sum FROM payments WHERE invoice_id = ?",
    invoiceId,
  );
  const alreadyPaid = round2(sumRow?.sum || 0);
  const remaining = round2(inv.total - alreadyPaid);
  // Prevent overpayment — this app has no credit/overpayment accounting, so
  // the safe default is to reject rather than silently create a negative
  // balance the rest of the UI doesn't know how to show.
  if (amount > remaining + 0.005) return { error: "exceeds-balance" };

  const id = randomUUID();
  const now = Date.now();
  await dbRun(
    `INSERT INTO payments (id, invoice_id, user_id, amount, payment_method, payment_date, reference, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    invoiceId,
    userId,
    amount,
    input.paymentMethod,
    input.paymentDate,
    (input.reference || "").slice(0, 200),
    (input.notes || "").slice(0, 2000),
    now,
    now,
  );

  const invoice = await recalcInvoiceFromPayments(userId, invoiceId);
  if (!invoice) return { error: "not-found" };
  const payment = await dbGet<PaymentRow>(
    "SELECT id, invoice_id, amount, payment_method, payment_date, reference, notes, created_at, updated_at FROM payments WHERE id = ?",
    id,
  );
  return { payment: payment!, invoice };
}

export async function updatePayment(
  userId: string,
  paymentId: string,
  input: PaymentInput,
): Promise<{ payment: PaymentRow; invoice: InvoiceSummary } | { error: PaymentMutationError }> {
  const row = await dbGet<{ invoice_id: string }>(
    "SELECT invoice_id FROM payments WHERE id = ? AND user_id = ?",
    paymentId,
    userId,
  );
  if (!row) return { error: "not-found" };

  const inv = await dbGet<{ total: number; status: string }>(
    "SELECT total, status FROM invoices WHERE id = ? AND user_id = ?",
    row.invoice_id,
    userId,
  );
  if (!inv) return { error: "not-found" };
  if (inv.status === "void") return { error: "void" };

  const amount = round2(input.amount);
  if (!Number.isFinite(amount) || amount <= 0) return { error: "invalid-amount" };

  // Balance check excludes this payment's own current amount from the sum.
  const sumRow = await dbGet<{ sum: number | null }>(
    "SELECT SUM(amount) AS sum FROM payments WHERE invoice_id = ? AND id != ?",
    row.invoice_id,
    paymentId,
  );
  const otherPaid = round2(sumRow?.sum || 0);
  const remaining = round2(inv.total - otherPaid);
  if (amount > remaining + 0.005) return { error: "exceeds-balance" };

  await dbRun(
    `UPDATE payments SET amount = ?, payment_method = ?, payment_date = ?, reference = ?, notes = ?, updated_at = ?
     WHERE id = ? AND user_id = ?`,
    amount,
    input.paymentMethod,
    input.paymentDate,
    (input.reference || "").slice(0, 200),
    (input.notes || "").slice(0, 2000),
    Date.now(),
    paymentId,
    userId,
  );

  const invoice = await recalcInvoiceFromPayments(userId, row.invoice_id);
  if (!invoice) return { error: "not-found" };
  const payment = await dbGet<PaymentRow>(
    "SELECT id, invoice_id, amount, payment_method, payment_date, reference, notes, created_at, updated_at FROM payments WHERE id = ?",
    paymentId,
  );
  return { payment: payment!, invoice };
}

export async function deletePayment(
  userId: string,
  paymentId: string,
): Promise<{ invoiceId: string; invoice: InvoiceSummary } | null> {
  const row = await dbGet<{ invoice_id: string }>(
    "SELECT invoice_id FROM payments WHERE id = ? AND user_id = ?",
    paymentId,
    userId,
  );
  if (!row) return null;

  await dbRun("DELETE FROM payments WHERE id = ? AND user_id = ?", paymentId, userId);
  const invoice = await recalcInvoiceFromPayments(userId, row.invoice_id);
  if (!invoice) return null;
  return { invoiceId: row.invoice_id, invoice };
}

export type ClientRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  team_id: string | null;
  team_name: string | null;
  created_at: number;
  status: string;
  contact_name: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  tax_number: string;
  business_reg_number: string;
  currency: string;
  payment_terms_days: number | null;
  default_tax_rate: number | null;
  default_discount: number | null;
  default_notes: string;
  default_payment_instructions: string;
  internal_notes: string;
  updated_at: number | null;
};

const CLIENT_COLUMNS = `c.id, c.name, c.email, c.address, c.team_id, t.name AS team_name, c.created_at,
  c.status, c.contact_name, c.phone, c.website, c.city, c.state, c.country, c.postal_code,
  c.tax_number, c.business_reg_number, c.currency, c.payment_terms_days, c.default_tax_rate,
  c.default_discount, c.default_notes, c.default_payment_instructions, c.internal_notes, c.updated_at`;

export async function listClients(userId: string): Promise<ClientRow[]> {
  return await dbAll<ClientRow>(
    `SELECT ${CLIENT_COLUMNS}
     FROM clients c
     LEFT JOIN teams t ON c.team_id = t.id
     WHERE c.user_id = ?
        OR c.team_id IN (SELECT team_id FROM team_members WHERE user_id = ?)
     ORDER BY c.name COLLATE NOCASE LIMIT 500`,
    userId, userId
  );
}

// Per-client rollups computed from the invoices/payments ledger in one pass
// (not N+1 queries per client). Voided/cancelled invoices are excluded from
// totals entirely — they're not active receivables (same rule as the
// Documents dashboard's Outstanding card).
export type ClientFinancials = {
  client_id: string;
  invoice_count: number;
  total_invoiced: number;
  total_paid: number;
  last_invoice_at: number | null;
};

export async function getClientFinancials(userId: string): Promise<Record<string, ClientFinancials>> {
  const rows = await dbAll<{
    client_id: string;
    invoice_count: number;
    total_invoiced: number;
    total_paid: number;
    last_invoice_at: number | null;
  }>(
    `SELECT
       i.client_id AS client_id,
       COUNT(*) AS invoice_count,
       COALESCE(SUM(i.total), 0) AS total_invoiced,
       COALESCE(SUM((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id)), 0) AS total_paid,
       MAX(i.updated_at) AS last_invoice_at
     FROM invoices i
     WHERE i.user_id = ? AND i.client_id IS NOT NULL AND i.status NOT IN ('void', 'cancelled')
     GROUP BY i.client_id`,
    userId,
  );
  const byClient: Record<string, ClientFinancials> = {};
  for (const r of rows) byClient[r.client_id] = r;
  return byClient;
}

export type ClientInput = {
  name: string;
  email?: string;
  address?: string;
  contactName?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  taxNumber?: string;
  businessRegNumber?: string;
  currency?: string;
  paymentTermsDays?: number | null;
  defaultTaxRate?: number | null;
  defaultDiscount?: number | null;
  defaultNotes?: string;
  defaultPaymentInstructions?: string;
  internalNotes?: string;
};

// Kept for the invoice generator's "save this as a new client" quick-add
// (matches by name to avoid creating a second row for the exact same
// client typed twice) — distinct from createClient, which is the full
// Clients-page form and treats an exact name collision as an error instead
// of silently merging, since silently overwriting fields there would be
// surprising for a deliberate edit-vs-create action.
export async function upsertClient(
  userId: string,
  client: { name: string; email?: string; address?: string },
  teamId?: string | null,
): Promise<ClientRow> {
  const existing = await dbGet<ClientRow>(
    `SELECT ${CLIENT_COLUMNS} FROM clients c LEFT JOIN teams t ON c.team_id = t.id
     WHERE c.user_id = ? AND c.name = ? COLLATE NOCASE`,
    userId, client.name
  );
  if (existing) {
    const resolvedTeamId = teamId === undefined ? existing.team_id : teamId;
    await dbRun("UPDATE clients SET email = ?, address = ?, team_id = ?, updated_at = ? WHERE id = ?",
      client.email ?? existing.email,
      client.address ?? existing.address,
      resolvedTeamId,
      Date.now(),
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
  const id = randomUUID();
  const now = Date.now();
  const teamName = teamId
    ? (await dbGet<{ name: string }>("SELECT name FROM teams WHERE id = ?", teamId))?.name ?? null
    : null;
  await dbRun(
    "INSERT INTO clients (id, user_id, team_id, name, email, address, created_at, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)",
    id, userId, teamId ?? null, client.name, client.email ?? "", client.address ?? "", now, now,
  );
  return {
    id, name: client.name, email: client.email ?? "", address: client.address ?? "",
    team_id: teamId ?? null, team_name: teamName, created_at: now, status: "active",
    contact_name: "", phone: "", website: "", city: "", state: "", country: "", postal_code: "",
    tax_number: "", business_reg_number: "", currency: "", payment_terms_days: null,
    default_tax_rate: null, default_discount: null, default_notes: "", default_payment_instructions: "",
    internal_notes: "", updated_at: now,
  };
}

export type ClientMutationError = "duplicate_name" | "invalid_name";

export async function createClient(
  userId: string,
  input: ClientInput,
  teamId?: string | null,
): Promise<ClientRow | { error: ClientMutationError }> {
  const name = input.name.trim();
  if (!name || name.length > 120) return { error: "invalid_name" };

  const id = randomUUID();
  const now = Date.now();
  try {
    await dbRun(
      `INSERT INTO clients (
        id, user_id, team_id, name, email, address, created_at, status, updated_at,
        contact_name, phone, website, city, state, country, postal_code,
        tax_number, business_reg_number, currency, payment_terms_days,
        default_tax_rate, default_discount, default_notes, default_payment_instructions, internal_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      id, userId, teamId ?? null, name, input.email?.trim() ?? "", input.address?.trim() ?? "", now, now,
      input.contactName?.trim() ?? "", input.phone?.trim() ?? "", input.website?.trim() ?? "",
      input.city?.trim() ?? "", input.state?.trim() ?? "", input.country?.trim() ?? "", input.postalCode?.trim() ?? "",
      input.taxNumber?.trim() ?? "", input.businessRegNumber?.trim() ?? "", input.currency?.trim() ?? "",
      input.paymentTermsDays ?? null, input.defaultTaxRate ?? null, input.defaultDiscount ?? null,
      input.defaultNotes?.trim() ?? "", input.defaultPaymentInstructions?.trim() ?? "", input.internalNotes?.trim() ?? "",
    );
  } catch (err) {
    if (err instanceof Error && /UNIQUE/i.test(err.message)) return { error: "duplicate_name" };
    throw err;
  }
  const row = await dbGet<ClientRow>(`SELECT ${CLIENT_COLUMNS} FROM clients c LEFT JOIN teams t ON c.team_id = t.id WHERE c.id = ?`, id);
  return row!;
}

export async function updateClient(
  userId: string,
  id: string,
  input: ClientInput,
): Promise<ClientRow | { error: ClientMutationError } | null> {
  const owned = await dbGet<{ id: string }>("SELECT id FROM clients WHERE id = ? AND user_id = ?", id, userId);
  if (!owned) return null;

  const name = input.name.trim();
  if (!name || name.length > 120) return { error: "invalid_name" };

  try {
    await dbRun(
      `UPDATE clients SET
        name = ?, email = ?, address = ?, updated_at = ?,
        contact_name = ?, phone = ?, website = ?, city = ?, state = ?, country = ?, postal_code = ?,
        tax_number = ?, business_reg_number = ?, currency = ?, payment_terms_days = ?,
        default_tax_rate = ?, default_discount = ?, default_notes = ?, default_payment_instructions = ?, internal_notes = ?
       WHERE id = ? AND user_id = ?`,
      name, input.email?.trim() ?? "", input.address?.trim() ?? "", Date.now(),
      input.contactName?.trim() ?? "", input.phone?.trim() ?? "", input.website?.trim() ?? "",
      input.city?.trim() ?? "", input.state?.trim() ?? "", input.country?.trim() ?? "", input.postalCode?.trim() ?? "",
      input.taxNumber?.trim() ?? "", input.businessRegNumber?.trim() ?? "", input.currency?.trim() ?? "",
      input.paymentTermsDays ?? null, input.defaultTaxRate ?? null, input.defaultDiscount ?? null,
      input.defaultNotes?.trim() ?? "", input.defaultPaymentInstructions?.trim() ?? "", input.internalNotes?.trim() ?? "",
      id, userId,
    );
  } catch (err) {
    if (err instanceof Error && /UNIQUE/i.test(err.message)) return { error: "duplicate_name" };
    throw err;
  }
  const row = await dbGet<ClientRow>(`SELECT ${CLIENT_COLUMNS} FROM clients c LEFT JOIN teams t ON c.team_id = t.id WHERE c.id = ?`, id);
  return row!;
}

export async function setClientStatus(userId: string, id: string, status: "active" | "archived"): Promise<boolean> {
  const { changes } = await dbRun(
    "UPDATE clients SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?",
    status, Date.now(), id, userId,
  );
  return changes > 0;
}

export type DeleteClientResult = "deleted" | "not-found" | "has-invoices";

export async function deleteClient(userId: string, id: string): Promise<DeleteClientResult> {
  const owned = await dbGet<{ id: string }>("SELECT id FROM clients WHERE id = ? AND user_id = ?", id, userId);
  if (!owned) return "not-found";

  // Never hard-delete a client with real billing history — archive instead
  // so historical invoices/payments keep a client to point at.
  const linked = await dbGet<{ n: number }>(
    "SELECT COUNT(*) AS n FROM invoices WHERE client_id = ? AND user_id = ?", id, userId,
  );
  if ((linked?.n ?? 0) > 0) return "has-invoices";

  const { changes } = await dbRun("DELETE FROM clients WHERE id = ? AND user_id = ?", id, userId);
  return changes > 0 ? "deleted" : "not-found";
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
