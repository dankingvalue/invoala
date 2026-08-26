export const FLAG_KEYS = [
  "aiComposer",
  "emailCapture",
  "trustpilotStrip",
  "printButton",
  "logoUpload",
  "maintenanceMode",
  "signupPrompt",
  "proTeaser",
  "quoteMode",
  "recurringTerms",
  "savedClients",
  "multiBusinessProfiles",
  "onlinePayments",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];

export type FlagDef = {
  key: FlagKey;
  label: string;
  description: string;
  defaultValue: boolean;
  group: "site" | "pro";
  status?: "ready" | "planned";
};

export const FLAG_DEFS: FlagDef[] = [
  {
    key: "aiComposer",
    label: "AI invoice drafting",
    description: '"Describe it, we\'ll draft it" composer inside the generator',
    defaultValue: true,
    group: "site",
  },
  {
    key: "emailCapture",
    label: "Email capture section",
    description: 'The "New features, first" signup block near the footer',
    defaultValue: true,
    group: "site",
  },
  {
    key: "trustpilotStrip",
    label: "Trustpilot strip",
    description: "Social proof strip below the hero",
    defaultValue: true,
    group: "site",
  },
  {
    key: "printButton",
    label: "Print button",
    description: 'Direct-print option next to "Download PDF"',
    defaultValue: true,
    group: "site",
  },
  {
    key: "logoUpload",
    label: "Logo upload",
    description: "Allow users to attach a logo to their invoice",
    defaultValue: true,
    group: "site",
  },
  {
    key: "signupPrompt",
    label: "Growth prompt",
    description:
      'Timed invite to join the notify list. Skips engaged users, repeat visitors, and members.',
    defaultValue: true,
    group: "site",
  },
  {
    key: "maintenanceMode",
    label: "Maintenance mode",
    description:
      "Takes the entire public site down to a friendly notice. Admin stays available.",
    defaultValue: false,
    group: "site",
  },
  {
    key: "proTeaser",
    label: "Pro pricing section",
    description:
      "Dark pricing section on the homepage — Free vs Pro ($9/mo · $79/yr) with waitlist CTA",
    defaultValue: false,
    group: "pro",
    status: "ready",
  },
  {
    key: "quoteMode",
    label: "Quotes & estimates",
    description:
      "Document switcher in the generator: flip any document between Invoice and Quote",
    defaultValue: false,
    group: "pro",
    status: "ready",
  },
  {
    key: "recurringTerms",
    label: "Recurring billing terms",
    description:
      "Repeat-frequency selector (weekly → yearly) stamped onto invoices and previews",
    defaultValue: false,
    group: "pro",
    status: "ready",
  },
  {
    key: "savedClients",
    label: "Client book",
    description:
      "Saved client profiles + invoice history dashboard. Reserved slot — flip when the update ships.",
    defaultValue: false,
    group: "pro",
    status: "planned",
  },
  {
    key: "multiBusinessProfiles",
    label: "Multi-business profiles",
    description:
      "Multiple sender identities with a switcher. Reserved slot — flip when the update ships.",
    defaultValue: false,
    group: "pro",
    status: "planned",
  },
  {
    key: "onlinePayments",
    label: "Pay-online buttons",
    description:
      "Stripe-powered payment links on invoices. Reserved slot — flip once Stripe keys are configured.",
    defaultValue: false,
    group: "pro",
    status: "planned",
  },
];

export type FlagsState = {
  flags: Record<FlagKey, boolean>;
  announcement: string;
};

export function defaultFlags(): FlagsState {
  const flags = {} as Record<FlagKey, boolean>;
  for (const def of FLAG_DEFS) flags[def.key] = def.defaultValue;
  return { flags, announcement: "" };
}
