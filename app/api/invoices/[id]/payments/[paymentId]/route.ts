import { getSessionUser } from "@/lib/server-auth";
import { deletePayment, updatePayment, type PaymentInput } from "@/lib/data";
import { sanitizePaymentMethod } from "@/lib/invoice-status";

const ERROR_MESSAGES: Record<string, string> = {
  "not-found": "Payment not found.",
  draft: "Issue this invoice before recording a payment against it.",
  void: "This invoice has been voided and can't take new payments.",
  "invalid-amount": "Enter a valid amount greater than zero.",
  "exceeds-balance": "That's more than the remaining balance on this invoice.",
};

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { paymentId } = await params;

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
  const paymentMethod = sanitizePaymentMethod(body.paymentMethod);
  const paymentDate =
    typeof body.paymentDate === "string" && body.paymentDate
      ? body.paymentDate
      : new Date().toISOString().slice(0, 10);

  const result = await updatePayment(user.id, paymentId, {
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> },
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { paymentId } = await params;

  const result = await deletePayment(user.id, paymentId);
  if (!result) return Response.json({ error: "Payment not found." }, { status: 404 });
  return Response.json({ ok: true, invoiceId: result.invoiceId, invoice: result.invoice });
}
