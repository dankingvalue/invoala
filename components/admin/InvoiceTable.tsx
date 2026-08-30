"use client";

import { useEffect, useState } from "react";
import type { Invoice } from "@/lib/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";

type InvoiceRow = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  doc_type: string;
  number: string;
  currency: string;
  status: string;
  client_name: string;
  total: number;
  data: string;
  created_at: number;
  updated_at: number;
};

export function InvoiceTable({ role }: { role: string }) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const pageSize = 50;

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set("q", q);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/admin/invoices?${params}`)
      .then(async (r) => (r.ok ? r.json() : { invoices: [], total: 0 }))
      .then((d) => {
        if (!cancelled) {
          setInvoices(d.invoices);
          setTotal(d.total);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, q, statusFilter]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      {previewInvoice ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setPreviewInvoice(null)}
          />
          <div className="fixed inset-4 z-50 overflow-y-auto rounded-2xl bg-white shadow-2xl sm:inset-8 lg:inset-16">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-white px-6 py-4 rounded-t-2xl">
              <h3 className="font-semibold">Invoice preview</h3>
              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="rounded-full p-2 text-subtle hover:bg-fog hover:text-ink"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <InvoicePreview invoice={previewInvoice} />
            </div>
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search client, number, email…"
          className="w-64 rounded-full border border-hairline px-4 py-2 text-sm outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-lg border border-hairline px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="outstanding">Outstanding</option>
          <option value="paid">Paid</option>
        </select>
        <span className="text-sm text-subtle">
          {total.toLocaleString()} total
        </span>
      </div>

      {loading ? (
        <p className="py-8 text-sm text-subtle text-center">Loading…</p>
      ) : invoices.length === 0 ? (
        <p className="py-8 text-sm text-subtle text-center">No invoices found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-wider text-subtle">
                <th className="pb-2 font-semibold">Number</th>
                <th className="pb-2 font-semibold">Client</th>
                <th className="pb-2 font-semibold">Owner</th>
                <th className="pb-2 font-semibold">Amount</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Created</th>
                <th className="pb-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-[#e8e8ed] last:border-0">
                  <td className="py-2.5 pr-4 font-medium">#{inv.number}</td>
                  <td className="py-2.5 pr-4">{inv.client_name || "—"}</td>
                  <td className="py-2.5 pr-4 text-subtle">{inv.user_email}</td>
                  <td className="py-2.5 pr-4 tabular-nums">
                    {inv.total.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    {inv.currency}
                  </td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        inv.status === "paid"
                          ? "bg-[#166534]/10 text-[#166534]"
                          : inv.status === "outstanding"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-fog text-subtle"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-subtle whitespace-nowrap">
                    {new Date(inv.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          setPreviewInvoice(JSON.parse(inv.data) as Invoice);
                        } catch {}
                      }}
                      className="font-medium text-link text-[13px] hover:underline"
                    >
                      Preview
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="hover:text-ink disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="hover:text-ink disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      ) : null}
    </div>
  );
}
