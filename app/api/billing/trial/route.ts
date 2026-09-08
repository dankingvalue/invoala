import { getSessionUser } from "@/lib/server-auth";
import { getSubscription } from "@/lib/billing";
import { checkTrialEligibility, startProTrial, TRIAL_DAYS } from "@/lib/trial";
import { hashIp, VISITOR_COOKIE } from "@/lib/usage";
import { sendEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";

const REASON_MESSAGE: Record<string, string> = {
  already_subscribed: "You already have a subscription on this account.",
  already_trialed: "You've already used your free trial.",
  duplicate_signal: "A free trial has already been used from this email or network. Upgrade to Pro to continue.",
};

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = ip ? hashIp(ip) : null;
  const cookieHeader = req.headers.get("cookie") || "";
  const visitorId = cookieHeader.match(new RegExp(`${VISITOR_COOKIE}=([^;]+)`))?.[1] || null;

  const eligibility = await checkTrialEligibility({ userId: user.id, email: user.email, ipHash, visitorId });
  if (!eligibility.eligible) {
    return Response.json({ error: REASON_MESSAGE[eligibility.reason] || "Not eligible for a free trial." }, { status: 400 });
  }

  await startProTrial({ userId: user.id, email: user.email, ipHash, visitorId });

  await logAudit({
    action: "grant_plan",
    targetId: user.id,
    targetType: "user",
    details: { plan: "pro_monthly", trial: true, days: TRIAL_DAYS },
    actor: { id: user.id, email: user.email, role: user.role },
  });

  void sendEmail({
    to: user.email,
    subject: "Your 7-day Invoala Pro trial has started",
    text: `Hi ${user.name || "there"},\n\nYour free ${TRIAL_DAYS}-day trial of Invoala Pro is active — no card required. It ends in ${TRIAL_DAYS} days; if you'd like to keep Pro features after that, you can subscribe anytime from Dashboard → Billing.\n\n— Invoala`,
    userId: user.id,
    kind: "other",
  });

  return Response.json({ ok: true, subscription: await getSubscription(user.id) });
}
