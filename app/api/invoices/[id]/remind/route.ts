import { getSessionUser } from "@/lib/server-auth";
import { getInvoice } from "@/lib/data";
import { sendEmail } from "@/lib/email";
import { invoicePdfBuffer } from "@/lib/invoice-pdf";
import { remainingBalance } from "@/lib/invoice-status";

// Reuses the exact same email + PDF pipeline as the regular "Email" action —
// a reminder is just that email with a nudge subject/body, not a second
// email system.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const row = await getInvoice(user.id, id);
  if (!row) return Response.json({ error: "Invoice not found." }, { status: 404 });

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const toEmail = (body.to || row.data.clientEmail || "").trim().toLowerCase();
  if (!toEmail || !toEmail.includes("@")) {
    return Response.json({ error: "Valid recipient email required." }, { status: 400 });
  }

  const businessName = row.data.businessName || user.name || "Invoala";
  const balance = remainingBalance(row.total, Number(row.data.amountPaid) || 0);
  const amount = balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let pdfAttachment: { filename: string; content: string } | undefined;
  try {
    const { buffer } = await invoicePdfBuffer(row.data);
    pdfAttachment = {
      filename: `Invoice-${row.number.replace(/[^\w.-]+/g, "-")}.pdf`,
      content: buffer.toString("base64"),
    };
  } catch (err) {
    console.error("[remind:invoice] PDF generation failed — sending text reminder only", err);
  }

  const result = await sendEmail({
    to: toEmail,
    subject: `Reminder: Invoice #${row.number} from ${businessName}`,
    text: `Hi ${row.client_name || "there"},\n\nThis is a friendly reminder that Invoice #${row.number} — ${amount} ${row.currency} — is still outstanding.\n\n${pdfAttachment ? "The invoice is attached." : `Amount due: ${amount} ${row.currency}.`}\n\nThank you!\n\n— ${businessName}`,
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
    userId: user.id,
    teamId: row.team_id,
    invoiceId: row.id,
    kind: "reminder",
  });

  if (result.status === "failed") {
    return Response.json({ error: "Failed to send reminder." }, { status: 500 });
  }
  return Response.json({ ok: true, status: result.status });
}
