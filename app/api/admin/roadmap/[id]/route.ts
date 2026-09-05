import { getSessionUser } from "@/lib/server-auth";
import { updateRoadmapItem, deleteRoadmapItem, isRoadmapStatus, type RoadmapStatus } from "@/lib/roadmap";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: { title?: string; description?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  let status: RoadmapStatus | undefined;
  if (body.status !== undefined) {
    if (!isRoadmapStatus(body.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    status = body.status;
  }

  const ok = await updateRoadmapItem(id, { title: body.title, description: body.description, status });
  return ok ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ok = await deleteRoadmapItem(id);
  return ok ? Response.json({ ok: true }) : Response.json({ error: "Not found." }, { status: 404 });
}
