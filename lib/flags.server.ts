import { dbGet, dbRun } from "@/lib/db";
import {
  defaultFlags,
  FLAG_KEYS,
  type FlagKey,
  type FlagsState,
} from "@/lib/flags";

const SETTINGS_KEY = "site_flags";

// Was a local JSON file (data/flags.json) — Vercel's serverless functions
// have an ephemeral, read-only filesystem, so writes either failed outright
// or silently vanished on the next cold start. app_settings is the same
// key/value table already used for schema_version and the AI provider
// choice, so it actually persists.
export async function getFlags(): Promise<FlagsState> {
  const row = await dbGet<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?", SETTINGS_KEY,
  ).catch(() => undefined);

  const state = defaultFlags();
  if (!row?.value) return state;

  try {
    const parsed = JSON.parse(row.value) as Partial<FlagsState>;
    if (parsed.flags && typeof parsed.flags === "object") {
      for (const key of FLAG_KEYS) {
        if (typeof parsed.flags[key as FlagKey] === "boolean") {
          state.flags[key] = parsed.flags[key as FlagKey];
        }
      }
    }
    if (typeof parsed.announcement === "string") {
      state.announcement = parsed.announcement.slice(0, 300);
    }
  } catch {
    // Corrupt stored value — fall back to defaults rather than throw.
  }
  return state;
}

export async function setFlags(next: FlagsState): Promise<void> {
  await dbRun(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    SETTINGS_KEY,
    JSON.stringify({ flags: next.flags, announcement: next.announcement }),
    Date.now(),
  );
}

export function sanitizeFlagsInput(input: unknown): FlagsState | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<FlagsState>;
  const state = defaultFlags();
  if (candidate.flags && typeof candidate.flags === "object") {
    for (const key of FLAG_KEYS) {
      if (typeof candidate.flags[key] === "boolean") state.flags[key] = candidate.flags[key];
    }
  }
  if (typeof candidate.announcement === "string") {
    state.announcement = candidate.announcement.trim().slice(0, 300);
  }
  return state;
}
