import { getSessionUser } from "@/lib/server-auth";
import { isTeamMember } from "@/lib/teams";
import { getTeamActivityFiltered } from "@/lib/audit";
import { dbGet } from "@/lib/db";

// Member profile — only what a fellow team member should reasonably see:
// name/email/role/joined date, how much they've done in this workspace, and
// their recent activity here. No auth internals (password hash, sessions,
// tokens) are ever selected, let alone returned.
export async function GET(req: Request, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id, userId } = await params;

  if (!(await isTeamMember(id, user.id))) {
    return Response.json({ error: "Not a member of this workspace." }, { status: 403 });
  }

  const member = await dbGet<{ user_id: string; role: string; joined_at: number; name: string; email: string }>(
    `SELECT tm.user_id, tm.role, tm.joined_at, u.name, u.email
     FROM team_members tm JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = ? AND tm.user_id = ?`,
    id, userId,
  );
  if (!member) return Response.json({ error: "Not a member of this workspace." }, { status: 404 });

  const [invoiceRow, paymentRow, { entries: recentActivity }] = await Promise.all([
    dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM invoices WHERE team_id = ? AND user_id = ?", id, userId),
    dbGet<{ n: number }>("SELECT COUNT(*) AS n FROM payments WHERE user_id = ? AND invoice_id IN (SELECT id FROM invoices WHERE team_id = ?)", userId, id),
    getTeamActivityFiltered(id, { actorId: userId, limit: 10 }),
  ]);

  return Response.json({
    member,
    stats: { invoicesCreated: invoiceRow?.n ?? 0, paymentsRecorded: paymentRow?.n ?? 0 },
    recentActivity,
  });
}
