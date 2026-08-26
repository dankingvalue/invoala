import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getDb } from "@/lib/db";
import { createSession, USER_COOKIE } from "@/lib/server-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = req.headers.get("cookie")?.match(/g_state=([^;]+)/)?.[1];

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_not_configured", req.url));
  }

  const origin = url.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new Error("token exchange failed");
    const tokenData = (await tokenRes.json()) as { access_token?: string };

    if (!tokenData.access_token) throw new Error("no access_token");

    const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (!userinfoRes.ok) throw new Error("userinfo failed");
    const profile = (await userinfoRes.json()) as { id: string; email: string; name: string };

    const db = getDb();
    const existing = db.prepare("SELECT id, email_verified FROM users WHERE google_id = ? OR email = ?").get(
      profile.id,
      profile.email,
    ) as { id: string; email_verified: number } | undefined;

    let userId: string;
    if (existing) {
      userId = existing.id;
      if (!existing.email_verified) {
        db.prepare("UPDATE users SET email_verified = 1, google_id = ? WHERE id = ?").run(profile.id, userId);
      }
      if (!db.prepare("SELECT google_id FROM users WHERE id = ? AND google_id IS NOT NULL").get(userId)) {
        db.prepare("UPDATE users SET google_id = ? WHERE id = ?").run(profile.id, userId);
      }
    } else {
      userId = randomUUID();
      db.prepare(
        "INSERT INTO users (id, email, password_hash, name, role, email_verified, google_id, created_at) VALUES (?, ?, '', ?, 'user', 1, ?, ?)",
      ).run(userId, profile.email, profile.name || profile.email.split("@")[0], profile.id, Date.now());
    }

    const { token } = createSession(userId);
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    res.cookies.set(USER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }
}
