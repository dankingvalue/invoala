import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbAll } from "@/lib/db";

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
    created_at: number;
  }>(
    "SELECT id, number, status, client_name, total, currency, created_at FROM invoices WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
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

  return Response.json({
    user: target,
    subscription: sub || null,
    invoices,
    conversations,
  });
}
