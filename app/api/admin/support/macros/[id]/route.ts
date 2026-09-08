import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { updateMacro, deleteMacro } from "@/lib/support-macros";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.macros.manage");
  if (denied) return denied;
  const { id } = await params;
  let patch: Parameters<typeof updateMacro>[1] = {};
  try {
    patch = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  await updateMacro(id, patch);
  await logAudit({ action: "macro_updated", targetId: id, targetType: "macro", details: { patch }, req });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.macros.manage");
  if (denied) return denied;
  const { id } = await params;
  await deleteMacro(id);
  await logAudit({ action: "macro_deleted", targetId: id, targetType: "macro", req });
  return Response.json({ ok: true });
}
