import { NextResponse } from "next/server";
import { getSessionUser, getUserByToken, destroySession, USER_COOKIE, IMPERSONATOR_COOKIE } from "@/lib/server-auth";
import { dbGet, dbRun } from "@/lib/db";
import { randomUUID, createHash } from "crypto";
import { logAudit } from "@/lib/audit";

function cookieValue(req: Request, name: string): string | undefined {
  return req.headers.get("cookie")?.match(new RegExp(`${name}=([^;]+)`))?.[1];
}

export async function POST(req: Request) {
  const admin = await getSessionUser(req);
  if (!admin || admin.role !== "superadmin") {
    return Response.json({ error: "Only superadmins can impersonate." }, { status: 403 });
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.userId) {
    return Response.json({ error: "userId required." }, { status: 400 });
  }

  const target = await dbGet<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE id = ?",
    body.userId
  );
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  const token = randomUUID();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = Date.now() + 60 * 60_000; // 1 hour

  await dbRun(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    tokenHash, body.userId, expiresAt, Date.now()
  );

  await logAudit({
    action: "impersonate",
    actor: { id: admin.id, email: admin.email, role: admin.role },
    targetType: "user",
    targetId: body.userId,
    details: { targetEmail: target.email, duration: "1hr" },
  });

  // Set the impersonation session as an httpOnly cookie here, server-side.
  // The admin's own session cookie is httpOnly, and browsers refuse to let
  // client JS overwrite an httpOnly cookie of the same name — so handing the
  // token back in the JSON body for the client to set via document.cookie
  // silently no-ops and leaves the admin's own session in place.
  const res = NextResponse.json({
    ok: true,
    expiresAt,
    user: { id: target.id, email: target.email },
  });
  res.cookies.set(USER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  // Stash the admin's own still-valid session token so "Stop impersonating"
  // can swap straight back to it instead of forcing a re-login.
  const adminToken = cookieValue(req, USER_COOKIE);
  if (adminToken) {
    res.cookies.set(IMPERSONATOR_COOKIE, adminToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60,
    });
  }
  return res;
}

export async function DELETE(req: Request) {
  const impersonatorToken = cookieValue(req, IMPERSONATOR_COOKIE);
  if (!impersonatorToken) {
    return Response.json({ error: "Not currently impersonating." }, { status: 400 });
  }

  const admin = await getUserByToken(impersonatorToken);
  if (!admin) {
    const res = NextResponse.json(
      { error: "Your original session has expired. Please sign in again." },
      { status: 401 },
    );
    res.cookies.delete(USER_COOKIE);
    res.cookies.delete(IMPERSONATOR_COOKIE);
    return res;
  }

  // Revoke the impersonation session outright rather than just abandoning it,
  // so it can't be replayed after "Stop impersonating".
  const impersonatedToken = cookieValue(req, USER_COOKIE);
  const impersonated = impersonatedToken ? await getUserByToken(impersonatedToken) : null;
  if (impersonatedToken) await destroySession(impersonatedToken);

  await logAudit({
    action: "stop_impersonate",
    actor: { id: admin.id, email: admin.email, role: admin.role },
    targetType: "user",
    targetId: impersonated?.id,
    details: impersonated ? { targetEmail: impersonated.email } : undefined,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, impersonatorToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  res.cookies.delete(IMPERSONATOR_COOKIE);
  return res;
}
