import { getSessionUser } from "@/lib/server-auth";
import { createTeam, getUserTeams, getUserInvites } from "@/lib/teams";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const teams = await getUserTeams(user.id);
  const invites = await getUserInvites(user.id);

  return Response.json({ teams, invites });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let name = "";
  try {
    const body = (await req.json()) as { name?: string };
    name = typeof body.name === "string" ? body.name.trim() : "";
  } catch {
    // falls through
  }

  if (!name || name.length > 80) {
    return Response.json({ error: "Team name is required (max 80 characters)." }, { status: 400 });
  }

  const existingTeams = await getUserTeams(user.id);
  if (existingTeams.length >= 3) {
    return Response.json({ error: "Maximum 3 teams per user." }, { status: 400 });
  }

  const team = await createTeam(user.id, name);
  return Response.json({ ok: true, team });
}
