// Single source of truth for plan marketing copy (pricing section + billing
// tab). Prices mirror lib/billing.ts PLANS.

export type PlanPitch = {
  id: "free" | "pro" | "teams" | "lifetime";
  name: string;
  price: string;
  priceNote: string;
  tag: string | null;
  cta: string;
  features: string[];
};

export const PLAN_PITCHES: PlanPitch[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceNote: "forever",
    tag: null,
    cta: "Start free",
    features: [
      "Invoice, quote, estimate & receipt generator",
      "Unlimited documents — no monthly caps",
      "All 154 currencies with automatic totals",
      "Tax (VAT/GST/sales), discounts & shipping",
      "AI line-item composer from plain English",
      "16+ industry templates included",
      "Logo upload, themes & custom fields",
      "A4-accurate PDF download & print",
      "One-tap share to any phone app",
      "No sign-up · no watermark · no credit card",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$9",
    priceNote: "/mo or $79/yr — save 27%",
    tag: "Popular",
    cta: "Get Pro",
    features: [
      "Everything in Free",
      "Save invoices to the cloud — access from any device",
      "Client book with history & one-click auto-fill",
      "Email invoices straight to your client",
      "Public share links with open/view notifications",
      "Quotes & estimates that convert to invoices in one click",
      "Recurring invoice terms & payment scheduling",
      "Payment links — let clients pay you online",
      "Track status: draft → sent → paid",
      "Advanced dashboard & invoice management",
      "Priority email support",
    ],
  },
  {
    id: "teams",
    name: "Teams",
    price: "$29",
    priceNote: "/mo or $249/yr — save 29%",
    tag: null,
    cta: "Get Teams",
    features: [
      "Everything in Pro",
      "Up to 3 teams per account",
      "Team members with owner, admin & member roles",
      "Shared client book across your team",
      "Invite teammates by email",
      "Manage clients & invoices together",
      "Team billing on one invoice",
      "Priority email support",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$499",
    priceNote: "one-time — forever",
    tag: "Best value",
    cta: "Get Lifetime",
    features: [
      "Everything in Pro",
      "One-time payment — no recurring charges",
      "All future Pro features included",
      "No subscription to manage or cancel",
      "Lifetime priority support",
    ],
  },
];
