import { dbRun } from "@/lib/db";
import { consumeToken, getSessionUser } from "@/lib/server-auth";

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let code = "";
  try {
    const body = (await req.json()) as { code?: string };
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {}

  if (!code || code.length !== 6) {
    return Response.json({ error: "Please enter a 6-digit code." }, { status: 400 });
  }

  const result = await consumeToken(code, "verify");
  if (!result || result.userId !== user.id) {
    return Response.json({ error: "Invalid or expired code." }, { status: 400 });
  }

  await dbRun("UPDATE users SET email_verified = 1 WHERE id = ?", user.id);

  return Response.json({ ok: true });
}
