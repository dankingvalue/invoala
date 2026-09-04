"use client";

import { useEffect, useState } from "react";
import { CURRENCIES } from "@/lib/invoice";
import { ConfirmDialog, Modal } from "@/components/dashboard/Modal";
import { ArchiveIcon, DeleteIcon, TransferIcon } from "@/components/dashboard/icons";

type Settings = {
  scopeType: "personal" | "team";
  name: string;
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
  quotePrefix: string | null;
  nextQuoteNumber: number | null;
  quoteValidityDays: number | null;
  defaultQuoteNotes: string | null;
  invoiceEmailSubject: string | null;
  quoteEmailSubject: string | null;
  receiptEmailSubject: string | null;
  showPdfAttachment: boolean | null;
  includePaymentLink: boolean | null;
  includeBusinessContact: boolean | null;
};

type Member = { user_id: string; role: string; name: string; email: string };

const inputCls =
  "w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15 disabled:bg-[#f9fafb] disabled:text-[#9ca3af]";
const labelCls = "mb-1.5 block text-[13px] font-medium text-[#6b7280]";
const hintCls = "mt-1 text-[12px] text-[#9ca3af]";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
      {hint ? <p className={hintCls}>{hint}</p> : null}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
  onSave,
  saving,
  saved,
  hideSave = false,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSave?: () => void;
  saving?: boolean;
  saved?: boolean;
  hideSave?: boolean;
}) {
  return (
    <section className="rounded-lg border border-[#e5e7eb] p-6">
      <h2 className="text-[16px] font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-[13px] text-[#6b7280]">{description}</p> : null}
      <div className="mt-5 space-y-4">{children}</div>
      {!hideSave && onSave ? (
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-lg bg-[#14532d] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved ? <span className="text-[13px] text-[#166534]">Settings saved successfully</span> : null}
        </div>
      ) : null}
    </section>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+$/i;

export function GeneralSettings({ workspace }: { workspace: string }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [canEdit, setCanEdit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSection, setSavedSection] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTo, setTransferTo] = useState("");
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [dangerBusy, setDangerBusy] = useState(false);
  const [dangerMsg, setDangerMsg] = useState("");

  const isTeam = workspace.startsWith("team:");
  const teamId = isTeam ? workspace.slice(5) : null;

  useEffect(() => {
    fetch(`/api/workspace-settings?workspace=${encodeURIComponent(workspace)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { settings?: Settings; canEdit?: boolean } | null) => {
        if (data?.settings) {
          setSettings(data.settings);
          setCanEdit(!!data.canEdit);
          setError("");
        } else {
          setError("Could not load settings.");
        }
      })
      .catch(() => setError("Network error while loading settings."))
      .finally(() => setLoading(false));
  }, [workspace]);

  useEffect(() => {
    if (!teamId) return;
    fetch(`/api/teams/${teamId}/members`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.members) setMembers(data.members);
      });
  }, [teamId]);

  function patch(fields: Partial<Settings>) {
    setSettings((s) => (s ? { ...s, ...fields } : s));
  }

  async function save(section: string, fields: Record<string, unknown>): Promise<boolean> {
    setSavingSection(section);
    setSavedSection(null);
    setError("");
    try {
      const res = await fetch(`/api/workspace-settings?workspace=${encodeURIComponent(workspace)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setSettings(json.settings);
        setSavedSection(section);
        setTimeout(() => setSavedSection((s) => (s === section ? null : s)), 3000);
        return true;
      }
      setError(json.error || "Could not save settings.");
      return false;
    } catch {
      setError("Network error while saving.");
      return false;
    } finally {
      setSavingSection(null);
    }
  }

  if (loading) return <p className="text-[13px] text-[#6b7280]">Loading…</p>;
  if (!settings) return <p className="text-[13px] text-[#d70015]">{error || "Could not load settings."}</p>;

  const logoTooLarge = settings.logo.length > 2_000_000;

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Logo must be an image file.");
      return;
    }
    if (file.size > 1_500_000) {
      setError("Logo must be smaller than 1.5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => patch({ logo: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {!canEdit ? (
        <div className="rounded-lg border border-[#fef3c7] bg-[#fefce8] px-4 py-3 text-[13px] text-[#92600a]">
          You have read-only access to these workspace settings. Ask a team admin or the owner to make changes.
        </div>
      ) : null}
      {error ? <p className="text-[13px] text-[#d70015]">{error}</p> : null}

      {/* 1. Business profile */}
      <SectionCard
        title="Business profile"
        description="Shown on invoices, quotes, and PDF documents."
        onSave={() =>
          void save("profile", {
            businessName: settings.businessName,
            legalBusinessName: settings.legalBusinessName,
            businessEmail: settings.businessEmail,
            phone: settings.phone,
            website: settings.website,
            businessAddress: settings.businessAddress,
            city: settings.city,
            state: settings.state,
            country: settings.country,
            postalCode: settings.postalCode,
            taxNumber: settings.taxNumber,
            businessRegNumber: settings.businessRegNumber,
          })
        }
        saving={savingSection === "profile"}
        saved={savedSection === "profile"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Business / company name *">
            <input
              value={settings.businessName}
              onChange={(e) => patch({ businessName: e.target.value })}
              disabled={!canEdit}
              maxLength={120}
              className={inputCls}
            />
          </Field>
          {settings.scopeType === "team" ? (
            <Field label="Legal business name">
              <input
                value={settings.legalBusinessName}
                onChange={(e) => patch({ legalBusinessName: e.target.value })}
                disabled={!canEdit}
                maxLength={120}
                className={inputCls}
              />
            </Field>
          ) : null}
          <Field label="Business email">
            <input
              type="email"
              value={settings.businessEmail}
              onChange={(e) => patch({ businessEmail: e.target.value })}
              disabled={!canEdit}
              className={inputCls}
            />
            {settings.businessEmail && !EMAIL_RE.test(settings.businessEmail) ? (
              <p className="mt-1 text-[12px] text-[#d70015]">Enter a valid email address.</p>
            ) : null}
          </Field>
          <Field label="Phone">
            <input value={settings.phone} onChange={(e) => patch({ phone: e.target.value })} disabled={!canEdit} className={inputCls} />
          </Field>
          <Field label="Website">
            <input
              value={settings.website}
              onChange={(e) => patch({ website: e.target.value })}
              disabled={!canEdit}
              placeholder="https://example.com"
              className={inputCls}
            />
            {settings.website && !URL_RE.test(settings.website) ? (
              <p className="mt-1 text-[12px] text-[#d70015]">Enter a full URL, e.g. https://example.com.</p>
            ) : null}
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address">
            <input value={settings.businessAddress} onChange={(e) => patch({ businessAddress: e.target.value })} disabled={!canEdit} className={inputCls} />
          </Field>
          {settings.scopeType === "team" ? (
            <>
              <Field label="City">
                <input value={settings.city} onChange={(e) => patch({ city: e.target.value })} disabled={!canEdit} className={inputCls} />
              </Field>
              <Field label="State / Province">
                <input value={settings.state} onChange={(e) => patch({ state: e.target.value })} disabled={!canEdit} className={inputCls} />
              </Field>
              <Field label="Country">
                <input value={settings.country} onChange={(e) => patch({ country: e.target.value })} disabled={!canEdit} className={inputCls} />
              </Field>
              <Field label="Postal / ZIP code">
                <input value={settings.postalCode} onChange={(e) => patch({ postalCode: e.target.value })} disabled={!canEdit} className={inputCls} />
              </Field>
              <Field label="Tax / VAT number">
                <input value={settings.taxNumber} onChange={(e) => patch({ taxNumber: e.target.value })} disabled={!canEdit} className={inputCls} />
              </Field>
              <Field label="Business registration number">
                <input value={settings.businessRegNumber} onChange={(e) => patch({ businessRegNumber: e.target.value })} disabled={!canEdit} className={inputCls} />
              </Field>
            </>
          ) : null}
        </div>
      </SectionCard>

      {/* 2. Branding */}
      <SectionCard
        title="Branding"
        description="How your business appears on invoices, quotes, and PDF documents."
        onSave={() =>
          void save("branding", {
            logo: settings.logo,
            brandColor: settings.brandColor,
            showLogoOnDocuments: settings.showLogoOnDocuments,
            businessNameDisplay: settings.businessNameDisplay,
          })
        }
        saving={savingSection === "branding"}
        saved={savedSection === "branding"}
      >
        <div className="flex items-center gap-4">
          {settings.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo} alt="Business logo" className="h-14 w-14 rounded-lg border border-[#e5e7eb] object-contain" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-[#e5e7eb] text-[11px] text-[#9ca3af]">No logo</div>
          )}
          <div className="flex items-center gap-2">
            <label className={`cursor-pointer rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6] ${!canEdit ? "pointer-events-none opacity-50" : ""}`}>
              {settings.logo ? "Change logo" : "Upload logo"}
              <input type="file" accept="image/*" className="hidden" disabled={!canEdit} onChange={handleLogo} />
            </label>
            {settings.logo ? (
              <button type="button" disabled={!canEdit} onClick={() => patch({ logo: "" })} className="text-[13px] text-[#d70015] hover:underline disabled:opacity-50">
                Remove
              </button>
            ) : null}
          </div>
        </div>
        {logoTooLarge ? <p className="text-[12px] text-[#d70015]">This logo is unusually large — consider a smaller image.</p> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand / accent color" hint="Used for headings and accents on generated documents.">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.brandColor || "#166534"}
                onChange={(e) => patch({ brandColor: e.target.value })}
                disabled={!canEdit}
                className="h-10 w-14 cursor-pointer rounded-lg border border-[#e5e7eb] disabled:cursor-not-allowed"
              />
              <input
                value={settings.brandColor}
                onChange={(e) => patch({ brandColor: e.target.value })}
                disabled={!canEdit}
                placeholder="#166534"
                className={inputCls}
              />
            </div>
          </Field>
          <Field label="Business name display">
            <select
              value={settings.businessNameDisplay}
              onChange={(e) => patch({ businessNameDisplay: e.target.value as Settings["businessNameDisplay"] })}
              disabled={!canEdit}
              className={inputCls}
            >
              <option value="business_name">Business name</option>
              <option value="legal_business_name">Legal business name</option>
            </select>
          </Field>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={settings.showLogoOnDocuments}
            onChange={(e) => patch({ showLogoOnDocuments: e.target.checked })}
            disabled={!canEdit}
            className="h-4 w-4 accent-[#166534]"
          />
          Show logo on invoices, quotes, and PDFs
        </label>

        {/* 13. Branding preview — reuses the same field values, no separate renderer */}
        <div className="mt-2 rounded-lg border border-[#e5e7eb] bg-[#f9fafb] p-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Invoice preview</p>
          <div className="rounded-lg border border-[#e5e7eb] bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {settings.showLogoOnDocuments && settings.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={settings.logo} alt="" className="h-8 w-8 rounded object-contain" />
                ) : null}
                <span className="text-[14px] font-bold text-ink">
                  {(settings.businessNameDisplay === "legal_business_name" && settings.legalBusinessName) || settings.businessName || "Your Business"}
                </span>
              </div>
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: settings.brandColor || "#166534" }}>
                Invoice
              </span>
            </div>
            <p className="mt-2 text-[11px] text-[#9ca3af]">{settings.invoicePrefix}{String(settings.nextInvoiceNumber).padStart(4, "0")}</p>
          </div>
        </div>
      </SectionCard>

      {/* 3. Regional settings */}
      <SectionCard
        title="Regional settings"
        onSave={() =>
          void save("regional", {
            defaultCurrency: settings.defaultCurrency,
            dateFormat: settings.dateFormat,
            timezone: settings.timezone,
            language: settings.language,
            country: settings.country,
          })
        }
        saving={savingSection === "regional"}
        saved={savedSection === "regional"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default currency" hint="Used when creating new invoices unless overridden.">
            <select value={settings.defaultCurrency} onChange={(e) => patch({ defaultCurrency: e.target.value })} disabled={!canEdit} className={inputCls}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Date format">
            <select value={settings.dateFormat} onChange={(e) => patch({ dateFormat: e.target.value })} disabled={!canEdit} className={inputCls}>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </Field>
          <Field label="Timezone">
            <input value={settings.timezone} onChange={(e) => patch({ timezone: e.target.value })} disabled={!canEdit} placeholder="e.g. America/New_York" className={inputCls} />
          </Field>
          <Field label="Language">
            <select value={settings.language} onChange={(e) => patch({ language: e.target.value })} disabled={!canEdit} className={inputCls}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="pt">Português</option>
              <option value="de">Deutsch</option>
            </select>
          </Field>
        </div>
      </SectionCard>

      {/* 4. Invoice defaults */}
      <SectionCard
        title="Invoice defaults"
        onSave={() =>
          void save("invoiceDefaults", {
            defaultPaymentTermsDays: settings.defaultPaymentTermsDays,
            defaultTaxRate: settings.defaultTaxRate,
            defaultNotes: settings.defaultNotes,
            defaultPaymentInstructions: settings.defaultPaymentInstructions,
          })
        }
        saving={savingSection === "invoiceDefaults"}
        saved={savedSection === "invoiceDefaults"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default payment terms" hint="Automatically calculates the invoice due date.">
            <select
              value={String(settings.defaultPaymentTermsDays)}
              onChange={(e) => patch({ defaultPaymentTermsDays: Number(e.target.value) })}
              disabled={!canEdit}
              className={inputCls}
            >
              <option value="0">Upon receipt</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
              <option value="60">60 days</option>
            </select>
          </Field>
          <Field label="Default tax rate (%)">
            <input
              type="number"
              min={0}
              max={100}
              step="0.1"
              value={settings.defaultTaxRate ?? ""}
              onChange={(e) => patch({ defaultTaxRate: e.target.value === "" ? null : Number(e.target.value) })}
              disabled={!canEdit}
              className={inputCls}
            />
          </Field>
        </div>
        <Field label="Default invoice notes">
          <textarea value={settings.defaultNotes} onChange={(e) => patch({ defaultNotes: e.target.value })} disabled={!canEdit} rows={2} className={inputCls} />
        </Field>
        <Field label="Default payment instructions">
          <textarea
            value={settings.defaultPaymentInstructions}
            onChange={(e) => patch({ defaultPaymentInstructions: e.target.value })}
            disabled={!canEdit}
            rows={2}
            className={inputCls}
          />
        </Field>
      </SectionCard>

      {/* 5. Quote defaults — team only (see lib/workspace-settings.ts) */}
      {settings.scopeType === "team" ? (
        <SectionCard
          title="Quote defaults"
          onSave={() =>
            void save("quoteDefaults", {
              quotePrefix: settings.quotePrefix,
              quoteValidityDays: settings.quoteValidityDays,
              defaultQuoteNotes: settings.defaultQuoteNotes,
            })
          }
          saving={savingSection === "quoteDefaults"}
          saved={savedSection === "quoteDefaults"}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Quote prefix">
              <input value={settings.quotePrefix ?? ""} onChange={(e) => patch({ quotePrefix: e.target.value })} disabled={!canEdit} className={inputCls} />
            </Field>
            <Field label="Default quote validity">
              <select
                value={String(settings.quoteValidityDays ?? 30)}
                onChange={(e) => patch({ quoteValidityDays: Number(e.target.value) })}
                disabled={!canEdit}
                className={inputCls}
              >
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
              </select>
            </Field>
          </div>
          <Field label="Default quote notes">
            <textarea value={settings.defaultQuoteNotes ?? ""} onChange={(e) => patch({ defaultQuoteNotes: e.target.value })} disabled={!canEdit} rows={2} className={inputCls} />
          </Field>
        </SectionCard>
      ) : null}

      {/* 6. Email & document preferences — team only */}
      {settings.scopeType === "team" ? (
        <SectionCard
          title="Email & document preferences"
          description="Supports {invoice_number}, {business_name}, {client_name} in subject lines."
          onSave={() =>
            void save("emailPrefs", {
              invoiceEmailSubject: settings.invoiceEmailSubject,
              quoteEmailSubject: settings.quoteEmailSubject,
              receiptEmailSubject: settings.receiptEmailSubject,
              showPdfAttachment: settings.showPdfAttachment,
              includePaymentLink: settings.includePaymentLink,
              includeBusinessContact: settings.includeBusinessContact,
            })
          }
          saving={savingSection === "emailPrefs"}
          saved={savedSection === "emailPrefs"}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Invoice email subject">
              <input
                value={settings.invoiceEmailSubject ?? ""}
                onChange={(e) => patch({ invoiceEmailSubject: e.target.value })}
                disabled={!canEdit}
                placeholder="Invoice {invoice_number} from {business_name}"
                className={inputCls}
              />
            </Field>
            <Field label="Quote email subject">
              <input
                value={settings.quoteEmailSubject ?? ""}
                onChange={(e) => patch({ quoteEmailSubject: e.target.value })}
                disabled={!canEdit}
                placeholder="Quote for {client_name}"
                className={inputCls}
              />
            </Field>
            <Field label="Payment receipt subject">
              <input
                value={settings.receiptEmailSubject ?? ""}
                onChange={(e) => patch({ receiptEmailSubject: e.target.value })}
                disabled={!canEdit}
                placeholder="Receipt for {invoice_number}"
                className={inputCls}
              />
            </Field>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={!!settings.showPdfAttachment} onChange={(e) => patch({ showPdfAttachment: e.target.checked })} disabled={!canEdit} className="h-4 w-4 accent-[#166534]" />
              Attach PDF to outgoing emails
            </label>
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={!!settings.includePaymentLink} onChange={(e) => patch({ includePaymentLink: e.target.checked })} disabled={!canEdit} className="h-4 w-4 accent-[#166534]" />
              Include payment link when available
            </label>
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input type="checkbox" checked={!!settings.includeBusinessContact} onChange={(e) => patch({ includeBusinessContact: e.target.checked })} disabled={!canEdit} className="h-4 w-4 accent-[#166534]" />
              Include business contact information
            </label>
          </div>
        </SectionCard>
      ) : null}

      {/* 7. Document numbering */}
      <SectionCard
        title="Document numbering"
        description="Controls the number assigned to newly created invoices. Numbers are allocated on the server, so two people creating an invoice at the same moment can never collide."
        onSave={() => void save("numbering", { invoicePrefix: settings.invoicePrefix })}
        saving={savingSection === "numbering"}
        saved={savedSection === "numbering"}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Invoice prefix">
            <input value={settings.invoicePrefix} onChange={(e) => patch({ invoicePrefix: e.target.value })} disabled={!canEdit} maxLength={12} className={inputCls} />
          </Field>
          <Field label="Next invoice number" hint="Read-only — advances automatically as invoices are created.">
            <input value={settings.nextInvoiceNumber} disabled className={inputCls} />
          </Field>
        </div>
        <p className="text-[12px] text-[#9ca3af]">
          Next invoice: <span className="font-mono text-ink">{settings.invoicePrefix}{String(settings.nextInvoiceNumber).padStart(4, "0")}</span>
        </p>
      </SectionCard>

      {/* 8. Danger zone — team only; workspace deletion architecture lives in lib/teams.ts (shared with the Teams tab) */}
      {isTeam && teamId ? (
        <section className="rounded-lg border border-[#fecaca] p-6">
          <h2 className="text-[16px] font-bold text-[#d70015]">Danger zone</h2>
          <p className="mt-1 text-[13px] text-[#6b7280]">Workspace-level, irreversible actions. Only the owner can do these.</p>
          <div className="mt-5 divide-y divide-[#fee2e2]">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink">Transfer ownership</p>
                <p className="text-[12px] text-[#6b7280]">Hand this workspace to another existing member.</p>
              </div>
              <button
                type="button"
                onClick={() => setTransferOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
              >
                <TransferIcon /> Transfer
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink">Archive workspace</p>
                <p className="text-[12px] text-[#6b7280]">Preserves all data but deactivates the workspace.</p>
              </div>
              <button
                type="button"
                onClick={() => setArchiveConfirmOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
              >
                <ArchiveIcon /> Archive
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-[14px] font-medium text-ink">Delete workspace</p>
                <p className="text-[12px] text-[#6b7280]">Removes the workspace and its membership. Clients, invoices, and payment history are kept, never deleted.</p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3.5 py-2 text-[13px] font-semibold text-[#d70015] transition hover:bg-[#fee2e2]"
              >
                <DeleteIcon /> Delete
              </button>
            </div>
          </div>
          {dangerMsg ? <p className="mt-3 text-[13px] text-[#d70015]">{dangerMsg}</p> : null}
        </section>
      ) : null}

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transfer ownership" maxWidth="420px">
        <div className="space-y-3">
          <p className="text-[13px] text-[#6b7280]">Choose an existing member to become the new owner. You&apos;ll become an admin.</p>
          <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} className={inputCls}>
            <option value="">Select a member…</option>
            {members.filter((m) => m.role !== "owner").map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => setTransferOpen(false)} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]">
              Cancel
            </button>
            <button
              type="button"
              disabled={!transferTo || dangerBusy}
              onClick={async () => {
                if (!teamId) return;
                setDangerBusy(true);
                setDangerMsg("");
                const res = await fetch(`/api/teams/${teamId}/transfer-ownership`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ userId: transferTo }),
                });
                const json = await res.json().catch(() => ({}));
                setDangerBusy(false);
                if (res.ok && json.ok) {
                  setTransferOpen(false);
                  window.location.reload();
                } else {
                  setDangerMsg(json.error || "Could not transfer ownership.");
                }
              }}
              className="rounded-full bg-[#166534] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60"
            >
              {dangerBusy ? "Transferring…" : "Transfer ownership"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={archiveConfirmOpen}
        onClose={() => setArchiveConfirmOpen(false)}
        title="Archive this workspace?"
        body="The workspace, its data, and its members are preserved, but it's hidden from active use until reactivated from the Teams tab."
        confirmLabel="Archive workspace"
        busy={dangerBusy}
        onConfirm={async () => {
          if (!teamId) return;
          setDangerBusy(true);
          const res = await fetch(`/api/teams/${teamId}/archive`, { method: "POST" });
          setDangerBusy(false);
          if (res.ok) {
            setArchiveConfirmOpen(false);
            window.location.assign("/dashboard?tab=teams");
          } else {
            setDangerMsg("Could not archive this workspace.");
          }
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete this workspace?"
        body="This removes the workspace and its membership permanently. Clients, invoices, and payment history are kept, not deleted. This cannot be undone."
        confirmLabel="Delete workspace"
        busy={dangerBusy}
        onConfirm={async () => {
          if (!teamId) return;
          setDangerBusy(true);
          const res = await fetch(`/api/teams/${teamId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "delete" }),
          });
          setDangerBusy(false);
          if (res.ok) {
            setDeleteConfirmOpen(false);
            window.location.assign("/dashboard?tab=teams");
          } else {
            setDangerMsg("Could not delete this workspace.");
          }
        }}
      />
    </div>
  );
}
