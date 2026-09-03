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
  ]);

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
