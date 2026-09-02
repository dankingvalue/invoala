export type ParsedItem = {
  description: string;
  quantity: number;
  rate: number;
};

export type ParsedInvoice = {
  businessName?: string;
  businessEmail?: string;
  businessAddress?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  currency?: string;
  taxRate?: number;
  discount?: number;
  invoiceNumber?: string;
  issueDate?: string;
  dueDate?: string;
  paymentInstructions?: string;
  amountPaid?: number;
  notes?: string;
  items?: ParsedItem[];
};

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

const TAX_PATTERNS = [
  /(\d+(?:\.\d+)?)\s*%\s*(?:sales\s*)?(?:tax|vat|gst|hst)/i,
  /(?:tax|vat|gst|hst)\s*(?:rate\s*)?(?:of|at|=|:)?\s*(\d+(?:\.\d+)?)\s*%/i,
];

const DUE_FRAGMENTS = [
  /\b(?:payment\s+)?due\s+(?:by\s+)?(?:in\s+)?(\d{1,3})\s*(?:calendar\s*)?days?\b/i,
  /\bnet\s+(\d{1,3})\b/i,
  /\bdue\s+(?:on\s+|by\s+)?(\d{4}-\d{2}-\d{2})\b/i,
];

const ISSUE_ISO_RE = /\bissued?\s+(?:on\s+)?(\d{4}-\d{2}-\d{2})\b/i;

const WORK_PREFIX_RE =
  /^(?:logo|design|designed|website|web|app|mobile|consult(?:ing|ation)?|consulted|workshop(?:s|ping)?|freelance|freelanced|project|develop(?:ment|ed|ing)?|wrote|writing|written|copy(?:writing)?|content|video|photo(?:graphy)?|marketing|seo|brand(?:ing|ed)?|illustrat(?:ion|ed|ing)|translat(?:ion|ed|ing)|maintenance|support|repair(?:ed|ing)?|install(?:ed|ing|ation)?|clean(?:ed|ing)|tutor(?:ing|ed)?|lesson|session|hour|day|week|month)s?\b/i;

const LOWER_OK = new Set([
  "and", "of", "the", "for", "de", "di", "van", "von",
  "inc", "llc", "ltd", "co", "corp", "plc", "gmbh", "sa", "bv", "ab", "oy", "pty",
  "each", "total", "subtotal", "discount",
]);

const CURRENCY_CHECKS: Array<[RegExp, string]> = [
  [/A\$/, "AUD"],
  [/C\$/, "CAD"],
  [/NZ\$/, "NZD"],
  [/\bAUD\b/i, "AUD"],
  [/\bCAD\b/i, "CAD"],
  [/\bNZD\b/i, "NZD"],
  [/€/, "EUR"],
  [/\bEUR\b/i, "EUR"],
  [/£/, "GBP"],
  [/\bGBP\b/i, "GBP"],
  [/₹/, "INR"],
  [/\bINR\b/i, "INR"],
  [/¥/, "JPY"],
  [/\bJPY\b/i, "JPY"],
  [/\$/, "USD"],
  [/\bUSD\b/i, "USD"],
];

function detectCurrency(text: string): string | undefined {
  for (const [pattern, code] of CURRENCY_CHECKS) {
    if (pattern.test(text)) return code;
  }
  return undefined;
}

