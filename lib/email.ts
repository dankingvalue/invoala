import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { dbRun } from "@/lib/db";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  attachments?: Array<{ filename: string; content: string }>;
}): Promise<{ status: "sent" | "simulated" | "failed"; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Invoala <noreply@invoala.com>";
  const fromHeader = from.includes("<") ? from : `Invoala <${from}>`;
  let status: "sent" | "simulated" | "failed" = "simulated";
  let error: string | undefined;

  if (apiKey) {
    const body: Record<string, unknown> = {
      from: fromHeader,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
    };
    if (opts.attachments && opts.attachments.length > 0) {
      body.attachments = opts.attachments.map((a) => ({ filename: a.filename, content: a.content }));
    }
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(RESEND_ENDPOINT, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(30000),
        });
        if (res.ok) {
          status = "sent";
          break;
        } else {
          status = "failed";
          const body = await res.text().catch(() => "");
          error = `HTTP ${res.status}: ${body}`;
          console.error(`[email:failed] attempt=${attempt} to=${opts.to} subject="${opts.subject}" error=${error}`);
          if (res.status >= 400 && res.status < 500) break;
        }
      } catch (err) {
        status = "failed";
        error = err instanceof Error ? err.message : String(err);
        console.error(`[email:error] attempt=${attempt} to=${opts.to} subject="${opts.subject}" error=${error}`);
        if (attempt < 3) await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  } else {
    console.log(`[email:simulated] to=${opts.to} subject="${opts.subject}"`);
  }

  try {
    await dbRun(
      "INSERT INTO email_log (id, to_email, subject, provider, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      randomUUID(), opts.to, opts.subject, apiKey ? "resend" : "console", status, error ?? null, Date.now()
    );
  } catch {
    // logging must never break the request
  }

  return { status, error };
}

export function verifyStripeSignature(payload: string, header: string | null): boolean {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]),
  );
  if (!parts.t || !parts.v1) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${payload}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
  } catch {
    return false;
  }
}

function origin(): string {
  return process.env.SITE_URL || "https://www.invoala.com";
}

export async function sendVerificationEmail(opts: {
  to: string;
  userId: string;
  code: string;
  linkToken: string;
}): Promise<void> {
  const link = `${origin()}/api/auth/verify-email?token=${opts.linkToken}`;
  const text = `Verify your Invoala account.\n\nYour verification code: ${opts.code}\n\nOr click this link to verify instantly:\n${link}\n\nThis link expires in 24 hours.`;
  await sendEmail({ to: opts.to, subject: "Verify your Invoala account", text });
}

export async function sendMagicLinkEmail(opts: {
  to: string;
  token: string;
}): Promise<void> {
  const link = `${origin()}/api/auth/magic/verify?token=${opts.token}`;
  const text = `Sign in to Invoala.\n\nClick this link to sign in instantly:\n${link}\n\nThis link expires in 15 minutes.`;
  await sendEmail({ to: opts.to, subject: "Sign in to Invoala", text });
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  token: string;
}): Promise<void> {
  const link = `${origin()}/reset-password?token=${opts.token}`;
  const text = `Reset your Invoala password.\n\nClick this link to set a new password:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, just ignore this email.`;
  await sendEmail({ to: opts.to, subject: "Reset your Invoala password", text });
}

export async function sendEmailChangeEmail(opts: {
  to: string;
  token: string;
  newEmail: string;
}): Promise<void> {
  const link = `${origin()}/api/auth/email-change?token=${opts.token}`;
  const text = `Confirm your new email address for Invoala.\n\nClick to confirm ${opts.newEmail}:\n${link}\n\nThis link expires in 24 hours.`;
  await sendEmail({ to: opts.to, subject: "Confirm your new email address", text });
}

export async function sendTeamInviteEmail(
  to: string,
  teamName: string,
  inviterName: string,
  inviteId: string
): Promise<void> {
  const link = `${origin()}/teams/accept/${inviteId}`;
  const text = `${inviterName} invited you to join "${teamName}" on Invoala.\n\nClick to accept the invitation:\n${link}\n\nThis link expires in 7 days.`;
  await sendEmail({ to, subject: `You're invited to join ${teamName} on Invoala`, text });
}

export async function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  promoCode?: string | null;
  promoExpiresAt?: number | null;
}): Promise<void> {
  const codeLine = opts.promoCode
    ? `\n\nNew-account offer: get 50% off the Lifetime plan.\nUse code ${opts.promoCode} at checkout.\n\nIt's valid for ${opts.promoExpiresAt ? `10 days (until ${new Date(opts.promoExpiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })})` : "10 days"} — one-time use.\nGrab it at https://www.invoala.com/pricing\n`
    : "";
  const text = `Hey ${opts.name || "there"},\n\nWelcome to Invoala! Your account is ready.\n\nCreate your first invoice in under a minute:\nhttps://www.invoala.com/#generate\n\nNo templates to configure. No forms to study. Just fill in the blanks and download your PDF.${codeLine}\nQuestions? Just reply to this email.\n\n— The Invoala Team`;
  await sendEmail({ to: opts.to, subject: "Welcome to Invoala — 50% off Lifetime inside", text });
}

export async function sendPromoReminderEmail(opts: {
  to: string;
  name: string;
  code: string;
  expiresAt: number;
}): Promise<void> {
  const expiry = new Date(opts.expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const text = `Hey ${opts.name || "there"},\n\nYou signed up for Invoala a couple of days ago but haven't picked a plan yet — no pressure, the free generator is yours forever.\n\nIf you do want lifetime access while it's on offer:\n\n→ Code: ${opts.code}\n→ 50% off the Lifetime plan ($249 instead of $499)\n→ Expires: ${expiry}\n→ Grab it: https://www.invoala.com/pricing\n\nThe code is applied automatically when you check out from your account.\n\n— The Invoala Team`;
  await sendEmail({ to: opts.to, subject: `Your 50% Lifetime code expires ${expiry}`, text });
}
