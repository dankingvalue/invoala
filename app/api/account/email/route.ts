import { dbGet, dbRun } from "@/lib/db";
import { getSessionUser, rateLimit, issueToken } from "@/lib/server-auth";
import { sendEmailChangeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`email-change:${ip}`, 3, 60 * 60e3)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let newEmail = "";
  try {
    const body = (await req.json()) as { email?: string };
    newEmail = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {}

  if (!EMAIL_RE.test(newEmail)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const exists = await dbGet("SELECT id FROM users WHERE email = ? AND id != ?", newEmail, user.id);
  if (exists) {
    return Response.json({ error: "This email is already in use." }, { status: 409 });
  }

  await dbRun("UPDATE users SET pending_email = ? WHERE id = ?", newEmail, user.id);
  const token = await issueToken(user.id, "email_change", 24 * 60 * 60e3, newEmail);
  void sendEmailChangeEmail({ to: newEmail, token, newEmail });

  return Response.json({ ok: true });
}
