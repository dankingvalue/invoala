import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/server-auth";
import { VISITOR_COOKIE, VISITOR_MAX_AGE, hashIp, isUsageEvent, logUsageEvent, newVisitorId } from "@/lib/usage";

export async function POST(req: Request) {
  let event = "";
  try {
    const body = (await req.json()) as { event?: string };
    event = typeof body.event === "string" ? body.event : "";
  } catch {
    return new Response(null, { status: 204 });
  }

  // Unknown/uninteresting event names are accepted (so callers never see an
  // error) but simply not persisted — this endpoint only tracks the
  // invoice-generation funnel, not every UI click.
  if (!isUsageEvent(event)) {
    return new Response(null, { status: 204 });
  }

  const cookieHeader = req.headers.get("cookie") || "";
  const existing = cookieHeader.match(new RegExp(`${VISITOR_COOKIE}=([^;]+)`))?.[1];
  const visitorId = existing || newVisitorId();

  const user = await getSessionUser(req).catch(() => null);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  await logUsageEvent({
    event,
    visitorId,
    userId: user?.id ?? null,
    ipHash: ip ? hashIp(ip) : null,
  });

  const res = new NextResponse(null, { status: 204 });
  if (!existing) {
    res.cookies.set(VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: VISITOR_MAX_AGE,
    });
  }
  return res;
}
