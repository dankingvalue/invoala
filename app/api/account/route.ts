import { dbRun } from "@/lib/db";
import { getSessionUser } from "@/lib/server-auth";

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
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

  await dbRun("UPDATE users SET name = ?, timezone = ? WHERE id = ?", name, timezone, user.id);

  return Response.json({ ok: true });
}
