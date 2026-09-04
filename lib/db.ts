import { createClient, type Client } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH = process.env.TURSO_AUTH_TOKEN;

declare global {
  var __invoalaDb: Client | undefined;
}

function getDb(): Client {
  if (!global.__invoalaDb) {
    if (!TURSO_URL) throw new Error("TURSO_DATABASE_URL is not set");
    global.__invoalaDb = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH || undefined,
    });
  }
  return global.__invoalaDb;
}

export { getDb };

let schemaInitialized = false;

// Bump this whenever a new ALTER TABLE / one-time migration is added below.
// Every serverless cold start used to re-run the full ~90-statement
// migration block sequentially (each wrapped in try/catch to tolerate
// "column already exists") before serving its first request — real,
// measurable latency on a fresh instance. This gate makes that a single
// cheap read on every cold start except the one right after a deploy that
// actually changed the schema.
const SCHEMA_VERSION = "2026-09-05.2";

async function ensureSchema(): Promise<void> {
  const db = getDb();

  await db.batch([
    { sql: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user',
      timezone TEXT NOT NULL DEFAULT '',
      email_verified INTEGER NOT NULL DEFAULT 0,
      pending_email TEXT,
      google_id TEXT,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)` },
    { sql: `CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      team_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, name COLLATE NOCASE)
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id)` },
    { sql: `CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      team_id TEXT,
      doc_type TEXT NOT NULL DEFAULT 'invoice',
      number TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'draft',
      client_name TEXT NOT NULL DEFAULT '',
      total REAL NOT NULL DEFAULT 0,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id, updated_at DESC)` },
    { sql: `CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      provider TEXT NOT NULL DEFAULT 'dev',
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      current_period_end INTEGER NOT NULL,
      cancel_at_period_end INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id)` },
    { sql: `CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'teams_monthly',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id)` },
    { sql: `CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      invited_by TEXT REFERENCES users(id),
      joined_at INTEGER NOT NULL,
      UNIQUE(team_id, user_id)
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id)` },
    { sql: `CREATE TABLE IF NOT EXISTS team_invites (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      email TEXT NOT NULL COLLATE NOCASE,
      role TEXT NOT NULL DEFAULT 'member',
      invited_by TEXT NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token_hash)` },
    { sql: `CREATE TABLE IF NOT EXISTS email_log (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      data TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(token_hash)` },
    { sql: `CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'ai',
      subject TEXT NOT NULL DEFAULT '',
      rating INTEGER,
      rating_comment TEXT,
      rating_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id)` },
    { sql: `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      sender_id TEXT,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at)` },
    { sql: `CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_email TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_id TEXT,
      target_type TEXT,
      details TEXT,
      ip_address TEXT,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id)` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_id)` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)` },
    { sql: `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      read INTEGER NOT NULL DEFAULT 0,
      meta TEXT,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC)` },
    { sql: `CREATE TABLE IF NOT EXISTS billing_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      email TEXT PRIMARY KEY,
      source TEXT NOT NULL DEFAULT 'website',
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created
      ON newsletter_subscribers(created_at DESC)` },
    { sql: `CREATE TABLE IF NOT EXISTS promos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL,
      polar_discount_id TEXT NOT NULL,
      percent INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      welcome_sent INTEGER NOT NULL DEFAULT 0,
      reminder_sent INTEGER NOT NULL DEFAULT 0
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_promos_reminder
      ON promos(expires_at, welcome_sent, reminder_sent)` },
    { sql: `CREATE TABLE IF NOT EXISTS fx_cache (
      day TEXT PRIMARY KEY,
      rates TEXT NOT NULL,
      fetched_at INTEGER NOT NULL
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT 'other',
      payment_date TEXT NOT NULL,
      reference TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id, payment_date)` },
    { sql: `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE TABLE IF NOT EXISTS usage_events (
      id TEXT PRIMARY KEY,
      event TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      user_id TEXT,
      ip_hash TEXT,
      meta TEXT,
      created_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_usage_events_created ON usage_events(created_at)` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_usage_events_visitor ON usage_events(visitor_id, created_at)` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_usage_events_event ON usage_events(event, created_at)` },
    { sql: `CREATE TABLE IF NOT EXISTS service_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      team_id TEXT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      rate REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_service_items_user ON service_items(user_id)` },
    { sql: `CREATE INDEX IF NOT EXISTS idx_service_items_team ON service_items(team_id)` },
  ]);

  const versionRow = await db.execute("SELECT value FROM app_settings WHERE key = 'schema_version'");
  if ((versionRow.rows[0] as { value?: string } | undefined)?.value === SCHEMA_VERSION) {
    schemaInitialized = true;
    return;
  }

  // Migration: add viewed_at if missing (ALTER TABLE throws if column exists)
  try {
    await db.execute("ALTER TABLE invoices ADD COLUMN viewed_at INTEGER");
  } catch {}

  // Migration: add share_token if missing (public share links require a token)
  try {
    await db.execute("ALTER TABLE invoices ADD COLUMN share_token TEXT");
  } catch {}

  // Migration: next scheduled run for recurring invoices
  try {
    await db.execute("ALTER TABLE invoices ADD COLUMN recurring_next_at INTEGER");
  } catch {}

  // Migration: client management fields (extends the existing clients table
  // rather than a second customer table — see lib/data.ts client functions).
  for (const col of [
    "status TEXT NOT NULL DEFAULT 'active'",
    "contact_name TEXT NOT NULL DEFAULT ''",
    "phone TEXT NOT NULL DEFAULT ''",
    "website TEXT NOT NULL DEFAULT ''",
    "city TEXT NOT NULL DEFAULT ''",
    "state TEXT NOT NULL DEFAULT ''",
    "country TEXT NOT NULL DEFAULT ''",
    "postal_code TEXT NOT NULL DEFAULT ''",
    "tax_number TEXT NOT NULL DEFAULT ''",
    "business_reg_number TEXT NOT NULL DEFAULT ''",
    "currency TEXT NOT NULL DEFAULT ''",
    "payment_terms_days INTEGER",
    "default_tax_rate REAL",
    "default_discount REAL",
    "default_notes TEXT NOT NULL DEFAULT ''",
    "default_payment_instructions TEXT NOT NULL DEFAULT ''",
    "internal_notes TEXT NOT NULL DEFAULT ''",
    "updated_at INTEGER",
  ]) {
    try {
      await db.execute(`ALTER TABLE clients ADD COLUMN ${col}`);
    } catch {}
  }
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(user_id, status)");
  } catch {}

  // Migration: a real client_id link on invoices. Previously invoices only
  // stored a denormalized client_name string, which can't support accurate
  // per-client totals (name edits/typos silently break the link). Nullable +
  // ON DELETE SET NULL so archiving/deleting a client never touches its
  // historical invoices.
  try {
    await db.execute("ALTER TABLE invoices ADD COLUMN client_id TEXT REFERENCES clients(id) ON DELETE SET NULL");
  } catch {}
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id)");
  } catch {}
  // One-time best-effort backfill for invoices created before client_id
  // existed: link by exact (case-insensitive) name match for the same user.
  // Safe to re-run — it only ever fills NULLs.
  try {
    await db.execute(`UPDATE invoices SET client_id = (
      SELECT c.id FROM clients c
      WHERE c.user_id = invoices.user_id AND c.name = invoices.client_name COLLATE NOCASE
      LIMIT 1
    ) WHERE client_id IS NULL AND client_name != ''`);
  } catch {}

  try {
    await db.execute(`CREATE TABLE IF NOT EXISTS seo_redirects (
      id TEXT PRIMARY KEY,
      source TEXT NOT NULL,
      destination TEXT NOT NULL,
      status_code INTEGER NOT NULL DEFAULT 301,
      active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT,
      created_at INTEGER NOT NULL
    )`);
    await db.execute("CREATE INDEX IF NOT EXISTS idx_seo_redirects_source ON seo_redirects(source)");
  } catch {}

  // Migration: per-user business/invoice-defaults profile — the "General
  // settings" backing store for the Personal workspace (no team active).
  // Applied as defaults when starting a brand-new invoice (see
  // InvoiceGenerator's hydration effect) and by /api/account/settings.
  // Deliberately a smaller field set than teams' below (no quote/branding/
  // email-template richness) — those are workspace-configuration concepts
  // that belong to a team, not a solo account. See lib/workspace-settings.ts.
  for (const col of [
    "business_name TEXT NOT NULL DEFAULT ''",
    "business_email TEXT NOT NULL DEFAULT ''",
    "business_address TEXT NOT NULL DEFAULT ''",
    "business_logo TEXT NOT NULL DEFAULT ''",
    "business_phone TEXT NOT NULL DEFAULT ''",
    "business_website TEXT NOT NULL DEFAULT ''",
    "invoice_prefix TEXT NOT NULL DEFAULT 'INV-'",
    "next_invoice_number INTEGER NOT NULL DEFAULT 1",
    "default_payment_terms_days INTEGER NOT NULL DEFAULT 14",
    "default_tax_rate REAL",
    "default_notes TEXT NOT NULL DEFAULT ''",
    "default_payment_instructions TEXT NOT NULL DEFAULT ''",
  ]) {
    try {
      await db.execute(`ALTER TABLE users ADD COLUMN ${col}`);
    } catch {}
  }

  // Migration: workspace upgrade. `teams`/`team_members`/`team_invites`
  // already existed (the original Teams feature); this extends `teams` into
  // a full workspace — business profile, branding, regional settings,
  // invoice/quote defaults and numbering, email preferences, and an
  // explicit 'owner' role so permission checks don't have to special-case
  // teams.owner_id everywhere (see lib/permissions.ts, lib/workspace-settings.ts).
  // Column names mirror the existing `clients` table's business-info
  // columns (contact/address/tax fields) for the same shape already used
  // there, rather than inventing a second convention.
  for (const col of [
    "status TEXT NOT NULL DEFAULT 'active'",
    "logo TEXT NOT NULL DEFAULT ''",
    "brand_color TEXT NOT NULL DEFAULT ''",
    "show_logo_on_documents INTEGER NOT NULL DEFAULT 1",
    "business_name_display TEXT NOT NULL DEFAULT 'business_name'",
    "business_name TEXT NOT NULL DEFAULT ''",
    "legal_business_name TEXT NOT NULL DEFAULT ''",
    "business_email TEXT NOT NULL DEFAULT ''",
    "business_address TEXT NOT NULL DEFAULT ''",
    "phone TEXT NOT NULL DEFAULT ''",
    "website TEXT NOT NULL DEFAULT ''",
    "city TEXT NOT NULL DEFAULT ''",
    "state TEXT NOT NULL DEFAULT ''",
    "country TEXT NOT NULL DEFAULT ''",
    "postal_code TEXT NOT NULL DEFAULT ''",
    "tax_number TEXT NOT NULL DEFAULT ''",
    "business_reg_number TEXT NOT NULL DEFAULT ''",
    "default_currency TEXT NOT NULL DEFAULT 'USD'",
    "date_format TEXT NOT NULL DEFAULT 'MM/DD/YYYY'",
    "timezone TEXT NOT NULL DEFAULT ''",
    "language TEXT NOT NULL DEFAULT 'en'",
    "default_tax_rate REAL",
    "default_notes TEXT NOT NULL DEFAULT ''",
    "default_payment_instructions TEXT NOT NULL DEFAULT ''",
    "default_payment_terms_days INTEGER NOT NULL DEFAULT 14",
    "invoice_prefix TEXT NOT NULL DEFAULT 'INV-'",
    "next_invoice_number INTEGER NOT NULL DEFAULT 1",
    "quote_prefix TEXT NOT NULL DEFAULT 'QUO-'",
    "next_quote_number INTEGER NOT NULL DEFAULT 1",
    "quote_validity_days INTEGER NOT NULL DEFAULT 30",
    "default_quote_notes TEXT NOT NULL DEFAULT ''",
    "receipt_prefix TEXT NOT NULL DEFAULT 'RCPT-'",
    "next_receipt_number INTEGER NOT NULL DEFAULT 1",
    "invoice_email_subject TEXT NOT NULL DEFAULT ''",
    "quote_email_subject TEXT NOT NULL DEFAULT ''",
    "receipt_email_subject TEXT NOT NULL DEFAULT ''",
    "show_pdf_attachment INTEGER NOT NULL DEFAULT 1",
    "include_payment_link INTEGER NOT NULL DEFAULT 1",
    "include_business_contact INTEGER NOT NULL DEFAULT 1",
  ]) {
    try {
      await db.execute(`ALTER TABLE teams ADD COLUMN ${col}`);
    } catch {}
  }
  // team_members.role was only ever 'admin' | 'member' — the creator's own
  // membership row was inserted with role='admin', with ownership tracked
  // purely via teams.owner_id. Backfill 'owner' onto that row so role alone
  // is now authoritative; safe to re-run (only ever touches rows that still
  // say 'admin' for the actual owner).
  try {
    await db.execute(`UPDATE team_members SET role = 'owner'
      WHERE role != 'owner' AND user_id = (SELECT owner_id FROM teams WHERE teams.id = team_members.team_id)`);
  } catch {}

  // Migration: team_id on payments, so a payment inherits its invoice's
  // workspace (mirrors the existing clients.team_id / invoices.team_id
  // columns) instead of requiring a join through invoices every time.
  try {
    await db.execute("ALTER TABLE payments ADD COLUMN team_id TEXT");
  } catch {}
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_payments_team ON payments(team_id)");
  } catch {}
  // Backfill from the invoice each payment already belongs to.
  try {
    await db.execute(`UPDATE payments SET team_id = (
      SELECT i.team_id FROM invoices i WHERE i.id = payments.invoice_id
    ) WHERE team_id IS NULL`);
  } catch {}

  // Migration: invoices.team_id existed from the original schema but was
  // never indexed or actually queried — add the index now that workspace
  // scoping uses it (see lib/data.ts). Also add updated_by so an edit by a
  // team member other than the original creator (invoices.user_id) is
  // attributable.
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_invoices_team ON invoices(team_id, updated_at DESC)");
  } catch {}
  try {
    await db.execute("ALTER TABLE invoices ADD COLUMN updated_by TEXT");
  } catch {}
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_clients_team ON clients(team_id)");
  } catch {}

  // Migration: team-scoped activity reuses audit_logs (see lib/audit.ts)
  // instead of a second event table — target_type/target_id/details already
  // map onto entityType/entityId/metadata, this just adds the workspace the
  // event happened in. NULL for existing (platform-admin) rows.
  try {
    await db.execute("ALTER TABLE audit_logs ADD COLUMN team_id TEXT");
  } catch {}
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_audit_team ON audit_logs(team_id, created_at DESC)");
  } catch {}

  // Migration: email_log gains enough context (who sent it, which invoice,
  // what kind) to power a per-user/workspace "Email activity" feed — it
  // previously only existed for admin-level diagnostics (to_email/subject/
  // status), with no way to tell which user or invoice an entry belonged to.
  for (const col of [
    "user_id TEXT",
    "team_id TEXT",
    "invoice_id TEXT",
    "kind TEXT",
  ]) {
    try {
      await db.execute(`ALTER TABLE email_log ADD COLUMN ${col}`);
    } catch {}
  }
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_email_log_user ON email_log(user_id, created_at DESC)");
  } catch {}
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_email_log_team ON email_log(team_id, created_at DESC)");
  } catch {}
  try {
    await db.execute("CREATE INDEX IF NOT EXISTS idx_email_log_invoice ON email_log(invoice_id)");
  } catch {}

  await db.execute({
    sql: `INSERT INTO app_settings (key, value, updated_at) VALUES ('schema_version', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    args: [SCHEMA_VERSION, Date.now()],
  });

  schemaInitialized = true;
}

