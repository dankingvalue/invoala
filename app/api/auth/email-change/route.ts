import { NextResponse } from "next/server";
import { dbRun } from "@/lib/db";
import { consumeToken } from "@/lib/server-auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";

  if (!token) {
    return NextResponse.redirect(new URL("/account?error=invalid_token", req.url));
  }

  const result = await consumeToken(token, "email_change");
  if (!result || !result.data) {
    return NextResponse.redirect(new URL("/account?error=expired", req.url));
  }

  await dbRun(
    "UPDATE users SET email = ?, pending_email = NULL, email_verified = 1 WHERE id = ?",
    result.data, result.userId
  );

  return NextResponse.redirect(new URL("/account?email_changed=1", req.url));
}
