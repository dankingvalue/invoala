import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { dbRun } from "@/lib/db";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ status: "sent" | "simulated" | "failed"; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Invoala <noreply@invoala.com>";
  const fromHeader = from.includes("<") ? from : `Invoala <${from}>`;
  let status: "sent" | "simulated" | "failed" = "simulated";
  let error: string | undefined;

  if (apiKey) {
    try {
      const res = await fetch(RESEND_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from: fromHeader, to: [opts.to], subject: opts.subject, text: opts.text }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        status = "sent";
      } else {
        status = "failed";
        error = `HTTP ${res.status}`;
      }
    } catch (err) {
      status = "failed";
      error = err instanceof Error ? err.message : String(err);
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
  return process.env.SITE_URL || "https://invoala.com";
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
