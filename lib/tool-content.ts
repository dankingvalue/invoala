export type ToolKind =
  | "invoice-number-generator"
  | "late-payment-calculator"
  | "invoice-tax-calculator"
  | "hourly-rate-calculator"
  | "profit-margin-calculator"
  | "markup-calculator"
  | "vat-calculator";

export type ToolDef = {
  slug: string;
  kind: ToolKind | "invoice-template-generator";
  name: string;
  h1: string;
  short: string;
  description: string;
  howTo: string[];
  example: string;
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
};

export const TOOLS: ToolDef[] = [
  {
    slug: "invoice-number-generator",
    kind: "invoice-number-generator",
    name: "Invoice Number Generator",
    h1: "Invoice Number Generator",
    short: "Generate a sequence of invoice numbers with any prefix.",
    description:
      "Pick a prefix, a starting number, and how many invoices you need. The generator produces a clean, copyable list — for example INV-001, INV-002, INV-003. Consistent numbering makes invoices easier to reference, file, and reconcile.",
    howTo: [
      "Enter a prefix such as INV or an abbreviation for your business.",
      "Set the starting number (usually 1) and how many numbers you need.",
      "Copy the generated list, or use it to pre-fill a batch of invoices.",
    ],
    example:
      "Prefix INV, starting at 1, count 5 → INV-001, INV-002, INV-003, INV-004, INV-005.",
    faqs: [
      {
        question: "Should invoice numbers restart every year?",
        answer:
          "Some businesses reset to 001 each year (INV-2026-001). Most tax authorities only require numbers to be unique and sequential; a yearly reset is fine as long as the sequence doesn't repeat within the same period.",
      },
      {
        question: "Can I use letters in an invoice number?",
        answer:
          "Yes. Prefixes such as INV- or abbreviations per client (ACME-001) are common and help with filing. Just keep the sequence unique and traceable.",
      },
      {
        question: "Do estimates need separate numbering?",
        answer:
          "It helps. Many businesses use a separate sequence such as EST-001 for quotes and INV-001 for invoices so the two document types never get confused.",
      },
    ],
    related: [
      { label: "How to number invoices", href: "/learn/how-to-number-invoices" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "Estimates vs invoices", href: "/estimates-and-invoices" },
    ],
  },
  {
    slug: "late-payment-calculator",
    kind: "late-payment-calculator",
    name: "Late Payment Calculator",
    h1: "Late Payment Calculator",
    short: "Work out interest and fees for overdue invoices.",
    description:
      "Calculate how much an overdue invoice grows when you apply a late payment interest rate and a one-time late fee. Use the result to send an accurate, professional reminder instead of guessing.",
    howTo: [
      "Enter the original invoice amount.",
      "Add the number of days the invoice is overdue.",
      "Set an annual interest rate (for example 8% per year) and an optional flat late fee.",
      "The calculator shows the interest due, the fee, and the new total.",
    ],
    example:
      "A $1,000 invoice that is 45 days overdue at 8% annual interest with a $20 late fee → interest ≈ $9.86 + $20 fee = $1,029.86 due.",
    faqs: [
      {
        question: "Can I charge interest on late invoices?",
        answer:
          "Only if your contract or payment terms allow it — and local rules vary by country. Mention the rate on your invoice and in your agreement so the client has agreed to it up front.",
      },
      {
        question: "How much interest can I charge?",
        answer:
          "There is no universal answer. Some jurisdictions set a legal default rate (such as a statutory rate linked to the central bank), while others prohibit interest without a written agreement. Check your local rules before applying a rate.",
      },
      {
        question: "Is a flat late fee better than interest?",
        answer:
          "A flat fee is simpler to communicate and enforce. Interest better reflects the real cost of waiting for money. Many businesses use a combination of both, set out in writing.",
      },
    ],
    related: [
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "Invoice reminders", href: "/invoice-reminders" },
      { label: "Invoice payment tracking", href: "/invoice-payment-tracking" },
    ],
  },
  {
    slug: "invoice-tax-calculator",
    kind: "invoice-tax-calculator",
    name: "Invoice Tax Calculator",
    h1: "Invoice Tax Calculator",
    short: "Add tax to an invoice subtotal in seconds.",
    description:
      "Enter your subtotal and tax rate to see the tax amount and final total. Works for VAT, GST, sales tax, or any flat percentage rate — before you create the invoice itself.",
    howTo: [
      "Enter the invoice subtotal (the sum of all line items).",
      "Enter the tax rate as a percentage, such as 20 for 20%.",
      "The calculator shows tax and the final total.",
    ],
    example:
      "Subtotal $850.00 with 20% VAT → tax $170.00, total $1,020.00.",
    faqs: [
      {
        question: "Does Invoala calculate tax automatically?",
        answer:
          "Yes. In the invoice generator you enter a tax rate and the preview updates the totals live, including the tax line on the PDF.",
      },
      {
        question: "Is tax included or added on top?",
        answer:
          "It depends on your jurisdiction and pricing. This calculator adds tax on top of the subtotal. If you sell inclusive of tax, you can use the VAT calculator to work back to the pre-tax amount.",
      },
      {
        question: "Do I have to charge tax?",
        answer:
          "Whether you must charge tax depends on where your business is registered, your revenue, and local rules. Consult a tax professional or your local tax authority to confirm your obligations.",
      },
    ],
    related: [
      { label: "VAT calculator", href: "/tools/vat-calculator" },
      { label: "How to calculate an invoice total", href: "/learn/how-to-calculate-an-invoice-total" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  },
  {
    slug: "hourly-rate-calculator",
    kind: "hourly-rate-calculator",
    name: "Hourly Rate Calculator",
    h1: "Hourly Rate Calculator",
    short: "Turn your income target into a billable hourly rate.",
    description:
      "Work backward from the annual income you want, subtract your business costs, and divide by the hours you can realistically bill. The result is the hourly rate you should put on invoices.",
    howTo: [
      "Enter your target annual income (take-home).",
      "Add annual business costs such as software, insurance, and equipment.",
      "Enter the hours you expect to bill per year — be realistic, not the hours you work.",
      "The calculator returns your required hourly rate.",
    ],
    example:
      "Target $80,000 take-home, $12,000 costs, 1,200 billable hours → $92,000 ÷ 1,200 = $76.67 per hour.",
    faqs: [
      {
        question: "How many billable hours should I assume?",
        answer:
          "For a full-time freelancer, 1,000–1,400 billable hours per year is a common working assumption. The rest of the time goes to admin, marketing, and unpaid work.",
      },
      {
        question: "Should I include costs in my rate?",
        answer:
          "Yes. If you ignore software, insurance, and downtime, your rate may look profitable but leave you short. Add real costs before dividing.",
      },
      {
        question: "What if my rate seems too high?",
        answer:
          "Rate anxiety is common. Compare against a few public rate surveys for your market and seniority, and remember that the number you just calculated is the minimum — not a ceiling.",
      },
    ],
    related: [
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
      { label: "Invoicing for freelancers", href: "/invoicing-for-freelancers" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  },
  {
    slug: "profit-margin-calculator",
    kind: "profit-margin-calculator",
    name: "Profit Margin Calculator",
    h1: "Profit Margin Calculator",
    short: "See how much of each sale is actual profit.",
    description:
      "Enter your selling price and the cost to deliver the product or service. The calculator returns your profit in money and as a margin percentage — the share of every sale you keep.",
    howTo: [
      "Enter the price you charge the client.",
      "Enter everything it costs you to deliver (materials, time, fees).",
      "The calculator shows profit and margin percentage.",
    ],
    example:
      "Price $500, cost $350 → profit $150, margin 30%.",
    faqs: [
      {
        question: "What's the difference between margin and markup?",
        answer:
          "Margin is profit as a percentage of the selling price. Markup is profit as a percentage of cost. A 30% margin is not the same as a 30% markup — see the markup calculator.",
      },
      {
        question: "What is a good profit margin?",
        answer:
          "It varies wildly by industry: service businesses often aim for 30–50% while retail may survive on far less. Benchmark against your own sector rather than a universal number.",
      },
      {
        question: "Should taxes come out of my margin?",
        answer:
          "Margin usually measures operating profit before income tax. Keep a separate view of what you actually keep after tax to avoid surprises.",
      },
    ],
    related: [
      { label: "Markup calculator", href: "/tools/markup-calculator" },
      { label: "Hourly rate calculator", href: "/tools/hourly-rate-calculator" },
      { label: "Invoicing for small businesses", href: "/invoicing-for-small-businesses" },
    ],
  },
  {
    slug: "markup-calculator",
    kind: "markup-calculator",
    name: "Markup Calculator",
    h1: "Markup Calculator",
    short: "Price your products and services from cost.",
    description:
      "Start from your cost and add a markup percentage to find the right selling price — and see the resulting margin. Useful for quoting fixed-price jobs and product sales.",
    howTo: [
      "Enter your cost for the item or job.",
      "Enter the markup percentage you want to add.",
      "The calculator shows the selling price, the profit, and the margin.",
    ],
    example:
      "Cost $80, 60% markup → price $128, profit $48, margin 37.5%.",
    faqs: [
      {
        question: "How do I choose a markup percentage?",
        answer:
          "Start from the margin you need to cover overheads and profit, then convert it to markup. A 40% margin equals roughly a 66.7% markup on cost.",
      },
      {
        question: "Why does my margin look lower than my markup?",
        answer:
          "Because they measure different things. Markup is relative to cost; margin is relative to price. The higher the percentage, the larger the gap between the two.",
      },
      {
        question: "Should I quote with markup or hourly rates?",
        answer:
          "Both are legitimate. Fixed-price projects benefit from markup on estimated cost; ongoing or variable work usually suits an hourly rate. Many businesses mix the two.",
      },
    ],
    related: [
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
      { label: "Hourly rate calculator", href: "/tools/hourly-rate-calculator" },
      { label: "Invoicing for contractors", href: "/invoicing-for-contractors" },
    ],
  },
  {
    slug: "vat-calculator",
    kind: "vat-calculator",
    name: "VAT Calculator",
    h1: "VAT Calculator",
    short: "Add or remove VAT from any amount.",
    description:
      "Work with VAT in both directions: add VAT to a net amount, or strip VAT out of a gross amount to find the net figure and the tax included.",
    howTo: [
      "Choose whether you are adding VAT to a net price or removing it from a gross price.",
      "Enter the amount and the VAT rate.",
      "The calculator returns the tax and the other side of the equation.",
    ],
    example:
      "Net $200 at 20% VAT → VAT $40, gross $240. Conversely, gross $240 → net $200, VAT $40.",
    faqs: [
      {
        question: "How do I remove VAT from a gross amount?",
        answer:
          "Divide the gross amount by (1 + rate). At 20% that means dividing by 1.2. The difference between gross and net is the VAT included.",
      },
      {
        question: "Do I have to register for VAT?",
        answer:
          "Registration thresholds and rules differ by country. If you're below the local threshold you may not charge VAT; if you're above it, you usually must. Check with your local tax authority.",
      },
      {
        question: "Is this calculator financial advice?",
        answer:
          "No. It performs basic arithmetic only. Your VAT obligations depend on your jurisdiction and circumstances — confirm rates and rules with your local authority or a tax professional.",
      },
    ],
    related: [
      { label: "Invoice tax calculator", href: "/tools/invoice-tax-calculator" },
      { label: "How to calculate VAT on an invoice", href: "/learn/how-to-calculate-vat-on-an-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  },
  {
    slug: "invoice-template-generator",
    kind: "invoice-template-generator",
    name: "Invoice Template Generator",
    h1: "Invoice Template Generator",
    short: "Start from a real, editable invoice template.",
    description:
      "This tool is the full Invoala invoice generator: a working template you can fill in, preview, and download as a PDF right now. Choose an industry template from the library, or start blank and build your own layout.",
    howTo: [
      "Fill in your business details, client details, and line items.",
      "Watch the live preview update as you type.",
      "Download the finished PDF or save it to your account.",
    ],
    example:
      "A freelancer opens the generator, picks a freelance template, adds 3 line items, and downloads a print-ready PDF in under two minutes.",
    faqs: [
      {
        question: "Is the template generator really free?",
        answer:
          "Yes — create, preview, and download unlimited invoices with no watermark and no account required.",
      },
      {
        question: "Can I edit the template after downloading?",
        answer:
          "Every download is a fresh PDF generated from your current data, so simply edit the form and download again. The preview always matches the PDF.",
      },
      {
        question: "Where do I find industry-specific templates?",
        answer:
          "Visit the templates library for freelance, consulting, contractor, photography, and more — each links back to this generator pre-filled with example items.",
      },
    ],
    related: [
      { label: "Templates library", href: "/templates" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "Free invoice template", href: "/invoice-template" },
    ],
  },
];

export const TOOLS_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export function isToolSlug(value: string): value is string {
  return value in TOOLS_BY_SLUG;
}
