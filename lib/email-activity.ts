// Powers the dashboard's "Email activity" feed (Messages tab) — reuses
// email_log (see lib/email.ts sendEmail) rather than a second log, joined
// against invoices for the live "viewed" state so that never drifts out of
// sync with the real ledger.
import { dbAll } from "@/lib/db";
import { isTeamMember } from "@/lib/teams";

export type EmailActivityEntry = {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  kind: string | null;
  created_at: number;
  invoice_id: string | null;
  invoice_number: string | null;
  invoice_viewed_at: number | null;
};

// teamId omitted: everything the user can see (their own + every team's).
// null: Personal only. A team id: that team only, membership re-verified
// here regardless of what the caller already checked.
export async function getEmailActivity(
  userId: string,
  teamId?: string | null,
  limit = 100,
): Promise<EmailActivityEntry[]> {
  const cols = `e.id, e.to_email, e.subject, e.status, e.kind, e.created_at,
      e.invoice_id, i.number AS invoice_number, i.viewed_at AS invoice_viewed_at`;
  const join = "FROM email_log e LEFT JOIN invoices i ON i.id = e.invoice_id";

  if (teamId === undefined) {
    return await dbAll<EmailActivityEntry>(
      `SELECT ${cols} ${join} WHERE e.user_id = ? ORDER BY e.created_at DESC LIMIT ?`,
      userId, limit,
    );
  }
  if (teamId === null) {
    return await dbAll<EmailActivityEntry>(
      `SELECT ${cols} ${join} WHERE e.user_id = ? AND e.team_id IS NULL ORDER BY e.created_at DESC LIMIT ?`,
      userId, limit,
    );
  }
  if (!(await isTeamMember(teamId, userId))) return [];
  return await dbAll<EmailActivityEntry>(
    `SELECT ${cols} ${join} WHERE e.team_id = ? ORDER BY e.created_at DESC LIMIT ?`,
    teamId, limit,
  );
}
