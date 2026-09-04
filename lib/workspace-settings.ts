// Unified "General settings" backing store for both workspace kinds:
// Personal (a user acting alone, backed by columns on `users`) and Team
// (backed by the richer columns added to `teams`). One shape, one set of
// functions — the Settings → General tab and the invoice/quote creation
// paths both go through this instead of branching on scope everywhere.
import { dbGet, dbRun } from "@/lib/db";
import { getTeamRole } from "@/lib/teams";
import { canManageTeamSettings } from "@/lib/permissions";

export type WorkspaceScope =
  | { type: "personal"; userId: string }
  | { type: "team"; teamId: string };

export type WorkspaceSettings = {
  scopeType: "personal" | "team";
  name: string; // account name (personal) or team name
  businessName: string;
  legalBusinessName: string;
  businessEmail: string;
  phone: string;
  website: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  businessRegNumber: string;
  logo: string;
  brandColor: string;
  showLogoOnDocuments: boolean;
  businessNameDisplay: "business_name" | "legal_business_name";
  defaultCurrency: string;
  dateFormat: string;
  timezone: string;
  language: string;
  defaultTaxRate: number | null;
  defaultNotes: string;
  defaultPaymentInstructions: string;
  defaultPaymentTermsDays: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  // Team-only richness — null for a personal workspace, which keeps its
  // numbering to invoices only (see the module comment above).
  quotePrefix: string | null;
  nextQuoteNumber: number | null;
  quoteValidityDays: number | null;
  defaultQuoteNotes: string | null;
  receiptPrefix: string | null;
  nextReceiptNumber: number | null;
  invoiceEmailSubject: string | null;
  quoteEmailSubject: string | null;
  receiptEmailSubject: string | null;
  showPdfAttachment: boolean | null;
  includePaymentLink: boolean | null;
  includeBusinessContact: boolean | null;
};

type UserSettingsRow = {
  name: string;
  business_name: string;
  business_email: string;
  business_address: string;
  business_logo: string;
  business_phone: string;
  business_website: string;
  timezone: string;
  invoice_prefix: string;
  next_invoice_number: number;
  default_payment_terms_days: number;
  default_tax_rate: number | null;
  default_notes: string;
  default_payment_instructions: string;
};

type TeamSettingsRow = {
  name: string;
  business_name: string;
  legal_business_name: string;
  business_email: string;
  phone: string;
  website: string;
  business_address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  tax_number: string;
  business_reg_number: string;
  logo: string;
  brand_color: string;
  show_logo_on_documents: number;
  business_name_display: string;
  default_currency: string;
  date_format: string;
  timezone: string;
  language: string;
  default_tax_rate: number | null;
  default_notes: string;
  default_payment_instructions: string;
  default_payment_terms_days: number;
  invoice_prefix: string;
  next_invoice_number: number;
  quote_prefix: string;
  next_quote_number: number;
  quote_validity_days: number;
  default_quote_notes: string;
  receipt_prefix: string;
  next_receipt_number: number;
  invoice_email_subject: string;
  quote_email_subject: string;
  receipt_email_subject: string;
  show_pdf_attachment: number;
  include_payment_link: number;
  include_business_contact: number;
};

