import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser, verifyPassword, hashPassword, destroyAllSessions, createSession, USER_COOKIE, validatePassword } from "@/lib/server-auth";

export async function POST(req: Request) {
  const user = getSessionUser(req);
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

  const db = getDb();
  const row = db.prepare("SELECT password_hash FROM users WHERE id = ?").get(user.id) as
    | { password_hash: string }
    | undefined;

  if (!row || !verifyPassword(currentPassword, row.password_hash)) {
    return Response.json({ error: "Current password is incorrect." }, { status: 400 });
  }

  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(newPassword), user.id);
  destroyAllSessions(user.id);

  const { token } = createSession(user.id);
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
