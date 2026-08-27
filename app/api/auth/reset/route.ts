import { dbRun } from "@/lib/db";
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

  const result = await consumeToken(token, "reset");
  if (!result) {
    return Response.json({ error: "This link has expired or is invalid." }, { status: 400 });
  }

  await dbRun("UPDATE users SET password_hash = ? WHERE id = ?", hashPassword(password), result.userId);
  await destroyAllSessions(result.userId);

  return Response.json({ ok: true });
}
