import { getSessionUser } from "@/lib/server-auth";
import { dbGet } from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const invoice = await dbGet<{
    id: string;
    user_id: string;
    number: string;
    status: string;
    client_name: string;
    total: number;
    currency: string;
    data: string;
  }>(
    "SELECT id, user_id, number, status, client_name, total, currency, data FROM invoices WHERE id = ? AND user_id = ?",
    id, user.id
  );

  if (!invoice) return Response.json({ error: "Invoice not found." }, { status: 404 });

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const toEmail = body.to?.trim().toLowerCase();
  if (!toEmail || !toEmail.includes("@")) {
    return Response.json({ error: "Valid recipient email required." }, { status: 400 });
  }

  let invoiceData: Record<string, unknown> = {};
  try {
    invoiceData = JSON.parse(invoice.data);
  } catch {}

  const businessName = (invoiceData.businessName as string) || user.name || "Invoala";
  const amount = invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const result = await sendEmail({
    to: toEmail,
    subject: `Invoice #${invoice.number} from ${businessName}`,
    text: `Hi ${invoice.client_name || "there"},\n\nPlease find attached invoice #${invoice.number} for ${amount} ${invoice.currency}.\n\n${invoiceData.notes ? `Notes: ${invoiceData.notes}\n\n` : ""}Thank you for your business!\n\n— ${businessName}`,
  });

  if (result.status === "failed") {
    return Response.json({ error: "Failed to send email." }, { status: 500 });
  }

  return Response.json({ ok: true, status: result.status });
}
