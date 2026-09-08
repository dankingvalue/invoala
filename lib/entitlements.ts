import type { SessionUser } from "@/lib/server-auth";
import { isUserPro } from "@/lib/billing";

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
