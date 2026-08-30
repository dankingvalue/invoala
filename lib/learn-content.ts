export type ArticleDef = {
  slug: string;
  category: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: { heading: string; body: string }[];
  example?: string;
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
  published: string;
  updated: string;
};

export const LEARN_CATEGORIES = [
  "Invoicing",
  "Payments",
  "Freelancing",
  "Accounting",
  "Taxes",
  "Cash Flow",
] as const;

export const ARTICLES: ArticleDef[] = [
  {
    slug: "invoice-vs-receipt",
    category: "Invoicing",
    title: "Invoice vs Receipt: What's the Difference?",
    metaTitle: "Invoice vs Receipt — What's the Difference? | Invoala",
    description:
      "Invoices request payment; receipts confirm it. Learn when to send each, what they must include, and why the difference matters for your books.",
    intro:
      "People use 'invoice' and 'receipt' interchangeably, but they're two different documents with different jobs. An invoice asks for money; a receipt confirms money received. Sending the right one at the right time keeps your records — and your clients — straight.",
    sections: [
      {
        heading: "An invoice asks for payment",
        body: "You send an invoice before or after delivering work, to tell the client what they owe and when. It lists your details, the client's details, line items, the total, and payment terms. An unpaid invoice is money you're waiting on.",
      },
      {
        heading: "A receipt confirms payment",
        body: "You issue a receipt when the client pays — it records that the money arrived, when, and in what amount. Clients and their accountants keep receipts as proof of purchase for their own records.",
      },
      {
        heading: "Key differences",
        body: "Timing is the core difference: invoice first, receipt after payment. An invoice is a demand (or request) for payment; a receipt is evidence that payment happened. A receipt usually references the invoice it settles, and it doesn't list payment terms because there's nothing left to pay.",
      },
      {
        heading: "What this means for your workflow",
        body: "Send the invoice, track it as sent, then mark it paid when the money lands — that record is your receipt trail. For retail-style sales, you can also simply issue a receipt-style document at point of sale. The key is never to present an invoice as a receipt or vice versa.",
      },
    ],
    example:
      "You finish a $500 design job: send Invoice #004 on Monday with 'due within 14 days'. The client pays by bank transfer on Friday. You mark the invoice paid — the paid invoice serves as the receipt record for both of you.",
    faqs: [
      {
        question: "Can an invoice be a receipt?",
        answer:
          "For many small transactions, a paid invoice (marked 'paid') serves as both. Strictly, an invoice requests payment and a receipt confirms it — one document can cover both if it's clearly marked paid.",
      },
      {
        question: "Do I need to issue a separate receipt?",
        answer:
          "Only if your client asks for one or your local rules require it. Most businesses record the paid invoice and are done.",
      },
      {
        question: "Which comes first — invoice or receipt?",
        answer:
          "The invoice. Payment happens after the invoice is sent, and the receipt documents that payment.",
      },
    ],
    related: [
      { label: "Estimates vs invoices", href: "/estimates-and-invoices" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "How to track unpaid invoices", href: "/learn/how-to-track-unpaid-invoices" },
    ],
    published: "2026-08-20",
    updated: "2026-08-27",
  },
  {
    slug: "invoice-vs-estimate",
    category: "Invoicing",
    title: "Invoice vs Estimate: When to Send Each",
    metaTitle: "Invoice vs Estimate — When to Send Each | Invoala",
    description:
      "An estimate prices the work; an invoice bills for it. Learn when to send each and how to convert one into the other smoothly.",
    intro:
      "An estimate answers 'how much will this cost?' before the work starts. An invoice asks for payment after the work is done. Mixing them up — or skipping one — creates confusion and delays payment.",
    sections: [
      {
        heading: "What an estimate is for",
        body: "An estimate (also called a quote or proposal) sets expectations before you start: scope, likely cost, and timeline. It's not a bill. Clients use it to approve the job; you use it to lock in scope and avoid surprises later.",
      },
      {
        heading: "What an invoice is for",
        body: "The invoice is the formal request for payment after delivery. It itemizes what was done, adds tax if applicable, states the total, and sets a due date. It's the document that actually gets you paid.",
      },
      {
        heading: "The estimate-to-invoice flow",
        body: "The professional pattern is: send an estimate, get written approval, do the work, then send an invoice that mirrors the approved estimate. When the numbers match what the client already approved, payment disputes largely disappear.",
      },
      {
        heading: "When to skip the estimate",
        body: "For small, routine jobs with a fixed price, an estimate is often overkill — invoice directly. For anything with variable scope or meaningful cost, always estimate first.",
      },
    ],
    example:
      "A client asks for a website. You send an estimate: $2,400 for a five-page site. They approve in writing. You build it, then send Invoice #012 for $2,400, referencing the approved estimate. They pay because the numbers are familiar.",
    faqs: [
      {
        question: "Is an estimate legally binding?",
        answer:
          "Generally no — it's a projection, not a contract. It becomes binding only if the client's written approval creates an agreement under your local law. The invoice records the amount due under that agreement.",
      },
      {
        question: "Can I send an invoice without an estimate?",
        answer:
          "Yes, for fixed-price or recurring work. For large or variable projects, the estimate first is strongly recommended.",
      },
      {
        question: "Should estimates expire?",
        answer:
          "It's good practice to state a validity period (e.g., 'valid for 30 days') so your price can't be accepted months later after costs changed.",
      },
    ],
    related: [
      { label: "Estimates and invoices", href: "/estimates-and-invoices" },
      { label: "What is a proforma invoice?", href: "/learn/what-is-a-proforma-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-21",
    updated: "2026-08-27",
  },
  {
    slug: "what-is-a-proforma-invoice",
    category: "Invoicing",
    title: "What Is a Proforma Invoice?",
    metaTitle: "What Is a Proforma Invoice? Definition & Use Cases | Invoala",
    description:
      "A proforma invoice is a preliminary bill sent before final delivery. Learn when businesses use it, what it includes, and how it differs from a real invoice.",
    intro:
      "A proforma invoice looks like an invoice but isn't one. It's a 'before' document — a quote dressed in invoice format — used to preview what the final bill will look like.",
    sections: [
      {
        heading: "Definition",
        body: "A proforma invoice lists goods or services, quantities, and prices in invoice format, but it's sent before the sale is final and doesn't record a debt. No payment is due on it; it's a promise of what the real invoice will show.",
      },
      {
        heading: "When businesses use them",
        body: "Three common cases: international trade (customs authorities ask for a proforma to value goods before shipment), approving a purchase order internally (the buyer gets sign-off against a concrete document), and services like events or rentals where the client needs a documented quote in invoice format.",
      },
      {
        heading: "How it differs from a real invoice",
        body: "A real invoice requests payment, creates a receivable, and goes into your books. A proforma is informational: no payment terms that bind, no revenue recorded, no legal obligation. Number them separately from your real invoice sequence to keep your books clean.",
      },
      {
        heading: "Turning a proforma into an invoice",
        body: "When the sale finalizes, issue the real invoice with the same details. If you need a proforma, produce it separately and clearly labeled — never send a client a real invoice number on a document that isn't one.",
      },
    ],
    example:
      "An exporter ships goods worth $4,000 to an overseas buyer. Customs needs a document describing the shipment before import — the exporter sends a proforma invoice with the value and description. Once goods arrive, the real invoice is issued for payment.",
    faqs: [
      {
        question: "Do I need to pay a proforma invoice?",
        answer:
          "No. It's a preview document. Some businesses take deposits against it, but the document itself doesn't create a payment obligation.",
      },
      {
        question: "Is a proforma invoice legally binding?",
        answer:
          "Generally no — it's a quotation in invoice format. The real invoice (or contract) creates the obligation.",
      },
      {
        question: "What's the difference between a proforma and an estimate?",
        answer:
          "Same idea, different format. An estimate is usually a free-form quote; a proforma uses the invoice layout. Use whichever your client or the situation calls for.",
      },
    ],
    related: [
      { label: "Estimates vs invoices", href: "/estimates-and-invoices" },
      { label: "Invoice vs estimate", href: "/learn/invoice-vs-estimate" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-22",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-send-an-invoice",
    category: "Payments",
    title: "How to Send an Invoice (and Get It Paid)",
    metaTitle: "How to Send an Invoice — Steps & Best Practices | Invoala",
    description:
      "How to send an invoice the right way: what to attach, what to write, when to send it, and what to do after. Practical steps for freelancers and small businesses.",
    intro:
      "Sending an invoice is a small moment with big consequences. Sent well, it gets paid fast and builds trust. Sent carelessly, it gets lost, questioned, or paid late. Here's the process that works.",
    sections: [
      {
        heading: "Send it as a PDF, not a link",
        body: "A PDF opens on any device and can't be altered. It's what corporate accounts-payable teams expect. Keep the filename clear — something like 'INV-004-Acme-Design.pdf' — so it survives the inbox and the filing system.",
      },
      {
        heading: "Write a short, clear email",
        body: "One or two sentences: what's attached, the amount, when it's due, and how to pay. No walls of text. The invoice does the talking; the email just directs attention to it.",
      },
      {
        heading: "Send it the moment the work ends",
        body: "Delay is the enemy of payment. Send the invoice on completion day, or on the agreed billing date for retainers. Every week you wait pushes the payment a week later.",
      },
      {
        heading: "Follow up before it's due",
        body: "A friendly pre-due note ('reminder that Invoice #004 is due Friday') prevents lateness instead of reacting to it. Then follow up the day after the due date if needed — polite persistence gets paid.",
      },
    ],
    example:
      "Subject: Invoice #004 — Acme Website Design. 'Hi Dana, attached is Invoice #004 for $2,400, due by August 30. You can pay by bank transfer (details on the invoice) or reply and I'll send a payment link. Thanks!' — sent the day the site went live.",
    faqs: [
      {
        question: "Should I email or print invoices?",
        answer:
          "Email is standard for most businesses. Print only when the client requires a physical invoice for their process.",
      },
      {
        question: "What do I do if the client doesn't respond?",
        answer:
          "Follow up after the due date, then escalate gradually. See the follow-up guide for exact templates.",
      },
      {
        question: "Can I send invoices from Invoala?",
        answer:
          "Yes — download the PDF and email it directly, or use the email option from your saved invoice.",
      },
    ],
    related: [
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "Invoice reminders", href: "/invoice-reminders" },
      { label: "Online invoicing", href: "/online-invoicing" },
    ],
    published: "2026-08-20",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-follow-up-on-an-unpaid-invoice",
    category: "Payments",
    title: "How to Follow Up on an Unpaid Invoice",
    metaTitle: "How to Follow Up on an Unpaid Invoice — Templates Included | Invoala",
    description:
      "Chasing an unpaid invoice doesn't have to be awkward. Use these friendly-to-firm follow-up templates and a timeline that actually gets you paid.",
    intro:
      "Most unpaid invoices aren't refusals — they're oversights. An invoice buried in an inbox gets paid the moment it resurfaces. A structured follow-up sequence resurfacing it is the highest-leverage thing you can do for your cash flow.",
    sections: [
      {
        heading: "The timeline that works",
        body: "Remind politely before the due date. Follow up on the due date. Send a firmer note 3–7 days after. Issue a final notice at 14–30 days. Escalate tone gradually — most invoices are collected by the second or third touch.",
      },
      {
        heading: "Always restate the facts",
        body: "Every message should include the invoice number, the amount, and the due date. Make it effortless for the client to act: one click, one reply, one payment instruction. Never make them search for the invoice.",
      },
      {
        heading: "Friendly first, firm later",
        body: "The first follow-up assumes goodwill ('just making sure this didn't get missed'). Later ones state consequences you set out in your terms — late fees, paused services. Match your words to your actual policy.",
      },
      {
        heading: "Offer an easy way forward",
        body: "If the client says they can't pay in full, a short payment plan beats months of silence. A partial payment or extended terms keeps the relationship and recovers most of the money.",
      },
    ],
    example:
      "Day 0 (due date): 'Quick reminder that Invoice #004 for $2,400 is due today.' Day 5: 'Checking in on Invoice #004 — can you confirm when payment will go out?' Day 16: 'Invoice #004 is now 15 days overdue. Payment was due August 30. Please arrange payment by September 10 or reply to discuss.'",
    faqs: [
      {
        question: "Is following up unprofessional?",
        answer:
          "The opposite. Prompt, polite follow-up is professional — silence is what erodes your cash flow and signals the client can ignore your terms.",
      },
      {
        question: "How many times should I ask?",
        answer:
          "A typical sequence is 3–4 touches: pre-due, due date, firm, final. After a final notice, escalate per your terms (late fees, collections, pausing work).",
      },
      {
        question: "Can I charge late fees?",
        answer:
          "Only if your written terms allow it and local law permits. Mention the policy on the invoice and in the agreement so it's never a surprise.",
      },
    ],
    related: [
      { label: "Invoice reminders", href: "/invoice-reminders" },
      { label: "Late payment calculator", href: "/tools/late-payment-calculator" },
      { label: "How to reduce late invoice payments", href: "/learn/how-to-reduce-late-invoice-payments" },
    ],
    published: "2026-08-20",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-number-invoices",
    category: "Accounting",
    title: "How to Number Invoices (and Why It Matters)",
    metaTitle: "How to Number Invoices — Simple Systems That Work | Invoala",
    description:
      "Sequential invoice numbering keeps your books traceable and your clients organized. Learn simple numbering systems and what to avoid.",
    intro:
      "Invoice numbers exist so every document is unique and traceable: yours, your accountant's, and your client's. A simple sequential system costs nothing and saves endless confusion.",
    sections: [
      {
        heading: "The basic rule",
        body: "Every invoice gets a unique number, and numbers never repeat. The simplest system is a sequence with a prefix: INV-001, INV-002, INV-003. The prefix just labels the document type so invoices don't collide with quotes or credit notes.",
      },
      {
        heading: "Numbering systems that work",
        body: "Sequential (INV-001) is easiest. Year-prefixed (INV-2026-001) restarts each year and self-documents the billing period. Client-coded (ACME-001) groups by customer, which helps when you review a client's history. All are fine as long as numbers stay unique and sequential within their sequence.",
      },
      {
        heading: "Keep estimates separate",
        body: "Quotes and estimates should use their own sequence (EST-001) so a quote can't be mistaken for a bill. This matters for your books and for clients who file documents by number.",
      },
      {
        heading: "What not to do",
        body: "Don't reuse numbers after a deletion, don't number invoices by date alone (two jobs on one day collide), and don't let 'INV-1' and 'INV-001' live in the same sequence. Fix the format and stick to it.",
      },
    ],
    example:
      "A freelancer starts with INV-001 in January. By December they're at INV-147. A client calls about 'that invoice from March' — 'INV-039, the logo project' — found in seconds because the sequence is clean.",
    faqs: [
      {
        question: "Do invoice numbers have to be sequential?",
        answer:
          "Most tax systems require each invoice to carry a unique, sequential identifier — but a sequential counter with a prefix is all you need. Check your local rules.",
      },
      {
        question: "Can I skip a number?",
        answer:
          "Skipping is fine (e.g., after a deleted draft); reusing is not. A gap is harmless — a duplicate is a red flag.",
      },
      {
        question: "Should I reset numbering each year?",
        answer:
          "Many businesses use INV-2026-001 style resets. That's valid and common — just keep the sequence unique within the year.",
      },
    ],
    related: [
      { label: "Invoice number generator", href: "/tools/invoice-number-generator" },
      { label: "How to calculate an invoice total", href: "/learn/how-to-calculate-an-invoice-total" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-21",
    updated: "2026-08-27",
  },
  {
    slug: "what-is-a-recurring-invoice",
    category: "Invoicing",
    title: "What Is a Recurring Invoice?",
    metaTitle: "What Is a Recurring Invoice? Explained Simply | Invoala",
    description:
      "A recurring invoice bills the same client the same amount on a schedule. Learn when to use them, how they work, and how to set one up.",
    intro:
      "If you bill the same client the same amount every month, you're creating the same invoice twelve times a year. A recurring invoice is the version of that document you can reuse on a fixed schedule — weekly, monthly, or yearly.",
    sections: [
      {
        heading: "What it is",
        body: "A recurring invoice repeats for the same client and amount on a set cadence: rent, retainers, subscriptions, maintenance contracts. Instead of rebuilding it each period, you keep a master copy and issue a fresh invoice each cycle.",
      },
      {
        heading: "When to use one",
        body: "Retainers (marketing, consulting, support), subscriptions and memberships, monthly maintenance, rent or property management, and any service billed on a fixed recurring amount. If the amount changes monthly, it's not a recurring invoice — it's a new invoice each time.",
      },
      {
        heading: "Recurring invoices vs recurring payments",
        body: "A recurring invoice is the bill; a recurring payment is the automatic collection. You can have one without the other. Many small businesses send recurring invoices and collect manually — the invoice makes the amount due official, and the client pays on schedule.",
      },
      {
        heading: "Setting one up",
        body: "Create the invoice once with the client's details, the fixed line items, and the amount. Each period, issue a fresh copy with the correct date. In Invoala you can keep a saved invoice and re-download it with updated dates each cycle.",
      },
    ],
    example:
      "A consultant bills a client $2,500 monthly for advisory. Rather than rebuilding the invoice each month, they keep a master retainer invoice and issue a fresh copy on the 1st with the new period on it. The client knows the drill; the money arrives on schedule.",
    faqs: [
      {
        question: "Do recurring invoices need different numbers?",
        answer:
          "Yes — every issued invoice, including each recurring cycle, needs its own unique number. The master template isn't the issued document.",
      },
      {
        question: "What happens if the amount changes?",
        answer:
          "Update the master copy and note the change. If the change is permanent, the next cycle reflects it; if it's one-off, issue a separate adjusted invoice.",
      },
      {
        question: "Is recurring invoicing the same as a subscription?",
        answer:
          "Closely related. Subscriptions usually imply automatic billing; recurring invoicing only guarantees the bill goes out on schedule. You choose how payment is collected.",
      },
    ],
    related: [
      { label: "Recurring invoices", href: "/recurring-invoices" },
      { label: "Retainer invoice template", href: "/templates/retainer-invoice" },
      { label: "Invoicing for consultants", href: "/invoicing-for-consultants" },
    ],
    published: "2026-08-22",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-track-unpaid-invoices",
    category: "Payments",
    title: "How to Track Unpaid Invoices",
    metaTitle: "How to Track Unpaid Invoices — A Simple System | Invoala",
    description:
      "Track unpaid invoices without a spreadsheet meltdown: one status per invoice, a weekly review, and a follow-up list that never gets stale.",
    intro:
      "Unpaid invoices don't chase themselves. The businesses that collect reliably all do the same three things: record every invoice, know its status, and review the overdue list on a schedule.",
    sections: [
      {
        heading: "One status per invoice",
        body: "Give every invoice a single status — draft, sent, paid (and overdue when it passes the due date). Update it the moment things change. That single column is the entire foundation of tracking.",
      },
      {
        heading: "Keep a single source of truth",
        body: "Invoices scattered across email, drives, and memory can't be tracked. Keep them in one place: your dashboard lists every invoice with its status, client, and amount, so 'what's outstanding?' is one glance instead of an afternoon.",
      },
      {
        heading: "Review on a fixed schedule",
        body: "Pick a weekly slot (Friday afternoons work well) and go down the list: who's overdue, who's due this week, who's paid. Turn the review into action — a follow-up email for each overdue invoice.",
      },
      {
        heading: "Track more than money",
        body: "Note which clients pay late repeatedly and whether you still want them on net-30. Your invoice history tells you who to invoice faster, who needs a deposit, and who's worth keeping.",
      },
    ],
    example:
      "A freelancer checks their dashboard every Friday. Three invoices are overdue: #007 (2 days), #009 (9 days), #010 (16 days). They send: a nudge to #007, a firm note to #009, and a final notice to #010. By the next review, two have paid.",
    faqs: [
      {
        question: "Do I need software to track invoices?",
        answer:
          "A spreadsheet works at small scale, but software removes the manual updates. Invoala records status automatically from your dashboard.",
      },
      {
        question: "What counts as 'overdue'?",
        answer:
          "Any invoice past its due date. Define the due date clearly on every invoice (e.g., net 14, net 30) so 'overdue' is unambiguous.",
      },
      {
        question: "How do I know an invoice was received?",
        answer:
          "You can't always. That's why the pre-due reminder and due-date follow-up exist — they confirm the client has the invoice and the payment date is set.",
      },
    ],
    related: [
      { label: "Invoice payment tracking", href: "/invoice-payment-tracking" },
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "How long should an invoice payment take?", href: "/learn/how-long-should-an-invoice-payment-take" },
    ],
    published: "2026-08-23",
    updated: "2026-08-27",
  },
  {
    slug: "how-long-should-an-invoice-payment-take",
    category: "Cash Flow",
    title: "How Long Should an Invoice Payment Take?",
    metaTitle: "How Long Should an Invoice Payment Take? | Invoala",
    description:
      "Net-7 to net-30: how to choose payment terms, what's realistic, and how to get paid faster without alienating clients.",
    intro:
      "There's no universal answer — payment speed depends on the terms you set and the habits you enforce. The good news: shorter, clearly stated terms get paid faster, and most clients will accept them if they're fair.",
    sections: [
      {
        heading: "What the common terms mean",
        body: "'Net 30' means due within 30 days; net 14 and net 7 are shorter. 'Due on receipt' is the strictest. Freelancers and service businesses commonly use net 14–30; big corporate buyers often have fixed 30–60 day cycles you can't negotiate.",
      },
      {
        heading: "Shorter terms, faster cash",
        body: "The invoice's due date becomes the default payment date — clients rarely pay earlier than asked. If you've been on net 30, net 14 shortens your typical wait dramatically. For repeat work, net 7 is defensible and increasingly common.",
      },
      {
        heading: "Realistic expectations",
        body: "Expect some clients to pay near the due date rather than on it. Large companies pay on their own cycles; plan around that. Whatever your terms, enforce them consistently — the client who pays net-30 late this month will do it every month.",
      },
      {
        heading: "Tools that shorten the cycle",
        body: "Send the invoice immediately on completion, remind before the due date, follow up the day after it passes, and offer easy payment methods. These four habits matter more than which net term you choose.",
      },
    ],
    example:
      "A designer moves from net 30 to net 14 for new clients. Invoices that used to land 30+ days out now arrive in under three weeks — and because reminders go out before the due date, over half pay on time.",
    faqs: [
      {
        question: "What payment terms should a freelancer use?",
        answer:
          "Net 14 is a strong default for services; net 7 for small repeat bills. If a client insists on net 30, accept it consciously and plan the cash flow around it.",
      },
      {
        question: "Can I charge interest on late invoices?",
        answer:
          "Only if your terms allow it and local law permits. State the rate on the invoice and in the agreement before the work starts.",
      },
      {
        question: "Why do big companies pay so slowly?",
        answer:
          "Many run fixed monthly payment runs with 30–60 day terms baked into their systems. Ask about their payment cycle when onboarding — some will accommodate shorter terms for new suppliers.",
      },
    ],
    related: [
      { label: "How to reduce late invoice payments", href: "/learn/how-to-reduce-late-invoice-payments" },
      { label: "Late payment calculator", href: "/tools/late-payment-calculator" },
      { label: "Invoice reminders", href: "/invoice-reminders" },
    ],
    published: "2026-08-21",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-calculate-an-invoice-total",
    category: "Accounting",
    title: "How to Calculate an Invoice Total",
    metaTitle: "How to Calculate an Invoice Total — Step by Step | Invoala",
    description:
      "Subtotal, discounts, tax, total due: calculate an invoice correctly every time with this step-by-step method and example.",
    intro:
      "An invoice total looks simple — until you add discounts and tax. Here's the exact order that keeps every total right: subtotal, discount, tax on the discounted amount, then the grand total.",
    sections: [
      {
        heading: "Step 1 — the subtotal",
        body: "Multiply each line's quantity by its rate and add them all up. One line per service, no hidden bundles — this subtotal is what your client can verify line by line.",
      },
      {
        heading: "Step 2 — discounts",
        body: "Apply discounts to the subtotal before tax. A percentage discount (e.g., 10% off) or a flat amount (e.g., $50 off) both come off here, producing the discounted subtotal.",
      },
      {
        heading: "Step 3 — tax",
        body: "Calculate tax on the discounted amount, not the original subtotal. Tax rate × discounted subtotal = tax. Whether tax is added on top or included in your prices depends on your jurisdiction's rules.",
      },
      {
        heading: "Step 4 — the total",
        body: "Discounted subtotal + tax = total due. Round consistently (most countries round to two decimals), and show the breakdown — subtotal, discount, tax, total — so nothing looks arbitrary.",
      },
    ],
    example:
      "Three lines: 10 hours × $50 = $500; 2 items × $75 = $150. Subtotal $650. 10% discount = $65 → $585. 20% tax on $585 = $117. Total due: $702.",
    faqs: [
      {
        question: "Does tax apply before or after discounts?",
        answer:
          "In most places, tax applies to the discounted amount actually charged. Confirm with your local rules — a few jurisdictions treat discounts differently.",
      },
      {
        question: "How do I round invoice totals?",
        answer:
          "Round the final amount to your currency's standard decimals (usually two). Avoid rounding each line independently in a way that makes the lines not add up.",
      },
      {
        question: "Can Invoala do this automatically?",
        answer:
          "Yes — enter quantities, rates, and a tax rate and the preview calculates the total live. No spreadsheet math required.",
      },
    ],
    related: [
      { label: "Invoice tax calculator", href: "/tools/invoice-tax-calculator" },
      { label: "How to calculate VAT on an invoice", href: "/learn/how-to-calculate-vat-on-an-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-22",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-calculate-vat-on-an-invoice",
    category: "Taxes",
    title: "How to Calculate VAT on an Invoice",
    metaTitle: "How to Calculate VAT on an Invoice | Invoala",
    description:
      "Add VAT to a net amount or strip it from a gross amount — with the formulas, a worked example, and a reminder that rates vary by country.",
    intro:
      "VAT (or GST, or sales tax — the name varies by country) either gets added to your net price or is already buried inside your gross price. This guide shows both directions. Check your local rate; it's not a substitute for advice.",
    sections: [
      {
        heading: "Adding VAT to a net amount",
        body: "If your prices are quoted before tax: VAT = net × (rate ÷ 100). Gross = net + VAT. So at 20%, a $200 net price becomes $240 gross, with $40 of VAT.",
      },
      {
        heading: "Removing VAT from a gross amount",
        body: "If your price already includes VAT: net = gross ÷ (1 + rate ÷ 100). At 20%, divide by 1.2 — a $240 gross price has $40 VAT and a $200 net amount.",
      },
      {
        heading: "Putting VAT on the invoice",
        body: "Show the net, the VAT rate, the VAT amount, and the gross total as separate lines. Tax authorities expect to see the VAT clearly stated — never a single blended number.",
      },
      {
        heading: "Know your rate and your status",
        body: "Rates differ by country (and sometimes by goods or service type), and whether you must charge VAT at all depends on your registration status and revenue. Verify both before invoicing.",
      },
    ],
    example:
      "You're registered for VAT at 20%. Your service is $800 net. VAT = $800 × 0.20 = $160. The invoice shows: net $800, VAT (20%) $160, total $960.",
    faqs: [
      {
        question: "Is VAT the same as sales tax?",
        answer:
          "Similar concept — a consumption tax — but rules differ. VAT applies at each stage of a supply chain with input credits; sales tax is usually charged once at retail. Follow your local terminology and rules.",
      },
      {
        question: "Do I charge VAT on everything?",
        answer:
          "No — some goods and services are zero-rated or exempt, and thresholds exist below which you may not charge VAT at all. Confirm with your tax authority.",
      },
      {
        question: "Does Invoala know my VAT rate?",
        answer:
          "Invoala calculates whatever rate you enter. It's a calculator, not tax advice — set the rate your jurisdiction requires.",
      },
    ],
    related: [
      { label: "VAT calculator", href: "/tools/vat-calculator" },
      { label: "How to calculate an invoice total", href: "/learn/how-to-calculate-an-invoice-total" },
      { label: "Invoice tax calculator", href: "/tools/invoice-tax-calculator" },
    ],
    published: "2026-08-23",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-create-an-invoice-for-freelance-work",
    category: "Freelancing",
    title: "How to Create an Invoice for Freelance Work",
    metaTitle: "How to Create an Invoice for Freelance Work | Invoala",
    description:
      "The freelance invoice, step by step: what to include, how to structure hourly and project billing, and what to do after you send it.",
    intro:
      "Your freelance invoice is both a bill and a business card. The right format gets you paid fast and makes you look established; the wrong one invites questions and delays.",
    sections: [
      {
        heading: "What every freelance invoice includes",
        body: "Your name or business name and contact details; the client's name and email; a unique invoice number; the issue date and due date; line items with quantity and rate; tax if you charge it; the total; and payment instructions.",
      },
      {
        heading: "Hourly vs project billing",
        body: "Hourly work invoices as hours × rate, ideally per task so the client can see what the time bought. Project work invoices per deliverable or per phase. Both work; clarity is what gets you paid.",
      },
      {
        heading: "Write terms you'll actually enforce",
        body: "State the due date (net 14 is a good freelancer default), your payment methods, and any late-fee policy — then follow up accordingly. Terms on paper are only as good as the follow-up behind them.",
      },
      {
        heading: "After you send it",
        body: "Mark it sent, remind before the due date, follow up the day after, and mark it paid when the money lands. Your history of paid invoices is also your best proof of income at tax time.",
      },
    ],
    example:
      "A copywriter finishes a 6-article batch: 6 articles × $150 = $900. The invoice shows each article as a line, tax at 0% (below threshold), net 14 terms, and bank details in the notes. Sent the day of delivery; paid in 11 days.",
    faqs: [
      {
        question: "Do freelancers need an invoice template?",
        answer:
          "A consistent template saves time and looks professional — but you don't need to design one. Invoala generates a polished PDF from your details in seconds.",
      },
      {
        question: "Should I charge tax as a freelancer?",
        answer:
          "It depends on your country and registration status. Check your local threshold and rules — don't guess.",
      },
      {
        question: "How do I invoice a client who hasn't paid?",
        answer:
          "Follow the escalation path: friendly reminder, firm follow-up, final notice. See the unpaid invoice guide for templates.",
      },
    ],
    related: [
      { label: "Freelance invoice template", href: "/templates/freelance-invoice" },
      { label: "Invoicing for freelancers", href: "/invoicing-for-freelancers" },
      { label: "Hourly rate calculator", href: "/tools/hourly-rate-calculator" },
    ],
    published: "2026-08-24",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-invoice-a-client",
    category: "Freelancing",
    title: "How to Invoice a Client (Without It Being Awkward)",
    metaTitle: "How to Invoice a Client — Confident Billing | Invoala",
    description:
      "Billing clients doesn't have to feel awkward. Learn to invoice confidently, set terms up front, and make payment a natural next step.",
    intro:
      "For many freelancers, asking for money feels uncomfortable. It shouldn't — you did the work, and the invoice is just the business formalization of what was agreed. The less awkward you make it, the faster clients pay.",
    sections: [
      {
        heading: "Agree terms before the work",
        body: "The invoice is never the first time the client hears about payment. Agree the price, due date, and method before starting. When the invoice simply repeats an agreement, asking for money isn't awkward — it's follow-through.",
      },
      {
        heading: "Normalize the invoice moment",
        body: "Send the invoice with a short, warm note that treats payment as the obvious next step ('attached is the invoice for the work — thanks again for a great project'). The framing trains the client's expectation.",
      },
      {
        heading: "Don't apologize for billing",
        body: "Skip 'sorry to bother you about money'. The invoice is expected, professional, and on time. Confidence in your billing reads as confidence in your work — and it gets paid faster.",
      },
      {
        heading: "Make paying easy",
        body: "Put everything the client needs in one place: the amount, the due date, and the payment method. The less a client has to hunt for, the sooner they pay.",
      },
    ],
    example:
      "Before starting: 'I'll invoice at $1,800 on delivery, net 14, by bank transfer.' On delivery: 'Hi Maya — the project is done. Invoice #011 for $1,800 is attached, due November 14. Thanks again!' No apology, no ambiguity.",
    faqs: [
      {
        question: "How do I ask for a deposit without awkwardness?",
        answer:
          "Make it a standard line in your agreement: 'a 30% deposit confirms the booking.' It's business practice, not a personal request.",
      },
      {
        question: "What if the client questions the invoice?",
        answer:
          "Stay calm and walk through the line items. A good invoice is its own best defense — every line maps to agreed work.",
      },
      {
        question: "Should I follow up by phone or email?",
        answer:
          "Email first — it's documented and non-intrusive. Phone works for overdue amounts where a personal touch helps.",
      },
    ],
    related: [
      { label: "How to send an invoice", href: "/learn/how-to-send-an-invoice" },
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-24",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-create-a-professional-invoice",
    category: "Invoicing",
    title: "How to Create a Professional Invoice",
    metaTitle: "How to Create a Professional Invoice | Invoala",
    description:
      "What separates a professional invoice from a messy one — layout, clarity, branding, and the details that make clients pay faster.",
    intro:
      "A professional invoice is about respect: respect for your work, for your client's time, and for your own records. The good news is that professionalism is a set of habits, not a design budget.",
    sections: [
      {
        heading: "Clear structure beats decoration",
        body: "A professional invoice has a predictable layout: your details and the client's, an invoice number and dates, a line-item table, and a totals block with payment terms. If someone can find the amount due in five seconds, the invoice is working.",
      },
      {
        heading: "Branding that's restrained",
        body: "Your logo and colors make the invoice yours — but restraint wins. One logo, one accent, plenty of white space. Over-designed invoices distract from the only thing that matters: the total.",
      },
      {
        heading: "Itemized lines, honest totals",
        body: "Every service gets its own line with quantity and rate, and the subtotal → discount → tax → total breakdown is visible. Clients trust invoices they can verify, and trust shortens payment time.",
      },
      {
        heading: "Details that get you paid",
        body: "A unique number, a clear due date, your payment method, and a one-line thank-you. These four details convert 'someday' into 'this week'. Missing any of them invites delay.",
      },
    ],
    example:
      "Two invoices for the same job: one is a wall of text with no due date. The other is Invoala's: logo top-left, clear table of items, subtotal/tax/total, 'due within 14 days', and bank details in the notes. The second one is paid in 9 days.",
    faqs: [
      {
        question: "Do I need a designer to make professional invoices?",
        answer:
          "No. Clean typography, consistent spacing, and a clear structure — which Invoala handles automatically — are what make an invoice look professional.",
      },
      {
        question: "Should invoices be PDF or Word?",
        answer:
          "PDF. It renders identically everywhere and can't be edited. Word files invite accidental (or deliberate) changes.",
      },
      {
        question: "How long should an invoice take to create?",
        answer:
          "With a good tool, under two minutes. If it takes longer, you're fighting your tools instead of using them.",
      },
    ],
    related: [
      { label: "Invoice template generator", href: "/tools/invoice-template-generator" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "Invoice vs receipt", href: "/learn/invoice-vs-receipt" },
    ],
    published: "2026-08-25",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-reduce-late-invoice-payments",
    category: "Cash Flow",
    title: "How to Reduce Late Invoice Payments",
    metaTitle: "How to Reduce Late Invoice Payments | Invoala",
    description:
      "Late payments are usually a systems problem, not a client problem. Fix the invoice, the terms, and the follow-up to get paid on time.",
    intro:
      "A client who pays late once will pay late again — unless the system around your invoicing changes. Most late payments come from loose terms, vague invoices, and silent follow-up. Here's the fix.",
    sections: [
      {
        heading: "Shorten the terms",
        body: "Payment tends to arrive at the due date, whatever it is. Moving from net 30 to net 14 — or net 7 for repeat bills — is the single highest-leverage change available.",
      },
      {
        heading: "Make the invoice undeniable",
        body: "A clear due date, an itemized breakdown, and correct totals leave nothing to question. Invoices that invite questions get paid last.",
      },
      {
        heading: "Automate the reminder rhythm",
        body: "Remind before the due date, follow up on it, and escalate after. Clients respond to consistency — the reminder sequence is what makes 'on time' the path of least resistance.",
      },
      {
        heading: "Use incentives and consequences",
        body: "A small early-payment discount ('2% off if paid within 10 days') works for cash-tight clients. A stated late fee (allowed by your terms and local law) works for everyone else. Offer a payment plan before the situation hardens.",
      },
    ],
    example:
      "A studio switches to net 14, adds a pre-due reminder, and states a late fee in its terms. Over the next quarter, average payment time drops from 31 to 19 days, and the monthly cash forecast stops being a guessing game.",
    faqs: [
      {
        question: "Why do clients pay late?",
        answer:
          "Usually disorganization, not malice: the invoice got buried, the due date was unclear, or the client's own cycle is slow. Clear terms and reminders fix all three.",
      },
      {
        question: "What's a fair early-payment discount?",
        answer:
          "1–2% for payment within 7–10 days is common and often cheaper than financing the gap. Offer it only if it genuinely changes behavior.",
      },
      {
        question: "When should I stop working with a late payer?",
        answer:
          "After repeated late payments despite clear terms, switch them to deposits or shorter terms. If they're still late, it's costing you more than they're worth.",
      },
    ],
    related: [
      { label: "How long should an invoice payment take?", href: "/learn/how-long-should-an-invoice-payment-take" },
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "Invoice reminders", href: "/invoice-reminders" },
    ],
    published: "2026-08-25",
    updated: "2026-08-27",
  },
  {
    slug: "how-to-write-an-invoice",
    category: "Invoicing",
    title: "How to Write an Invoice",
    metaTitle: "How to Write an Invoice — Wording That Gets You Paid | Invoala",
    description:
      "What to actually write on an invoice: the fields, the line items, the payment terms, and the notes that make clients pay without questions.",
    intro:
      "Writing an invoice is copywriting for cash flow. The right words make payment effortless and professional; vague wording invites questions, delays, and disputes. Here's what to write, field by field.",
    sections: [
      {
        heading: "Start with the identifying details",
        body: "Top of the invoice: your business name, email, and address, then the client's name and email. Add a unique invoice number and both dates — the issue date and the due date. These look dull, but they're what your client's accounts team files against.",
      },
      {
        heading: "Write line items clients can verify",
        body: "Each line is: a short description, a quantity, and a rate. Write descriptions that match the work the client saw — 'Website design — homepage, pricing, contact pages' beats 'design work'. If the client can verify every line, they have nothing to question.",
      },
      {
        heading: "State terms plainly",
        body: "'Due within 14 days' is clearer than 'net 14'. Add a one-line payment instruction: 'Payment by bank transfer to the account below.' If you charge late fees, say so briefly — hidden policies are unenforceable in practice.",
      },
      {
        heading: "Write notes that help, not fluff",
        body: "A one-line thank-you is plenty. The notes field is better used for anything practical: the payment method details, the purchase order number the client provided, or a short scope reminder. Skip paragraphs; invoices are read fast.",
      },
    ],
    example:
      "Invoice #INV-014 — 'Brand refresh — 3 logo concepts (1 round of revisions included), 8 hours × $65 = $520. Due within 14 days. Payment by bank transfer: [details]. PO ref: ACME-2210.' Four lines, zero ambiguity, paid in 11 days.",
    faqs: [
      {
        question: "Should I write a full description or keep it short?",
        answer:
          "Short and specific. One sentence per line item that matches agreed scope. Enough to verify, not enough to argue with.",
      },
      {
        question: "Do invoices need a thank-you note?",
        answer:
          "A single line is a nice professional touch. It's not required and shouldn't dominate the document.",
      },
      {
        question: "What if English isn't the client's language?",
        answer:
          "Keep wording simple and concrete — numbers, dates, and item names do most of the work regardless of language.",
      },
    ],
    related: [
      { label: "How to create an invoice", href: "/how-to-create-invoice" },
      { label: "How to create a professional invoice", href: "/learn/how-to-create-a-professional-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-26",
    updated: "2026-08-27",
  },
  {
    slug: "what-should-an-invoice-include",
    category: "Invoicing",
    title: "What Should an Invoice Include? (Checklist)",
    metaTitle: "What Should an Invoice Include? — Full Checklist | Invoala",
    description:
      "The complete checklist of everything a professional invoice needs: business details, line items, totals, tax, payment terms, and the small print that prevents disputes.",
    intro:
      "A complete invoice is a complete answer to every question a client could ask about payment. Missing even one field can delay the money by weeks. Work through this checklist before you hit send.",
    sections: [
      {
        heading: "Who, what, and when",
        body: "Your details (name, email, address) and the client's details (name, email). The invoice number and both dates — issue date and due date. Without these, the document is anonymous and can't be filed, approved, or paid.",
      },
      {
        heading: "The money part",
        body: "Line items with quantity and rate, the subtotal, any discount, tax with the rate shown, and the grand total. Show the math — clients and their accountants should be able to reproduce your total in 30 seconds.",
      },
      {
        heading: "Payment terms",
        body: "The due date in plain language, the payment methods you accept, and any late-fee or early-payment policies. If a client knows exactly what to do and when, they do it.",
      },
      {
        heading: "Small print that prevents disputes",
        body: "A purchase order or reference number if the client provided one, a scope or period reference for retainers, and a short notes line. None of it is legally required, but each piece closes a loophole for confusion.",
      },
    ],
    example:
      "Before sending, run the checklist: business info ✓, client info ✓, INV number ✓, dates ✓, itemized lines ✓, subtotal/discount/tax/total ✓, due date ✓, payment method ✓, PO reference ✓. Nine boxes, one send.",
    faqs: [
      {
        question: "Is a phone number required on an invoice?",
        answer:
          "Not required, but useful if the client needs to reach you about payment. Email is usually enough.",
      },
      {
        question: "Do I need to show tax on every invoice?",
        answer:
          "If you charge tax, yes — show the rate and amount separately. If you don't charge tax, you can omit it, but some jurisdictions require the statement that no tax applies.",
      },
      {
        question: "What's the most commonly forgotten field?",
        answer:
          "The due date, or a vague one ('due upon receipt'). An explicit date is what turns an invoice into a scheduled payment.",
      },
    ],
    related: [
      { label: "What should an invoice include (template)", href: "/templates/freelance-invoice" },
      { label: "How to calculate an invoice total", href: "/learn/how-to-calculate-an-invoice-total" },
      { label: "Invoice vs receipt", href: "/learn/invoice-vs-receipt" },
    ],
    published: "2026-08-26",
    updated: "2026-08-27",
  },
  {
    slug: "net-30-payment-terms",
    category: "Payments",
    title: "What Are Net 30 Payment Terms?",
    metaTitle: "What Are Net 30 Payment Terms? (And Net 15, 60, 90) | Invoala",
    description:
      "Net 30 means payment is due 30 days after the invoice date. Learn how net terms work, when to use them, and how to protect your cash flow.",
    intro:
      "\"Net 30\" appears on millions of invoices, but it's often left unexplained. It simply means the full invoice amount is due 30 days after the invoice date. Understanding net terms — and picking the right ones — shapes how fast you get paid.",
    sections: [
      {
        heading: "What the numbers mean",
        body: "Net 30: payment due 30 days after the invoice date. Net 15, Net 45, Net 60, and Net 90 follow the same rule with different day counts. The count uses calendar days, not business days. An invoice dated March 3rd with Net 30 terms is due April 2nd.",
      },
      {
        heading: "When to use net terms",
        body: "Net terms work well for established client relationships, larger contracts, and clients with formal payment processes. They're also standard in industries where clients expect credit — construction, wholesale, and B2B services. New clients usually shouldn't get generous terms until they've paid on time a few times.",
      },
      {
        heading: "The risk you're taking on",
        body: "Net 30 is effectively a 30-day, interest-free loan to your client. If you pay suppliers faster than clients pay you, the gap comes out of your cash flow. Longer terms (Net 60, Net 90) amplify this. That's why invoices should always state the terms explicitly — assumptions produce late payments.",
      },
      {
        heading: "Protecting yourself",
        body: "State terms on every invoice, and define what happens after the due date — late fees, interest, or work pauses. Follow up on the due date itself, not weeks later. And consider early-payment discounts (like 2/10 Net 30: 2% off if paid within 10 days) if you'd rather be paid faster.",
      },
      {
        heading: "Due-on-receipt vs net terms",
        body: "Due on receipt means payment is expected immediately — common for freelancers and one-off work. Net terms give the client breathing room. There's no universally right answer: match terms to the client's payment record and your own cash needs.",
      },
    ],
    example:
      "A graphic designer invoices a retail client on June 1st with Net 30 terms. Payment is due June 30th. On June 30th the payment hasn't arrived, so the designer sends a polite reminder the same day — and the payment lands July 2nd.",
    faqs: [
      {
        question: "Does Net 30 mean 30 business days?",
        answer:
          "No — calendar days. Business-day counting would stretch 30 days into six weeks, and clients would never accept the ambiguity.",
      },
      {
        question: "Should new clients get Net 30?",
        answer:
          "Usually not automatically. Many freelancers start new clients on due-on-receipt or Net 15 and extend terms after a few on-time payments.",
      },
      {
        question: "Can I charge late fees after Net 30?",
        answer:
          "Only if the terms stated it upfront. Add a short late-payment clause to your invoice notes or contract before the invoice is due, not after.",
      },
    ],
    related: [
      { label: "Invoice due date calculator", href: "/tools/invoice-due-date-calculator" },
      { label: "How to follow up on an unpaid invoice", href: "/learn/how-to-follow-up-on-an-unpaid-invoice" },
      { label: "Late payment calculator", href: "/tools/late-payment-calculator" },
    ],
    published: "2026-08-29",
    updated: "2026-08-29",
  },
  {
    slug: "what-is-a-tax-invoice",
    category: "Taxes",
    title: "What Is a Tax Invoice?",
    metaTitle: "What Is a Tax Invoice? Requirements & Examples | Invoala",
    description:
      "A tax invoice is an invoice that includes the tax details your jurisdiction requires — VAT or GST breakdowns, tax IDs, and itemized amounts. Learn what must appear on one.",
    intro:
      "A tax invoice is a standard invoice that meets the legal requirements for charging and reclaiming tax — most commonly VAT or GST. If you're registered for tax, you're generally required to issue tax invoices, and your business clients can't reclaim input tax without one.",
    sections: [
      {
        heading: "What makes an invoice a 'tax invoice'",
        body: "Beyond the usual invoice contents, a tax invoice must show the tax explicitly: your tax registration number, the client's tax number (when required), the taxable amount, the tax rate, and the tax charged. The exact requirements vary by country — check your local tax authority's rules.",
      },
      {
        heading: "Common requirements",
        body: "Most jurisdictions require: the words 'Tax Invoice' on the document, seller's name and tax ID, buyer's details, a unique invoice number, the invoice date, a description of the goods or services, the amount excluding tax, the tax rate, and the total tax. Some also require the currency and exchange details for foreign invoices.",
      },
      {
        heading: "How Invoala handles tax invoices",
        body: "In Invoala, set your tax rate in the generator and it calculates the tax and total automatically, showing a labeled tax line on the PDF. Add your tax registration number as a custom field so it appears on every document. You can also set the document title by choosing the invoice type.",
      },
      {
        heading: "Simplified tax invoices",
        body: "For small transactions (under a threshold that varies by country), a simplified tax invoice may be allowed — usually the same document minus the buyer's full details. Check the threshold in your jurisdiction before relying on this.",
      },
      {
        heading: "Keeping tax invoices",
        body: "Most countries require you to keep issued tax invoices for several years. Saving your invoices in Invoala keeps them searchable and re-downloadable when the tax authority asks.",
      },
    ],
    example:
      "A UK VAT-registered designer issues an invoice for £1,000 with 20% VAT: subtotal £1,000, VAT £200, total £1,200, with their VAT number shown on the invoice. The client's accountant reclaims the £200 input VAT using this document.",
    faqs: [
      {
        question: "Is every invoice a tax invoice?",
        answer:
          "No. An invoice only qualifies as a tax invoice when it contains the tax information your jurisdiction requires — including your tax ID and the tax breakdown.",
      },
      {
        question: "Do I need a tax invoice if I'm not VAT registered?",
        answer:
          "If you're not registered for tax, you can't charge it — so you issue a regular invoice without a tax line. Once registered, tax invoices become mandatory for taxable supplies.",
      },
      {
        question: "Where do I put my tax ID on an invoice?",
        answer:
          "Near your business details at the top. In Invoala, add it as a custom field or in your address block so it appears on every PDF.",
      },
    ],
    related: [
      { label: "How to calculate VAT on an invoice", href: "/learn/how-to-calculate-vat-on-an-invoice" },
      { label: "VAT calculator", href: "/tools/vat-calculator" },
      { label: "What should an invoice include", href: "/learn/what-should-an-invoice-include" },
    ],
    published: "2026-08-29",
    updated: "2026-08-29",
  },
  {
    slug: "what-is-a-commercial-invoice",
    category: "Invoicing",
    title: "What Is a Commercial Invoice?",
    metaTitle: "What Is a Commercial Invoice? (For International Shipping) | Invoala",
    description:
      "A commercial invoice is the customs document for international shipments. Learn what it must include — value, HS codes, origin — and how it differs from a regular invoice.",
    intro:
      "A commercial invoice is the official transaction document that accompanies goods crossing international borders. Customs uses it to assess duties and taxes, verify what's in the shipment, and clear the goods. Ship without one and your package stalls at the border.",
    sections: [
      {
        heading: "What customs wants to see",
        body: "A commercial invoice needs more than a regular invoice: seller and buyer details, shipping address, a precise description of each item, quantities, unit value and total value, the currency, the country of origin, HS (harmonized system) codes, and the reason for export. The declared value is what duties are calculated on.",
      },
      {
        heading: "How it differs from a regular invoice",
        body: "A regular invoice documents a sale for accounting. A commercial invoice does that too, but its audience is customs: it declares the goods' value, origin, and classification. Getting the value wrong — even accidentally — can cause delays, fines, or confiscation.",
      },
      {
        heading: "Common mistakes to avoid",
        body: "Undervaluing goods to reduce duty is fraud — never do it. Mismatches between the commercial invoice and the packing list cause holds. And vague descriptions like 'samples' or 'merchandise' get flagged: customs wants 'cotton t-shirts, 100% cotton' — not 'clothes'.",
      },
      {
        heading: "Creating one in Invoala",
        body: "Use Invoala's generator with item descriptions, quantities, and unit values. Add HS codes and country of origin as custom fields, and put incoterms (like FOB or CIF) in the notes. Most couriers also accept a filled PDF alongside their own forms.",
      },
    ],
    example:
      "A maker ships 50 leather wallets from the UK to a US retailer: the commercial invoice lists 'leather wallets, HS 4202.31, origin UK, value £1,250'. US customs uses it to assess import duty before release.",
    faqs: [
      {
        question: "Who prepares the commercial invoice?",
        answer:
          "The exporter (sender). Couriers like DHL and FedEx usually generate a draft from the details you enter — but you're legally responsible for accuracy.",
      },
      {
        question: "Do I need a commercial invoice for documents?",
        answer:
          "Usually not — non-commercial documents travel without customs value. Goods, however, almost always need one when crossing borders.",
      },
      {
        question: "What are HS codes?",
        answer:
          "The harmonized system classifies products worldwide. Getting the right 6-digit code for your product ensures correct duty rates and faster clearance.",
      },
    ],
    related: [
      { label: "What should an invoice include", href: "/learn/what-should-an-invoice-include" },
      { label: "Invoice generator with custom fields", href: "/invoice-generator" },
      { label: "What is a tax invoice?", href: "/learn/what-is-a-tax-invoice" },
    ],
    published: "2026-08-29",
    updated: "2026-08-29",
  },
  {
    slug: "invoice-vs-quote",
    category: "Invoicing",
    title: "Invoice vs Quote: What's the Difference?",
    metaTitle: "Invoice vs Quote — What's the Difference? | Invoala",
    description:
      "A quote is a firm price offered before work starts; an invoice requests payment for completed work. Learn when to send each and how they connect.",
    intro:
      "Quotes and invoices bookend every job: the quote sets the price before the work, and the invoice collects the money after. Confusing the two confuses your client — and your records.",
    sections: [
      {
        heading: "The quote comes first",
        body: "A quote is a firm offer: 'this is what I'll do, and this is exactly what it will cost.' It's sent before work begins, usually with a validity period. Once the client accepts, the price is generally binding — which is why quotes should be detailed and carefully priced.",
      },
      {
        heading: "The invoice comes after",
        body: "The invoice requests payment for work done (or in progress, for staged billing). It references the same items as the accepted quote, adds payment terms and a due date, and is the document your client actually pays against.",
      },
      {
        heading: "Estimates sit between the two",
        body: "An estimate is a ballpark figure — an informed guess that can change as scope becomes clearer. Unlike a quote, it's not a promise. Many clients say 'quote' when they mean 'estimate'; confirming which one you're providing prevents pricing disputes later.",
      },
      {
        heading: "Connecting them",
        body: "The cleanest workflow: send a quote, get approval, then convert that quote into an invoice with the same line items. Invoala does this in one click — the items carry over and a due date is added automatically. No retyping, no transcription errors, and the numbers the client approved are exactly the numbers they're billed.",
      },
    ],
    example:
      "A web designer quotes $3,000 for a site rebuild with 30-day validity. The client approves on day 12. The designer converts the quote to an invoice with Net 14 terms — same $3,000, now with a payment deadline.",
    faqs: [
      {
        question: "Is a quote legally binding?",
        answer:
          "An accepted quote is generally a binding agreement at the quoted price. Estimates are not. Label your documents clearly so there's no doubt about which one you sent.",
      },
      {
        question: "Can I change the price after a quote?",
        answer:
          "Only if the scope changes or the quote expired. Changing the price of an accepted quote without scope change is a fast way to lose trust — and potentially a dispute.",
      },
      {
        question: "Should quotes have payment terms?",
        answer:
          "Quotes usually show a validity period rather than payment terms. Payment terms belong on the invoice you raise after acceptance.",
      },
    ],
    related: [
      { label: "Estimate generator", href: "/estimate-generator" },
      { label: "Invoice vs estimate", href: "/learn/invoice-vs-estimate" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
    published: "2026-08-29",
    updated: "2026-08-29",
  },
];

export const ARTICLES_BY_SLUG = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));

export const ARTICLES_BY_CATEGORY = LEARN_CATEGORIES.map((category) => ({
  category,
  articles: ARTICLES.filter((a) => a.category === category),
}));
