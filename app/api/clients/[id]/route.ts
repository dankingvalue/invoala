import { getSessionUser } from "@/lib/server-auth";
import { deleteClient, setClientTeam, updateClient, getClientProfile, type ClientInput } from "@/lib/data";
import { getTeamMemberRole } from "@/lib/teams";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const profile = await getClientProfile(user.id, id);
  if (!profile) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(profile);
}

const ERROR_MESSAGES: Record<string, string> = {
  duplicate_name: "A client with this name already exists.",
  invalid_name: "Client/company name is required.",
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: Partial<ClientInput>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: ERROR_MESSAGES.invalid_name }, { status: 400 });

  const result = await updateClient(user.id, id, { ...body, name } as ClientInput);
  if (result === null) return Response.json({ error: "Not found." }, { status: 404 });
  if ("error" in result) return Response.json({ error: ERROR_MESSAGES[result.error] }, { status: 400 });
  return Response.json({ ok: true, client: result });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const result = await deleteClient(user.id, id);
  if (result === "not-found") return Response.json({ error: "Not found." }, { status: 404 });
  if (result === "has-invoices") {
    return Response.json(
      { error: "This client has invoices on record — archive it instead of deleting to keep that history intact." },
      { status: 409 },
    );
  }
  return Response.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: { teamId?: string | null };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const teamId = typeof body.teamId === "string" && body.teamId ? body.teamId : null;
  if (teamId) {
    const role = await getTeamMemberRole(teamId, user.id);
    if (!role) {
      return Response.json({ error: "You are not a member of that team." }, { status: 403 });
    }
  }

  const updated = await setClientTeam(user.id, id, teamId);
  if (!updated) {
    return Response.json({ error: "Could not update client sharing." }, { status: 400 });
  }
  return Response.json({ ok: true });
}
