import { getSessionUser } from "@/lib/server-auth";
import { dbGet, dbRun } from "@/lib/db";
import { randomUUID, createHash } from "crypto";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const admin = await getSessionUser(req);
  if (!admin || admin.role !== "superadmin") {
    return Response.json({ error: "Only superadmins can impersonate." }, { status: 403 });
  }

  let body: { userId?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (!body.userId) {
    return Response.json({ error: "userId required." }, { status: 400 });
  }

  const target = await dbGet<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE id = ?",
    body.userId
  );
  if (!target) return Response.json({ error: "User not found." }, { status: 404 });

  const token = randomUUID();
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = Date.now() + 60 * 60_000; // 1 hour

  await dbRun(
    "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
    tokenHash, body.userId, expiresAt, Date.now()
  );

  await logAudit({
    action: "impersonate",
    actor: { id: admin.id, email: admin.email, role: admin.role },
    targetType: "user",
    targetId: body.userId,
    details: { targetEmail: target.email, duration: "1hr" },
  });

  return Response.json({
    ok: true,
    token,
    expiresAt,
    user: { id: target.id, email: target.email },
  });
}
