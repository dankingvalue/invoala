import { getSessionUser } from "@/lib/server-auth";
import { createClient, listClients, listClientsForWorkspace, upsertClient, getClientFinancials, type ClientInput } from "@/lib/data";
import { getTeamMemberRole, isTeamMember } from "@/lib/teams";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Same convention as GET /api/invoices: omitted keeps the legacy merged
  // (personal + every shared team) view; workspace=personal or
  // workspace=team:<id> filters strictly to one workspace.
  const workspace = new URL(req.url).searchParams.get("workspace");
  let clients;
  if (!workspace) {
    clients = await listClients(user.id);
  } else if (workspace === "personal") {
    clients = await listClientsForWorkspace(user.id, null);
  } else if (workspace.startsWith("team:")) {
    const teamId = workspace.slice(5);
    if (!(await isTeamMember(teamId, user.id))) {
      return Response.json({ error: "Not a member of that workspace." }, { status: 403 });
    }
    clients = await listClientsForWorkspace(user.id, teamId);
  } else {
    return Response.json({ error: "Invalid workspace." }, { status: 400 });
  }

  const financials = await getClientFinancials(user.id);
  return Response.json({ clients, financials });
}

const ERROR_MESSAGES: Record<string, string> = {
  duplicate_name: "A client with this name already exists.",
  invalid_name: "Client/company name is required.",
};

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: Partial<ClientInput> & { teamId?: string | null; quickSave?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 120) {
    return Response.json({ error: ERROR_MESSAGES.invalid_name }, { status: 400 });
  }

  let teamId: string | null = null;
  if (typeof body.teamId === "string" && body.teamId) {
    const role = await getTeamMemberRole(body.teamId, user.id);
    if (!role) {
      return Response.json({ error: "You are not a member of that team." }, { status: 403 });
    }
    teamId = body.teamId;
  }

  // The invoice generator's "save as a new client" dropdown option calls
  // this with quickSave — it should merge into an existing same-named
  // client rather than showing a hard "already exists" error, since there
  // the user is just trying to keep their client book up to date mid-invoice.
  if (body.quickSave) {
    const client = await upsertClient(
      user.id,
      { name, email: body.email, address: body.address },
      teamId,
    );
    return Response.json({ ok: true, client });
  }

  const result = await createClient(
    user.id,
    { ...body, name } as ClientInput,
    teamId,
  );
  if ("error" in result) {
    return Response.json({ error: ERROR_MESSAGES[result.error] }, { status: 400 });
  }
  return Response.json({ ok: true, client: result });
}
