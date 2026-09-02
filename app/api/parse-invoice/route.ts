import { parseInvoiceText, type ParsedInvoice } from "@/lib/parseInvoice";

function stripNulls(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
      delete obj[key];
    }
  }
}

type Provider = "openai" | "anthropic" | "gemini" | null;

// The OPENAI_API_KEY slot now accepts any OpenAI-compatible provider key.
// Defaults point at DeepSeek (deepseek-chat); set AI_BASE_URL/AI_MODEL to
// target OpenAI or another compatible endpoint instead.
function getProvider(): { provider: Provider; apiKey: string; model: string; baseUrl?: string } {
  const model = process.env.AI_MODEL || "";

  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: model || "claude-sonnet-4-20250514",
    };
  }

  if (process.env.GEMINI_API_KEY) {
    return {
      provider: "gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: model || "gemini-2.5-flash",
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: model || "deepseek-chat",
      baseUrl: (process.env.AI_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        "https://api.deepseek.com").replace(/\/+$/, ""),
    };
  }

  return { provider: null, apiKey: "", model: "" };
}

function buildSystemPrompt(): string {
  const today = new Date().toISOString().slice(0, 10);
  return [
    "You extract structured invoice data from natural language or pasted invoice text.",
    `Today's date is ${today}.`,
    "Return ONLY a JSON object with this exact shape:",
    '{"businessName":string|null,"businessEmail":string|null,"businessAddress":string|null,"clientName":string|null,"clientEmail":string|null,"clientAddress":string|null,"currency":string|null,"taxRate":number|null,"discount":number|null,"discountAmount":number|null,"invoiceNumber":string|null,"issueDate":string|null,"dueDate":string|null,"paymentInstructions":string|null,"notes":string|null,"amountPaid":number|null,"items":[{"description":string,"quantity":number,"rate":number}]}',
    "",
    "Rules:",
    "- businessName/businessEmail/businessAddress: info about the sender (the user). Extract if mentioned.",
    "- clientName/clientEmail/clientAddress: info about who is being billed.",
    "- currency: ISO 4217 code. Default to USD if $ is used, EUR if €, GBP if £, KES if KSh/KES is used.",
    "- taxRate: percentage number (e.g. 16 for VAT (16%)).",
    "- discount: percentage number ONLY when the text states a percentage (e.g. '10% discount'). For a flat money discount such as 'Discount: KES 15,000', set discount to null and mention the flat discount in notes.",
    "- invoiceNumber: any invoice number such as INV-2026-00427.",
    "- issueDate/dueDate: YYYY-MM-DD format. Parse dates like '02 Sep 2026' or '2026-09-02'.",
    "- amountPaid: the paid amount in the invoice's currency when the text mentions 'Amount Paid'.",
    "- paymentInstructions: combine payment method + payment terms into a short instruction, e.g. 'Payment due within Net 14 days. Pay via M-Pesa / Bank Transfer.'",
    "- notes: thank-you messages, references, and any text that doesn't fit elsewhere. Include flat monetary discounts here as a line like 'Discount: KES 15,000'.",
    "- items: each line item with description, quantity (default 1), and rate (per-unit price).",
    "- If a total is given for multiple units, divide by quantity to get rate.",
    "- Omit fields not mentioned by using null. Never invent facts.",
    "- If someone says 'I designed a logo for Acme', the clientName is 'Acme' and the item is the design work.",
  ].join("\n");
}

async function callOpenAICompatible(
  apiKey: string,
  model: string,
  baseUrl: string,
  system: string,
  text: string,
  isReasoner = false,
): Promise<string | null> {
  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: text },
    ],
  };
  if (!isReasoner) {
    // Reasoner models don't accept response_format or temperature.
    body.temperature = 0;
    body.response_format = { type: "json_object" };
  } else {
    body.max_tokens = 4000;
  }
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) {
    console.error("[parse:ai] request failed", res.status);
    return null;
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? null;
}

async function callAnthropic(apiKey: string, model: string, system: string, text: string): Promise<string | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      temperature: 0,
      system,
      messages: [{ role: "user", content: text }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return json.content?.[0]?.text ?? null;
}

