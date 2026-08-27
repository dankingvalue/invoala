import { dbGet } from "@/lib/db";
import { rateLimit, issueToken } from "@/lib/server-auth";
import { sendPasswordResetEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`forgot:${ip}`, 5, 60 * 60e3)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {}

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: true });
  }

  const row = await dbGet<{ id: string }>("SELECT id FROM users WHERE email = ?", email);

  if (row) {
    const token = await issueToken(row.id, "reset", 60 * 60e3);
    await sendPasswordResetEmail({ to: email, token });
  }

  return Response.json({ ok: true });
}