export async function getWorkspaceSettings(scope: WorkspaceScope): Promise<WorkspaceSettings | null> {
  if (scope.type === "personal") {
    const row = await dbGet<UserSettingsRow>(
      `SELECT name, business_name, business_email, business_address, business_logo, business_phone,
        business_website, timezone, invoice_prefix, next_invoice_number, default_payment_terms_days,
        default_tax_rate, default_notes, default_payment_instructions
       FROM users WHERE id = ?`,
      scope.userId,
    );
    if (!row) return null;
    return {
      scopeType: "personal",
      name: row.name,
      businessName: row.business_name,
      legalBusinessName: "",
      businessEmail: row.business_email,
      phone: row.business_phone,
      website: row.business_website,
      businessAddress: row.business_address,
      city: "", state: "", country: "", postalCode: "",
      taxNumber: "", businessRegNumber: "",
      logo: row.business_logo,
      brandColor: "",
      showLogoOnDocuments: true,
      businessNameDisplay: "business_name",
      defaultCurrency: "USD",
      dateFormat: "MM/DD/YYYY",
      timezone: row.timezone,
      language: "en",
      defaultTaxRate: row.default_tax_rate,
      defaultNotes: row.default_notes,
      defaultPaymentInstructions: row.default_payment_instructions,
      defaultPaymentTermsDays: row.default_payment_terms_days,
      invoicePrefix: row.invoice_prefix,
      nextInvoiceNumber: row.next_invoice_number,
      quotePrefix: null, nextQuoteNumber: null, quoteValidityDays: null, defaultQuoteNotes: null,
      receiptPrefix: null, nextReceiptNumber: null,
      invoiceEmailSubject: null, quoteEmailSubject: null, receiptEmailSubject: null,
      showPdfAttachment: null, includePaymentLink: null, includeBusinessContact: null,
    };
  }

  const row = await dbGet<TeamSettingsRow>(
    `SELECT name, business_name, legal_business_name, business_email, phone, website, business_address,
      city, state, country, postal_code, tax_number, business_reg_number, logo, brand_color,
      show_logo_on_documents, business_name_display, default_currency, date_format, timezone, language,
      default_tax_rate, default_notes, default_payment_instructions, default_payment_terms_days,
      invoice_prefix, next_invoice_number, quote_prefix, next_quote_number, quote_validity_days,
      default_quote_notes, receipt_prefix, next_receipt_number, invoice_email_subject, quote_email_subject,
      receipt_email_subject, show_pdf_attachment, include_payment_link, include_business_contact
     FROM teams WHERE id = ?`,
    scope.teamId,
  );
  if (!row) return null;
  return {
    scopeType: "team",
    name: row.name,
    businessName: row.business_name,
    legalBusinessName: row.legal_business_name,
    businessEmail: row.business_email,
    phone: row.phone,
    website: row.website,
    businessAddress: row.business_address,
    city: row.city, state: row.state, country: row.country, postalCode: row.postal_code,
    taxNumber: row.tax_number, businessRegNumber: row.business_reg_number,
    logo: row.logo,
    brandColor: row.brand_color,
    showLogoOnDocuments: !!row.show_logo_on_documents,
    businessNameDisplay: row.business_name_display === "legal_business_name" ? "legal_business_name" : "business_name",
    defaultCurrency: row.default_currency,
    dateFormat: row.date_format,
    timezone: row.timezone,
    language: row.language,
    defaultTaxRate: row.default_tax_rate,
    defaultNotes: row.default_notes,
    defaultPaymentInstructions: row.default_payment_instructions,
    defaultPaymentTermsDays: row.default_payment_terms_days,
    invoicePrefix: row.invoice_prefix,
    nextInvoiceNumber: row.next_invoice_number,
    quotePrefix: row.quote_prefix,
    nextQuoteNumber: row.next_quote_number,
    quoteValidityDays: row.quote_validity_days,
    defaultQuoteNotes: row.default_quote_notes,
    receiptPrefix: row.receipt_prefix,
    nextReceiptNumber: row.next_receipt_number,
    invoiceEmailSubject: row.invoice_email_subject,
    quoteEmailSubject: row.quote_email_subject,
    receiptEmailSubject: row.receipt_email_subject,
    showPdfAttachment: !!row.show_pdf_attachment,
    includePaymentLink: !!row.include_payment_link,
    includeBusinessContact: !!row.include_business_contact,
  };
}

export type WorkspaceSettingsInput = Partial<{
  businessName: string;
  legalBusinessName: string;
  businessEmail: string;
  phone: string;
  website: string;
  businessAddress: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  businessRegNumber: string;
  logo: string;
  brandColor: string;
  showLogoOnDocuments: boolean;
  businessNameDisplay: "business_name" | "legal_business_name";
  defaultCurrency: string;
  dateFormat: string;
  timezone: string;
  language: string;
  defaultTaxRate: number | null;
  defaultNotes: string;
  defaultPaymentInstructions: string;
  defaultPaymentTermsDays: number;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  quotePrefix: string;
  nextQuoteNumber: number;
  quoteValidityDays: number;
  defaultQuoteNotes: string;
  invoiceEmailSubject: string;
  quoteEmailSubject: string;
  receiptEmailSubject: string;
  showPdfAttachment: boolean;
  includePaymentLink: boolean;
  includeBusinessContact: boolean;
}>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i;

