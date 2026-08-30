import { randomUUID } from "crypto";
import { dbGet, dbRun } from "@/lib/db";
import { getSessionUser } from "@/lib/server-auth";
import { createNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const invoice = await dbGet<{ id: string }>(
    "SELECT id FROM invoices WHERE id = ? AND user_id = ?",
    id,
    user.id
  );
  if (!invoice) return Response.json({ error: "Not found." }, { status: 404 });

  const token = randomUUID();
  await dbRun("UPDATE invoices SET share_token = ? WHERE id = ?", token, id);
  const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.invoala.com"}/api/invoices/${id}/share?token=${token}`;
  return Response.json({ ok: true, url });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  // A share link is only valid with its secret token. Without one (or with a
  // wrong one) the invoice is treated as not found so nothing is leaked.
  if (!token) {
    return new Response("Invoice not found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  const invoice = await dbGet<{
    id: string;
    user_id: string;
    number: string;
    status: string;
    client_name: string;
    total: number;
    currency: string;
    data: string;
    viewed_at: number | null;
    share_token: string | null;
  }>(
    "SELECT id, user_id, number, status, client_name, total, currency, data, viewed_at, share_token FROM invoices WHERE id = ?",
    id
  );

  if (!invoice || !invoice.share_token || invoice.share_token !== token) {
    return new Response("Invoice not found", {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    });
  }

  // Track first view (only notify once)
  if (!invoice.viewed_at) {
    const now = Date.now();
    const { changes } = await dbRun(
      "UPDATE invoices SET viewed_at = ? WHERE id = ? AND viewed_at IS NULL",
      now,
      id
    );
    if (changes > 0) {
      await createNotification({
        userId: invoice.user_id,
        type: "invoice_viewed",
        title: `Invoice #${invoice.number} was viewed`,
        body: `Your invoice for ${invoice.client_name || "a client"} (${invoice.total.toLocaleString("en-US", { minimumFractionDigits: 2 })} ${invoice.currency}) was just opened.`,
        meta: { invoiceId: id },
      });
    }
  }

  let invoiceData: Record<string, unknown> = {};
  try {
    invoiceData = JSON.parse(invoice.data);
  } catch {}

  return Response.json(
    {
      id: invoice.id,
      number: invoice.number,
      status: invoice.status,
      clientName: invoice.client_name,
      total: invoice.total,
      currency: invoice.currency,
      ...invoiceData,
    },
    {
      headers: { "X-Robots-Tag": "noindex, nofollow" },
    }
  );
}
