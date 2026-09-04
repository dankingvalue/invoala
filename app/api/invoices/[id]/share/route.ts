import { randomUUID } from "crypto";
import { dbGet, dbRun } from "@/lib/db";
import { getSessionUser } from "@/lib/server-auth";
import { getSharedInvoice } from "@/lib/invoice-share";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await dbGet<{ id: string }>(
    `SELECT id FROM invoices WHERE id = ?
     AND (user_id = ? OR team_id IN (SELECT team_id FROM team_members WHERE user_id = ?))`,
    id,
    user.id,
    user.id,
  );
  if (!invoice) return Response.json({ error: "Not found." }, { status: 404 });

  const token = randomUUID();
  await dbRun("UPDATE invoices SET share_token = ? WHERE id = ?", token, id);
  // Points at the styled public view page, not this API route directly — a
  // recipient clicking the link should see a real invoice, not raw JSON.
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.invoala.com"}/i/${id}?token=${token}`;
  return Response.json({ ok: true, url });
}

// JSON form of the same share link, kept for any existing/external
// integrations that fetch this route directly. The public-facing link is
// /i/[id]?token=... (app/i/[id]/page.tsx), which renders this same data
// through the styled invoice preview instead of raw JSON.
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  const result = await getSharedInvoice(id, token);
  if (!result) {
    return new Response("Invoice not found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  return Response.json(
    {
      id,
      number: result.meta.number,
      status: result.meta.status,
      total: result.meta.total,
      ...result.invoice,
    },
    {
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    }
  );
}