function toNumber(raw: string): number {
  return Number(raw.replace(/[,\s]/g, "")) || 0;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function cleanText(s: string): string {
  let out = s
    .replace(/^[\s\-–—*•·]+/, "")
    .replace(/["'`]/g, "")
    .replace(/[,;:.](\s*[,;:.])+/g, ",");
  out = out.trim();
  out = out.replace(/^(?:and|plus|also|then|with|including|of|the|a|an|to|for)\s+/i, "").trim();
  out = out.replace(/^[,\-–—*•·\s]+/, "");
  out = out.replace(/[.,;:\s]+$/, "");
  return out.replace(/\s{2,}/g, " ").trim();
}

function removeFragment(s: string, m: RegExpMatchArray): string {
  const i = m.index ?? 0;
  return s.slice(0, i) + " " + s.slice(i + m[0].length);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function looksLikeOrgName(s: string): boolean {
  if (!s || /\d/.test(s)) return false;
  if (WORK_PREFIX_RE.test(s)) return false;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 6) return false;
  return words.every(
    (w, i) => /^[A-Z0-9(]/.test(w) || (i > 0 && LOWER_OK.has(w.toLowerCase())),
  );
}

export function parseInvoiceText(text: string): ParsedInvoice {
  const result: ParsedInvoice = {};
  const items: ParsedItem[] = [];

  const emailMatch = text.match(EMAIL_RE);
  if (emailMatch) result.clientEmail = emailMatch[0].toLowerCase();

  const currency = detectCurrency(text);
  if (currency) result.currency = currency;

  // Extract metadata first
  let cleanText2 = text;

  // Extract tax rate
  for (const pattern of TAX_PATTERNS) {
    const m = cleanText2.match(pattern);
    if (m && result.taxRate === undefined) {
      result.taxRate = toNumber(m[1]);
      cleanText2 = removeFragment(cleanText2, m);
      break;
    }
  }

  // Extract due date
  for (const pattern of DUE_FRAGMENTS) {
    const m = cleanText2.match(pattern);
    if (m && result.dueDate === undefined) {
      result.dueDate = /^\d{4}/.test(m[1]) ? m[1] : addDays(Number(m[1]));
      cleanText2 = removeFragment(cleanText2, m);
      break;
    }
  }

  // Extract issue date
  const issueM = cleanText2.match(ISSUE_ISO_RE);
  if (issueM && result.issueDate === undefined) {
    result.issueDate = issueM[1];
    cleanText2 = removeFragment(cleanText2, issueM);
  }

  // Extract client name from "for Client" or "invoice for Client" patterns
  const clientMatch = cleanText2.match(/\b(?:invoice\s+)?(?:for|to|bill(?:ed)?\s*to)\s+([A-Z][\w\s.&]{1,40})\b/i);
  if (clientMatch && !result.clientName) {
    const candidate = cleanText(captureGroup(cleanText2, clientMatch));
    if (looksLikeOrgName(candidate)) {
      result.clientName = candidate;
    }
  }

  // Now extract items by scanning for $amount patterns
  // Find all dollar amounts in the text
  const moneyPattern = /(?:[$€£₹¥])\s*(\d[\d,]*(?:\.\d+)?)/g;
  let moneyMatch;
  const moneyPositions: Array<{ amount: number; index: number; end: number }> = [];

  while ((moneyMatch = moneyPattern.exec(text)) !== null) {
    const amount = toNumber(moneyMatch[1]);
    if (amount > 0) {
      moneyPositions.push({
        amount,
        index: moneyMatch.index,
        end: moneyMatch.index + moneyMatch[0].length,
      });
    }
  }

  // For each dollar amount, extract the description before it
  for (const pos of moneyPositions) {
    // Look back from the $ to find the description
    const before = text.slice(0, pos.index);
    // Find the last delimiter or start
    const lastDelim = Math.max(
      before.lastIndexOf(","),
      before.lastIndexOf(";"),
      before.lastIndexOf("—"),
      before.lastIndexOf(" + "),
      before.lastIndexOf(" plus "),
      0,
    );
    let descText = before.slice(lastDelim).trim();
    // Clean up the description
    descText = descText
      .replace(/^[\s,;—+]+/, "")
      .replace(/\s+/g, " ")
      .trim();

    // Skip if description is empty or just numbers
    if (!descText || /^\d+[\d,.\s]*$/.test(descText)) continue;

    // Extract quantity if present (e.g., "3 logos", "12 hours")
    let quantity = 1;
    const qtyMatch = descText.match(/\b(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|days?|weeks?|months?|logos?|items?|units?|pieces?|pcs?|pages?|posts?|articles?|sessions?|licenses?)\b/i);
    if (qtyMatch) {
      quantity = toNumber(qtyMatch[1]);
    }

    // Clean description
    const description = descText
      .replace(/\b(?:at|@|each|per\s+(?:hour|unit|item|piece))\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    // Skip if description is just noise words
    if (/^(?:each|subtotal|tax|due|net|for|to|invoice|was|and|also|the|their|that|this|with|but|or|so|yet|nor)$/i.test(description)) continue;

    // Check if this is a "at $X/hr" or "@ $X" rate pattern (not a total)
    // Look back up to 50 chars before the $ amount for "at @" or just "at"/"@"
    const lookback = text.slice(Math.max(0, pos.index - 80), pos.index);
    const isAtRate = /\b(?:at|@)\s*(?:[$€£₹¥]?\s*\d)/i.test(lookback) || /\b(?:at|@)\s*$/i.test(lookback.trim());

    items.push({
      description: description.charAt(0).toUpperCase() + description.slice(1),
      quantity: Math.max(quantity, 0.25),
      rate: Math.max(round2(isAtRate ? pos.amount : pos.amount / (quantity > 1 ? quantity : 1)), 0),
    });
  }

  // Also try to find "N at $X/hr" or "@ $X/hr" patterns
  const atPattern = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|days?|weeks?|months?)\s+(?:at|@)\s*(?:[$€£₹¥])\s*(\d[\d,]*(?:\.\d+)?)/gi;
  let atMatch;
  while ((atMatch = atPattern.exec(text)) !== null) {
    // Check if we already captured this as a dollar amount item
    const alreadyCaptured = items.some(item =>
      Math.abs(item.rate - toNumber(atMatch![2])) < 0.01 &&
      item.quantity === toNumber(atMatch![1])
    );
    if (alreadyCaptured) continue;

    const before = text.slice(0, atMatch.index);
    const desc = before.slice(Math.max(before.lastIndexOf(","), before.lastIndexOf(";"), 0)).trim()
      .replace(/^[\s,;]+/, "")
      .replace(/\s+/g, " ")
      .trim();

    if (desc && !/^(?:each|total|subtotal|tax|due|net)$/i.test(desc)) {
      items.push({
        description: desc.charAt(0).toUpperCase() + desc.slice(1),
        quantity: toNumber(atMatch[1]),
        rate: round2(toNumber(atMatch[2])),
      });
    }
  }

  if (items.length > 0) result.items = items;
  return result;
}

function captureGroup(text: string, match: RegExpMatchArray): string {
  return match[1] || match[0];
}
