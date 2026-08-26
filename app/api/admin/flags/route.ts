import { getSessionUser } from "@/lib/server-auth";
import { getFlags, sanitizeFlagsInput, setFlags } from "@/lib/flags.server";

const ADMIN_ROLES = ["superadmin", "admin", "support"];

export async function GET(req: Request) {
  const user = getSessionUser(req);
  if (!hasAdminRole(user)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(await getFlags());
}

export async function PUT(req: Request) {
  const user = getSessionUser(req);
  if (!hasAdminRole(user)) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
  return Response.json({ ok: true, ...state });
}

function hasAdminRole(user: ReturnType<typeof getSessionUser>): boolean {
  return !!user && ADMIN_ROLES.includes(user.role);
}
