import { dbGet } from "@/lib/db";
import { rateLimit, issueVerifyTokens, getSessionUser } from "@/lib/server-auth";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`resend:${ip}`, 3, 60 * 60e3)) {
    return Response.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const row = await dbGet<{ email: string; email_verified: number }>(
    "SELECT email, email_verified FROM users WHERE id = ?",
    user.id
  );

  if (!row || row.email_verified) {
    return Response.json({ ok: true });
  }

  const { code, linkToken } = await issueVerifyTokens(user.id, 24 * 60 * 60e3);
  void sendVerificationEmail({ to: row.email, userId: user.id, code, linkToken });

  return Response.json({ ok: true });
}
