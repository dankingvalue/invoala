import { getDb } from "@/lib/db";
import { consumeToken, hashPassword, destroyAllSessions, validatePassword } from "@/lib/server-auth";

export async function POST(req: Request) {
  let token = "";
  let password = "";
  try {
    const body = (await req.json()) as { token?: string; password?: string };
    token = typeof body.token === "string" ? body.token.trim() : "";
    password = typeof body.password === "string" ? body.password : "";
  } catch {}

  if (!token) {
    return Response.json({ error: "Invalid token." }, { status: 400 });
  }
  const pwError = validatePassword(password);
  if (pwError) {
    return Response.json({ error: pwError }, { status: 400 });
  }

  const result = consumeToken(token, "reset");
  if (!result) {
    return Response.json({ error: "This link has expired or is invalid." }, { status: 400 });
  }

  const db = getDb();
  db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(hashPassword(password), result.userId);
  destroyAllSessions(result.userId);

  return Response.json({ ok: true });
}
