import { NextResponse } from "next/server";
import { dbGet, dbRun } from "@/lib/db";
import { getSessionUser, verifyPassword, hashPassword, destroyAllSessions, createSession, USER_COOKIE, validatePassword } from "@/lib/server-auth";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let currentPassword = "";
  let newPassword = "";
  try {
    const body = (await req.json()) as { currentPassword?: string; newPassword?: string };
    currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  } catch {}

  const pwError = validatePassword(newPassword);
  if (pwError) {
    return Response.json({ error: pwError }, { status: 400 });
  }

  const row = await dbGet<{ password_hash: string }>(
    "SELECT password_hash FROM users WHERE id = ?",
    user.id
  );
  if (!row) {
    return Response.json({ error: "Account not found." }, { status: 404 });
  }

  // Google-only accounts have password_hash = '' (see
  // app/api/auth/google/callback) — there's no current password to check,
  // so the first password they set doesn't need one.
  const hasPassword = !!row.password_hash;
  if (hasPassword && !verifyPassword(currentPassword, row.password_hash)) {
    return Response.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(newPassword), user.id);
  await destroyAllSessions(user.id);

  const { token } = await createSession(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
