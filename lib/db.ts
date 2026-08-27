import { mkdir } from "fs/promises";
import path from "path";
import Database from "better-sqlite3";
import { hashPassword } from "@/lib/server-auth";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

declare global {
  var __invoalaDb: Database.Database | undefined;
}

function createDb(): Database.Database {
  mkdir(DATA_DIR, { recursive: true });
  const db = new Database(path.join(DATA_DIR, "invoala.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 5000");
  db.pragma("foreign_keys = ON");
  migrate(db);
  ensureSchema(db);
  return db;
}

function ensureSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      team_id TEXT,
      name TEXT NOT NULL,
      email TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      UNIQUE(user_id, name COLLATE NOCASE)
    );
    CREATE INDEX IF NOT EXISTS idx_clients_user ON clients(user_id);
    CREATE INDEX IF NOT EXISTS idx_clients_team ON clients(team_id);
    CREATE TABLE IF NOT EXISTS invoices (
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
    );
    CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id, updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_invoices_team ON invoices(team_id);
    CREATE TABLE IF NOT EXISTS subscriptions (
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
    );
    CREATE INDEX IF NOT EXISTS idx_subs_user ON subscriptions(user_id);
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan TEXT NOT NULL DEFAULT 'teams_monthly',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member',
      invited_by TEXT REFERENCES users(id),
      joined_at INTEGER NOT NULL,
      UNIQUE(team_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
    CREATE TABLE IF NOT EXISTS team_invites (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      email TEXT NOT NULL COLLATE NOCASE,
      role TEXT NOT NULL DEFAULT 'member',
      invited_by TEXT NOT NULL REFERENCES users(id),
      token_hash TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_team_invites_team ON team_invites(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token_hash);
    CREATE TABLE IF NOT EXISTS email_log (
      id TEXT PRIMARY KEY,
      to_email TEXT NOT NULL,
      subject TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      error TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      data TEXT,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_hash ON tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'ai',
      subject TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL,
      sender_id TEXT,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
  `);
}

function migrate(db: Database.Database) {
  // Check if tables exist before migrating
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as Array<{ name: string }>;
  const tableNames = new Set(tables.map((t) => t.name));

  if (tableNames.has("users")) {
    const cols = db.pragma("table_info(users)") as Array<{ name: string }>;
    const names = new Set(cols.map((c) => c.name));
    if (!names.has("timezone")) db.exec("ALTER TABLE users ADD COLUMN timezone TEXT NOT NULL DEFAULT ''");
    if (!names.has("email_verified")) db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0");
    if (!names.has("pending_email")) db.exec("ALTER TABLE users ADD COLUMN pending_email TEXT");
    if (!names.has("google_id")) db.exec("ALTER TABLE users ADD COLUMN google_id TEXT");
  }

  if (tableNames.has("clients")) {
    const clientCols = db.pragma("table_info(clients)") as Array<{ name: string }>;
    const clientNames = new Set(clientCols.map((c) => c.name));
    if (!clientNames.has("team_id")) db.exec("ALTER TABLE clients ADD COLUMN team_id TEXT");
  }

  if (tableNames.has("invoices")) {
    const invoiceCols = db.pragma("table_info(invoices)") as Array<{ name: string }>;
    const invoiceNames = new Set(invoiceCols.map((c) => c.name));
    if (!invoiceNames.has("team_id")) db.exec("ALTER TABLE invoices ADD COLUMN team_id TEXT");
  }

  if (!tableNames.has("conversations")) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'ai',
        subject TEXT NOT NULL DEFAULT '',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
        sender_type TEXT NOT NULL,
        sender_id TEXT,
        content TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, created_at);
    `);
  }
}

export function getDb(): Database.Database {
  if (!global.__invoalaDb) global.__invoalaDb = createDb();
  return global.__invoalaDb;
}
