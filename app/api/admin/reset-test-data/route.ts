import { getSessionUser } from "@/lib/server-auth";
import { dbRun } from "@/lib/db";

// Deliberately narrow: only clears data that can ONLY be test/dev noise —
// usage_events (pure analytics tracking, no customer-facing meaning) and
// subscriptions created via the admin "Grant Pro" dev buttons (provider =
// 'dev', never a real Stripe/Polar payment). Never touches users, invoices,
// real subscriptions, or email history — those can't be reliably told apart
// from real customer data, so this doesn't guess.
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user || user.role !== "superadmin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usageResult = await dbRun("DELETE FROM usage_events");
  const subsResult = await dbRun("DELETE FROM subscriptions WHERE provider = 'dev'");

  return Response.json({
    ok: true,
    deleted: {
      usageEvents: usageResult.changes,
      devSubscriptions: subsResult.changes,
    },
  });
}