async function callGemini(apiKey: string, model: string, system: string, text: string): Promise<string | null> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        temperature: 0,
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(30000),
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

function parseJsonContent(content: string): Record<string, unknown> | null {
  let cleaned = content.trim();
  // Strip ```json fences if the model wrapped the output despite json_object.
  const fence = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) cleaned = fence[1];
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end > start) cleaned = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function parseResponse(content: string): ParsedInvoice | null {
  try {
    const parsed = parseJsonContent(content);
    if (!parsed) return null;
    stripNulls(parsed);
    const items = Array.isArray(parsed.items)
      ? (parsed.items as Array<Record<string, unknown>>)
          .filter((i) => i && typeof i.description === "string")
          .map((i) => ({
            description: String(i.description),
            quantity: Number(i.quantity) || 1,
            rate: Number(i.rate) || 0,
          }))
      : undefined;
    return {
      businessName: parsed.businessName as string | undefined,
      businessEmail: parsed.businessEmail as string | undefined,
      businessAddress: parsed.businessAddress as string | undefined,
      clientName: parsed.clientName as string | undefined,
      clientEmail: parsed.clientEmail as string | undefined,
      clientAddress: parsed.clientAddress as string | undefined,
      currency:
        typeof parsed.currency === "string" ? parsed.currency.toUpperCase() : undefined,
      taxRate: typeof parsed.taxRate === "number" ? parsed.taxRate : undefined,
      discount: typeof parsed.discount === "number" ? parsed.discount : undefined,
      discountAmount:
        typeof parsed.discountAmount === "number" ? parsed.discountAmount : undefined,
      invoiceNumber: parsed.invoiceNumber as string | undefined,
      issueDate: parsed.issueDate as string | undefined,
      dueDate: parsed.dueDate as string | undefined,
      paymentInstructions: parsed.paymentInstructions as string | undefined,
      notes: parsed.notes as string | undefined,
      amountPaid: typeof parsed.amountPaid === "number" ? parsed.amountPaid : undefined,
      items: items && items.length > 0 ? items : undefined,
    };
  } catch {
    return null;
  }
}

async function parseWithLlm(text: string): Promise<ParsedInvoice | null> {
  const { provider, apiKey, model, baseUrl } = getProvider();
  if (!provider || !apiKey) return null;

  const system = buildSystemPrompt();

  try {
    let content: string | null = null;

    switch (provider) {
      case "openai": {
        // Prefer the strongest model, fall back down the list automatically.
        const candidates: string[] = [
          ...(model ? [model] : []),
          "deepseek-reasoner",
          "deepseek-chat",
        ].filter((m, i, a) => a.indexOf(m) === i);
        for (const candidate of candidates) {
          content = await callOpenAICompatible(
            apiKey,
            candidate,
            baseUrl || "https://api.deepseek.com",
            system,
            text,
            candidate.includes("reasoner"),
          );
          if (!content) continue;
          const parsed = parseResponse(content);
          if (parsed) return parsed;
        }
        return null;
      }
      case "anthropic":
        content = await callAnthropic(apiKey, model, system, text);
        break;
      case "gemini":
        content = await callGemini(apiKey, model, system, text);
        break;
    }

    if (!content) return null;
    return parseResponse(content);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let text = "";
  try {
    const body = (await req.json()) as { text?: string };
    text = typeof body.text === "string" ? body.text.trim() : "";
  } catch {
    // fall through to empty check
  }
  if (!text) {
    return Response.json({ error: "Describe your invoice in a sentence or two." }, { status: 400 });
  }

  const aiResult = await parseWithLlm(text);
  if (aiResult) {
    return Response.json({ source: "ai", data: aiResult });
  }

  const fallback = parseInvoiceText(text);
  if (!fallback.items?.length && !fallback.clientName && !fallback.clientEmail) {
    return Response.json(
      { error: "Couldn't find any items or amounts in that. Try mentioning quantities and prices." },
      { status: 422 },
    );
  }
  return Response.json({ source: "parser", data: fallback });
}
