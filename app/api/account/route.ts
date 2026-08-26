import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/server-auth";

export async function PUT(req: Request) {
  const user = getSessionUser(req);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let name = "";
  let timezone = "";
  try {
    const body = (await req.json()) as { name?: string; timezone?: string };
    name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : "";
    timezone = typeof body.timezone === "string" ? body.timezone.trim().slice(0, 50) : "";
  } catch {}

  const db = getDb();
  db.prepare("UPDATE users SET name = ?, timezone = ? WHERE id = ?").run(name, timezone, user.id);

  return Response.json({ ok: true });
}
