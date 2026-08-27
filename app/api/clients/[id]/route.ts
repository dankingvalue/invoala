import { getSessionUser } from "@/lib/server-auth";
import { deleteClient } from "@/lib/data";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deleted = await deleteClient(user.id, id);
  if (!deleted) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json({ ok: true });
}
