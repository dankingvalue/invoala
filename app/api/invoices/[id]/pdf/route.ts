import { getSessionUser } from "@/lib/server-auth";
import { dbGet } from "@/lib/db";
import { invoicePdfBuffer } from "@/lib/invoice-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const row = await dbGet<{ number: string; data: string }>(
    "SELECT number, data FROM invoices WHERE id = ? AND user_id = ?",
    id,
    user.id,
  );
  if (!row) return Response.json({ error: "Not found." }, { status: 404 });

  let invoice: unknown;
  try {
    invoice = JSON.parse(row.data);
  } catch {
    return Response.json({ error: "Corrupt invoice data." }, { status: 500 });
  }

  const url = new URL(req.url);
  const inline = url.searchParams.get("inline") === "1";

  let pdf: Buffer;
  try {
    pdf = await invoicePdfBuffer(invoice as never);
  } catch (err) {
    console.error("[pdf] styled render failed", err);
    return Response.json(
      { error: "Couldn't generate the invoice PDF right now. Please try again in a moment." },
      { status: 503 },
    );
  }
  const name = `Invoice-${(row.number || "invoice").replace(/[^\w.-]+/g, "-")}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
