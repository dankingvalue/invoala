import { randomUUID } from "crypto";
import { getSessionUser } from "@/lib/server-auth";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";

const MAX_BATCH = 1000;

export async function POST(req: Request) {
  const admin = getSessionUser(req);
  if (!admin || !["superadmin", "admin", "support"].includes(admin.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let audience = "";
  let subject = "";
  let text = "";
  let toEmail = "";
  try {
    const body = (await req.json()) as {
      audience?: string;
      subject?: string;
      text?: string;
      to?: string;
    };
    audience = typeof body.audience === "string" ? body.audience : "";
    subject = typeof body.subject === "string" ? body.subject.trim() : "";
    text = typeof body.text === "string" ? body.text.trim() : "";
    toEmail = typeof body.to === "string" ? body.to.trim().toLowerCase() : "";
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!subject || subject.length > 200) {
    return Response.json({ error: "Subject is required (max 200 chars)." }, { status: 400 });
  }
  if (!text || text.length > 10000) {
    return Response.json({ error: "Message is required (max 10,000 chars)." }, { status: 400 });
  }

  const db = getDb();
  let recipients: string[] = [];

  if (audience === "one") {
    if (!toEmail) return Response.json({ error: "Recipient email required." }, { status: 400 });
    recipients = [toEmail];
  } else {
    const filter =
      audience === "pro"
        ? "JOIN subscriptions s ON s.user_id = u.id WHERE s.status = 'active'"
        : audience === "free"
          ? "LEFT JOIN subscriptions s ON s.user_id = u.id WHERE s.id IS NULL OR s.status != 'active'"
          : "";
    if (!["all", "pro", "free"].includes(audience)) {
      return Response.json({ error: "Unknown audience." }, { status: 400 });
    }
    const rows = db
      .prepare(`SELECT u.email FROM users u ${filter} LIMIT ${MAX_BATCH}`)
      .all() as Array<{ email: string }>;
    recipients = rows.map((r) => r.email);
  }

  if (recipients.length === 0) {
    return Response.json({ error: "No recipients matched." }, { status: 422 });
  }

  let sent = 0;
  let simulated = 0;
  let failed = 0;
  for (const to of recipients) {
    const result = await sendEmail({
      to,
      subject: audience === "one" ? subject : `${subject}`,
      text,
    });
    if (result.status === "sent") sent += 1;
    else if (result.status === "simulated") simulated += 1;
    else failed += 1;
  }

  void randomUUID;
  return Response.json({
    ok: true,
    recipients: recipients.length,
    sent,
    simulated,
    failed,
  });
}
