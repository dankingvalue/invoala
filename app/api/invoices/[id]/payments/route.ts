import { getSessionUser } from "@/lib/server-auth";
import { createPayment, listPayments, type PaymentInput } from "@/lib/data";
import { isPaymentMethod } from "@/lib/invoice-status";

const ERROR_MESSAGES: Record<string, string> = {
  "not-found": "Invoice not found.",
  draft: "Issue this invoice before recording a payment against it.",
  void: "This invoice has been voided and can't take new payments.",
  "invalid-amount": "Enter a valid amount greater than zero.",
  "exceeds-balance": "That's more than the remaining balance on this invoice.",
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const payments = await listPayments(user.id, id);
  if (payments === null) return Response.json({ error: "Invoice not found." }, { status: 404 });
  return Response.json({ payments });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let body: Partial<PaymentInput>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount)) {
    return Response.json({ error: ERROR_MESSAGES["invalid-amount"] }, { status: 400 });
  }
  const paymentMethod = isPaymentMethod(body.paymentMethod) ? body.paymentMethod : "other";
  const paymentDate =
    typeof body.paymentDate === "string" && body.paymentDate
      ? body.paymentDate
      : new Date().toISOString().slice(0, 10);

  const result = await createPayment(user.id, id, {
    amount,
    paymentMethod,
    paymentDate,
    reference: typeof body.reference === "string" ? body.reference : "",
    notes: typeof body.notes === "string" ? body.notes : "",
  });

  if ("error" in result) {
    const status = result.error === "not-found" ? 404 : 400;
    return Response.json({ error: ERROR_MESSAGES[result.error] }, { status });
  }
  return Response.json({ ok: true, payment: result.payment, invoice: result.invoice });
}
