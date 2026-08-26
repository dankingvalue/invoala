import { parseInvoiceText, type ParsedInvoice } from "@/lib/parseInvoice";

function stripNulls(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
      delete obj[key];
    }
  }
}

async function parseWithLlm(text: string): Promise<ParsedInvoice | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  const today = new Date().toISOString().slice(0, 10);
  const system = [
    "You extract structured invoice data from natural language descriptions.",
    `Today's date is ${today}.`,
    "Return ONLY a JSON object with this exact shape:",
    '{"businessName":string|null,"businessEmail":string|null,"businessAddress":string|null,"clientName":string|null,"clientEmail":string|null,"clientAddress":string|null,"currency":string|null,"taxRate":number|null,"issueDate":string|null,"dueDate":string|null,"notes":string|null,"items":[{"description":string,"quantity":number,"rate":number}]}',
    "",
    "Rules:",
    "- businessName/businessEmail/businessAddress: info about the sender (the user). Extract if mentioned.",
    "- clientName/clientEmail/clientAddress: info about who is being billed.",
    "- currency: ISO 4217 code. Default to USD if $ is used, EUR if €, GBP if £.",
    "- taxRate: percentage number (e.g. 8.5 for 8.5% tax).",
    "- dates: YYYY-MM-DD format.",
    "- items: each line item with description, quantity (default 1), and rate (per-unit price).",
    "- If a total is given for multiple units, divide by quantity to get rate.",
    "- notes: payment terms, bank details, thank-you messages, etc.",
    "- Omit fields not mentioned by using null. Never invent facts.",
    "- If someone says 'I designed a logo for Acme', the clientName is 'Acme' and the item is the design work.",
  ].join("\n");

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: text },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as Record<string, unknown>;
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
      issueDate: parsed.issueDate as string | undefined,
      dueDate: parsed.dueDate as string | undefined,
      notes: parsed.notes as string | undefined,
      items: items && items.length > 0 ? items : undefined,
    };
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