export function validateWorkspaceSettings(input: WorkspaceSettingsInput): string | null {
  if (input.businessEmail && !EMAIL_RE.test(input.businessEmail)) return "Enter a valid business email.";
  if (input.website && !URL_RE.test(input.website)) return "Website must be a full URL, e.g. https://example.com.";
  if (input.businessName !== undefined && input.businessName.length > 120) return "Business name is too long.";
  if (input.legalBusinessName && input.legalBusinessName.length > 120) return "Legal business name is too long.";
  if (input.defaultTaxRate != null && (input.defaultTaxRate < 0 || input.defaultTaxRate > 100)) return "Tax rate must be between 0 and 100.";
  return null;
}

// Owner/admin only for a team (members get read-only per spec); a personal
// workspace is always fully editable by its own account — there's no one
// else to restrict.
export async function canEditWorkspaceSettings(scope: WorkspaceScope, actorId: string): Promise<boolean> {
  if (scope.type === "personal") return scope.userId === actorId;
  const role = await getTeamRole(scope.teamId, actorId);
  return !!role && canManageTeamSettings(role);
}

export async function updateWorkspaceSettings(
  scope: WorkspaceScope,
  actorId: string,
  input: WorkspaceSettingsInput,
): Promise<WorkspaceSettings | { error: string }> {
  if (!(await canEditWorkspaceSettings(scope, actorId))) {
    return { error: "You don't have permission to change these settings." };
  }
  const validationError = validateWorkspaceSettings(input);
  if (validationError) return { error: validationError };

  const current = await getWorkspaceSettings(scope);
  if (!current) return { error: "Workspace not found." };

  let result: { changes: number };
  if (scope.type === "personal") {
    result = await dbRun(
      `UPDATE users SET business_name = ?, business_email = ?, business_address = ?, business_logo = ?,
        business_phone = ?, business_website = ?, invoice_prefix = ?, default_payment_terms_days = ?,
        default_tax_rate = ?, default_notes = ?, default_payment_instructions = ? WHERE id = ?`,
      input.businessName ?? current.businessName,
      input.businessEmail ?? current.businessEmail,
      input.businessAddress ?? current.businessAddress,
      input.logo ?? current.logo,
      input.phone ?? current.phone,
      input.website ?? current.website,
      input.invoicePrefix ?? current.invoicePrefix,
      input.defaultPaymentTermsDays ?? current.defaultPaymentTermsDays,
      input.defaultTaxRate !== undefined ? input.defaultTaxRate : current.defaultTaxRate,
      input.defaultNotes ?? current.defaultNotes,
      input.defaultPaymentInstructions ?? current.defaultPaymentInstructions,
      scope.userId,
    );
  } else {
    result = await dbRun(
      `UPDATE teams SET business_name = ?, legal_business_name = ?, business_email = ?, phone = ?, website = ?,
        business_address = ?, city = ?, state = ?, country = ?, postal_code = ?, tax_number = ?,
        business_reg_number = ?, logo = ?, brand_color = ?, show_logo_on_documents = ?, business_name_display = ?,
        default_currency = ?, date_format = ?, timezone = ?, language = ?, default_tax_rate = ?, default_notes = ?,
        default_payment_instructions = ?, default_payment_terms_days = ?, invoice_prefix = ?, quote_prefix = ?,
        quote_validity_days = ?, default_quote_notes = ?, invoice_email_subject = ?, quote_email_subject = ?,
        receipt_email_subject = ?, show_pdf_attachment = ?, include_payment_link = ?, include_business_contact = ?,
        updated_at = ?
       WHERE id = ?`,
      input.businessName ?? current.businessName,
      input.legalBusinessName ?? current.legalBusinessName,
      input.businessEmail ?? current.businessEmail,
      input.phone ?? current.phone,
      input.website ?? current.website,
      input.businessAddress ?? current.businessAddress,
      input.city ?? current.city,
      input.state ?? current.state,
      input.country ?? current.country,
      input.postalCode ?? current.postalCode,
      input.taxNumber ?? current.taxNumber,
      input.businessRegNumber ?? current.businessRegNumber,
      input.logo ?? current.logo,
      input.brandColor ?? current.brandColor,
      (input.showLogoOnDocuments ?? current.showLogoOnDocuments) ? 1 : 0,
      input.businessNameDisplay ?? current.businessNameDisplay,
      input.defaultCurrency ?? current.defaultCurrency,
      input.dateFormat ?? current.dateFormat,
      input.timezone ?? current.timezone,
      input.language ?? current.language,
      input.defaultTaxRate !== undefined ? input.defaultTaxRate : current.defaultTaxRate,
      input.defaultNotes ?? current.defaultNotes,
      input.defaultPaymentInstructions ?? current.defaultPaymentInstructions,
      input.defaultPaymentTermsDays ?? current.defaultPaymentTermsDays,
      input.invoicePrefix ?? current.invoicePrefix,
      input.quotePrefix ?? current.quotePrefix,
      input.quoteValidityDays ?? current.quoteValidityDays,
      input.defaultQuoteNotes ?? current.defaultQuoteNotes,
      input.invoiceEmailSubject ?? current.invoiceEmailSubject,
      input.quoteEmailSubject ?? current.quoteEmailSubject,
      input.receiptEmailSubject ?? current.receiptEmailSubject,
      (input.showPdfAttachment ?? current.showPdfAttachment) ? 1 : 0,
      (input.includePaymentLink ?? current.includePaymentLink) ? 1 : 0,
      (input.includeBusinessContact ?? current.includeBusinessContact) ? 1 : 0,
      Date.now(),
      scope.teamId,
    );
  }

  // Guards against a param-count/placeholder mismatch silently updating
  // zero rows (the UPDATE succeeds either way; only `changes` reveals it) —
  // surfaces as a real error instead of a save that looks successful but
  // wrote nothing.
  if (result.changes === 0) return { error: "Could not save settings — workspace not found." };

  return (await getWorkspaceSettings(scope))!;
}

