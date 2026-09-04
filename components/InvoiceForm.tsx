"use client";

import { useState, type ChangeEvent } from "react";
import {
  CURRENCIES,
  DOC_TYPES,
  newId,
  RECURRING_OPTIONS,
  THEMES,
  type Invoice,
  type LineItem,
} from "@/lib/invoice";
import type { ClientRow } from "@/lib/data";
import type { ServiceItem } from "@/lib/service-items";

const inputCls =
  "w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-[#6b7280] focus:border-accent focus:ring-[3px] focus:ring-accent/20";

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[13px] font-medium text-subtle">
        {label}
      </label>
      {children}
    </div>
  );
}

export function InvoiceForm({
  invoice,
  onChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  allowLogo = true,
  showQuoteMode = false,
  showRecurring = false,
  clients = [],
  onClientSelect,
  onClientSaved,
  services = [],
  onAddService,
  onServiceSaved,
  serviceWorkspaceTeamId = null,
}: {
  invoice: Invoice;
  onChange: (patch: Partial<Invoice>) => void;
  onItemChange: (id: string, patch: Partial<LineItem>) => void;
  onAddItem: () => void;
  onRemoveItem: (id: string) => void;
  allowLogo?: boolean;
  showQuoteMode?: boolean;
  showRecurring?: boolean;
  clients?: ClientRow[];
  /** Which saved client (if any) the invoice's Bill-to fields currently match — so the invoice can be linked by ID, not just by name, when saved. */
  onClientSelect?: (clientId: string | null) => void;
  /** Fires after "Save as new client" succeeds, so the caller can add it to its own client list without a refetch. */
  onClientSaved?: (client: ClientRow) => void;
  services?: ServiceItem[];
  /** Appends a new line item pre-filled from the picked saved service. */
  onAddService?: (service: ServiceItem) => void;
  /** Fires after "+ New service" succeeds, so the caller can add it to its own list without a refetch. */
  onServiceSaved?: (service: ServiceItem) => void;
  /** Workspace a newly-saved service should belong to (null = Personal). */
  serviceWorkspaceTeamId?: string | null;
}) {
  const [selectedClientId, setSelectedClientId] = useState<string>("new");
  const [savingClient, setSavingClient] = useState(false);
  const [clientSaveNote, setClientSaveNote] = useState("");
  const [servicesOpen, setServicesOpen] = useState(false);
  const [newServiceOpen, setNewServiceOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceRate, setNewServiceRate] = useState("");
  const [savingService, setSavingService] = useState(false);
  const [serviceError, setServiceError] = useState("");
  // Whether the payment section is shown on the invoice itself (preview/PDF)
  // is real invoice data (`paymentEnabled`), not local UI state — otherwise
  // toggling it off still leaves the underlying text rendering on the
  // document. Off by default; a saved invoice/template restores whatever it
  // was last set to.
  const payUiOpen = invoice.paymentEnabled;
  const [payMode, setPayMode] = useState<"link" | "instructions">(() =>
    invoice.paymentLink ? "link" : "instructions",
  );

  function handleLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ logoDataUrl: String(reader.result) });
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function selectClient(id: string) {
    setSelectedClientId(id);
    setClientSaveNote("");
    if (id === "new") {
      onChange({ clientName: "", clientEmail: "", clientAddress: "" });
      onClientSelect?.(null);
    } else {
      const client = clients.find((c) => c.id === id);
      if (client) {
        const patch: Partial<Invoice> = {
          clientName: client.name,
          clientEmail: client.email,
          clientAddress: client.address,
        };
        // Client-level billing defaults auto-fill the invoice; the user can
        // still change anything below afterward.
        if (client.currency) patch.currency = client.currency;
        if (typeof client.default_tax_rate === "number") patch.taxRate = client.default_tax_rate;
        if (typeof client.default_discount === "number") patch.discount = client.default_discount;
        if (client.default_notes) patch.notes = client.default_notes;
        if (client.default_payment_instructions) {
          patch.paymentInstructions = client.default_payment_instructions;
          patch.paymentEnabled = true;
        }
        if (typeof client.payment_terms_days === "number") {
          const issue = invoice.issueDate ? new Date(invoice.issueDate + "T00:00:00Z") : new Date();
          const due = new Date(issue);
          due.setUTCDate(due.getUTCDate() + client.payment_terms_days);
          patch.dueDate = due.toISOString().slice(0, 10);
        }
        onChange(patch);
      }
      onClientSelect?.(id);
    }
  }

  async function saveAsNewClient() {
    if (!invoice.clientName.trim() || savingClient) return;
    setSavingClient(true);
    setClientSaveNote("");
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: invoice.clientName,
          email: invoice.clientEmail,
          address: invoice.clientAddress,
          quickSave: true,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; client?: ClientRow; error?: string };
      if (res.ok && json.ok && json.client) {
        setSelectedClientId(json.client.id);
        onClientSelect?.(json.client.id);
        onClientSaved?.(json.client);
        setClientSaveNote("Saved to your client book.");
      } else {
        setClientSaveNote(json.error || "Could not save this client.");
      }
    } catch {
      setClientSaveNote("Network error while saving.");
    }
    setSavingClient(false);
    setTimeout(() => setClientSaveNote(""), 3000);
  }

  async function saveNewService() {
    if (!newServiceName.trim() || savingService) return;
    setSavingService(true);
    setServiceError("");
    try {
      const res = await fetch("/api/service-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newServiceName,
          description: newServiceDescription,
          rate: Number(newServiceRate) || 0,
          teamId: serviceWorkspaceTeamId,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; service?: ServiceItem; error?: string };
      if (res.ok && json.ok && json.service) {
        onServiceSaved?.(json.service);
        setNewServiceName("");
        setNewServiceDescription("");
        setNewServiceRate("");
        setNewServiceOpen(false);
      } else {
        setServiceError(json.error || "Could not save this service.");
      }
    } catch {
      setServiceError("Network error while saving.");
    }
    setSavingService(false);
  }

  return (
    <div className="space-y-10">
      {showQuoteMode ? (
        <section>
          <h3 className="mb-3 text-lg font-semibold tracking-tight text-ink">Document type</h3>
          <div className="flex flex-wrap gap-1 rounded-full bg-fog p-1 sm:inline-flex">
            {DOC_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ docType: t.value })}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  invoice.docType === t.value
                    ? "bg-white text-ink shadow-sm"
                    : "text-subtle hover:text-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">From</h3>
          <Field label="Business name" id="inv-business-name">
            <input
              id="inv-business-name"
              className={inputCls}
              value={invoice.businessName}
              onChange={(e) => onChange({ businessName: e.target.value })}
              placeholder="Studio Nova LLC"
            />
          </Field>
          <Field label="Email" id="inv-business-email">
            <input
              id="inv-business-email"
              type="email"
              className={inputCls}
              value={invoice.businessEmail}
              onChange={(e) => onChange({ businessEmail: e.target.value })}
              placeholder="billing@studionova.com"
            />
          </Field>
          <Field label="Address" id="inv-business-address">
            <textarea
              id="inv-business-address"
              className={`${inputCls} min-h-[72px] resize-none`}
              value={invoice.businessAddress}
              onChange={(e) => onChange({ businessAddress: e.target.value })}
              placeholder={"123 Market St\nSan Francisco, CA 94103"}
            />
          </Field>

          {allowLogo ? (
            <Field label="Logo (optional)">
              {invoice.logoDataUrl ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={invoice.logoDataUrl}
                  alt="Logo preview"
                  className="h-11 w-11 rounded-lg border border-hairline object-contain"
                />
                <button
                  type="button"
                  onClick={() => onChange({ logoDataUrl: null })}
                  className="text-sm text-link hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex h-[46px] cursor-pointer items-center justify-center rounded-xl border border-dashed border-hairline bg-white text-sm text-subtle transition hover:border-accent hover:text-accent">
                Upload image
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>
            )}
            </Field>
          ) : null}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Bill to</h3>

          {clients.length > 0 ? (
            <Field label="Saved clients" id="inv-client-select">
              <select
                id="inv-client-select"
                className={inputCls}
                value={selectedClientId}
                onChange={(e) => selectClient(e.target.value)}
              >
                <option value="new">+ New client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.email ? ` (${c.email})` : ""}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}

          <Field label="Client name" id="inv-client-name">
            <input
              id="inv-client-name"
              className={inputCls}
              value={invoice.clientName}
              onChange={(e) => {
                onChange({ clientName: e.target.value });
                if (selectedClientId !== "new") { setSelectedClientId("new"); onClientSelect?.(null); }
              }}
              placeholder="Acme Inc."
            />
          </Field>
          <Field label="Email" id="inv-client-email">
            <input
              id="inv-client-email"
              type="email"
              className={inputCls}
              value={invoice.clientEmail}
              onChange={(e) => {
                onChange({ clientEmail: e.target.value });
                if (selectedClientId !== "new") { setSelectedClientId("new"); onClientSelect?.(null); }
              }}
              placeholder="ap@acme.com"
            />
          </Field>
          <Field label="Address" id="inv-client-address">
            <textarea
              id="inv-client-address"
              className={`${inputCls} min-h-[72px] resize-none`}
              value={invoice.clientAddress}
              onChange={(e) => {
                onChange({ clientAddress: e.target.value });
                if (selectedClientId !== "new") { setSelectedClientId("new"); onClientSelect?.(null); }
              }}
              placeholder={"456 Broadway\nNew York, NY 10013"}
            />
          </Field>
          {selectedClientId === "new" && invoice.clientName.trim() ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void saveAsNewClient()}
                disabled={savingClient}
                className="text-sm font-medium text-link transition-opacity hover:opacity-70 disabled:opacity-50"
              >
                {savingClient ? "Saving…" : "+ Save as new client"}
              </button>
              {clientSaveNote ? <span className="text-xs text-subtle">{clientSaveNote}</span> : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Items</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              className="text-sm font-medium text-link transition-opacity hover:opacity-70"
            >
              + Add from saved services
            </button>
            <button
              type="button"
              onClick={onAddItem}
              className="text-sm font-medium text-link transition-opacity hover:opacity-70"
            >
              + Add item
            </button>
          </div>
        </div>

        {servicesOpen ? (
          <div className="rounded-xl border border-hairline bg-fog/40 p-3">
            {services.length === 0 ? (
              <p className="px-1 py-2 text-sm text-subtle">
                No saved services yet — add one below to reuse it on any future invoice.
              </p>
            ) : (
              <ul className="max-h-56 divide-y divide-hairline overflow-y-auto">
                {services.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => onAddService?.(s)}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink">{s.name}</span>
                        {s.description ? (
                          <span className="block truncate text-xs text-subtle">{s.description}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-subtle">
                        {s.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-2 border-t border-hairline pt-2">
              {newServiceOpen ? (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-[1fr_100px]">
                    <input
                      className={inputCls}
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Service name, e.g. Website design"
                      aria-label="Service name"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={`${inputCls} text-right tabular-nums`}
                      value={newServiceRate}
                      onChange={(e) => setNewServiceRate(e.target.value)}
                      placeholder="Rate"
                      aria-label="Service rate"
                    />
                  </div>
                  <input
                    className={inputCls}
                    value={newServiceDescription}
                    onChange={(e) => setNewServiceDescription(e.target.value)}
                    placeholder="Description (optional)"
                    aria-label="Service description"
                  />
                  {serviceError ? <p className="text-xs text-red-600">{serviceError}</p> : null}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void saveNewService()}
                      disabled={!newServiceName.trim() || savingService}
                      className="text-sm font-medium text-link transition-opacity hover:opacity-70 disabled:opacity-50"
                    >
                      {savingService ? "Saving…" : "Save service"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewServiceOpen(false)}
                      className="text-sm text-subtle transition-opacity hover:opacity-70"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setNewServiceOpen(true)}
                  className="text-sm font-medium text-link transition-opacity hover:opacity-70"
                >
                  + New service
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div className="hidden grid-cols-[1fr_64px_104px_96px_28px] gap-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-subtle sm:grid">
          <span>Description</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Amount</span>
          <span />
        </div>

        <div className="space-y-3">
          {invoice.items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1fr_28px] items-start gap-3 sm:grid-cols-[1fr_64px_104px_96px_28px]"
            >
              <input
                className={inputCls}
                value={item.description}
                onChange={(e) => onItemChange(item.id, { description: e.target.value })}
                placeholder="Description of service or product"
                aria-label="Description"
              />
              <input
                type="number"
                min={0}
                className={`${inputCls} px-2 text-right tabular-nums`}
                value={item.quantity}
                onChange={(e) =>
                  onItemChange(item.id, { quantity: Number(e.target.value) || 0 })
                }
                aria-label="Quantity"
              />
              <input
                type="number"
                min={0}
                step="0.01"
                className={`${inputCls} px-2 text-right tabular-nums`}
                value={item.rate}
                onChange={(e) => onItemChange(item.id, { rate: Number(e.target.value) || 0 })}
                aria-label="Rate"
              />
              <div className="col-start-1 flex h-[46px] items-center justify-end px-1 text-[15px] tabular-nums text-subtle sm:col-auto">
                {(item.quantity * item.rate).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <button
                type="button"
                onClick={() => onRemoveItem(item.id)}
                disabled={invoice.items.length === 1}
                aria-label="Remove item"
                className="mt-2 flex h-7 w-7 items-center justify-center justify-self-end rounded-full text-lg leading-none text-subtle transition hover:bg-fog hover:text-ink disabled:pointer-events-none disabled:opacity-30 sm:mt-0 sm:self-center"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency" id="inv-currency">
            <select
              id="inv-currency"
              className={inputCls}
              value={invoice.currency}
              onChange={(e) => onChange({ currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tax %" id="inv-tax">
            <input
              id="inv-tax"
              type="number"
              min={0}
              step="0.01"
              className={inputCls}
              value={invoice.taxRate}
              onChange={(e) => onChange({ taxRate: Number(e.target.value) || 0 })}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Discount" id="inv-discount">
              <div className="flex items-center gap-2">
                <select
                  aria-label="Discount type"
                  value={invoice.discountMode === "fixed" ? "fixed" : "percent"}
                  onChange={(e) => {
                    const mode = e.target.value as "percent" | "fixed";
                    if (mode === "fixed") {
                      const keep = Number(invoice.discount) > 0 ? Number(invoice.discount) : Number(invoice.discountAmount) || 0;
                      onChange({ discountMode: "fixed", discountAmount: keep, discount: 0 });
                    } else {
                      const keep = Number(invoice.discountAmount) > 0 ? Number(invoice.discountAmount) : Number(invoice.discount) || 0;
                      onChange({ discountMode: "percent", discount: keep > 100 ? 0 : keep, discountAmount: 0 });
                    }
                  }}
                  style={{ width: 118, minWidth: 118 }}
                  className={inputCls}
                >
                  <option value="percent">%</option>
                  <option value="fixed">Amount</option>
                </select>
                {invoice.discountMode === "fixed" ? (
                  <input
                    id="inv-discount"
                    type="number"
                    min={0}
                    step="0.01"
                    className={`${inputCls} min-w-0 flex-1`}
                    value={invoice.discountAmount ?? 0}
                    onChange={(e) =>
                      onChange({
                        discountAmount: Number(e.target.value) || 0,
                        discount: 0,
                      })
                    }
                    placeholder="0.00"
                  />
                ) : (
                  <input
                    id="inv-discount"
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    className={`${inputCls} min-w-0 flex-1`}
                    value={invoice.discount}
                    onChange={(e) =>
                      onChange({
                        discount: Number(e.target.value) || 0,
                        discountAmount: 0,
                      })
                    }
                  />
                )}
              </div>
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Shipping" id="inv-shipping">
              <input
                id="inv-shipping"
                type="number"
                min={0}
                step="0.01"
                className={inputCls}
                value={invoice.shipping}
                onChange={(e) => onChange({ shipping: Number(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </Field>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={invoice.docType === "receipt" ? "Date paid" : "Issue date"} id="inv-issue-date">
            <input
              id="inv-issue-date"
              type="date"
              className={inputCls}
              value={invoice.issueDate}
              onChange={(e) => onChange({ issueDate: e.target.value })}
            />
          </Field>
          <Field label={invoice.docType === "quote" || invoice.docType === "estimate" ? "Valid until" : "Due date"} id="inv-due-date">
            <input
              id="inv-due-date"
              type="date"
              className={inputCls}
              value={invoice.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value })}
            />
          </Field>
        </div>
      </section>

      {showRecurring ? (
        <section>
          <Field label="Billing frequency" id="inv-recurring">
            <select
              id="inv-recurring"
              className={inputCls}
              value={invoice.recurring}
              onChange={(e) => onChange({ recurring: e.target.value })}
            >
              {RECURRING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </section>
      ) : null}

      <section>
        <Field label="Theme" id="inv-theme">
          <div className="flex items-center gap-2 rounded-xl border border-hairline bg-white px-3.5 py-2.5">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ theme: t.value })}
                title={t.label}
                aria-label={t.label}
                className={`h-7 w-7 rounded-full transition ${
                  invoice.theme === t.value
                    ? "ring-2 ring-offset-2 ring-[#166534]"
                    : "opacity-60 hover:opacity-100"
                }`}
                style={{ background: t.color }}
              />
            ))}
          </div>
        </Field>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Custom fields</h3>
          <button
            type="button"
            onClick={() =>
              onChange({
                customFields: [
                  ...invoice.customFields,
                  { id: newId(), label: "", value: "" },
                ],
              })
            }
            className="text-sm font-medium text-link transition-opacity hover:opacity-70"
          >
            + Add field
          </button>
        </div>
        {invoice.customFields.length === 0 ? (
          <p className="text-sm text-subtle">
            Add purchase order numbers, project references, or any extra detail that
            appears on the invoice.
          </p>
        ) : (
          invoice.customFields.map((f) => (
            <div key={f.id} className="grid grid-cols-[1fr_1fr_28px] items-start gap-3">
              <input
                className={inputCls}
                value={f.label}
                onChange={(e) =>
                  onChange({
                    customFields: invoice.customFields.map((cf) =>
                      cf.id === f.id ? { ...cf, label: e.target.value } : cf
                    ),
                  })
                }
                placeholder="Field name (e.g. Purchase order #)"
                aria-label="Custom field name"
              />
              <input
                className={inputCls}
                value={f.value}
                onChange={(e) =>
                  onChange({
                    customFields: invoice.customFields.map((cf) =>
                      cf.id === f.id ? { ...cf, value: e.target.value } : cf
                    ),
                  })
                }
                placeholder="Value"
                aria-label="Custom field value"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    customFields: invoice.customFields.filter((cf) => cf.id !== f.id),
                  })
                }
                aria-label="Remove custom field"
                className="mt-2 flex h-7 w-7 items-center justify-center rounded-full text-lg leading-none text-subtle transition hover:bg-fog hover:text-ink"
              >
                &times;
              </button>
            </div>
          ))
        )}
      </section>

      {/* Payment details: optional, off by default */}
      <section
        className={`rounded-2xl border p-4 transition-colors ${
          payUiOpen ? "border-accent/30 bg-white" : "border-hairline bg-white"
        }`}
      >
        <button
          type="button"
          role="switch"
          aria-checked={payUiOpen}
          onClick={() => onChange({ paymentEnabled: !payUiOpen })}
          className="flex w-full items-center justify-between gap-3 rounded-xl text-left"
        >
          <span>
            <span className="block text-[15px] font-semibold tracking-tight text-ink">
              Payment details
            </span>
            <span className="mt-0.5 block text-[13px] text-subtle">
              {payUiOpen
                ? "Pay-online link or bank/payment instructions shown on the invoice."
                : "Add a pay-online link or payment instructions to your invoice."}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
              payUiOpen ? "bg-accent" : "bg-[#e4e4e9]"
            }`}
          >
            <span
              className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-all ${
                payUiOpen ? "left-7" : "left-1"
              }`}
            >
              {payUiOpen ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </span>
          </span>
        </button>

        {payUiOpen ? (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["link", "Pay online with a link"],
                  ["instructions", "Payment instructions"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPayMode(value)}
                  aria-pressed={payMode === value}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${
                    payMode === value
                      ? "bg-[#166534] text-white"
                      : "border border-hairline bg-white text-ink hover:border-accent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {payMode === "link" ? (
              <Field label="Payment link" id="inv-payment-link">
                <input
                  id="inv-payment-link"
                  type="url"
                  className={inputCls}
                  value={invoice.paymentLink}
                  onChange={(e) => onChange({ paymentLink: e.target.value })}
                  placeholder="https://pay.example.com/…"
                />
              </Field>
            ) : (
              <Field label="How to pay" id="inv-payment-instructions">
                <textarea
                  id="inv-payment-instructions"
                  className={`${inputCls} min-h-[72px] resize-none`}
                  value={invoice.paymentInstructions}
                  onChange={(e) => onChange({ paymentInstructions: e.target.value })}
                  placeholder={"Bank transfer:\nAccount name: Studio Nova LLC\nIBAN: …"}
                />
              </Field>
            )}
          </div>
        ) : null}
      </section>

      <section className="grid gap-6 sm:grid-cols-[1fr_auto]">
        <Field label="Notes & payment terms" id="inv-notes">
          <textarea
            id="inv-notes"
            className={`${inputCls} min-h-[88px] resize-none`}
            value={invoice.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Payment details, bank info, thank-you note…"
          />
        </Field>
        <div className="flex items-end pb-1">
          <p className="max-w-[180px] text-xs leading-relaxed text-subtle">
            Everything is saved automatically in your browser. Nothing leaves your device.
          </p>
        </div>
      </section>
    </div>
  );
}
