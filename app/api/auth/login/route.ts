import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  clearRateLimit,
  createSession,
  rateLimit,
  USER_COOKIE,
  verifyPassword,
  verificationRequired,
} from "@/lib/server-auth";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`login:${ip}`, 10, 10 * 60e3)) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let email = "";
  let password = "";
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    // falls through to failure
  }

  const row = getDb()
    .prepare("SELECT id, password_hash, role, email_verified FROM users WHERE email = ?")
    .get(email) as { id: string; password_hash: string; role: string; email_verified: number } | undefined;

  if (!row || !verifyPassword(password, row.password_hash)) {
    return Response.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (verificationRequired() && !row.email_verified) {
    return Response.json({ error: "Please verify your email first.", needsVerification: true }, { status: 403 });
  }

  clearRateLimit(`login:${ip}`);
  const { token } = createSession(row.id);
  const res = NextResponse.json({ ok: true, role: row.role });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
