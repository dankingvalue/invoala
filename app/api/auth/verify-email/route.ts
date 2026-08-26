import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { consumeToken, createSession, USER_COOKIE } from "@/lib/server-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  if (!token) {
    return NextResponse.redirect(new URL("/verify?error=invalid", req.url));
  }

  const result = consumeToken(token, "verify");
  if (!result) {
    return NextResponse.redirect(new URL("/verify?error=expired", req.url));
  }

  const db = getDb();
  db.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").run(result.userId);

  const { token: sessionToken } = createSession(result.userId);
  const res = NextResponse.redirect(new URL("/dashboard?verified=1", req.url));
  res.cookies.set(USER_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return res;
}
