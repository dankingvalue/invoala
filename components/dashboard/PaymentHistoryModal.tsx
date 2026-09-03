"use client";

import { useEffect, useState } from "react";
import { Modal, ConfirmDialog } from "@/components/dashboard/Modal";
import { formatMoney } from "@/lib/invoice";
import { PAYMENT_METHODS, paymentMethodLabel, remainingBalance, round2, type PaymentMethod } from "@/lib/invoice-status";
import type { PaymentResult } from "@/components/dashboard/RecordPaymentModal";
import { EditIcon, DeleteIcon } from "@/components/dashboard/icons";

type PaymentRow = {
  id: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference: string;
  notes: string;
  created_at: number;
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function PaymentHistoryModal({
  open,
  onClose,
  invoiceId,
  number,
  currency,
  total,
  onChanged,
}: {
  open: boolean;
  onClose: () => void;
  invoiceId: string;
  number: string;
  currency: string;
  total: number;
  onChanged: (invoice: PaymentResult) => void;
}) {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMethod, setEditMethod] = useState<PaymentMethod>("other");
  const [editDate, setEditDate] = useState("");
  const [editReference, setEditReference] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch(`/api/invoices/${invoiceId}/payments`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { payments?: PaymentRow[] } | null) => setPayments(data?.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  const amountPaid = round2(payments.reduce((s, p) => s + p.amount, 0));
  const balance = remainingBalance(total, amountPaid);

  function startEdit(p: PaymentRow) {
    setEditingId(p.id);
    setEditAmount(String(p.amount));
    setEditMethod((PAYMENT_METHODS as readonly string[]).includes(p.payment_method) ? (p.payment_method as PaymentMethod) : "other");
    setEditDate(p.payment_date);
    setEditReference(p.reference || "");
    setEditNotes(p.notes || "");
    setRowError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setRowError(null);
  }

  async function saveEdit(paymentId: string) {
    const amount = round2(Number(editAmount));
    if (!Number.isFinite(amount) || amount <= 0) {
      setRowError({ id: paymentId, message: "Enter an amount greater than zero." });
      return;
    }
    setRowBusy(paymentId);
    setRowError(null);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          paymentMethod: editMethod,
          paymentDate: editDate,
          reference: editReference,
          notes: editNotes,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; payment?: PaymentRow; invoice?: PaymentResult; error?: string };
      if (!res.ok || !json.ok || !json.payment || !json.invoice) {
        setRowError({ id: paymentId, message: json.error || "Could not save this payment." });
        setRowBusy(null);
        return;
      }
      setPayments((rows) => rows.map((r) => (r.id === paymentId ? json.payment! : r)));
      onChanged(json.invoice);
      setEditingId(null);
      setRowBusy(null);
    } catch {
      setRowError({ id: paymentId, message: "Network error. Please try again." });
      setRowBusy(null);
    }
  }

  async function confirmDelete() {
    const paymentId = deleteTarget;
    if (!paymentId) return;
    setRowBusy(paymentId);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/payments/${paymentId}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; invoice?: PaymentResult; error?: string };
      if (!res.ok || !json.ok || !json.invoice) {
        setRowError({ id: paymentId, message: json.error || "Could not delete this payment." });
        setRowBusy(null);
        setDeleteTarget(null);
        return;
      }
      setPayments((rows) => rows.filter((r) => r.id !== paymentId));
      onChanged(json.invoice);
      setRowBusy(null);
      setDeleteTarget(null);
    } catch {
      setRowError({ id: paymentId, message: "Network error. Please try again." });
      setRowBusy(null);
      setDeleteTarget(null);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Payment history" subtitle={`Invoice ${number}`} maxWidth="560px">
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-[#e5e7eb] bg-[#f9fafb] p-3.5 text-center">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Total invoice</p>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">{formatMoney(total, currency)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Total paid</p>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-[#00875a]">{formatMoney(amountPaid, currency)}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Remaining</p>
            <p className="mt-1 text-[14px] font-semibold tabular-nums text-ink">{formatMoney(balance, currency)}</p>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <p className="py-6 text-center text-[13px] text-[#6b7280]">Loading…</p>
          ) : payments.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-[#6b7280]">No payments recorded</p>
          ) : (
            <ul className="divide-y divide-[#e5e7eb] rounded-xl border border-[#e5e7eb]">
              {payments.map((p) => (
                <li key={p.id} className="p-3.5">
                  {editingId === p.id ? (
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534]"
                          aria-label="Amount"
                        />
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534]"
                          aria-label="Payment date"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        <select
                          value={editMethod}
                          onChange={(e) => setEditMethod(e.target.value as PaymentMethod)}
                          className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534]"
                          aria-label="Payment method"
                        >
                          {PAYMENT_METHODS.map((m) => (
                            <option key={m} value={m}>
                              {paymentMethodLabel(m)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editReference}
                          onChange={(e) => setEditReference(e.target.value)}
                          placeholder="Reference"
                          className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none placeholder:text-[#9ca3af] focus:border-[#166534]"
                          aria-label="Reference"
                        />
                      </div>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        rows={2}
                        placeholder="Notes"
                        className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none placeholder:text-[#9ca3af] focus:border-[#166534]"
                        aria-label="Notes"
                      />
                      {rowError?.id === p.id ? <p className="text-[12px] text-[#d70015]">{rowError.message}</p> : null}
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={rowBusy === p.id}
                          className="rounded-full border border-[#e5e7eb] px-3.5 py-1.5 text-[12px] font-medium text-ink transition hover:bg-[#f3f4f6] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => void saveEdit(p.id)}
                          disabled={rowBusy === p.id}
                          className="rounded-full bg-[#166534] px-3.5 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60"
                        >
                          {rowBusy === p.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold tabular-nums text-ink">
                          {formatMoney(p.amount, currency)}{" "}
                          <span className="font-normal text-[#6b7280]">· {paymentMethodLabel(p.payment_method)}</span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#6b7280]">
                          {formatDate(p.payment_date)}
                          {p.reference ? ` · Ref: ${p.reference}` : ""}
                        </p>
                        {p.notes ? <p className="mt-1 text-[12px] text-[#9ca3af]">{p.notes}</p> : null}
                        <p className="mt-1 text-[11px] text-[#9ca3af]">
                          Recorded {new Date(p.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {rowError?.id === p.id ? <p className="mt-1 text-[12px] text-[#d70015]">{rowError.message}</p> : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          aria-label="Edit payment"
                          title="Edit payment"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-ink"
                        >
                          <EditIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(p.id)}
                          aria-label="Delete payment"
                          title="Delete payment"
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#fef2f2] hover:text-[#d70015]"
                        >
                          <DeleteIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
          >
            Close
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete payment?"
        body="This will remove the recorded payment and recalculate the invoice balance."
        confirmLabel="Delete payment"
        busy={rowBusy === deleteTarget}
      />
    </>
  );
}
