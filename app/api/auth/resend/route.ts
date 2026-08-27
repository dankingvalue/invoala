import { dbGet } from "@/lib/db";
import { rateLimit, issueVerifyTokens, getSessionUser } from "@/lib/server-auth";
import { sendVerificationEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`resend:${ip}`, 3, 60 * 60e3)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {}

  const user = await getSessionUser(req);

  let targetEmail = "";
  let targetUserId = "";

  if (user) {
    const row = await dbGet<{ email: string; email_verified: number }>(
      "SELECT email, email_verified FROM users WHERE id = ?",
      user.id
    );
    if (!row || row.email_verified) return Response.json({ ok: true });
    targetEmail = row.email;
    targetUserId = user.id;
  } else if (EMAIL_RE.test(email)) {
    const row = await dbGet<{ id: string; email: string; email_verified: number }>(
      "SELECT id, email, email_verified FROM users WHERE email = ?",
      email
    );
    if (!row || row.email_verified) return Response.json({ ok: true });
    targetEmail = row.email;
    targetUserId = row.id;
  } else {
    return Response.json({ ok: true });
  }

  const { code, linkToken } = await issueVerifyTokens(targetUserId, 24 * 60 * 60e3);
  await sendVerificationEmail({ to: targetEmail, userId: targetUserId, code, linkToken });

  return Response.json({ ok: true });
}
