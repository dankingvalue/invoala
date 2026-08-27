import { getSessionUser } from "@/lib/server-auth";
import { getFlags, sanitizeFlagsInput, setFlags } from "@/lib/flags.server";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await getFlags());
}

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const oldFlags = await getFlags();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const state = sanitizeFlagsInput(body);
  if (!state) return Response.json({ error: "Invalid flags payload." }, { status: 400 });
  try {
    await setFlags(state);
  } catch (err) {
    console.error("[flags] write failed", err);
    return Response.json({ error: "Could not save flags." }, { status: 500 });
  }

  await logAudit({
    action: "flag_toggle",
    targetId: undefined,
    targetType: "flags",
    details: { old: oldFlags, new: state },
    req,
  });

  return Response.json({ ok: true, ...state });
}
