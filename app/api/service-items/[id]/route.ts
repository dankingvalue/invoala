import { getSessionUser } from "@/lib/server-auth";
import { updateServiceItem, deleteServiceItem, type ServiceItemInput } from "@/lib/service-items";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: ServiceItemInput;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) return Response.json({ error: "Service name is required." }, { status: 400 });

  const result = await updateServiceItem(user.id, id, {
    name,
    description: body.description,
    rate: typeof body.rate === "number" ? body.rate : Number(body.rate) || 0,
  });
  if (!result) return Response.json({ error: "Not found." }, { status: 404 });
  if ("error" in result) return Response.json({ error: "Service name is required." }, { status: 400 });
  return Response.json({ ok: true, service: result });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const deleted = await deleteServiceItem(user.id, id);
  if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ ok: true });
}
