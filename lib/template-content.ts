import { newId, type Invoice } from "@/lib/invoice";

export type TemplateDef = {
  slug: string;
  name: string;
  metaTitle: string;
  description: string;
  whenToUse: string;
  fields: string[];
  sampleItems: { description: string; quantity: number; rate: number }[];
  tips: string[];
  faqs: { question: string; answer: string }[];
  related: { label: string; href: string }[];
  preset: Partial<Invoice>;
};

function template(
  def: Omit<TemplateDef, "preset"> & { notes?: string; currency?: string }
): TemplateDef {
  return {
    ...def,
    preset: {
      invoiceNumber: "INV-001",
      currency: def.currency ?? "USD",
      items: def.sampleItems.map((item) => ({ id: newId(), ...item })),
      notes: def.notes ?? "Payment due within 14 days. Thank you for your business!",
    },
  };
}

export const TEMPLATES: TemplateDef[] = [
  template({
    slug: "freelance-invoice",
    name: "Freelance Invoice",
    metaTitle: "Freelance Invoice Template — Free & Editable | Invoala",
    description:
      "A simple, professional invoice template for freelancers billing by the hour or per project. No sign-up needed to fill it in and download.",
    whenToUse:
      "Use this template whenever you complete a freelance job: hourly work, fixed-fee projects, or a mix of both. It keeps every job traceable and makes you look professional from the first invoice.",
    fields: [
      "Your business name, email, and address",
      "Client name and contact details",
      "Invoice number and issue date",
      "A line per service with quantity and rate",
      "Payment terms and due date",
    ],
    sampleItems: [
      { description: "Logo design — 8 hours at $60/hr", quantity: 8, rate: 60 },
      { description: "Brand style guide — fixed fee", quantity: 1, rate: 350 },
      { description: "Client revisions (included)", quantity: 1, rate: 0 },
    ],
    tips: [
      "Itemize every deliverable — vague invoices get paid slower.",
      "Agree on payment terms before the work starts, not after.",
      "Send the invoice the day the work is done.",
    ],
    faqs: [
      {
        question: "What should a freelance invoice include?",
        answer:
          "Your details, the client's details, a unique invoice number, the work performed as line items, the total due, and clear payment terms with a due date.",
      },
      {
        question: "How do freelancers usually get paid?",
        answer:
          "Bank transfer is the most common. You can also add your PayPal or other payment details to the notes section of the invoice so the client has everything in one place.",
      },
      {
        question: "Is this template free to use?",
        answer:
          "Yes — fill it in, preview it, and download a print-ready PDF. No watermark and no account required.",
      },
    ],
    related: [
      { label: "Invoicing for freelancers", href: "/invoicing-for-freelancers" },
      { label: "How to create an invoice for freelance work", href: "/learn/how-to-create-an-invoice-for-freelance-work" },
      { label: "Hourly rate calculator", href: "/tools/hourly-rate-calculator" },
    ],
  }),
  template({
    slug: "consulting-invoice",
    name: "Consulting Invoice",
    metaTitle: "Consulting Invoice Template — Free & Editable | Invoala",
    description:
      "A clean consulting invoice template for retainer work, strategy sessions, and advisory engagements. Add your rate card and bill in minutes.",
    whenToUse:
      "Use this template for consulting and advisory work — monthly retainers, one-off strategy sessions, or milestone billing. It works equally well for solo consultants and small advisory firms.",
    fields: [
      "Consultant and client details",
      "Billing period or engagement reference",
      "Line items per service or session",
      "Retainer or hourly rate",
      "Tax where applicable",
    ],
    sampleItems: [
      { description: "Strategy session — 90 minutes", quantity: 1.5, rate: 150 },
      { description: "Monthly retainer — advisory support", quantity: 1, rate: 1200 },
      { description: "Follow-up report and recommendations", quantity: 1, rate: 300 },
    ],
    tips: [
      "Reference the engagement or purchase order number if the client uses one.",
      "For retainers, state the period covered on the invoice.",
      "Bill at the start of a retainer period, not the end.",
    ],
    faqs: [
      {
        question: "How do consultants bill for retainers?",
        answer:
          "Most bill a fixed monthly amount at the start of the month, using the same line items each period. You can reuse a saved invoice in Invoala to avoid re-creating it.",
      },
      {
        question: "Should I charge for phone calls and emails?",
        answer:
          "Decide on a policy and state it in your agreement. Many consultants include them in a retainer, while hourly consultants track and bill them as time.",
      },
      {
        question: "Do consultants need to charge tax?",
        answer:
          "That depends on your jurisdiction, registration status, and the client. Confirm your obligations locally rather than assuming.",
      },
    ],
    related: [
      { label: "Invoicing for consultants", href: "/invoicing-for-consultants" },
      { label: "Recurring invoices", href: "/recurring-invoices" },
      { label: "Invoice tax calculator", href: "/tools/invoice-tax-calculator" },
    ],
  }),
  template({
    slug: "photography-invoice",
    name: "Photography Invoice",
    metaTitle: "Photography Invoice Template — Free & Editable | Invoala",
    description:
      "A photography invoice template for shoots, packages, and print sales. Itemize sessions, editing, and usage rights clearly.",
    whenToUse:
      "Use this template for any photography work — portrait sessions, weddings, events, or commercial shoots. Clear itemization prevents confusion about what the client is paying for.",
    fields: [
      "Photographer and client details",
      "Shoot date and package name",
      "Per-deliverable line items",
      "Usage or license terms if relevant",
      "Deposit already paid (as a credit)",
    ],
    sampleItems: [
      { description: "Studio session — 2 hours", quantity: 1, rate: 250 },
      { description: "Edited digital images (20 included)", quantity: 1, rate: 150 },
      { description: "Extra edited image", quantity: 5, rate: 15 },
    ],
    tips: [
      "List exactly what's included so there are no surprises at delivery.",
      "If you charge a non-refundable booking fee, show it as a deposit credit.",
      "Define usage rights in the notes if the images are for commercial use.",
    ],
    faqs: [
      {
        question: "Should photographers charge before or after the shoot?",
        answer:
          "A common pattern is a deposit to book the date, then the balance on delivery. You can reflect a paid deposit as a credit line on the final invoice.",
      },
      {
        question: "What if the client wants extra images?",
        answer:
          "Add them as separate line items at your per-image rate. Itemizing extras keeps the bill transparent and easier for the client to approve.",
      },
      {
        question: "Can I add a watermark to my invoice?",
        answer:
          "Invoala never adds watermarks to your invoices — the PDF you download is clean and professional.",
      },
    ],
    related: [
      { label: "Invoicing for photographers", href: "/invoicing-for-photographers" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "How to send an invoice", href: "/learn/how-to-send-an-invoice" },
    ],
  }),
  template({
    slug: "contractor-invoice",
    name: "Contractor Invoice",
    metaTitle: "Contractor Invoice Template — Free & Editable | Invoala",
    description:
      "A contractor invoice template for labor and materials. Break out hours, materials, and any deposits so every line is accounted for.",
    whenToUse:
      "Use this template for construction, renovation, maintenance, and handyman jobs. Splitting labor from materials makes it easy for clients to verify the work and for you to keep records.",
    fields: [
      "Contractor and client details",
      "Job site or project reference",
      "Labor broken out from materials",
      "Permits or fees as their own line",
      "Deposit applied as a credit",
    ],
    sampleItems: [
      { description: "Labor — 2 technicians, 3 days", quantity: 24, rate: 55 },
      { description: "Materials (receipts attached)", quantity: 1, rate: 480 },
      { description: "Waste disposal fee", quantity: 1, rate: 60 },
    ],
    tips: [
      "Attach or reference receipts for materials — it builds trust and helps disputes.",
      "Reference the job site address so the invoice matches the quote.",
      "Show any deposit already paid as a credit line.",
    ],
    faqs: [
      {
        question: "Should I bill before or after the job?",
        answer:
          "Many contractors take a deposit before starting and bill the balance on completion. Milestone billing works well for longer projects.",
      },
      {
        question: "How do I handle change orders?",
        answer:
          "Send an updated estimate before doing extra work, then reflect the approved changes on the final invoice. Written approval avoids arguments later.",
      },
      {
        question: "Is my invoice legally binding?",
        answer:
          "An invoice records an amount due under your agreement. For it to be enforceable, the underlying agreement and terms should be in writing — a template alone isn't a contract.",
      },
    ],
    related: [
      { label: "Invoicing for contractors", href: "/invoicing-for-contractors" },
      { label: "Estimates vs invoices", href: "/estimates-and-invoices" },
      { label: "Late payment calculator", href: "/tools/late-payment-calculator" },
    ],
  }),
  template({
    slug: "design-invoice",
    name: "Design Invoice",
    metaTitle: "Design Invoice Template — Free & Editable | Invoala",
    description:
      "A designer's invoice template for UI/UX, branding, and creative projects. Bill per phase or per deliverable with clear scope.",
    whenToUse:
      "Use this template for design work — branding, UI/UX, print, or illustration. Billing per phase or per deliverable keeps large projects transparent.",
    fields: [
      "Designer and client details",
      "Project and phase reference",
      "Line items per deliverable",
      "Revision allowance",
      "Payment milestones",
    ],
    sampleItems: [
      { description: "Discovery & wireframes — fixed phase", quantity: 1, rate: 900 },
      { description: "UI design — 12 screens", quantity: 12, rate: 85 },
      { description: "Developer handoff & file prep", quantity: 1, rate: 200 },
    ],
    tips: [
      "Invoice per phase (discovery, design, delivery) for larger projects.",
      "State the revision allowance in the notes — unlimited revisions are a project killer.",
      "Ask for a deposit before the first phase.",
    ],
    faqs: [
      {
        question: "Should designers bill hourly or per project?",
        answer:
          "Both work. Fixed pricing is easier for clients to approve; hourly reflects real effort. Many designers price fixed phases backed by an internal hourly estimate.",
      },
      {
        question: "How do I avoid scope creep on invoices?",
        answer:
          "Define the deliverables and revision rounds in writing before starting, and quote anything outside that scope as a separate line item.",
      },
      {
        question: "Can I send a design invoice as a PDF?",
        answer:
          "Yes — download the print-ready PDF from Invoala and email it to your client directly.",
      },
    ],
    related: [
      { label: "Invoicing for web designers", href: "/invoicing-for-web-designers" },
      { label: "Invoice template generator", href: "/tools/invoice-template-generator" },
      { label: "Profit margin calculator", href: "/tools/profit-margin-calculator" },
    ],
  }),
  template({
    slug: "marketing-invoice",
    name: "Marketing Invoice",
    metaTitle: "Marketing Invoice Template — Free & Editable | Invoala",
    description:
      "A marketing agency invoice template for campaigns, retainers, and monthly services. Separate ad spend from management fees.",
    whenToUse:
      "Use this template for marketing services — campaigns, content, SEO, or monthly retainers. Splitting ad spend from management fees is essential for trust.",
    fields: [
      "Agency and client details",
      "Campaign or month reference",
      "Management fees as line items",
      "Ad spend passed through (clearly labeled)",
      "Reporting and deliverables",
    ],
    sampleItems: [
      { description: "Monthly campaign management", quantity: 1, rate: 900 },
      { description: "Ad spend — passed through (receipts attached)", quantity: 1, rate: 1500 },
      { description: "Monthly performance report", quantity: 1, rate: 150 },
    ],
    tips: [
      "Always itemize ad spend separately from your fees.",
      "Bill retainers at the start of the month.",
      "Include the reporting date range so the client can match the invoice to results.",
    ],
    faqs: [
      {
        question: "Should ad spend be marked up?",
        answer:
          "It's your policy — some agencies pass spend through at cost, others add a margin. Just label it clearly on the invoice so there's no confusion.",
      },
      {
        question: "What should a marketing retainer include?",
        answer:
          "A fixed scope of work (channels, deliverables, meetings) for a fixed monthly fee. Invoice the same amount each month and adjust only by written agreement.",
      },
      {
        question: "Do agencies need receipts for ad spend?",
        answer:
          "Attaching or referencing platform receipts makes pass-through spend verifiable and prevents disputes at billing time.",
      },
    ],
    related: [
      { label: "Invoicing for agencies", href: "/invoicing-for-agencies" },
      { label: "Recurring invoices", href: "/recurring-invoices" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  }),
  template({
    slug: "cleaning-invoice",
    name: "Cleaning Invoice",
    metaTitle: "Cleaning Invoice Template — Free & Editable | Invoala",
    description:
      "A cleaning business invoice template for one-off cleans, regular visits, and packages. Bill clearly for time, frequency, and any add-ons.",
    whenToUse:
      "Use this template for residential or commercial cleaning — one-off deep cleans, weekly or monthly visits, or package pricing. Simple, itemized invoices are easy for clients to approve and pay.",
    fields: [
      "Your business and client details",
      "Property address being cleaned",
      "Date and type of clean",
      "Hours or package rate",
      "Add-ons and supplies",
    ],
    sampleItems: [
      { description: "Standard clean — 2 technicians, 2 hours", quantity: 4, rate: 30 },
      { description: "Oven deep clean — add-on", quantity: 1, rate: 45 },
      { description: "Supplies (eco products)", quantity: 1, rate: 12 },
    ],
    tips: [
      "Billing by the hour? Show hours × rate per technician.",
      "For regular clients, offer a fixed weekly or monthly package rate.",
      "Add the property address so the invoice maps to the job.",
    ],
    faqs: [
      {
        question: "Should I charge per hour or per visit?",
        answer:
          "Per-visit package pricing is easier for clients to understand; hourly rates work when job sizes vary. Many cleaners offer both.",
      },
      {
        question: "How do I bill regular cleaning clients?",
        answer:
          "Set a fixed rate per visit and invoice on a schedule (weekly or monthly). A consistent invoice amount each period makes payments predictable.",
      },
      {
        question: "Do I need to charge tax on cleaning services?",
        answer:
          "It depends on your country and registration status. Check with your local tax authority or a professional.",
      },
    ],
    related: [
      { label: "Invoicing for cleaning businesses", href: "/invoicing-for-cleaning-businesses" },
      { label: "Free invoice generator", href: "/invoice-generator" },
      { label: "Invoice reminders", href: "/invoice-reminders" },
    ],
  }),
  template({
    slug: "web-development-invoice",
    name: "Web Development Invoice",
    metaTitle: "Web Development Invoice Template — Free & Editable | Invoala",
    description:
      "A web development invoice template for builds, maintenance, and milestone billing. Itemize development phases, hosting, and extras.",
    whenToUse:
      "Use this template for web development work — website builds, feature development, or ongoing maintenance. Milestone billing keeps cash flow steady on longer projects.",
    fields: [
      "Developer and client details",
      "Project and milestone reference",
      "Line items per development phase",
      "Hosting, domains, and licenses (if billed by you)",
      "Maintenance agreements",
    ],
    sampleItems: [
      { description: "Phase 1 — build & setup (of 3)", quantity: 1, rate: 1500 },
      { description: "Custom feature: booking module", quantity: 1, rate: 800 },
      { description: "Hosting & domain — annual", quantity: 1, rate: 120 },
    ],
    tips: [
      "Invoice per milestone (e.g., build, content, launch) for long projects.",
      "Separate pass-through costs (hosting, domains) from your labor.",
      "If you run a maintenance retainer, bill it monthly in arrears or advance — and say which.",
    ],
    faqs: [
      {
        question: "Should developers take a deposit?",
        answer:
          "A 20–50% deposit before starting is standard practice and protects you if the project is cancelled early.",
      },
      {
        question: "How do I bill milestone payments?",
        answer:
          "Agree on milestones in writing (e.g., setup, build, content, launch) and invoice each one as it's reached. Invoala lets you number and track each invoice.",
      },
      {
        question: "What about hosting bills I pay on the client's behalf?",
        answer:
          "Pass them through as clearly labeled line items with receipts or references, exactly like ad spend in marketing.",
      },
    ],
    related: [
      { label: "Invoicing for web designers", href: "/invoicing-for-web-designers" },
      { label: "Recurring invoices", href: "/recurring-invoices" },
      { label: "Invoice number generator", href: "/tools/invoice-number-generator" },
    ],
  }),
  template({
    slug: "retainer-invoice",
    name: "Retainer Invoice",
    metaTitle: "Retainer Invoice Template — Free & Editable | Invoala",
    description:
      "A retainer invoice template for monthly services. Bill a fixed amount for a defined scope of work, month after month, without friction.",
    whenToUse:
      "Use this template whenever you charge a client a recurring monthly (or quarterly) fee for ongoing services — marketing, development, consulting, or design retainers.",
    fields: [
      "Your details and the client's details",
      "The billing period covered",
      "A fixed retainer line item",
      "The scope summary in notes",
      "Any overage or add-on lines",
    ],
    sampleItems: [
      { description: "Monthly retainer — August (as agreed)", quantity: 1, rate: 2500 },
      { description: "Overage — 3 extra hours", quantity: 3, rate: 75 },
    ],
    tips: [
      "State the period covered (e.g., 'August 2026') on every retainer invoice.",
      "Describe the included scope in the notes so expectations stay aligned.",
      "Bill the same amount each month unless the scope changes in writing.",
    ],
    faqs: [
      {
        question: "What is a retainer invoice?",
        answer:
          "A retainer invoice bills a recurring fee for reserved capacity or ongoing services — typically a fixed monthly amount for a defined scope of work.",
      },
      {
        question: "Should I bill retainers in advance or arrears?",
        answer:
          "In advance is common: the client pays for the upcoming month, so you're never working on credit. State your preference in the agreement.",
      },
      {
        question: "How do I handle hours above the retainer?",
        answer:
          "Agree on an overage rate in advance and invoice anything above the included hours as a separate line item, as shown in the example above.",
      },
    ],
    related: [
      { label: "Recurring invoices", href: "/recurring-invoices" },
      { label: "Invoicing for consultants", href: "/invoicing-for-consultants" },
      { label: "Invoicing for agencies", href: "/invoicing-for-agencies" },
    ],
  }),
  template({
    slug: "landscaping-invoice",
    name: "Landscaping Invoice",
    metaTitle: "Landscaping Invoice Template — Free & Editable | Invoala",
    description:
      "A landscaping invoice template for lawn care, garden design, and outdoor maintenance work. Itemize services, materials, and seasonal packages.",
    whenToUse:
      "Use this template for lawn mowing, garden maintenance, hardscaping, planting, or any outdoor work — whether you bill per visit, per project, or per season.",
    fields: [
      "Your business details and logo",
      "Client name and property address",
      "Services performed, with quantities and rates",
      "Materials used (plants, mulch, stone)",
      "Payment terms and due date",
    ],
    sampleItems: [
      { description: "Lawn mowing & edging — weekly service", quantity: 1, rate: 65 },
      { description: "Hedge trimming (front & back)", quantity: 2, rate: 45 },
      { description: "Mulch installation — 4 cubic yards", quantity: 4, rate: 35 },
    ],
    tips: [
      "List materials separately from labor so clients see exactly what they're paying for.",
      "Add the service address as a custom field when it differs from the billing address.",
      "Offer seasonal packages as single line items — they invoice faster than itemized visits.",
    ],
    faqs: [
      {
        question: "Should landscaping invoices include materials?",
        answer:
          "Yes — separate lines for labor and materials make the invoice transparent and reduce disputes about costs. Include quantities where possible.",
      },
      {
        question: "How do I bill recurring lawn maintenance?",
        answer:
          "One invoice per visit or one monthly invoice covering all visits that month. The Invoala recurring setting lets you label either pattern.",
      },
      {
        question: "Can I add before/after photos to the invoice?",
        answer:
          "Photos can't be embedded in the invoice itself, but you can add a project reference as a custom field or send photos alongside the invoice email.",
      },
    ],
    related: [
      { label: "Invoicing for cleaning businesses", href: "/invoicing-for-cleaning-businesses" },
      { label: "Invoicing for small businesses", href: "/invoicing-for-small-businesses" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  }),
  template({
    slug: "construction-invoice",
    name: "Construction Invoice",
    metaTitle: "Construction Invoice Template — Free & Editable | Invoala",
    description:
      "A construction invoice template for contractors and builders. Track labor, materials, equipment, and progress payments with professional formatting.",
    whenToUse:
      "Use this template for remodeling, renovation, or new-build work. It works for fixed contracts and time-and-materials billing, including progress payments.",
    fields: [
      "Contractor details and license number",
      "Client and job site details",
      "Labor, materials, and equipment line items",
      "Retention or deposit notes",
      "Payment schedule reference",
    ],
    sampleItems: [
      { description: "Framing labor — week 3", quantity: 40, rate: 55 },
      { description: "Lumber package (per quote)", quantity: 1, rate: 4200 },
      { description: "Skid steer rental — 5 days", quantity: 5, rate: 240 },
    ],
    tips: [
      "Add your license number as a custom field — many jurisdictions require it on invoices.",
      "For progress payments, label each invoice 'Payment 2 of 4' in the notes.",
      "Keep materials on separate lines from labor for easier approval.",
    ],
    faqs: [
      {
        question: "What is a progress payment invoice?",
        answer:
          "An invoice for a portion of the contract value, issued at defined milestones. It references the total contract and the completed percentage or phase.",
      },
      {
        question: "Should I charge for equipment on construction invoices?",
        answer:
          "Yes, as its own line item. Clients approve invoices faster when equipment, materials, and labor are clearly separated.",
      },
      {
        question: "How do I handle retainage?",
        answer:
          "Note the withheld amount in the invoice notes or as a negative line item, and reference the contract clause so the client knows why it's held.",
      },
    ],
    related: [
      { label: "Invoicing for contractors", href: "/invoicing-for-contractors" },
      { label: "Estimate generator", href: "/estimate-generator" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  }),
  template({
    slug: "real-estate-invoice",
    name: "Real Estate Invoice",
    metaTitle: "Real Estate Invoice Template — Free & Editable | Invoala",
    description:
      "A real estate invoice template for agents, brokers, and property managers. Bill commissions, management fees, and property services cleanly.",
    whenToUse:
      "Use this template for commission billing, property management fees, inspections, or maintenance coordination. Works for agencies and solo agents alike.",
    fields: [
      "Agency name and agent license",
      "Client and property address",
      "Commission or fee line items",
      "Transaction or listing reference",
      "Payment terms",
    ],
    sampleItems: [
      { description: "Sales commission — 3% of $425,000 sale", quantity: 1, rate: 12750 },
      { description: "Property management fee — June", quantity: 1, rate: 220 },
      { description: "Inspection coordination", quantity: 1, rate: 150 },
    ],
    tips: [
      "Reference the property address and transaction number on every invoice.",
      "Bill commissions promptly after closing — they're easily forgotten in the post-sale rush.",
      "Use separate lines when splitting fees across services or properties.",
    ],
    faqs: [
      {
        question: "Who pays the agent's invoice — buyer or seller?",
        answer:
          "Depends on the agreement. Commissions are typically paid from proceeds at closing, while management fees are billed to the property owner. Bill whoever your agreement names.",
      },
      {
        question: "Are commission invoices taxable?",
        answer:
          "In most jurisdictions yes — commissions are business income. Use the tax field to apply your local rate and consult an accountant for specifics.",
      },
      {
        question: "What details should a property management invoice include?",
        answer:
          "The property address, service period, management fee, and any pass-through costs like repairs or utilities, each on its own line.",
      },
    ],
    related: [
      { label: "Invoicing for small businesses", href: "/invoicing-for-small-businesses" },
      { label: "What is a tax invoice?", href: "/learn/what-is-a-tax-invoice" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  }),
  template({
    slug: "beauty-invoice",
    name: "Beauty & Salon Invoice",
    metaTitle: "Beauty Salon Invoice Template — Free & Editable | Invoala",
    description:
      "A beauty and salon invoice template for hairdressers, estheticians, and studios. Bill services, products, and packages with a polished, client-friendly layout.",
    whenToUse:
      "Use this template for salon services, spa treatments, makeup, or retail product sales — for walk-in clients, wedding parties, or wholesale orders.",
    fields: [
      "Salon name and contact details",
      "Client name",
      "Services with stylist or duration notes",
      "Retail products sold",
      "Tips or gratuity line if applicable",
    ],
    sampleItems: [
      { description: "Balayage & toner", quantity: 1, rate: 180 },
      { description: "Cut & style", quantity: 1, rate: 65 },
      { description: "Deep conditioning treatment", quantity: 1, rate: 35 },
    ],
    tips: [
      "Note the stylist's name on the line item — clients ask for the same person next time.",
      "List retail products separately so the service total stays clear.",
      "For group bookings (weddings, parties), one invoice with a per-person breakdown works best.",
    ],
    faqs: [
      {
        question: "Should I put tips on the invoice?",
        answer:
          "If gratuity is charged as part of the service (common for group bookings), add it as a line item. Otherwise tips are paid directly and don't belong on the invoice.",
      },
      {
        question: "Do salons need to charge tax on services?",
        answer:
          "In most jurisdictions, yes — both services and retail products are usually taxable. Use the tax field with your local rate and check with your accountant.",
      },
      {
        question: "Can I use this for wholesale product orders?",
        answer:
          "Yes — list products with quantities and prices. Add a purchase order reference as a custom field if the buyer requires one.",
      },
    ],
    related: [
      { label: "Invoicing for small businesses", href: "/invoicing-for-small-businesses" },
      { label: "Receipt generator", href: "/receipt-generator" },
      { label: "Free invoice generator", href: "/invoice-generator" },
    ],
  }),
  template({
    slug: "restaurant-invoice",
    name: "Restaurant & Catering Invoice",
    metaTitle: "Restaurant & Catering Invoice Template — Free & Editable | Invoala",
    description:
      "A restaurant and catering invoice template for events, wholesale orders, and corporate accounts. Itemize menus, headcounts, and deposits.",
    whenToUse:
      "Use this template for catering events, corporate accounts, or wholesale deliveries — anywhere a restaurant bills on terms instead of at the table.",
    fields: [
      "Restaurant name and contact",
      "Client and event details",
      "Menu packages with guest counts",
      "Beverage, staffing, and rental lines",
      "Deposit paid and balance due",
    ],
    sampleItems: [
      { description: "Wedding buffet — 80 guests @ $55", quantity: 80, rate: 55 },
      { description: "Open bar package (4 hours)", quantity: 1, rate: 1200 },
      { description: "Service staff — 3 servers", quantity: 3, rate: 180 },
    ],
    tips: [
      "Show the deposit as a discount line or note it in the payment section so the balance is obvious.",
      "Always put the event date and guest count on the invoice.",
      "Agree on final headcount deadlines before issuing the invoice.",
    ],
    faqs: [
      {
        question: "How do catering deposits work on invoices?",
        answer:
          "Show the full event total, then subtract the deposit already paid — either as a discount percentage or a clearly labeled negative line, with the balance marked as due.",
      },
      {
        question: "Should gratuity be on catering invoices?",
        answer:
          "If your contract adds a service charge, include it as a line item. Otherwise leave it off and let the client decide at the event.",
      },
      {
        question: "When should the final catering invoice be sent?",
        answer:
          "Most caterers invoice the balance after the event once final headcount is known. Pre-event invoicing is also common if the contract requires it.",
      },
    ],
    related: [
      { label: "Invoicing for small businesses", href: "/invoicing-for-small-businesses" },
      { label: "Estimate generator", href: "/estimate-generator" },
      { label: "Receipt generator", href: "/receipt-generator" },
    ],
  }),
  template({
    slug: "repair-invoice",
    name: "Repair & Maintenance Invoice",
    metaTitle: "Repair Service Invoice Template — Free & Editable | Invoala",
    description:
      "A repair and maintenance invoice template for technicians and service businesses. Bill labor, parts, and call-out fees with a clear, professional layout.",
    whenToUse:
      "Use this template for appliance repair, HVAC service, auto repair, or general handyman work — any job with labor plus parts.",
    fields: [
      "Your business details",
      "Client and service location",
      "Diagnosis or service performed",
      "Labor hours and rate",
      "Parts with quantities",
    ],
    sampleItems: [
      { description: "Diagnostic & repair labor — 2.5 hours", quantity: 2.5, rate: 85 },
      { description: "Replacement compressor (part #CP-3200)", quantity: 1, rate: 410 },
      { description: "Call-out fee", quantity: 1, rate: 60 },
    ],
    tips: [
      "Include part numbers so warranty claims and re-orders are easy.",
      "Describe the diagnosis — clients approve invoices faster when they understand the fix.",
      "Note warranty terms on parts and labor in the invoice notes.",
    ],
    faqs: [
      {
        question: "Should I charge a call-out fee?",
        answer:
          "Common for field service. List it separately from labor so the client sees what the trip costs, and mention whether it's credited toward the repair.",
      },
      {
        question: "How detailed should the repair description be?",
        answer:
          "One clear line is enough — 'replaced thermostat, tested operation' beats a paragraph. Save the full explanation for the work order.",
      },
      {
        question: "What about warranty on repairs?",
        answer:
          "State it in the notes: e.g., '90-day warranty on parts and labor.' Being explicit prevents disputes later.",
      },
    ],
    related: [
      { label: "Invoicing for contractors", href: "/invoicing-for-contractors" },
      { label: "Work order — free invoice generator", href: "/invoice-generator" },
      { label: "Receipt generator", href: "/receipt-generator" },
    ],
  }),
];

export const TEMPLATES_BY_SLUG = Object.fromEntries(TEMPLATES.map((t) => [t.slug, t]));
