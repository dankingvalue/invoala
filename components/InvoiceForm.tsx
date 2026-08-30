"use client";

import { useState, type ChangeEvent } from "react";
import {
  CURRENCIES,
  RECURRING_OPTIONS,
  type Invoice,
  type LineItem,
} from "@/lib/invoice";
import type { ClientRow } from "@/lib/data";

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
}) {
  const [selectedClientId, setSelectedClientId] = useState<string>("new");

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
    if (id === "new") {
      onChange({ clientName: "", clientEmail: "", clientAddress: "" });
    } else {
      const client = clients.find((c) => c.id === id);
      if (client) {
        onChange({
          clientName: client.name,
          clientEmail: client.email,
          clientAddress: client.address,
        });
      }
    }
  }

  return (
    <div className="space-y-10">
      {showQuoteMode ? (
        <section>
          <h3 className="mb-3 text-lg font-semibold tracking-tight text-ink">Document type</h3>
          <div className="inline-flex rounded-full bg-fog p-1">
            {(["invoice", "quote"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ docType: t })}
                className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                  invoice.docType === t
                    ? "bg-white text-ink shadow-sm"
                    : "text-subtle hover:text-ink"
                }`}
              >
                {t}
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
                if (selectedClientId !== "new") setSelectedClientId("new");
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
                if (selectedClientId !== "new") setSelectedClientId("new");
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
                if (selectedClientId !== "new") setSelectedClientId("new");
              }}
              placeholder={"456 Broadway\nNew York, NY 10013"}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-ink">Items</h3>
          <button
            type="button"
            onClick={onAddItem}
            className="text-sm font-medium text-link transition-opacity hover:opacity-70"
          >
            + Add item
          </button>
        </div>

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
        <div className="grid grid-cols-2 gap-4">
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
          <Field label="Discount %" id="inv-discount">
            <input
              id="inv-discount"
              type="number"
              min={0}
              max={100}
              step="0.01"
              className={inputCls}
              value={invoice.discount}
              onChange={(e) => onChange({ discount: Number(e.target.value) || 0 })}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Issue date" id="inv-issue-date">
            <input
              id="inv-issue-date"
              type="date"
              className={inputCls}
              value={invoice.issueDate}
              onChange={(e) => onChange({ issueDate: e.target.value })}
            />
          </Field>
          <Field label="Due date" id="inv-due-date">
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
