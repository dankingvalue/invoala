import { NextResponse } from "next/server";
import { destroySession, USER_COOKIE } from "@/lib/server-auth";

export async function POST(req: Request) {
  const match = req.headers.get("cookie")?.match(new RegExp(`${USER_COOKIE}=([^;]+)`));
  destroySession(match?.[1]);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
