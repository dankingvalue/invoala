import { getSessionUser } from "@/lib/server-auth";
import { dbAll } from "@/lib/db";

type InvoiceRow = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  doc_type: string;
  number: string;
  currency: string;
  status: string;
  client_name: string;
  total: number;
  data: string;
  created_at: number;
  updated_at: number;
};

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const status = url.searchParams.get("status") || "";
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const args: unknown[] = [];

  if (q) {
    conditions.push("(i.client_name LIKE ? OR i.number LIKE ? OR u.email LIKE ?)");
    const like = `%${q}%`;
    args.push(like, like, like);
  }
  if (status) {
    conditions.push("i.status = ?");
    args.push(status);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRow = await dbAll<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM invoices i JOIN users u ON u.id = i.user_id ${where}`,
    ...args
  );
  const total = countRow[0]?.cnt ?? 0;

  const invoices = await dbAll<InvoiceRow>(
    `SELECT i.id, i.user_id, u.email as user_email, u.name as user_name,
            i.doc_type, i.number, i.currency, i.status, i.client_name,
            i.total, i.data, i.created_at, i.updated_at
     FROM invoices i JOIN users u ON u.id = i.user_id
     ${where}
     ORDER BY i.updated_at DESC LIMIT ? OFFSET ?`,
    ...args,
    pageSize,
    offset
  );

  return Response.json({ invoices, total, page, pageSize });
}
