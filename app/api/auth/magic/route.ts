import { dbGet } from "@/lib/db";
import { rateLimit, issueToken, verificationRequired } from "@/lib/server-auth";
import { sendMagicLinkEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`magic:${ip}`, 5, 15 * 60e3)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {}

  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const row = await dbGet<{ id: string; email_verified: number }>(
    "SELECT id, email_verified FROM users WHERE email = ?",
    email
  );

  if (!row) {
    return Response.json({ ok: true });
  }

  const token = await issueToken(row.id, "magic", 15 * 60e3);
  await sendMagicLinkEmail({ to: email, token });

  return Response.json({ ok: true });
}
