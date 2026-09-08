import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";
import { redactEmail } from "@/lib/redact";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const target = await dbGet<{
    id: string;
    email: string;
    name: string;
    role: string;
    timezone: string;
    email_verified: number;
    created_at: number;
  }>(
    "SELECT id, email, name, role, timezone, email_verified, created_at FROM users WHERE id = ?",
    id
  );
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  const sub = await dbGet<{
    plan: string;
    status: string;
    provider: string;
    current_period_end: number;
    cancel_at_period_end: number;
  }>(
    "SELECT plan, status, provider, current_period_end, cancel_at_period_end FROM subscriptions WHERE user_id = ?",
    id
  );

  const invoices = await dbAll<{
    id: string;
    number: string;
    status: string;
    client_name: string;
    total: number;
    currency: string;
    data: string;
    created_at: number;
  }>(
    "SELECT id, number, status, client_name, total, currency, data, created_at FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
    id
  );

  const conversations = await dbAll<{
    id: string;
    subject: string;
    status: string;
    created_at: number;
    updated_at: number;
  }>(
    "SELECT id, subject, status, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 10",
    id
  );

  const isSupport = user.role === "support";

  // Least-privilege access to customer financial documents (spec: "Customer
  // Document Access") — every time an agent opens a customer's profile they
  // see that customer's invoice documents, so this is the meaningful
  // "document viewed" event, not the paginated all-invoices admin list.
  await logAudit({
    action: "document_viewed",
    targetId: id,
    targetType: "customer_profile",
    details: { invoiceCount: invoices.length },
    actor: { id: user.id, email: user.email, role: user.role },
    req,
  });

  return Response.json({
    user: {
      ...target,
      email: isSupport ? redactEmail(target.email) : target.email,
    },
    subscription: sub || null,
    invoices,
    conversations,
  });
}
