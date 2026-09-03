import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { dbGet, dbRun } from "@/lib/db";

export const USER_COOKIE = "invoala_session";
// Holds the admin's own session token while they're impersonating someone
// else (whose session then occupies USER_COOKIE) — see
// app/api/admin/impersonate/route.ts. Lets "Stop impersonating" swap back to
// the admin's real session instead of requiring them to log in again.
export const IMPERSONATOR_COOKIE = "invoala_impersonator";
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  email_verified: number;
  timezone: string;
  // Google signups get password_hash = '' (see app/api/auth/google/callback) —
  // they have no password to verify a "current password" against, so the
  // Security tab needs to know to offer "set a password" instead of "change".
  has_password: boolean;
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

export async function createSession(userId: string): Promise<{ token: string; expiresAt: number }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await dbRun(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    hashToken(token), userId, expiresAt, Date.now()
  );
  return { token, expiresAt };
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  await dbRun("DELETE FROM sessions WHERE token_hash = ?", hashToken(token));
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await dbRun("DELETE FROM sessions WHERE user_id = ?", userId);
}

export async function getUserByToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const row = await dbGet<{ id: string; email: string; name: string; role: string; email_verified: number; timezone: string; password_hash: string; expires_at: number }>(
    `SELECT u.id, u.email, u.name, u.role, u.email_verified, u.timezone, u.password_hash, s.expires_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
    hashToken(token)
  );
  if (!row || row.expires_at < Date.now()) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    email_verified: row.email_verified,
    timezone: row.timezone,
    has_password: !!row.password_hash,
  };
}

export async function getSessionUser(req: Request): Promise<SessionUser | null> {
  const match = req.headers.get("cookie")?.match(new RegExp(`${USER_COOKIE}=([^;]+)`));
  return getUserByToken(match?.[1]);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  return getUserByToken(store.get(USER_COOKIE)?.value);
}

// Non-null only while the current session is an admin impersonating someone
// else — see IMPERSONATOR_COOKIE. Used to show the "Impersonating…" banner.
export async function getImpersonatorAdmin(): Promise<SessionUser | null> {
  const store = await cookies();
  return getUserByToken(store.get(IMPERSONATOR_COOKIE)?.value);
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

export async function issueToken(userId: string, type: TokenType, ttlMs: number, data?: string): Promise<string> {
  const raw = type === "verify" ? generateCode() : randomBytes(32).toString("hex");
  await dbRun("DELETE FROM tokens WHERE user_id = ? AND type = ?", userId, type);
  await dbRun(
    "INSERT INTO tokens (id, user_id, type, token_hash, data, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    crypto.randomUUID(), userId, type, hashToken(raw), data ?? null, Date.now() + ttlMs, Date.now()
  );
  return raw;
}

export async function issueVerifyTokens(userId: string, ttlMs: number): Promise<{ code: string; linkToken: string }> {
  const code = generateCode();
  const linkToken = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + ttlMs;
  const now = Date.now();
  await dbRun("DELETE FROM tokens WHERE user_id = ? AND type = ?", userId, "verify" as TokenType);
  await dbRun(
    "INSERT INTO tokens (id, user_id, type, token_hash, data, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    crypto.randomUUID(), userId, "verify", hashToken(code), null, expiresAt, now
  );
  await dbRun(
    "INSERT INTO tokens (id, user_id, type, token_hash, data, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    crypto.randomUUID(), userId, "verify_link", hashToken(linkToken), null, expiresAt, now
  );
  return { code, linkToken };
}

export async function consumeVerifyLink(raw: string): Promise<{ userId: string } | null> {
  const row = await dbGet<{ id: string; user_id: string; expires_at: number }>(
    "SELECT id, user_id, expires_at FROM tokens WHERE token_hash = ? AND type = 'verify_link'",
    hashToken(raw)
  );
  if (!row || row.expires_at < Date.now()) return null;
  await dbRun("DELETE FROM tokens WHERE id = ?", row.id);
  await dbRun("DELETE FROM tokens WHERE user_id = ? AND type = 'verify'", row.user_id);
  return { userId: row.user_id };
}

export async function consumeToken(raw: string, type: TokenType): Promise<{ userId: string; data?: string } | null> {
  const row = await dbGet<{ id: string; user_id: string; data: string | null; expires_at: number }>(
    "SELECT id, user_id, data, expires_at FROM tokens WHERE token_hash = ? AND type = ?",
    hashToken(raw), type
  );
  if (!row || row.expires_at < Date.now()) return null;
  await dbRun("DELETE FROM tokens WHERE id = ?", row.id);
  return { userId: row.user_id, data: row.data ?? undefined };
}

export async function consumeTokenByCode(code: string, type: TokenType): Promise<{ userId: string; data?: string } | null> {
  return consumeToken(code, type);
}

function generateCode(): string {
  return String(randomInt(100000, 999999));
}
