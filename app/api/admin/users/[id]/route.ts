import { getSessionUser } from "@/lib/server-auth";
import { getDb } from "@/lib/db";
import { getSubscription, revokeSubscription, activateDevSubscription, isPlan } from "@/lib/billing";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = getSessionUser(req);
  if (!admin || !["superadmin", "admin"].includes(admin.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: { role?: string; grantPro?: string; revokePro?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const db = getDb();
  const target = db.prepare("SELECT id FROM users WHERE id = ?").get(id) as { id: string } | undefined;
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  if (body.role !== undefined) {
    if (admin.role !== "superadmin") {
      return Response.json({ error: "Only superadmins can change roles." }, { status: 403 });
    }
    if (!["user", "support", "admin", "superadmin"].includes(body.role)) {
      return Response.json({ error: "Invalid role." }, { status: 400 });
    }
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(body.role, id);
  }

  if (body.grantPro !== undefined) {
    if (!isPlan(body.grantPro)) {
      return Response.json({ error: "Invalid plan." }, { status: 400 });
    }
    activateDevSubscription(id, body.grantPro);
  }

  if (body.revokePro) {
    revokeSubscription(id);
  }

  return Response.json({ ok: true, subscription: getSubscription(id) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = getSessionUser(req);
  if (!admin || admin.role !== "superadmin") {
    return Response.json({ error: "Only superadmins can delete users." }, { status: 403 });
  }
  const { id } = await params;
  if (id === admin.id) {
    return Response.json({ error: "You cannot delete yourself." }, { status: 400 });
  }
  const result = getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
  if (result.changes === 0) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ ok: true });
}
