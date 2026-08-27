"use client";

import { useEffect, useState } from "react";
import type { Invoice } from "@/lib/invoice";
import { InvoicePreview } from "@/components/InvoicePreview";

type CustomerData = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    timezone: string;
    email_verified: number;
    created_at: number;
  };
  subscription: {
    plan: string;
    status: string;
    provider: string;
    current_period_end: number;
    cancel_at_period_end: number;
  } | null;
  invoices: Array<{
    id: string;
    number: string;
    status: string;
    client_name: string;
    total: number;
    currency: string;
    created_at: number;
    data: string;
  }>;
  conversations: Array<{
    id: string;
    subject: string;
    status: string;
    created_at: number;
    updated_at: number;
  }>;
};

export function CustomerSlideOut({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetch(`/api/admin/customers/${userId}`)
      .then(async (r) => (r.ok ? r.json() : null))
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg overflow-y-auto bg-white shadow-2xl ring-1 ring-black/10">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline bg-white px-6 py-4">
          <h2 className="text-lg font-semibold">Customer details</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-subtle hover:bg-fog hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-subtle text-center">Loading…</div>
        ) : !data ? (
          <div className="p-6 text-sm text-subtle text-center">Customer not found.</div>
        ) : (
          <div className="space-y-6 p-6">
            {/* Profile */}
            <div className="rounded-[20px] bg-fog p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Profile</p>
              <p className="mt-2 text-lg font-semibold">{data.user.name || "Unnamed"}</p>
              <p className="mt-0.5 text-sm text-subtle">{data.user.email}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-subtle">
                <span>Role: {data.user.role}</span>
                <span>·</span>
                <span>Joined: {new Date(data.user.created_at).toLocaleDateString()}</span>
                <span>·</span>
                <span>{data.user.email_verified ? "Verified" : "Unverified"}</span>
              </div>
            </div>

            {/* Subscription */}
            <div className="rounded-[20px] bg-fog p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Subscription</p>
              {data.subscription ? (
                <div className="mt-2">
                  <p className="text-sm font-medium capitalize">
                    {data.subscription.plan.replace(/_/g, " ")}
                  </p>
                  <p className="mt-1 text-xs text-subtle">
                    Status: {data.subscription.status} · {data.subscription.provider}
                    {data.subscription.cancel_at_period_end
                      ? " · Cancels at period end"
                      : ""}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-subtle">Free tier</p>
              )}
            </div>

            {/* Recent invoices */}
            <div className="rounded-[20px] bg-fog p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Recent invoices ({data.invoices.length})
              </p>
              {data.invoices.length === 0 ? (
                <p className="mt-2 text-sm text-subtle">No invoices yet.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {data.invoices.map((inv) => (
                    <button
                      key={inv.id}
                      type="button"
                      onClick={() => {
                        try {
                          setPreviewInvoice(JSON.parse(inv.data) as Invoice);
                        } catch {}
                      }}
                      className="flex w-full items-center justify-between rounded-xl bg-white p-3 text-left text-sm ring-1 ring-black/5 transition hover:ring-accent/30"
                    >
                      <div>
                        <p className="font-medium">{inv.client_name || "Untitled"}</p>
                        <p className="mt-0.5 text-xs text-subtle">#{inv.number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium tabular-nums">
                          {inv.total.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}{" "}
                          {inv.currency}
                        </p>
                        <p
                          className={`mt-0.5 text-xs font-medium capitalize ${
                            inv.status === "paid"
                              ? "text-[#166534]"
                              : inv.status === "outstanding"
                                ? "text-amber-600"
                                : "text-subtle"
                          }`}
                        >
                          {inv.status}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Conversations */}
            <div className="rounded-[20px] bg-fog p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Support tickets ({data.conversations.length})
              </p>
              {data.conversations.length === 0 ? (
                <p className="mt-2 text-sm text-subtle">No tickets.</p>
              ) : (
                <div className="mt-3 space-y-2">
                  {data.conversations.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl bg-white p-3 text-sm ring-1 ring-black/5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium">
                          {c.subject || "No subject"}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                            c.status === "resolved"
                              ? "bg-[#166534]/10 text-[#166534]"
                              : c.status === "escalated"
                                ? "bg-red-50 text-red-600"
                                : "bg-fog text-subtle"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-subtle">
                        {new Date(c.updated_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invoice preview modal */}
      {previewInvoice ? (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => setPreviewInvoice(null)}
          />
          <div className="fixed inset-4 z-[70] overflow-y-auto rounded-2xl bg-white shadow-2xl sm:inset-8 lg:inset-16">
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
    </>
  );
}
