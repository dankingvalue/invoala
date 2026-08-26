const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const recent = new Set<string>();

export async function POST(req: Request) {
  let email = "";
  try {
    const body = (await req.json()) as { email?: string };
    email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  } catch {
    // invalid body handled below
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
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
        return Response.json(
          { error: "Subscription service is having trouble. Try again later." },
          { status: 502 },
        );
      }
    } catch {
      return Response.json(
        { error: "Subscription service is having trouble. Try again later." },
        { status: 502 },
      );
    }
  } else {
    recent.add(email);
    console.log(`[subscribe] captured ${email} (${recent.size} total this server lifetime)`);
  }

  return Response.json({ ok: true });
}
