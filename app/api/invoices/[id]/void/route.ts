import { getSessionUser } from "@/lib/server-auth";
import { reopenInvoice, voidInvoice } from "@/lib/data";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const ok = await voidInvoice(user.id, id);
  if (!ok) return Response.json({ error: "Invoice not found or already voided." }, { status: 404 });
  return Response.json({ ok: true });
}

// Reopens a voided invoice back to its payments-derived status. Not exposed
// in the row menu (only Void is asked for), but a void is explicitly not a
// delete, so undoing it needs to be possible from somewhere in the app.
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const invoice = await reopenInvoice(user.id, id);
  if (!invoice) return Response.json({ error: "Invoice not found or not voided." }, { status: 404 });
  return Response.json({ ok: true, invoice });
}
