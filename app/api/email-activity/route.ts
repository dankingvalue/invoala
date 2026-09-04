import { getSessionUser } from "@/lib/server-auth";
import { getEmailActivity } from "@/lib/email-activity";
import { isTeamMember } from "@/lib/teams";

// Same ?workspace= convention as /api/invoices and /api/clients.
export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const workspace = new URL(req.url).searchParams.get("workspace");
  let teamId: string | null | undefined;
  if (!workspace) {
    teamId = undefined;
  } else if (workspace === "personal") {
    teamId = null;
  } else if (workspace.startsWith("team:")) {
    teamId = workspace.slice(5);
    if (!(await isTeamMember(teamId, user.id))) {
      return Response.json({ error: "Not a member of that workspace." }, { status: 403 });
    }
  } else {
    return Response.json({ error: "Invalid workspace." }, { status: 400 });
  }

  return Response.json({ activity: await getEmailActivity(user.id, teamId, 100) });
}
