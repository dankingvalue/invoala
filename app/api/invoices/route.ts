import { getSessionUser } from "@/lib/server-auth";
import { listInvoices, upsertInvoice } from "@/lib/data";
import type { Invoice } from "@/lib/invoice";

function isValidInvoice(v: unknown): v is Invoice {
  if (!v || typeof v !== "object") return false;
  const inv = v as Invoice;
  return (
    Array.isArray(inv.items) &&
    typeof inv.invoiceNumber === "string" &&
    typeof inv.docType === "string"
  );
}

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ invoices: await listInvoices(user.id) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    invoice?: unknown;
    id?: string;
    status?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.id && typeof body.status === "string" && !body.invoice) {
    if (!["draft", "sent", "paid"].includes(body.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    try {
      await upsertInvoice(user.id, {} as Invoice, { id: body.id, status: body.status });
      return Response.json({ ok: true, id: body.id });
    } catch {
      return Response.json({ error: "Invoice not found." }, { status: 404 });
    }
  }

  if (!isValidInvoice(body.invoice)) {
    return Response.json({ error: "Invalid invoice payload." }, { status: 400 });
  }

  try {
    const result = await upsertInvoice(user.id, body.invoice, { id: body.id });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && err.message === "not-found") {
      return Response.json({ error: "Invoice not found." }, { status: 404 });
    }
    throw err;
  }
}
