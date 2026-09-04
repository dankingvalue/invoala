import { getSessionUser } from "@/lib/server-auth";
import { listServiceItems, createServiceItem, type ServiceItemInput } from "@/lib/service-items";
import { isTeamMember } from "@/lib/teams";

// Same ?workspace= convention as /api/invoices and /api/clients: omitted
// returns everything the user can see (own + every team's), personal/team:<id>
// filter strictly to one workspace.
async function resolveTeamIdParam(req: Request, userId: string): Promise<{ teamId?: string | null; error?: string }> {
  const workspace = new URL(req.url).searchParams.get("workspace");
  if (!workspace) return {};
  if (workspace === "personal") return { teamId: null };
  if (workspace.startsWith("team:")) {
    const teamId = workspace.slice(5);
    if (!(await isTeamMember(teamId, userId))) return { error: "Not a member of that workspace." };
    return { teamId };
  }
  return { error: "Invalid workspace." };
}

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { teamId, error } = await resolveTeamIdParam(req, user.id);
  if (error) return Response.json({ error }, { status: 403 });
  return Response.json({ services: await listServiceItems(user.id, teamId) });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: ServiceItemInput & { teamId?: string | null };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: "Service name is required." }, { status: 400 });

  let teamId: string | null = null;
  if (typeof body.teamId === "string" && body.teamId) {
    if (!(await isTeamMember(body.teamId, user.id))) {
      return Response.json({ error: "You are not a member of that team." }, { status: 403 });
    }
    teamId = body.teamId;
  }

  const result = await createServiceItem(
    user.id,
    { name, description: body.description, rate: typeof body.rate === "number" ? body.rate : Number(body.rate) || 0 },
    teamId,
  );
  if ("error" in result) return Response.json({ error: "Service name is required." }, { status: 400 });
  return Response.json({ ok: true, service: result });
}