function pad(n: number): string {
  return String(n).padStart(4, "0");
}

// Atomically allocates the next invoice number for the given scope and
// returns the formatted number (e.g. "INV-0473") — the counter increments
// in the same UPDATE...RETURNING statement it reads from, so two team
// members creating an invoice at the same moment can never be handed the
// same number (each request's UPDATE is serialized by SQLite's normal
// single-writer locking; there's no separate read-then-write window to race).
export async function allocateInvoiceNumber(scope: WorkspaceScope): Promise<string> {
  if (scope.type === "personal") {
    const row = await dbGet<{ n: number; prefix: string }>(
      `UPDATE users SET next_invoice_number = next_invoice_number + 1
       WHERE id = ? RETURNING next_invoice_number - 1 AS n, invoice_prefix AS prefix`,
      scope.userId,
    );
    return `${row?.prefix ?? "INV-"}${pad(row?.n ?? 1)}`;
  }
  const row = await dbGet<{ n: number; prefix: string }>(
    `UPDATE teams SET next_invoice_number = next_invoice_number + 1
     WHERE id = ? RETURNING next_invoice_number - 1 AS n, invoice_prefix AS prefix`,
    scope.teamId,
  );
  return `${row?.prefix ?? "INV-"}${pad(row?.n ?? 1)}`;
}

// Team-only — see the module comment on why personal workspaces don't get
// a separate quote counter.
export async function allocateQuoteNumber(teamId: string): Promise<string> {
  const row = await dbGet<{ n: number; prefix: string }>(
    `UPDATE teams SET next_quote_number = next_quote_number + 1
     WHERE id = ? RETURNING next_quote_number - 1 AS n, quote_prefix AS prefix`,
    teamId,
  );
  return `${row?.prefix ?? "QUO-"}${pad(row?.n ?? 1)}`;
}
