import { getSessionUser } from "@/lib/server-auth";
import { isTeamMember } from "@/lib/teams";
import {
  getWorkspaceSettings,
  updateWorkspaceSettings,
  canEditWorkspaceSettings,
  type WorkspaceScope,
  type WorkspaceSettingsInput,
} from "@/lib/workspace-settings";

// Same ?workspace= convention as /api/invoices and /api/clients, except
// here it's required (there's no "everything merged" reading for settings —
// a setting belongs to exactly one workspace).
async function resolveScope(req: Request, userId: string): Promise<{ scope?: WorkspaceScope; error?: string; status?: number }> {
  const workspace = new URL(req.url).searchParams.get("workspace");
  if (!workspace || workspace === "personal") return { scope: { type: "personal", userId } };
  if (workspace.startsWith("team:")) {
    const teamId = workspace.slice(5);
    if (!(await isTeamMember(teamId, userId))) {
      return { error: "Not a member of that workspace.", status: 403 };
    }
    return { scope: { type: "team", teamId } };
  }
  return { error: "Invalid workspace.", status: 400 };
}

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scope, error, status } = await resolveScope(req, user.id);
  if (error || !scope) return Response.json({ error }, { status: status ?? 400 });

  const settings = await getWorkspaceSettings(scope);
  if (!settings) return Response.json({ error: "Workspace not found." }, { status: 404 });

  const canEdit = await canEditWorkspaceSettings(scope, user.id);
  return Response.json({ settings, canEdit });
}

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { scope, error, status } = await resolveScope(req, user.id);
  if (error || !scope) return Response.json({ error }, { status: status ?? 400 });

  let body: WorkspaceSettingsInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const result = await updateWorkspaceSettings(scope, user.id, body);
  if ("error" in result) return Response.json({ error: result.error }, { status: 400 });
  return Response.json({ ok: true, settings: result });
}
