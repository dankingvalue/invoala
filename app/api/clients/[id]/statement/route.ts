import { getSessionUser } from "@/lib/server-auth";
import { getClientProfile } from "@/lib/data";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { sendEmail } from "@/lib/email";
import { formatMoney } from "@/lib/invoice";
import { buildStatementData } from "@/lib/statement-html";
import { statementPdfBuffer } from "@/lib/statement-pdf";

// Builds a running-balance statement from the real invoice/payment ledger and
// sends it as a styled PDF attachment (same Chromium pipeline as invoice
// emails) with a short readable text body — not a monospace-padded text wall,
// which most email clients render as an unreadable jumble.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const profile = await getClientProfile(user.id, id);
  if (!profile) return Response.json({ error: "Client not found." }, { status: 404 });

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const toEmail = (body.to || profile.client.email || "").trim().toLowerCase();
  if (!toEmail || !toEmail.includes("@")) {
    return Response.json({ error: "Valid recipient email required." }, { status: 400 });
  }

  const business = await getWorkspaceSettings(
    profile.client.team_id ? { type: "team", teamId: profile.client.team_id } : { type: "personal", userId: user.id },
  );
  if (!business) return Response.json({ error: "Workspace settings not found." }, { status: 500 });

  const statement = buildStatementData(profile.client, business, profile.invoices, profile.payments);

  let pdfAttachment: { filename: string; content: string } | undefined;
  try {
    const { buffer } = await statementPdfBuffer(statement);
    pdfAttachment = {
      filename: `Statement-${profile.client.name.replace(/[^\w.-]+/g, "-")}.pdf`,
      content: buffer.toString("base64"),
    };
  } catch (err) {
    console.error("[email:statement] PDF generation failed — sending text summary only", err);
  }

  const closing = formatMoney(statement.closingBalance, statement.currency);
  const text = pdfAttachment
    ? `Hi ${profile.client.name},\n\nPlease find your account statement attached.\n\nClosing balance due: ${closing}\n\n— ${business.businessName || "Invoala"}`
    : `Hi ${profile.client.name},\n\nHere is your account statement.\n\n${statement.rows
        .map((r) => `${new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} — ${r.label}: ${r.debit ? formatMoney(r.debit, statement.currency) : `-${formatMoney(r.credit, statement.currency)}`}`)
        .join("\n")}\n\nClosing balance due: ${closing}\n\n— ${business.businessName || "Invoala"}`;

  const result = await sendEmail({
    to: toEmail,
    subject: `Statement — ${profile.client.name}`,
    text,
    attachments: pdfAttachment ? [pdfAttachment] : undefined,
    userId: user.id,
    teamId: profile.client.team_id,
    kind: "statement",
  });
  if (result.status === "failed") {
    return Response.json({ error: "Failed to send statement." }, { status: 500 });
  }
  return Response.json({ ok: true, status: result.status, attachedPdf: !!pdfAttachment });
}
