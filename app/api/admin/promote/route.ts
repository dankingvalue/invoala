import { dbRun, dbGet } from "@/lib/db";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.AUTH_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {}

  if (!email) {
    return Response.json({ error: "Email required" }, { status: 400 });
  }

  const user = await dbGet<{ id: string; role: string }>("SELECT id, role FROM users WHERE email = ?", email);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  await dbRun("UPDATE users SET role = 'superadmin' WHERE id = ?", user.id);
  return Response.json({ ok: true, previousRole: user.role, newRole: "superadmin" });
}
