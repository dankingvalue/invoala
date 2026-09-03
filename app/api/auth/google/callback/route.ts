import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { dbGet, dbRun } from "@/lib/db";
import { createSession, USER_COOKIE } from "@/lib/server-auth";
import { sendWelcomeEmail } from "@/lib/email";
import { createUserPromo } from "@/lib/promo";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = req.headers.get("cookie")?.match(/g_state=([^;]+)/)?.[1];
  const rawNext = req.headers.get("cookie")?.match(/g_next=([^;]+)/)?.[1];
  const next = rawNext ? decodeURIComponent(rawNext) : null;
  const redirectTo = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

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

    const existing = await dbGet<{ id: string; email_verified: number }>(
      "SELECT id, email_verified FROM users WHERE google_id = ? OR email = ?",
      profile.id, profile.email
    );

    let userId: string;
    if (existing) {
      userId = existing.id;
      if (!existing.email_verified) {
        await dbRun("UPDATE users SET email_verified = 1, google_id = ? WHERE id = ?", profile.id, userId);
      }
      if (!(await dbGet("SELECT google_id FROM users WHERE id = ? AND google_id IS NOT NULL", userId))) {
        await dbRun("UPDATE users SET google_id = ? WHERE id = ?", profile.id, userId);
      }
    } else {
      userId = randomUUID();
      const isAdmin = process.env.ADMIN_EMAIL && profile.email === process.env.ADMIN_EMAIL.toLowerCase();
      const role = isAdmin ? "superadmin" : "user";
      await dbRun(
        "INSERT INTO users (id, email, password_hash, name, role, email_verified, google_id, created_at) VALUES (?, ?, '', ?, ?, 1, ?, ?)",
        userId, profile.email, role, profile.name || profile.email.split("@")[0], profile.id, Date.now()
      );
      // Google signups previously got no welcome email — fix that and hand
      // them the same new-account 50% Lifetime offer as password signups.
      const promo = await createUserPromo({
        id: userId,
        email: profile.email,
        name: profile.name || profile.email.split("@")[0],
      }).catch(() => null);
      await sendWelcomeEmail({
        to: profile.email,
        name: profile.name || profile.email.split("@")[0],
        promoCode: promo?.code,
        promoExpiresAt: promo?.expires_at,
      }).catch(() => {});
    }

    const { token } = await createSession(userId);
    const res = NextResponse.redirect(new URL(redirectTo, req.url));
    res.cookies.set(USER_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    res.cookies.delete("g_next");
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_failed", req.url));
  }
}
