"use client";

import { useEffect, useState } from "react";
import { formatMoney, newId } from "@/lib/invoice";
import { remainingBalance, paymentMethodLabel } from "@/lib/invoice-status";
import type { ClientRow, InvoiceRow, PaymentRow } from "@/lib/data";
import { BackIcon, EditIcon, PlusIcon } from "@/components/dashboard/icons";

type ProfileData = {
  client: ClientRow;
  invoices: InvoiceRow[];
  payments: (PaymentRow & { invoice_number: string })[];
};

type Tab = "invoices" | "payments" | "quotes" | "activity";

function fmtDate(ms: number | null | undefined): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function activeTotal(invoices: InvoiceRow[]): number {
  return invoices.filter((i) => i.status !== "void" && i.status !== "cancelled").reduce((s, i) => s + (i.total || 0), 0);
}

export function ClientProfile({
  clientId,
  onBack,
  onEdit,
  onArchiveChanged,
}: {
  clientId: string;
  onBack: () => void;
  onEdit: (client: ClientRow) => void;
  onArchiveChanged: () => void;
}) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("invoices");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: ProfileData | null) => setData(json))
      .finally(() => setLoading(false));
  }, [clientId]);

  function newInvoiceForClient() {
    if (!data) return;
    const c = data.client;
    const payload: { invoice: Record<string, unknown>; clientId: string; teamId: string | null } = {
      clientId: c.id,
      teamId: c.team_id,
      invoice: {
        clientName: c.name,
        clientEmail: c.email,
        clientAddress: [c.address, c.city, c.state, c.postal_code, c.country].filter(Boolean).join("\n"),
        // The hydration effect on the other end only accepts this payload
        // when invoice.items is a real array (it's how it tells "a genuine
        // edit/preset payload" apart from a stray/empty localStorage value)
        // — omitting this silently drops the whole handoff.
        items: [{ id: newId(), description: "", quantity: 1, rate: 0 }],
      },
    };
    if (c.currency) payload.invoice.currency = c.currency;
    if (typeof c.default_tax_rate === "number") payload.invoice.taxRate = c.default_tax_rate;
    if (typeof c.default_discount === "number") payload.invoice.discount = c.default_discount;
    if (c.default_notes) payload.invoice.notes = c.default_notes;
    if (c.default_payment_instructions) {
      payload.invoice.paymentInstructions = c.default_payment_instructions;
      payload.invoice.paymentEnabled = true;
    }
    if (typeof c.payment_terms_days === "number") {
      const today = new Date();
      const due = new Date(today);
      due.setUTCDate(due.getUTCDate() + c.payment_terms_days);
      payload.invoice.issueDate = today.toISOString().slice(0, 10);
      payload.invoice.dueDate = due.toISOString().slice(0, 10);
    }
    try {
      localStorage.setItem("invoala.edit", JSON.stringify(payload));
    } catch {}
    // Hard navigation — see the comment on the equivalent handoff in
    // DashboardClient.editInvoice for why router.push isn't safe here.
    window.location.assign("/#generate");
  }

  async function viewInvoice(row: InvoiceRow) {
    try {
      const res = await fetch(`/api/invoices/${row.id}/share`, { method: "POST" });
      const json = (await res.json()) as { url?: string };
      if (json.url) window.open(json.url, "_blank", "noopener,noreferrer");
    } catch {}
  }

  async function toggleArchive() {
    if (!data || busy) return;
    setBusy(true);
    const archived = data.client.status === "archived";
    const res = await fetch(`/api/clients/${clientId}/archive`, { method: archived ? "DELETE" : "POST" });
    if (res.ok) {
      setData((d) => (d ? { ...d, client: { ...d.client, status: archived ? "active" : "archived" } } : d));
      onArchiveChanged();
    }
    setBusy(false);
  }

  if (loading) return <p className="py-12 text-center text-[14px] text-[#6b7280]">Loading…</p>;
  if (!data) return <p className="py-12 text-center text-[14px] text-[#6b7280]">Client not found.</p>;

  const { client, invoices, payments } = data;
  const totalInvoiced = activeTotal(invoices);
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const outstanding = remainingBalance(totalInvoiced, totalPaid);
  const quotes = invoices.filter((i) => i.doc_type === "quote" || i.doc_type === "estimate");
  const regularInvoices = invoices.filter((i) => i.doc_type === "invoice" || i.doc_type === "receipt");

  const activity: Array<{ at: number; label: string }> = [
    { at: client.created_at, label: "Client created" },
    ...(client.updated_at && client.updated_at !== client.created_at ? [{ at: client.updated_at, label: "Client updated" }] : []),
    ...invoices.flatMap((i) => [
      { at: i.created_at, label: `Invoice ${i.number || i.id.slice(0, 8)} created` },
      ...(i.status !== "draft" && i.updated_at !== i.created_at ? [{ at: i.updated_at, label: `Invoice ${i.number} sent` }] : []),
      ...(i.viewed_at ? [{ at: i.viewed_at, label: `Invoice ${i.number} viewed by client` }] : []),
    ]),
    ...payments.map((p) => ({ at: p.created_at, label: `Payment of ${formatMoney(p.amount, client.currency || "USD")} received (${p.invoice_number})` })),
  ].sort((a, b) => b.at - a.at);

  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-[#6b7280] hover:text-ink">
        <BackIcon /> Clients
      </button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold tracking-tight text-ink">{client.name}</h2>
            {client.status === "archived" ? (
              <span className="rounded-full bg-fog px-2.5 py-1 text-[11px] font-semibold text-subtle">Archived</span>
            ) : null}
          </div>
          <p className="mt-1 text-[13px] text-[#6b7280]">
            {[client.email, client.phone].filter(Boolean).join(" · ") || "No contact details on file"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onEdit(client)} className="flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]">
            <EditIcon /> Edit client
          </button>
          <button type="button" onClick={newInvoiceForClient} className="flex items-center gap-1.5 rounded-full bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d]">
            <PlusIcon /> New invoice
          </button>
          <button
            type="button"
            onClick={() => void toggleArchive()}
            disabled={busy}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6] disabled:opacity-50"
          >
            {client.status === "archived" ? "Reactivate" : "Archive"}
          </button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Total invoiced</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums text-ink">{formatMoney(totalInvoiced, client.currency || "USD")}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Total paid</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums text-[#00875a]">{formatMoney(totalPaid, client.currency || "USD")}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Outstanding</p>
          <p className="mt-1 text-[18px] font-bold tabular-nums text-ink">{formatMoney(outstanding, client.currency || "USD")}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-1 rounded-full bg-fog p-1 sm:inline-flex">
        {([
          ["invoices", `Invoices (${regularInvoices.length})`],
          ["payments", `Payments (${payments.length})`],
          ["quotes", `Quotes (${quotes.length})`],
          ["activity", "Activity"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium transition ${tab === id ? "bg-white text-ink shadow-sm" : "text-subtle hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "invoices" ? (
        regularInvoices.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#6b7280]">No invoices for this client yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Number</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Due</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Paid</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Balance</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {regularInvoices.map((i) => {
                  const paid = Number(i.data?.amountPaid) || 0;
                  return (
                    <tr key={i.id} className="cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb]" onClick={() => void viewInvoice(i)}>
                      <td className="px-4 py-2.5 font-medium text-ink">{i.number || "—"}</td>
                      <td className="px-4 py-2.5 text-[#6b7280]">{fmtDate(i.created_at)}</td>
                      <td className="px-4 py-2.5 text-[#6b7280]">{i.data?.dueDate || "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{formatMoney(i.total, i.currency)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[#00875a]">{formatMoney(paid, i.currency)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-ink">{formatMoney(remainingBalance(i.total, paid), i.currency)}</td>
                      <td className="px-4 py-2.5 capitalize text-[#6b7280]">{i.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {tab === "payments" ? (
        payments.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#6b7280]">No payments recorded</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 font-semibold">Invoice</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Amount</th>
                  <th className="px-4 py-2.5 font-semibold">Method</th>
                  <th className="px-4 py-2.5 font-semibold">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-[#f3f4f6]">
                    <td className="px-4 py-2.5 text-[#6b7280]">{p.payment_date}</td>
                    <td className="px-4 py-2.5 font-medium text-ink">{p.invoice_number}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{formatMoney(p.amount, client.currency || "USD")}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{paymentMethodLabel(p.payment_method)}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{p.reference || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-6 border-t border-[#e5e7eb] px-4 py-3 text-[13px]">
              <span className="text-[#6b7280]">Total paid <strong className="text-ink">{formatMoney(totalPaid, client.currency || "USD")}</strong></span>
              <span className="text-[#6b7280]">Outstanding <strong className="text-ink">{formatMoney(outstanding, client.currency || "USD")}</strong></span>
            </div>
          </div>
        )
      ) : null}

      {tab === "quotes" ? (
        quotes.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#6b7280]">No quotes or estimates for this client yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
            <table className="w-full min-w-[480px] text-left text-[13px]">
              <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Number</th>
                  <th className="px-4 py-2.5 font-semibold">Date</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-4 py-2.5 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className="cursor-pointer border-t border-[#f3f4f6] hover:bg-[#f9fafb]" onClick={() => void viewInvoice(q)}>
                    <td className="px-4 py-2.5 font-medium text-ink">{q.number || "—"}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{fmtDate(q.created_at)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-ink">{formatMoney(q.total, q.currency)}</td>
                    <td className="px-4 py-2.5 capitalize text-[#6b7280]">{q.status === "draft" ? "Draft" : "Sent"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : null}

      {tab === "activity" ? (
        activity.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#6b7280]">No activity yet.</p>
        ) : (
          <ul className="space-y-3 rounded-lg border border-[#e5e7eb] bg-white p-4">
            {activity.map((a, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-[13px]">
                <span className="text-ink">{a.label}</span>
                <span className="shrink-0 text-[#9ca3af]">{new Date(a.at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
