import { dbRun } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let email = "";
  let source = "website";
  try {
    const body = (await req.json()) as { email?: string; source?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    source =
      typeof body.source === "string" && body.source.trim().length > 0
        ? body.source.trim().slice(0, 50)
        : "website";
  } catch {
    // invalid body handled below
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  // Always keep a local copy so subscribers show up in the admin panel,
  // regardless of whether an external newsletter provider is configured.
  try {
    await dbRun(
      "INSERT INTO newsletter_subscribers (email, source, created_at) VALUES (?, ?, ?) ON CONFLICT(email) DO NOTHING",
      email,
      source,
      Date.now(),
    );
  } catch {
    // storage failure should not block the user experience
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.buttondown.com/v1/subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({ email }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok && res.status !== 409) {
        console.error("[subscribe] Buttondown sync failed", res.status);
      }
    } catch (err) {
      // The local copy is what powers the admin panel; a newsletter provider
      // outage should not turn a successful signup into an error.
      console.error("[subscribe] Buttondown sync error", err);
    }
  }

  return Response.json({ ok: true });
}
