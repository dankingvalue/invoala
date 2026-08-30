import { getSessionUser } from "@/lib/server-auth";
import { listClients, upsertClient } from "@/lib/data";
import { getTeamMemberRole } from "@/lib/teams";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ clients: await listClients(user.id) });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: { name?: string; email?: string; address?: string; teamId?: string | null };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) {
    return Response.json({ error: "Client name is required." }, { status: 400 });
  }

  let teamId: string | null = null;
  if (typeof body.teamId === "string" && body.teamId) {
    const role = await getTeamMemberRole(body.teamId, user.id);
    if (!role) {
      return Response.json({ error: "You are not a member of that team." }, { status: 403 });
    }
    teamId = body.teamId;
  }

  const client = await upsertClient(user.id, {
    name,
    email: typeof body.email === "string" ? body.email.trim() : "",
    address: typeof body.address === "string" ? body.address.trim() : "",
  }, teamId);
  return Response.json({ ok: true, client });
}
