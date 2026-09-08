import { getSessionUser } from "@/lib/server-auth";
import { getClientProfile } from "@/lib/data";
import { getWorkspaceSettings } from "@/lib/workspace-settings";
import { buildStatementData } from "@/lib/statement-html";
import { statementPdfBuffer } from "@/lib/statement-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Lets the user download their own copy of a client's statement without
// emailing it — same PDF the "Send statement" action attaches.
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const profile = await getClientProfile(user.id, id);
  if (!profile) return Response.json({ error: "Client not found." }, { status: 404 });

  const business = await getWorkspaceSettings(
    profile.client.team_id ? { type: "team", teamId: profile.client.team_id } : { type: "personal", userId: user.id },
  );
  if (!business) return Response.json({ error: "Workspace settings not found." }, { status: 500 });

  const statement = buildStatementData(profile.client, business, profile.invoices, profile.payments);

  const url = new URL(req.url);
  const inline = url.searchParams.get("inline") === "1";

  let pdf: { buffer: Buffer; engine: "chromium" | "emergency" };
  try {
    pdf = await statementPdfBuffer(statement);
  } catch (err) {
    console.error("[pdf] statement render failed", err);
    return Response.json(
      { error: "Couldn't generate the statement PDF right now. Please try again in a moment." },
      { status: 503 },
    );
  }
  const name = `Statement-${profile.client.name.replace(/[^\w.-]+/g, "-")}.pdf`;
  return new Response(new Uint8Array(pdf.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
      "Cache-Control": "private, no-store",
      "X-PDF-Engine": pdf.engine,
    },
  });
}
