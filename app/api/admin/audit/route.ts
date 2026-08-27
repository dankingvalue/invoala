import { getSessionUser } from "@/lib/server-auth";
import { getAuditLogs } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const actorId = url.searchParams.get("actor_id") || undefined;
  const targetId = url.searchParams.get("target_id") || undefined;
  const action = url.searchParams.get("action") || undefined;
  const from = url.searchParams.get("from") ? parseInt(url.searchParams.get("from")!, 10) : undefined;
  const to = url.searchParams.get("to") ? parseInt(url.searchParams.get("to")!, 10) : undefined;

  const result = await getAuditLogs({
    page,
    actorId,
    targetId,
    action,
    from,
    to,
    viewerRole: user.role,
    viewerId: user.id,
  });

  return Response.json(result);
}