let schemaReady: Promise<void> | null = null;

async function ensureSchemaOnce(): Promise<void> {
  if (schemaInitialized) return;
  if (!schemaReady) {
    schemaReady = ensureSchema().catch((err) => {
      schemaReady = null;
      schemaInitialized = false;
      throw err;
    });
  }
  return schemaReady;
}

export async function dbAll<T = Record<string, unknown>>(sql: string, ...args: unknown[]): Promise<T[]> {
  await ensureSchemaOnce();
  const db = getDb();
  const result = await db.execute({ sql, args: args as (string | number | null)[] });
  // libsql's Row objects behave like plain objects for property access but
  // aren't recognized as one by React's Server->Client serialization check
  // ("Only plain objects can be passed to Client Components... Classes or
  // other objects with methods are not supported") whenever a query result
  // is passed straight through as a prop (e.g. app/dashboard/page.tsx's
  // initialInvoices/initialClients). Spreading rebuilds each row as a real
  // Object.prototype object with the same data, which fixes that everywhere
  // this function is used instead of patching every call site.
  return result.rows.map((row) => ({ ...row })) as T[];
}

export async function dbGet<T = Record<string, unknown>>(sql: string, ...args: unknown[]): Promise<T | undefined> {
  const rows = await dbAll<T>(sql, ...args);
  return rows[0] as T | undefined;
}

export async function dbRun(sql: string, ...args: unknown[]): Promise<{ changes: number; lastInsertRowid: bigint }> {
  await ensureSchemaOnce();
  const db = getDb();
  const result = await db.execute({ sql, args: args as (string | number | null)[] });
  return { changes: Number(result.rowsAffected), lastInsertRowid: result.lastInsertRowid ?? BigInt(0) };
}

export async function dbExec(sql: string): Promise<void> {
  await ensureSchemaOnce();
  const db = getDb();
  await db.execute(sql);
}
// redeploy
