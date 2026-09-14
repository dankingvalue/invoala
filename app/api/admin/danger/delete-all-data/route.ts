import { getSessionUser } from "@/lib/server-auth";
import { dbRun } from "@/lib/db";

// Total platform wipe: every user, invoice, team, subscription, and every
// piece of data tied to them — including messages/conversations, the email
// subscriber list, the audit trail, and usage-tracking activity. Platform
// CONTENT that isn't tied to a specific user survives on purpose (roadmap
// items, knowledge base articles, support macros, SEO redirects/overrides,
// app settings, FX/billing config caches) — this wipes users' data, not the
// admin's own curated site content.
//
// Deliberately includes the acting superadmin's own account, matching the
// button's literal "all users" wording — recovery is signing back up with
// the email in ADMIN_EMAIL, which auto-grants the role again (see
// app/api/auth/signup/route.ts).
//
// Table names below are a fixed internal list, never user input, so the
// interpolation into DELETE FROM <table> is not an injection risk.
//
// audit_logs is itself one of the tables wiped, so there is no DB record of
// who did this afterward — logged to the server console (Vercel logs) as
// the only surviving trace.
const TABLES_TO_WIPE = [
  // Support ops — children before parents
  "qa_reviews",
  "incident_updates",
  "incident_conversations",
  "incidents",
  "escalations",
  "shift_reports",
  "agent_skills",
  "messages",
  "conversations",
  // Billing/teams
  "payments",
  "team_invites",
  "team_members",
  "teams",
  "subscriptions",
  "promos",
  "trial_claims",
  // Core account data
  "service_items",
  "clients",
  "invoices",
  "notifications",
  "tokens",
  "sessions",
  // Explicitly requested additions
  "audit_logs",
  "usage_events",
  "newsletter_subscribers",
  "email_log",
  "roadmap_votes",
  // Root — last, since nothing above depends on it existing anymore
  "users",
];

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "superadmin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let confirm = "";
  try {
    const body = (await req.json()) as { confirm?: string };
    confirm = typeof body.confirm === "string" ? body.confirm : "";
  } catch {}
  if (confirm !== "DELETE ALL DATA") {
    return Response.json({ error: 'Type "DELETE ALL DATA" to confirm.' }, { status: 400 });
  }

  console.error(
    `[DANGER] delete-all-data triggered by ${user.email} (${user.id}) at ${new Date().toISOString()}`,
  );

  const deleted: Record<string, number> = {};
  for (const table of TABLES_TO_WIPE) {
    const result = await dbRun(`DELETE FROM ${table}`);
    deleted[table] = result.changes;
  }

  return Response.json({ ok: true, deleted });
}
