import { NextResponse } from "next/server";
import { dbGet, dbRun } from "@/lib/db";
import { consumeVerifyLink, createSession, USER_COOKIE } from "@/lib/server-auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  if (!token) {
    return NextResponse.redirect(new URL("/verify?error=invalid", req.url));
  }

  const result = await consumeVerifyLink(token);
  if (!result) {
    return NextResponse.redirect(new URL("/verify?error=expired", req.url));
  }

  await dbRun("UPDATE users SET email_verified = 1 WHERE id = ?", result.userId);

  const user = await dbGet<{ email: string; name: string }>("SELECT email, name FROM users WHERE id = ?", result.userId);
  if (user) void sendWelcomeEmail({ to: user.email, name: user.name });

  const { token: sessionToken } = await createSession(result.userId);
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
