"use client";

import { useState } from "react";
import { Modal } from "@/components/dashboard/Modal";
import { CURRENCIES } from "@/lib/invoice";
import type { ClientRow } from "@/lib/data";

export type ClientFormValues = {
  name: string;
  email: string;
  phone: string;
  website: string;
  contactName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxNumber: string;
  businessRegNumber: string;
  currency: string;
  paymentTermsDays: string;
  defaultTaxRate: string;
  defaultDiscount: string;
  defaultNotes: string;
  defaultPaymentInstructions: string;
  internalNotes: string;
};

const EMPTY_FORM: ClientFormValues = {
  name: "", email: "", phone: "", website: "", contactName: "",
  address: "", city: "", state: "", country: "", postalCode: "",
  taxNumber: "", businessRegNumber: "", currency: "", paymentTermsDays: "",
  defaultTaxRate: "", defaultDiscount: "", defaultNotes: "", defaultPaymentInstructions: "", internalNotes: "",
};

function fieldsFromClient(c: ClientRow): ClientFormValues {
  return {
    name: c.name, email: c.email, phone: c.phone, website: c.website, contactName: c.contact_name,
    address: c.address, city: c.city, state: c.state, country: c.country, postalCode: c.postal_code,
    taxNumber: c.tax_number, businessRegNumber: c.business_reg_number, currency: c.currency,
    paymentTermsDays: c.payment_terms_days != null ? String(c.payment_terms_days) : "",
    defaultTaxRate: c.default_tax_rate != null ? String(c.default_tax_rate) : "",
    defaultDiscount: c.default_discount != null ? String(c.default_discount) : "",
    defaultNotes: c.default_notes, defaultPaymentInstructions: c.default_payment_instructions,
    internalNotes: c.internal_notes,
  };
}

const inputCls =
  "w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15";
const labelCls = "mb-1 block text-[12px] font-medium text-[#6b7280]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

export function ClientModal({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: ClientRow | null;
  onSaved: (client: ClientRow, wasEdit: boolean) => void;
}) {
  const [form, setForm] = useState<ClientFormValues>(() => (editing ? fieldsFromClient(editing) : EMPTY_FORM));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [initializedFor, setInitializedFor] = useState<string | null>(editing?.id ?? "new");

  // Re-sync form fields when switching between "new" and a specific client
  // to edit, without needing the parent to key/remount this component.
  const wantKey = editing?.id ?? "new";
  if (open && initializedFor !== wantKey) {
    setForm(editing ? fieldsFromClient(editing) : EMPTY_FORM);
    setError("");
    setInitializedFor(wantKey);
  }

  function set<K extends keyof ClientFormValues>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function close() {
    if (busy) return;
    onClose();
  }

  const emailValid = !form.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim());

  async function submit() {
    if (busy) return;
    if (!form.name.trim()) {
      setError("Client/company name is required.");
      return;
    }
    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        website: form.website,
        contactName: form.contactName,
        address: form.address,
        city: form.city,
        state: form.state,
        country: form.country,
        postalCode: form.postalCode,
        taxNumber: form.taxNumber,
        businessRegNumber: form.businessRegNumber,
        currency: form.currency,
        paymentTermsDays: form.paymentTermsDays.trim() ? Number(form.paymentTermsDays) : null,
        defaultTaxRate: form.defaultTaxRate.trim() ? Number(form.defaultTaxRate) : null,
        defaultDiscount: form.defaultDiscount.trim() ? Number(form.defaultDiscount) : null,
        defaultNotes: form.defaultNotes,
        defaultPaymentInstructions: form.defaultPaymentInstructions,
        internalNotes: form.internalNotes,
      };
      const res = await fetch(editing ? `/api/clients/${editing.id}` : "/api/clients", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; client?: ClientRow; error?: string };
      if (!res.ok || !json.ok || !json.client) {
        setError(json.error || "Could not save this client.");
        setBusy(false);
        return;
      }
      onSaved(json.client, !!editing);
      setBusy(false);
      onClose();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title={editing ? "Edit client" : "New client"} maxWidth="640px">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Client/company name *">
            <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Acme Inc." />
          </Field>
          <Field label="Contact person">
            <input className={inputCls} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Jane Doe" />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="ap@acme.com" />
          </Field>
          <Field label="Phone">
            <input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 555 000 0000" />
          </Field>
          <Field label="Website">
            <input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="acme.com" />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink">Billing address</p>
          <div className="space-y-3">
            <Field label="Address">
              <textarea rows={2} className={`${inputCls} resize-none`} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Market St" />
            </Field>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="City"><input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} /></Field>
              <Field label="State/Province"><input className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} /></Field>
              <Field label="Country"><input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} /></Field>
              <Field label="Postal/ZIP"><input className={inputCls} value={form.postalCode} onChange={(e) => set("postalCode", e.target.value)} /></Field>
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink">Business information</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Tax/VAT number"><input className={inputCls} value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} /></Field>
            <Field label="Business registration number"><input className={inputCls} value={form.businessRegNumber} onChange={(e) => set("businessRegNumber", e.target.value)} /></Field>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold text-ink">Billing defaults</p>
          <p className="mb-2 text-[12px] text-[#9ca3af]">Auto-fill new invoices for this client — still editable per-invoice.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Currency">
              <select className={inputCls} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                <option value="">Account default</option>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </Field>
            <Field label="Payment terms (days)">
              <input type="number" min={0} className={inputCls} value={form.paymentTermsDays} onChange={(e) => set("paymentTermsDays", e.target.value)} placeholder="14" />
            </Field>
            <Field label="Default tax %">
              <input type="number" min={0} step="0.01" className={inputCls} value={form.defaultTaxRate} onChange={(e) => set("defaultTaxRate", e.target.value)} />
            </Field>
            <Field label="Default discount %">
              <input type="number" min={0} step="0.01" className={inputCls} value={form.defaultDiscount} onChange={(e) => set("defaultDiscount", e.target.value)} />
            </Field>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Default invoice notes">
              <textarea rows={2} className={`${inputCls} resize-none`} value={form.defaultNotes} onChange={(e) => set("defaultNotes", e.target.value)} />
            </Field>
            <Field label="Default payment instructions">
              <textarea rows={2} className={`${inputCls} resize-none`} value={form.defaultPaymentInstructions} onChange={(e) => set("defaultPaymentInstructions", e.target.value)} />
            </Field>
          </div>
        </div>

        <Field label="Internal notes (not shown to client)">
          <textarea rows={2} className={`${inputCls} resize-none`} value={form.internalNotes} onChange={(e) => set("internalNotes", e.target.value)} />
        </Field>

        {error ? <p className="text-[13px] text-[#d70015]">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-[#e5e7eb] pt-4">
          <button type="button" onClick={close} disabled={busy} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6] disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={() => void submit()} disabled={busy} className="rounded-full bg-[#166534] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60">
            {busy ? "Saving…" : "Save client"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
