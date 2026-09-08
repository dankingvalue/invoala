import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission, hasSupportPermission } from "@/lib/support-permissions";
import { createMacro, listMacros } from "@/lib/support-macros";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasSupportPermission(user.role, "support.macros.use")) return Response.json({ error: "Forbidden" }, { status: 403 });
  const macros = await listMacros(true);
  return Response.json({ macros });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.macros.manage");
  if (denied) return denied;

  let body: { name?: string; category?: string; responseText?: string; internalInstructions?: string; applicablePlans?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body.name || !body.responseText) return Response.json({ error: "Name and response text are required." }, { status: 400 });

  const macro = await createMacro({
    name: body.name,
    category: body.category || "general",
    responseText: body.responseText,
    internalInstructions: body.internalInstructions,
    applicablePlans: body.applicablePlans,
    createdBy: user!.id,
  });
  await logAudit({ action: "macro_created", targetId: macro.id, targetType: "macro", details: { name: macro.name }, req });
  return Response.json({ ok: true, macro });
}
