import type { SessionUser } from "@/lib/server-auth";
import { isUserPro, canUseTeams } from "@/lib/billing";
import { dbGet } from "@/lib/db";

// Single source of truth for which actions require Pro — every one of these
// is a bullet on the pricing page (lib/plans-content.ts); this is what
// actually enforces it server-side instead of that copy being purely
// aspirational. Frontend lock icons/upgrade prompts read from
// PRO_FEATURE_LABELS too, so the wording never drifts between "why is this
// locked" (UI) and "why did this 402" (API).
export const PRO_FEATURE_LABELS = {
  save_invoice: "Saving invoices to your account",
  client_book: "Saved clients",
  client_statement: "Client statements",
  email_invoice: "Emailing invoices to clients",
  share_link: "Public share links",
  quote_estimate: "Quotes & estimates",
  recurring_invoice: "Recurring invoices",
  payment_link: "Payment links",
} as const;

export type ProFeature = keyof typeof PRO_FEATURE_LABELS;

// 402 Payment Required — semantically distinct from a 401/403 auth failure,
// and an easy, unambiguous signal for the frontend to detect "show an
// upgrade prompt" vs. a real permission error.
export async function requireProFeature(user: SessionUser, feature: ProFeature): Promise<Response | null> {
  const pro = await isUserPro(user.id, user.role);
  if (pro) return null;
  return Response.json(
    { error: `${PRO_FEATURE_LABELS[feature]} is a Pro feature.`, code: "PRO_REQUIRED", feature },
    { status: 402 },
  );
}

// Team creation itself already checks canUseTeams (see app/api/teams/route.ts)
// — but that was the ONLY place it was checked. A team, once created, kept
// functioning as a permanent entitlement forever: invites and invite-
// acceptance never re-verified the owner's Teams subscription was still
// active. This closes that specific gap (new invites / accepting a pending
// invite) without touching already-existing team members' access to
// clients/invoices they already share — same "gate growth, not what's
// already there" approach used for Pro features above.
export async function requireActiveTeamsPlan(ownerId: string): Promise<Response | null> {
  const owner = await dbGet<{ role: string }>("SELECT role FROM users WHERE id = ?", ownerId);
  const active = await canUseTeams(ownerId, owner?.role);
  if (active) return null;
  return Response.json(
    { error: "This team's Teams plan is no longer active — the team owner needs to renew before more members can be added.", code: "TEAMS_PLAN_REQUIRED" },
    { status: 402 },
  );
}
