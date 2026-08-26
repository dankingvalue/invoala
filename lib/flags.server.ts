import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  defaultFlags,
  FLAG_KEYS,
  type FlagKey,
  type FlagsState,
} from "@/lib/flags";

function filePath(): string {
  return process.env.FLAGS_PATH || path.join(process.cwd(), "data", "flags.json");
}

export async function getFlags(): Promise<FlagsState> {
  try {
    const raw = await readFile(filePath(), "utf8");
    const parsed = JSON.parse(raw) as Partial<FlagsState>;
    const state = defaultFlags();
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
    return state;
  } catch {
    return defaultFlags();
  }
}

export async function setFlags(next: FlagsState): Promise<void> {
  const file = filePath();
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(next, null, 2)}\n`, "utf8");
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
