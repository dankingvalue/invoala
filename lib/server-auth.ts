import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

export const USER_COOKIE = "invoala_session";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: number;
  timezone: string;
};

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Password must contain a number.";
  return null;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSession(userId: string): { token: string; expiresAt: number } {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  getDb()
    .prepare("INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(hashToken(token), userId, expiresAt, Date.now());
  return { token, expiresAt };
}

export function destroySession(token: string | undefined): void {
  if (!token) return;
  getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}

export function destroyAllSessions(userId: string): void {
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function getUserByToken(token: string | undefined): SessionUser | null {
  if (!token) return null;
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.name, u.role, u.email_verified, u.timezone, s.expires_at
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?`,
    )
    .get(hashToken(token)) as
    | { id: string; email: string; name: string; role: string; email_verified: number; timezone: string; expires_at: number }
    | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, email: row.email, name: row.name, role: row.role, email_verified: row.email_verified, timezone: row.timezone };
}

export function getSessionUser(req: Request): SessionUser | null {
  const match = req.headers.get("cookie")?.match(new RegExp(`${USER_COOKIE}=([^;]+)`));
  return getUserByToken(match?.[1]);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return getUserByToken(store.get(USER_COOKIE)?.value);
}

export function hasRole(user: SessionUser | null, roles: string[]): boolean {
  return !!user && roles.includes(user.role);
}

export function verificationRequired(): boolean {
  return (process.env.RESEND_API_KEY?.length ?? 0) > 0 || process.env.FORCE_EMAIL_VERIFICATION === "1";
}

const attemptLog = new Map<string, { count: number; resetAt: number }>();
let lastCleanup = Date.now();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();

  // Clean up stale entries every 5 minutes
  if (now - lastCleanup > 5 * 60e3) {
    lastCleanup = now;
    for (const [k, v] of attemptLog) {
      if (v.resetAt <= now) attemptLog.delete(k);
    }
  }

  const entry = attemptLog.get(key);
  if (!entry || entry.resetAt <= now) {
    attemptLog.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count += 1;
  return true;
}

export function clearRateLimit(key: string): void {
  attemptLog.delete(key);
}

export type TokenType = "verify" | "magic" | "reset" | "email_change";

export function issueToken(userId: string, type: TokenType, ttlMs: number, data?: string): string {
  const raw = type === "verify" ? generateCode() : randomBytes(32).toString("hex");
  const db = getDb();
  db.prepare("DELETE FROM tokens WHERE user_id = ? AND type = ?").run(userId, type);
  db.prepare(
    "INSERT INTO tokens (id, user_id, type, token_hash, data, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(crypto.randomUUID(), userId, type, hashToken(raw), data ?? null, Date.now() + ttlMs, Date.now());
  return raw;
}

export function consumeToken(raw: string, type: TokenType): { userId: string; data?: string } | null {
  const db = getDb();
  const row = db
    .prepare("SELECT id, user_id, data, expires_at FROM tokens WHERE token_hash = ? AND type = ?")
    .get(hashToken(raw), type) as { id: string; user_id: string; data: string | null; expires_at: number } | undefined;
  if (!row || row.expires_at < Date.now()) return null;
  db.prepare("DELETE FROM tokens WHERE id = ?").run(row.id);
  return { userId: row.user_id, data: row.data ?? undefined };
}

export function consumeTokenByCode(code: string, type: TokenType): { userId: string; data?: string } | null {
  return consumeToken(code, type);
}

function generateCode(): string {
  return String(randomInt(100000, 999999));
}
