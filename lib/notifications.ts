import { randomUUID } from "crypto";
import { dbRun } from "@/lib/db";

export async function createNotification(opts: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  try {
    await dbRun(
      `INSERT INTO notifications (id, user_id, type, title, body, meta, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      randomUUID(),
      opts.userId,
      opts.type,
      opts.title,
      opts.body || "",
      opts.meta ? JSON.stringify(opts.meta) : null,
      Date.now()
    );
  } catch {
    // notifications must never break the request
  }
}
