import { getSessionUser } from "@/lib/server-auth";
import { duplicateInvoice } from "@/lib/data";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const row = await duplicateInvoice(user.id, id);
  if (!row) return Response.json({ error: "Invoice not found." }, { status: 404 });
  return Response.json({ ok: true, invoice: row });
}
