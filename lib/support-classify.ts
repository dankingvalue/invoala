import type { EscalationCategory } from "@/lib/support-escalations";
import type { Priority } from "@/lib/sla";

// Lightweight heuristic classification applied when a conversation escalates
// to a human — keyword matching, not a model call, so it's instant and free.
// Purely a starting point for the agent to confirm/correct, never a silent
// final decision (spec section 32: AI must not make unauthorized decisions).

const URGENT_PATTERNS = [
  /\b(urgent|asap|immediately|emergency|critical)\b/i,
  /\b(lost|stole|stolen|fraud|scam|hack(ed)?)\b/i,
  /\b(can'?t (log ?in|access|pay)|payment (failed|declined)|charged twice|double charge)\b/i,
  /\b(down|outage|not working|broken|crash(ed|ing)?)\b/i,
];

const HIGH_PATTERNS = [/\b(bug|error|issue|problem|refund|billing)\b/i];

export function detectPriority(message: string): Priority {
  if (URGENT_PATTERNS.some((p) => p.test(message))) return "p1";
  if (HIGH_PATTERNS.some((p) => p.test(message))) return "p2";
  return "p3";
}

const CATEGORY_PATTERNS: Array<{ category: EscalationCategory; subcategory: string; pattern: RegExp }> = [
  { category: "payment", subcategory: "payment_failed", pattern: /payment (failed|declined)|card (declined|failed)|charged twice|double charge/i },
  { category: "billing", subcategory: "billing_question", pattern: /\b(bill(ing)?|invoice (charge|question)|subscription cost)\b/i },
  { category: "account", subcategory: "login", pattern: /\b(log ?in|password|can'?t access|locked out|2fa|verification code)\b/i },
  { category: "technical_bug", subcategory: "pdf_generation", pattern: /\bpdf\b.*(fail|broken|not (working|generat))/i },
  { category: "technical_bug", subcategory: "general", pattern: /\b(bug|error|broken|crash(ed|ing)?|not working)\b/i },
  { category: "refund", subcategory: "refund_request", pattern: /\brefund\b/i },
  { category: "security", subcategory: "account_security", pattern: /\b(hack(ed)?|fraud|unauthorized|suspicious)\b/i },
  { category: "abuse", subcategory: "report", pattern: /\b(spam|abuse|harass)\b/i },
  { category: "feature_request", subcategory: "", pattern: /\b(feature request|please add|would be (great|nice) if|wish it (could|had))\b/i },
];

export function detectCategory(message: string): { category: EscalationCategory; subcategory: string } | null {
  for (const entry of CATEGORY_PATTERNS) {
    if (entry.pattern.test(message)) return { category: entry.category, subcategory: entry.subcategory };
  }
  return null;
}
