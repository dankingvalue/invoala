export type SolutionDef = {
  slug: string;
  name: string;
  metaTitle: string;
  description: string;
  intro: string;
  sections: { heading: string; body: string }[];
  sampleItems: { description: string; quantity: number; rate: number }[];
  challenges: string[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
};

export const SOLUTIONS: SolutionDef[] = [
  {
    slug: "invoicing-for-freelancers",
    name: "Freelancers",
    metaTitle: "Invoicing for Freelancers — Simple Invoices, Faster Payment | Invoala",
    description:
      "Freelancer invoicing made simple: create professional invoices in seconds, save repeat clients, and get paid faster without expensive software.",
    intro:
      "As a freelancer, your invoice is the last impression of every project. It needs to look professional, add up correctly, and make payment easy. Invoala gives you a polished invoice in under two minutes — free.",
    sections: [
      {
        heading: "The freelancer invoicing problem",
        body: "You spend your day on client work, then face an evening of building invoices from scratch in a document editor — fixing totals, hunting for the last client's address, and praying the layout prints well. Every project repeats the same overhead, and the longer an invoice takes to create, the later it goes out.",
      },
      {
        heading: "How Invoala fits a freelancer's workflow",
        body: "Fill in your details once, add line items, and watch the totals calculate themselves. Download a print-ready PDF in one click, attach it to an email, and move on. When the same client comes back, their details are already saved — you just add the new items and download.",
      },
      {
        heading: "Getting paid on time",
        body: "A clean invoice with clear payment terms gets paid faster. Put the due date and your payment method right on the invoice, send it the day you finish the work, and follow up the day it goes overdue. Mark it paid in your dashboard so your records stay accurate.",
      },
      {
        heading: "What a freelancer's invoice should show",
        body: "Your name and contact details, the client's details, a unique invoice number, one line per service with quantity and rate, a tax line if you charge it, and the total with a due date. Quotes for new work can use the same format labeled as a quote.",
      },
    ],
    sampleItems: [
      { description: "Website copywriting — 3 articles", quantity: 3, rate: 180 },
      { description: "Revisions (round 2 of 2)", quantity: 1, rate: 0 },
      { description: "Rush delivery fee", quantity: 1, rate: 50 },
    ],
    challenges: [
      "Chasing unpaid invoices without a clear record",
      "Re-typing the same client details every month",
      "Invoices that don't print or look unprofessional",
    ],
    checklist: [
      "Agree payment terms before starting the project",
      "Send the invoice on completion day",
      "Number invoices sequentially (INV-001, INV-002…)",
      "Follow up the day after the due date",
      "Mark each invoice paid when the money lands",
    ],
    faqs: [
      {
        question: "Do freelancers need invoicing software?",
        answer:
          "Not expensive software — but a purpose-built tool saves the hours you'd spend building invoices by hand. A free generator that handles totals, tax, and PDFs is enough for most solo freelancers.",
      },
      {
        question: "How much should freelancers charge per hour?",
        answer:
          "Work backward from your target income, add business costs, and divide by realistic billable hours. The hourly rate calculator walks through the math.",
      },
      {
        question: "Is Invoala free for freelancers?",
        answer:
          "The invoice generator is free forever — unlimited invoices, no watermark, no sign-up. Optional Pro features such as saved client history and quotes are available if you want them.",
      },
    ],
    related: [
      { label: "Freelance invoice template", href: "/templates/freelance-invoice" },
      { label: "Hourly rate calculator", href: "/tools/hourly-rate-calculator" },
      { label: "How to create an invoice for freelance work", href: "/learn/how-to-create-an-invoice-for-freelance-work" },
    ],
  },
  {
    slug: "invoicing-for-small-businesses",
    name: "Small Businesses",
    metaTitle: "Invoicing for Small Businesses — Professional Billing | Invoala",
    description:
      "Small business invoicing made easy: professional invoices, saved clients, payment tracking, and quotes — without enterprise pricing.",
    intro:
      "A small business needs invoices that look the part, records that stay organized, and clients that pay on time. Invoala handles all three without a learning curve or a monthly bill you have to justify.",
    sections: [
      {
        heading: "Invoicing without an accounting department",
        body: "Most small businesses don't have an accounts team — the owner does the billing between everything else. Invoala keeps the whole job to minutes: create the invoice, send it as a PDF, and track its status from your dashboard. No double-entry, no spreadsheets.",
      },
      {
        heading: "Keeping client records straight",
        body: "Saved client profiles mean you never retype an address, and you always know what each customer has been billed and paid. That history is what you reach for at tax time and when a client asks, 'what have we paid so far?'",
      },
      {
        heading: "Quotes, invoices, and payments",
        body: "Quote a job, then turn it into an invoice when the work is done. Track each invoice as draft, sent, or paid so nothing slips through the cracks — and follow up on the ones that don't get paid on time.",
      },
      {
        heading: "Staying professional without overhead",
        body: "A consistent invoice with your logo, clear line items, and correct tax makes a small business look far bigger than it is. That professionalism directly affects how quickly clients pay.",
      },
    ],
    sampleItems: [
      { description: "Product delivery — 25 units", quantity: 25, rate: 40 },
      { description: "Delivery & installation", quantity: 1, rate: 95 },
      { description: "Extended warranty (12 months)", quantity: 1, rate: 60 },
    ],
    challenges: [
      "Losing track of who has paid and who hasn't",
      "Invoices with wrong totals or missing tax",
      "Retyping client details for repeat orders",
    ],
    checklist: [
      "Use a consistent invoice layout with your logo",
      "Apply the right tax for your jurisdiction",
      "Record every invoice's status",
      "Follow up on overdue invoices within days",
      "Keep PDFs for your records",
    ],
    faqs: [
      {
        question: "Is this enough for tax records?",
        answer:
          "Keep your invoice PDFs and a record of payment status. Actual bookkeeping, VAT returns, and tax filing should be handled by your accountant or accounting software — Invoala covers the invoice side.",
      },
      {
        question: "Can multiple people send invoices?",
        answer:
          "Yes — on a Teams plan, up to five team members can share a client book with role-based permissions.",
      },
      {
        question: "Does Invoala replace accounting software?",
        answer:
          "No. Invoala focuses on creating, sending, and tracking invoices. Many small businesses pair it with their accountant's bookkeeping flow.",
      },
    ],
    related: [
      { label: "Invoicing software", href: "/invoicing-software" },
      { label: "Invoice payment tracking", href: "/invoice-payment-tracking" },
      { label: "Online invoicing", href: "/online-invoicing" },
    ],
  },
  {
    slug: "invoicing-for-consultants",
    name: "Consultants",
    metaTitle: "Invoicing for Consultants — Retainers & Sessions | Invoala",
    description:
      "Consultant invoicing for retainers, sessions, and engagements. Bill cleanly, bill on time, and keep every engagement traceable.",
    intro:
      "Consultants live on trust and repeat business — and nothing erodes trust faster than a messy invoice. Invoala keeps your billing as polished as your advice.",
    sections: [
      {
        heading: "Retainers made repeatable",
        body: "The consulting model runs on monthly retainers. Set up a clean retainer invoice once, reuse it every month, and bill at the start of each period. Your client sees the same professional format with the right period on it — no friction, no surprises.",
      },
      {
        heading: "Hourly sessions and ad-hoc work",
        body: "Strategy sessions, workshops, and one-off advisory calls each get their own line item with hours and rate. Add overage lines for anything beyond the retainer scope so extra work is never free.",
      },
      {
        heading: "The value of a proper paper trail",
        body: "When a client asks what they've been billed or what a deliverable cost, you can answer instantly from your invoice history. That record also makes end-of-year accounting far less painful.",
      },
      {
        heading: "Presenting yourself at your level",
        body: "Consultants are paid for judgment — and a sloppy invoice undercuts it. A branded, itemized invoice signals that you run your business as professionally as you advise theirs.",
      },
    ],
    sampleItems: [
      { description: "Monthly retainer — advisory", quantity: 1, rate: 3000 },
      { description: "Workshop — half day", quantity: 4, rate: 250 },
      { description: "Overage — 2 extra hours", quantity: 2, rate: 150 },
    ],
    challenges: [
      "Retainer clients paying late or inconsistently",
      "Tracking which month's scope a payment covers",
      "Explaining what the client is actually paying for",
    ],
    checklist: [
      "State the billing period on every retainer invoice",
      "List the included scope in the notes",
      "Bill at the start of the period",
      "Charge overage at an agreed rate",
      "Follow up on day one of non-payment",
    ],
    faqs: [
      {
        question: "Should consultants bill in advance?",
        answer:
          "Common practice is to bill retainers at the start of the month so you're never working on credit. Whatever you choose, state it in the agreement and on the invoice.",
      },
      {
        question: "How do I invoice a one-off workshop?",
        answer:
          "Use a standard invoice with line items per deliverable (e.g., half-day workshop × rate). Add expenses like travel as their own lines.",
      },
      {
        question: "Can I reuse the same retainer invoice?",
        answer:
          "Yes — keep a saved copy of your retainer invoice and update the period each month. Invoala lets you download a fresh PDF from the same data in seconds.",
      },
    ],
    related: [
      { label: "Consulting invoice template", href: "/templates/consulting-invoice" },
      { label: "Retainer invoice template", href: "/templates/retainer-invoice" },
      { label: "Recurring invoices", href: "/recurring-invoices" },
    ],
  },
  {
    slug: "invoicing-for-agencies",
    name: "Agencies",
    metaTitle: "Invoicing for Agencies — Clients, Retainers & Team | Invoala",
    description:
      "Agency invoicing with a shared client book: manage retainers, ad spend pass-throughs, and team billing from one place.",
    intro:
      "Agencies juggle multiple clients, monthly retainers, and pass-through costs. Invoala gives your whole team one shared client book and a billing flow that doesn't require a finance department.",
    sections: [
      {
        heading: "One shared client book",
        body: "When your team can see the same clients and invoices, nobody re-creates a bill that already exists. Team members create invoices, the owner reviews, and the client book stays consistent — with role-based permissions deciding who changes what.",
      },
      {
        heading: "Retainers and ad spend, kept separate",
        body: "Clients trust agencies that itemize honestly. Bill your management fee as its own line, and pass ad spend through as a clearly labeled line with platform receipts referenced. Transparency here is what prevents monthly billing disputes.",
      },
      {
        heading: "Milestones and projects",
        body: "For project-based work, invoice per phase — discovery, design, delivery. Number the invoices sequentially so both you and the client can match each payment to its milestone.",
      },
      {
        heading: "Team roles that match reality",
        body: "Owner, admin, and member roles mean the person doing the billing has the access they need and nothing more. Permissions scale with your team without changing your process.",
      },
    ],
    sampleItems: [
      { description: "Monthly retainer — campaign management", quantity: 1, rate: 2400 },
      { description: "Ad spend — passed through (receipts attached)", quantity: 1, rate: 4000 },
      { description: "Monthly reporting & optimization", quantity: 1, rate: 350 },
    ],
    challenges: [
      "Multiple people creating duplicate invoices",
      "Ad spend and fees mixed into one confusing total",
      "Retainers going out late month after month",
    ],
    checklist: [
      "Keep ad spend pass-throughs on their own line",
      "Bill retainers the same day every month",
      "Use milestone invoices for project work",
      "Track every invoice's status from one dashboard",
      "Set team permissions per role",
    ],
    faqs: [
      {
        question: "How many people can use Invoala?",
        answer:
          "Teams plans support up to five members with shared clients and role-based permissions — enough for a small agency's full billing workflow.",
      },
      {
        question: "Should we mark up ad spend?",
        answer:
          "That's your business decision. What matters is labeling: pass-through spend should be clearly separated from your fees so clients can verify it.",
      },
      {
        question: "Can I invoice international clients?",
        answer:
          "Yes — all 154 currencies are supported, so you can bill each client in their own currency.",
      },
    ],
    related: [
      { label: "Marketing invoice template", href: "/templates/marketing-invoice" },
      { label: "Retainer invoice template", href: "/templates/retainer-invoice" },
      { label: "Recurring invoices", href: "/recurring-invoices" },
    ],
  },
  {
    slug: "invoicing-for-contractors",
    name: "Contractors",
    metaTitle: "Invoicing for Contractors — Labor, Materials & Deposits | Invoala",
    description:
      "Contractor invoicing for labor, materials, and deposits. Quote the job, bill the work, and get paid — with receipts kept clean.",
    intro:
      "Contractors get paid for completed work — and the invoice is what turns finished work into money. A clear breakdown of labor, materials, and deposits keeps clients happy and records straight.",
    sections: [
      {
        heading: "The job-first invoice",
        body: "Contractors who bill by the job need invoices that match the work on site: labor broken out by hours, materials itemized, and any permits or fees listed separately. When every line maps to something the client saw, payment questions disappear.",
      },
      {
        heading: "Deposits and progress billing",
        body: "Most contractor jobs start with a deposit. Show it on the final invoice as a credit line so the balance due is obvious. For longer projects, bill by milestone and reference the stage in the invoice number or notes.",
      },
      {
        heading: "Quotes that become invoices",
        body: "Quote the job before you start, get approval in writing, then turn that quote into the final invoice when the work is done. The client recognizes the numbers, so there's nothing new to argue about.",
      },
      {
        heading: "Records that survive the season",
        body: "At the end of the year, your accountant wants to see what you billed and collected. Sequential invoice numbers and PDF records give you that history without digging through texts and emails.",
      },
    ],
    sampleItems: [
      { description: "Labor — 2 technicians × 3 days", quantity: 24, rate: 55 },
      { description: "Materials (receipts attached)", quantity: 1, rate: 780 },
      { description: "Deposit already paid — credit", quantity: 1, rate: -500 },
    ],
    challenges: [
      "Clients disputing hours after the job is done",
      "Forgetting deposit amounts on final bills",
      "Unreadable handwritten or template invoices",
    ],
    checklist: [
      "Quote and get written approval before starting",
      "Itemize labor separately from materials",
      "Show the deposit as a credit line",
      "Reference the job site on the invoice",
      "Follow up promptly when payment is late",
    ],
    faqs: [
      {
        question: "How do I show a deposit on the invoice?",
        answer:
          "Add it as a credit line (a negative amount) so the final balance equals the total minus the deposit. The client sees exactly what's still owed.",
      },
      {
        question: "Should I bill by the hour or by the job?",
        answer:
          "Quoted fixed prices are easier to approve and compare; hourly billing reflects real effort. Many contractors quote fixed jobs built on an internal hourly estimate.",
      },
      {
        question: "What if a client disputes a line item?",
        answer:
          "A written quote plus receipts for materials resolves most disputes. Keep both, reference the job on the invoice, and stay firm but friendly.",
      },
    ],
    related: [
      { label: "Contractor invoice template", href: "/templates/contractor-invoice" },
      { label: "Estimates vs invoices", href: "/estimates-and-invoices" },
      { label: "Late payment calculator", href: "/tools/late-payment-calculator" },
    ],
  },
  {
    slug: "invoicing-for-photographers",
    name: "Photographers",
    metaTitle: "Invoicing for Photographers — Sessions, Packages & Usage | Invoala",
    description:
      "Photographer invoicing for sessions, packages, and usage rights. Deposit-friendly, deliverable-focused, and watermark-free.",
    intro:
      "Your photos are your product — and your invoice is how you get paid for them. Itemized, deposit-friendly invoices make the business side of photography feel as clean as your portfolio.",
    sections: [
      {
        heading: "Package pricing that's easy to approve",
        body: "Clients decide faster when they see exactly what a package includes. List the session, the number of edited images, and any add-ons as separate lines. The total matches what you promised — no confusion at delivery.",
      },
      {
        heading: "Deposits that protect your calendar",
        body: "A booking fee holds the date. Show it on the final invoice as a credit so the client sees their deposit applied, and the balance is clear. This is standard practice in the industry.",
      },
      {
        heading: "Usage rights, in writing",
        body: "Commercial shoots raise the question of usage: web, print, billboard, exclusivity. Note the agreed usage in your invoice notes and price commercial licenses as their own line item.",
      },
      {
        heading: "Extras without awkwardness",
        body: "When the client asks for five more edited images, you just add a line. Itemized extras turn 'can you also…' requests into agreed revenue instead of free work.",
      },
    ],
    sampleItems: [
      { description: "Engagement session — 90 minutes", quantity: 1, rate: 300 },
      { description: "20 edited digital images", quantity: 1, rate: 200 },
      { description: "Additional edited image", quantity: 5, rate: 15 },
      { description: "Deposit paid at booking — credit", quantity: 1, rate: -150 },
    ],
    challenges: [
      "Clients expecting more images than the package includes",
      "Deposits getting lost between booking and delivery",
      "Usage disputes after commercial shoots",
    ],
    checklist: [
      "State what the package includes, in writing",
      "Require a deposit to hold the date",
      "Show the deposit as a credit on the final invoice",
      "Price usage rights separately for commercial work",
      "Deliver images only after payment for non-retainer clients",
    ],
    faqs: [
      {
        question: "Do photographers charge deposits?",
        answer:
          "Most do — commonly 20–50% of the package to hold the date. It protects you against cancellations and is normal practice for clients.",
      },
      {
        question: "How do I invoice commercial usage?",
        answer:
          "Add usage rights as their own line item (e.g., 'Commercial web license — 12 months') and define the terms in your notes or contract.",
      },
      {
        question: "Should I watermark my invoices?",
        answer:
          "Invoala never adds watermarks to invoices — your PDF is always clean and client-ready.",
      },
    ],
    related: [
      { label: "Photography invoice template", href: "/templates/photography-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "How to send an invoice", href: "/learn/how-to-send-an-invoice" },
    ],
  },
  {
    slug: "invoicing-for-web-designers",
    name: "Web Designers",
    metaTitle: "Invoicing for Web Designers — Phases & Deliverables | Invoala",
    description:
      "Web designer invoicing for builds, milestones, and maintenance. Bill design work clearly, separate pass-through costs, and get paid per phase.",
    intro:
      "Web design and development projects are long, multi-phase, and full of pass-through costs. Invoala keeps every phase billable and every line understandable.",
    sections: [
      {
        heading: "Milestone billing for long projects",
        body: "A website build can run for months. Instead of one giant invoice at the end, bill per phase — discovery, design, build, launch. Your cash flow stays healthy and the client only ever approves a manageable amount.",
      },
      {
        heading: "Deliverables as line items",
        body: "Designers sell deliverables, not vague 'work'. List wireframes, screen designs, or custom features as lines with their own price. When the scope is visible, revisions and additions become new lines instead of arguments.",
      },
      {
        heading: "Pass-through costs, clearly labeled",
        body: "Hosting, domains, and licenses you pay on the client's behalf belong on their own line — labeled pass-through, with receipts where helpful. It keeps your profit visible and the client's trust intact.",
      },
      {
        heading: "Maintenance retainers after launch",
        body: "Post-launch care is natural retainer territory: a fixed monthly amount for updates and support. A recurring monthly invoice is easier for the client to budget than surprise bills.",
      },
    ],
    sampleItems: [
      { description: "Phase 1 — wireframes & discovery", quantity: 1, rate: 800 },
      { description: "UI design — 10 screens", quantity: 10, rate: 90 },
      { description: "Hosting & domain — annual (pass-through)", quantity: 1, rate: 130 },
    ],
    challenges: [
      "Cash flow gaps between long project phases",
      "Clients treating revisions as unlimited",
      "Hosting bills buried inside the final invoice",
    ],
    checklist: [
      "Take a deposit before starting",
      "Invoice each milestone as it completes",
      "Define revision rounds in writing",
      "Label pass-through costs clearly",
      "Offer a maintenance retainer at launch",
    ],
    faqs: [
      {
        question: "What percentage should my deposit be?",
        answer:
          "20–50% is common for design work. It covers your first phase of effort and filters out clients who aren't serious.",
      },
      {
        question: "How do I stop unlimited revisions?",
        answer:
          "Agree a revision allowance (e.g., two rounds) in writing before starting, and invoice anything beyond it as a new line item.",
      },
      {
        question: "Can I mix fixed phases and hourly work?",
        answer:
          "Yes — quote fixed phases and add hourly lines (e.g., 'extra development — 6 hours') when the work falls outside the agreed scope.",
      },
    ],
    related: [
      { label: "Web development invoice template", href: "/templates/web-development-invoice" },
      { label: "Design invoice template", href: "/templates/design-invoice" },
      { label: "Invoicing for freelancers", href: "/invoicing-for-freelancers" },
    ],
  },
  {
    slug: "invoicing-for-cleaning-businesses",
    name: "Cleaning Businesses",
    metaTitle: "Invoicing for Cleaning Businesses — Per Visit or Package | Invoala",
    description:
      "Cleaning business invoicing for one-off cleans and regular packages. Bill by the hour or per visit, with add-ons itemized.",
    intro:
      "Cleaning businesses run on repeat customers and reliable billing. A simple, itemized invoice — the same every week or month — is what turns a good clean into a paid one.",
    sections: [
      {
        heading: "Hourly or per-visit pricing",
        body: "If job sizes vary, bill by the hour: technicians × hours × rate, all on one line. If your jobs are consistent, a fixed per-visit or package rate is simpler for clients to approve and budget.",
      },
      {
        heading: "Regular clients, regular invoices",
        body: "Weekly and monthly clients expect the same amount at the same time. A repeatable invoice format makes the billing cycle frictionless — the client knows the drill and pays without a second thought.",
      },
      {
        heading: "Add-ons as their own lines",
        body: "Oven cleans, window washes, and extra supplies should never be silently absorbed into the base price. Itemize them — the client sees exactly what they're paying for and you get paid for the extra work.",
      },
      {
        heading: "Addresses that match jobs",
        body: "Add the property address to every invoice. It maps each bill to a physical job, which matters when one client has multiple properties or when you clean for property managers.",
      },
    ],
    sampleItems: [
      { description: "Weekly clean — 2 technicians × 2 hours", quantity: 4, rate: 32 },
      { description: "Oven deep clean — add-on", quantity: 1, rate: 45 },
      { description: "Supplies", quantity: 1, rate: 10 },
    ],
    challenges: [
      "Weekly clients paying late or inconsistently",
      "Extra services added without being billed",
      "Multiple properties getting mixed up",
    ],
    checklist: [
      "Show hours × technicians × rate clearly",
      "Bill regulars on a fixed schedule",
      "Itemize every add-on",
      "Reference the property address",
      "Send reminders before payment is due",
    ],
    faqs: [
      {
        question: "Should I charge a cancellation fee?",
        answer:
          "Many cleaning businesses charge a fee for late cancellations. If you do, state it in your terms and reference it in your invoice notes.",
      },
      {
        question: "How do I bill property managers?",
        answer:
          "Invoice per property with the address on each invoice, or per portfolio with a list in the notes. Property managers appreciate invoices that map cleanly to their ledgers.",
      },
      {
        question: "Do cleaning businesses need to charge tax?",
        answer:
          "It depends on your country and registration status. Check with your local tax authority — don't assume.",
      },
    ],
    related: [
      { label: "Cleaning invoice template", href: "/templates/cleaning-invoice" },
      { label: "Invoice reminders", href: "/invoice-reminders" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  },
  {
    slug: "invoicing-for-startups",
    name: "Startups",
    metaTitle: "Invoicing for Startups — B2B Billing That Scales | Invoala",
    description:
      "Startup invoicing for B2B sales, contractors, and early teams. Get invoices out fast, keep records clean, and add team billing as you grow.",
    intro:
      "Early-stage startups bill for their first services, manage contractors, and need records that look credible to investors and accountants from day one. Invoala keeps billing fast without a finance hire.",
    sections: [
      {
        heading: "First revenue, proper paperwork",
        body: "The first invoices you send set the tone for your financial records. Sequential numbers, clean PDFs, and tracked payment status give you a ledger that survives due diligence — even before you have a finance function.",
      },
      {
        heading: "B2B clients expect real invoices",
        body: "Corporate clients won't pay from a casual email. They need an invoice with your company details, their PO number, correct tax, and professional formatting. A branded invoice makes your startup look established.",
      },
      {
        heading: "Contractors and early team billing",
        body: "Until you have payroll, contractors send you invoices and you send invoices to clients. On a Teams plan, your small team shares a client book so billing doesn't depend on one person's head.",
      },
      {
        heading: "Funding-ready records",
        body: "Investors ask what you've billed and collected. With every invoice tracked as draft, sent, or paid, you can answer from a dashboard instead of a spreadsheet you stopped updating.",
      },
    ],
    sampleItems: [
      { description: "Implementation & onboarding (per SOW)", quantity: 1, rate: 1500 },
      { description: "Platform license — first 3 seats", quantity: 3, rate: 99 },
      { description: "Priority support add-on", quantity: 1, rate: 100 },
    ],
    challenges: [
      "No finance person to own the billing process",
      "Corporate clients demanding PO numbers and tax details",
      "Records that don't hold up when investors ask",
    ],
    checklist: [
      "Use your legal company name and address on invoices",
      "Reference the client's PO number in the notes",
      "Number invoices sequentially from day one",
      "Track payment status for every invoice",
      "Add team billing before it becomes a bottleneck",
    ],
    faqs: [
      {
        question: "Should startups do their own invoicing?",
        answer:
          "Until you have volume or complex subscription billing, a simple invoicing tool is the right size. It keeps records clean without the overhead of a finance stack.",
      },
      {
        question: "What do B2B clients need on an invoice?",
        answer:
          "Your registered company details, their PO or reference number, itemized services, correct tax, and your payment details. Corporate payables teams will send it back if anything's missing.",
      },
      {
        question: "Can a small team share the client book?",
        answer:
          "Yes — Teams plans support up to five members with shared clients and role-based permissions.",
      },
    ],
    related: [
      { label: "Invoicing software", href: "/invoicing-software" },
      { label: "Online invoicing", href: "/online-invoicing" },
      { label: "Invoice payment tracking", href: "/invoice-payment-tracking" },
    ],
  },
];

export const SOLUTIONS_BY_SLUG = Object.fromEntries(SOLUTIONS.map((s) => [s.slug, s]));
