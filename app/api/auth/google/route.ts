import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
  }

  const origin = new URL(req.url).origin;
  const state = randomBytes(16).toString("hex");
  const redirectUri = `${origin}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "consent",
  });

  const res = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  res.cookies.set("g_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
