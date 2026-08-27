import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, rateLimit, createSession, USER_COOKIE, verificationRequired, issueToken, validatePassword } from "@/lib/server-auth";
import { sendEmail, sendVerificationEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`signup:${ip}`, 5, 60 * 60e3)) {
    return Response.json({ error: "Too many signups from this network. Try later." }, { status: 429 });
  }

  let email = "";
  let password = "";
  let name = "";
  try {
    const body = (await req.json()) as { email?: string; password?: string; name?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
    name = typeof body.name === "string" ? body.name.trim() : "";
  } catch {
    // falls through to validation failure
  }

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return Response.json({ error: pwError }, { status: 400 });
  }

  const db = getDb();
  const exists = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (exists) {
    return Response.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const required = verificationRequired();
  const id = randomUUID();
  const isAdmin = process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase();
  const role = isAdmin ? "superadmin" : "user";
  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
  ).run(id, email, hashPassword(password), name, role, required ? 0 : 1, Date.now());

  const { token } = createSession(id);

  if (required) {
    const code = issueToken(id, "verify", 24 * 60 * 60e3);
    const linkToken = issueToken(id, "verify", 24 * 60 * 60e3);
    void sendVerificationEmail({ to: email, userId: id, code, linkToken });
  } else {
    void sendEmail({
      to: email,
      subject: "Welcome to Invoala",
      text: "Your account is ready. Create your first invoice at https://invoala.com — it takes two minutes.",
    });
  }

  const res = NextResponse.json({ ok: true, role: "user", needsVerification: required });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
