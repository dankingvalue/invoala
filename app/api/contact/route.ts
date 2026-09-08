import { sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

const CONTACT_INBOX = "hello@invoala.com";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { ok, retryAfterMs } = checkRateLimit(`contact:${ip}`, 5, 15 * 60_000);
  if (!ok) {
    return Response.json(
      { error: `Too many requests. Try again in ${Math.ceil(retryAfterMs / 60_000)} minutes.` },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } },
    );
  }

  let body: { name?: string; email?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = (body.name || "").trim().slice(0, 120);
  const email = (body.email || "").trim().toLowerCase().slice(0, 200);
  const message = (body.message || "").trim().slice(0, 4000);

  if (!name) return Response.json({ error: "Please enter your name." }, { status: 400 });
  if (!email || !email.includes("@")) return Response.json({ error: "Please enter a valid email." }, { status: 400 });
  if (!message) return Response.json({ error: "Please enter a message." }, { status: 400 });

  const result = await sendEmail({
    to: CONTACT_INBOX,
    subject: `Contact form — ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    kind: "other",
  });

  if (result.status === "failed") {
    return Response.json({ error: "Could not send your message right now. Please try again." }, { status: 500 });
  }
  return Response.json({ ok: true });
}
