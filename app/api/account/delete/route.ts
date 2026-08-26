import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser, destroyAllSessions } from "@/lib/server-auth";

export async function POST(req: Request) {
  const user = getSessionUser(req);
  if (!user) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  let confirm = "";
  try {
    const body = (await req.json()) as { confirm?: string };
    confirm = typeof body.confirm === "string" ? body.confirm : "";
  } catch {}

  if (confirm !== "DELETE") {
    return Response.json({ error: 'Type DELETE to confirm.' }, { status: 400 });
  }

  const db = getDb();
  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  destroyAllSessions(user.id);

  const res = NextResponse.json({ ok: true });
  res.cookies.delete("invoala_session");
  return res;
}
