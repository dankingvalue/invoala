import { dbGet, dbRun } from "@/lib/db";

export const AI_PROVIDERS = ["openai", "deepseek", "anthropic", "gemini"] as const;
export type AiProviderId = (typeof AI_PROVIDERS)[number];

type ProviderKind = "openai-compatible" | "anthropic" | "gemini";

type ProviderMeta = {
  id: AiProviderId;
  label: string;
  envKey: string;
  modelEnvKey: string;
  defaultModel: string;
  baseUrl?: string;
  kind: ProviderKind;
};

const PROVIDER_META: Record<AiProviderId, ProviderMeta> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    envKey: "OPENAI_API_KEY",
    modelEnvKey: "AI_MODEL_OPENAI",
    defaultModel: "gpt-4o-mini",
    baseUrl: "https://api.openai.com/v1",
    kind: "openai-compatible",
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    modelEnvKey: "AI_MODEL_DEEPSEEK",
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    kind: "openai-compatible",
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    modelEnvKey: "AI_MODEL_ANTHROPIC",
    defaultModel: "claude-sonnet-4-20250514",
    kind: "anthropic",
  },
  gemini: {
    id: "gemini",
    label: "Gemini",
    envKey: "GEMINI_API_KEY",
    modelEnvKey: "AI_MODEL_GEMINI",
    defaultModel: "gemini-2.5-flash",
    kind: "gemini",
  },
};

const SETTINGS_KEY = "ai_provider";

function hasKey(id: AiProviderId): boolean {
  return !!process.env[PROVIDER_META[id].envKey];
}

export function listProviders(): Array<{ id: AiProviderId; label: string; configured: boolean }> {
  return AI_PROVIDERS.map((id) => ({ id, label: PROVIDER_META[id].label, configured: hasKey(id) }));
}

export function isAiProviderId(value: unknown): value is AiProviderId {
  return typeof value === "string" && (AI_PROVIDERS as readonly string[]).includes(value);
}

export async function getActiveProviderId(): Promise<AiProviderId | null> {
  const row = await dbGet<{ value: string }>(
    "SELECT value FROM app_settings WHERE key = ?",
    SETTINGS_KEY,
  ).catch(() => undefined);
  const stored = row?.value;
  if (isAiProviderId(stored) && hasKey(stored)) return stored;
  // No valid stored choice (or its key was removed from Vercel) — fall back
  // to the first provider that currently has a key configured.
  return AI_PROVIDERS.find(hasKey) ?? null;
}

export async function setActiveProviderId(id: AiProviderId): Promise<void> {
  await dbRun(
    `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    SETTINGS_KEY,
    id,
    Date.now(),
  );
}

type ResolvedProvider = {
  id: AiProviderId;
  label: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  kind: ProviderKind;
};

async function resolveActiveProvider(): Promise<ResolvedProvider | null> {
  const id = await getActiveProviderId();
  if (!id) return null;
  const meta = PROVIDER_META[id];
  const apiKey = process.env[meta.envKey];
  if (!apiKey) return null;
  const model = process.env[meta.modelEnvKey] || process.env.AI_MODEL || meta.defaultModel;
  return { id, label: meta.label, apiKey, model, baseUrl: meta.baseUrl, kind: meta.kind };
}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

type CallOpts = {
  jsonMode?: boolean;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

async function callOpenAiCompatible(
  provider: ResolvedProvider,
  messages: ChatMessage[],
  opts: CallOpts,
): Promise<string | null> {
  const body: Record<string, unknown> = {
    model: provider.model,
    messages,
    temperature: opts.temperature ?? 0.3,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };
  if (opts.maxTokens) body.max_tokens = opts.maxTokens;

  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 30000),
  });
  if (!res.ok) {
    console.error(`[ai:${provider.id}] request failed`, res.status);
    return null;
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? null;
}

async function callAnthropic(
  provider: ResolvedProvider,
  messages: ChatMessage[],
  opts: CallOpts,
): Promise<string | null> {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const turns = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": provider.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: provider.model,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature ?? 0.3,
      system,
      messages: turns,
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 30000),
  });
  if (!res.ok) {
    console.error("[ai:anthropic] request failed", res.status);
    return null;
  }
  const json = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
  return json.content?.[0]?.text ?? null;
}

async function callGemini(
  provider: ResolvedProvider,
  messages: ChatMessage[],
  opts: CallOpts,
): Promise<string | null> {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const contents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: opts.temperature ?? 0.3,
          ...(opts.jsonMode ? { responseMimeType: "application/json" } : {}),
        },
      }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? 30000),
    },
  );
  if (!res.ok) {
    console.error("[ai:gemini] request failed", res.status);
    return null;
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// Single entry point for both the invoice-drafting AI and the live-chat AI.
// Which provider actually runs is decided by the admin-selected setting
// (superadmin → Settings → AI provider), so switching there changes both
// features at once — no code change or redeploy needed.
export async function callChat(messages: ChatMessage[], opts: CallOpts = {}): Promise<string | null> {
  const provider = await resolveActiveProvider();
  if (!provider) return null;
  try {
    if (provider.kind === "openai-compatible") return await callOpenAiCompatible(provider, messages, opts);
    if (provider.kind === "anthropic") return await callAnthropic(provider, messages, opts);
    if (provider.kind === "gemini") return await callGemini(provider, messages, opts);
    return null;
  } catch (err) {
    console.error(`[ai:${provider.id}] call threw`, err);
    return null;
  }
}
