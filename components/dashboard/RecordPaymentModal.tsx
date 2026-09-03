"use client";

import { useState } from "react";
import { Modal } from "@/components/dashboard/Modal";
import { formatMoney } from "@/lib/invoice";
import { PAYMENT_METHODS, paymentMethodLabel, remainingBalance, round2, type PaymentMethod } from "@/lib/invoice-status";

export type PaymentResult = { amountPaid: number; total: number; status: string };

export function RecordPaymentModal({
  open,
  onClose,
  invoiceId,
  number,
  currency,
  total,
  amountPaid,
  onRecorded,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  number: string;
  currency: string;
  total: number;
  amountPaid: number;
  onRecorded: (invoice: PaymentResult) => void;
}) {
  const remaining = remainingBalance(total, amountPaid);
  const [amount, setAmount] = useState(() => (remaining > 0 ? String(remaining) : ""));
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [otherLabel, setOtherLabel] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setAmount(remaining > 0 ? String(remaining) : "");
    setMethod("bank_transfer");
    setOtherLabel("");
    setDate(new Date().toISOString().slice(0, 10));
    setReference("");
    setNotes("");
    setError("");
  }

  function close() {
    if (busy) return;
    reset();
    onClose();
  }

  const parsedAmount = round2(Number(amount));
  const amountError =
    amount.trim() === ""
      ? ""
      : !Number.isFinite(parsedAmount) || parsedAmount <= 0
        ? "Enter an amount greater than zero."
        : parsedAmount > remaining + 0.005
          ? `Can't exceed the remaining balance of ${formatMoney(remaining, currency)}.`
          : "";

  async function submit() {
    if (busy) return;
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (parsedAmount > remaining + 0.005) {
      setError(`Can't exceed the remaining balance of ${formatMoney(remaining, currency)}.`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          paymentMethod: method === "other" && otherLabel.trim() ? otherLabel.trim() : method,
          paymentDate: date,
          reference,
          notes,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; invoice?: PaymentResult; error?: string };
      if (!res.ok || !json.ok || !json.invoice) {
        setError(json.error || "Could not record the payment. Please try again.");
        setBusy(false);
        return;
      }
      onRecorded(json.invoice);
      reset();
      setBusy(false);
      onClose();
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Record payment" subtitle={`Invoice ${number}`} maxWidth="440px">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-3.5 text-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Invoice total</p>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">{formatMoney(total, currency)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Already paid</p>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-[#00875a]">{formatMoney(amountPaid, currency)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Remaining</p>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">{formatMoney(remaining, currency)}</p>
          </div>
        </div>

        <div>
          <label htmlFor="pay-amount" className="mb-1 block text-[13px] font-medium text-[#374151]">
            Amount received
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[14px] text-[#6b7280]">
              {currency}
            </span>
            <input
              id="pay-amount"
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-[#e5e7eb] py-2.5 pl-14 pr-3.5 text-[15px] text-ink outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
            />
          </div>
          {amountError ? <p className="mt-1 text-[12px] text-[#d70015]">{amountError}</p> : null}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pay-method" className="mb-1 block text-[13px] font-medium text-[#374151]">
              Payment method
            </label>
            <select
              id="pay-method"
              value={method}
              onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {paymentMethodLabel(m)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pay-date" className="mb-1 block text-[13px] font-medium text-[#374151]">
              Payment date
            </label>
            <input
              id="pay-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
            />
          </div>
        </div>

        {method === "other" ? (
          <div>
            <label htmlFor="pay-method-other" className="mb-1 block text-[13px] font-medium text-[#374151]">
              Specify method <span className="text-[#9ca3af]">(optional)</span>
            </label>
            <input
              id="pay-method-other"
              type="text"
              value={otherLabel}
              onChange={(e) => setOtherLabel(e.target.value)}
              placeholder="e.g. Mobile money, cheque, crypto…"
              maxLength={60}
              className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="pay-ref" className="mb-1 block text-[13px] font-medium text-[#374151]">
            Payment reference <span className="text-[#9ca3af]">(optional)</span>
          </label>
          <input
            id="pay-ref"
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Transaction ID, transfer ref…"
            className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] text-ink outline-none placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
          />
        </div>

        <div>
          <label htmlFor="pay-notes" className="mb-1 block text-[13px] font-medium text-[#374151]">
            Notes <span className="text-[#9ca3af]">(optional)</span>
          </label>
          <textarea
            id="pay-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] text-ink outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
          />
        </div>

        {error ? <p className="text-[13px] text-[#d70015]">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={busy || remaining <= 0}
            className="rounded-full bg-[#166534] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60"
          >
            {busy ? "Recording…" : "Record payment"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
