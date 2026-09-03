"use client";

import { useEffect, useMemo, useState } from "react";
import { formatMoney, newId } from "@/lib/invoice";
import { remainingBalance } from "@/lib/invoice-status";
import type { ClientRow, ClientFinancials } from "@/lib/data";
import { ConfirmDialog } from "@/components/dashboard/Modal";
import { ClientModal } from "@/components/dashboard/ClientModal";
import { ClientProfile } from "@/components/dashboard/ClientProfile";
import { PlusIcon, SearchIcon, ViewIcon, EditIcon, ArchiveIcon, DeleteIcon, EmailIcon, ReceiptIcon, HistoryIcon, SendIcon, BuildingIcon } from "@/components/dashboard/icons";
import { RowMenu, type RowMenuItem } from "@/components/dashboard/RowMenu";

type Team = { id: string; name: string };

type SortKey = "name" | "newest" | "oldest" | "highest_invoiced" | "highest_outstanding";
type StatusFilter = "all" | "active" | "archived" | "outstanding" | "paid";

function zero(): ClientFinancials {
  return { client_id: "", invoice_count: 0, total_invoiced: 0, total_paid: 0, last_invoice_at: null };
}

function ClientRowMenu({
  client,
  onView,
  onNewInvoice,
  onNewQuote,
  onStatement,
  onEmail,
  onEdit,
  onArchiveToggle,
  onDelete,
}: {
  client: ClientRow;
  onView: () => void;
  onNewInvoice: () => void;
  onNewQuote: () => void;
  onStatement: () => void;
  onEmail: () => void;
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}) {
  const items: RowMenuItem[] = [
    { key: "view", label: "View client", icon: <ViewIcon />, onClick: onView },
    { key: "invoice", label: "Create invoice", icon: <PlusIcon />, onClick: onNewInvoice },
    { key: "quote", label: "Create quote", icon: <ReceiptIcon />, onClick: onNewQuote },
    { key: "statement", label: "Send statement", icon: <SendIcon />, onClick: onStatement },
    { key: "history", label: "View payments", icon: <HistoryIcon />, onClick: onView },
    { key: "email", label: "Email client", icon: <EmailIcon />, onClick: onEmail },
    { key: "edit", label: "Edit client", icon: <EditIcon />, onClick: onEdit },
    {
      key: "archive",
      label: client.status === "archived" ? "Reactivate client" : "Archive client",
      icon: <ArchiveIcon />,
      onClick: onArchiveToggle,
    },
    { key: "delete", label: "Delete client", icon: <DeleteIcon />, onClick: onDelete, danger: true },
  ];

  return <RowMenu items={items} />;
}

export function ClientsTab({ teams }: { teams: Team[] }) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [financials, setFinancials] = useState<Record<string, ClientFinancials>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClientRow | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/clients")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { clients?: ClientRow[]; financials?: Record<string, ClientFinancials> } | null) => {
        if (data?.clients) setClients(data.clients);
        if (data?.financials) setFinancials(data.financials);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = clients.filter((c) => {
      if (q) {
        const hay = `${c.name} ${c.contact_name} ${c.email} ${c.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const fin = financials[c.id] || zero();
      const outstanding = remainingBalance(fin.total_invoiced, fin.total_paid);
      switch (statusFilter) {
        case "active": return c.status !== "archived";
        case "archived": return c.status === "archived";
        case "outstanding": return outstanding > 0;
        case "paid": return fin.invoice_count > 0 && outstanding <= 0;
        default: return true;
      }
    });
    rows = rows.slice().sort((a, b) => {
      const fa = financials[a.id] || zero();
      const fb = financials[b.id] || zero();
      switch (sortKey) {
        case "newest": return b.created_at - a.created_at;
        case "oldest": return a.created_at - b.created_at;
        case "highest_invoiced": return fb.total_invoiced - fa.total_invoiced;
        case "highest_outstanding":
          return remainingBalance(fb.total_invoiced, fb.total_paid) - remainingBalance(fa.total_invoiced, fa.total_paid);
        default: return a.name.localeCompare(b.name);
      }
    });
    return rows;
  }, [clients, financials, search, statusFilter, sortKey]);

  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status !== "archived").length;
  const totalInvoiced = Object.values(financials).reduce((s, f) => s + f.total_invoiced, 0);
  const totalOutstanding = Object.values(financials).reduce((s, f) => s + remainingBalance(f.total_invoiced, f.total_paid), 0);
  const displayCcy = clients.find((c) => c.currency)?.currency || "USD";

  function startNewInvoice(client: ClientRow, docType?: "quote") {
    const payload: { invoice: Record<string, unknown>; clientId: string } = {
      clientId: client.id,
      invoice: {
        clientName: client.name,
        clientEmail: client.email,
        clientAddress: [client.address, client.city, client.state, client.postal_code, client.country].filter(Boolean).join("\n"),
        // The hydration effect on the other end only accepts this payload
        // when invoice.items is a real array — omitting it silently drops
        // the whole handoff and falls back to whatever was last drafted.
        items: [{ id: newId(), description: "", quantity: 1, rate: 0 }],
      },
    };
    if (docType) payload.invoice.docType = docType;
    if (client.currency) payload.invoice.currency = client.currency;
    if (typeof client.default_tax_rate === "number") payload.invoice.taxRate = client.default_tax_rate;
    if (typeof client.default_discount === "number") payload.invoice.discount = client.default_discount;
    if (client.default_notes) payload.invoice.notes = client.default_notes;
    if (client.default_payment_instructions) {
      payload.invoice.paymentInstructions = client.default_payment_instructions;
      payload.invoice.paymentEnabled = true;
    }
    if (typeof client.payment_terms_days === "number") {
      const today = new Date();
      const due = new Date(today);
      due.setUTCDate(due.getUTCDate() + client.payment_terms_days);
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

  async function sendStatement(client: ClientRow) {
    if (!client.email) {
      flash("This client has no email on file.");
      return;
    }
    setBusyId(client.id);
    try {
      const res = await fetch(`/api/clients/${client.id}/statement`, { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      flash(json.ok ? "Statement sent" : json.error || "Could not send statement.");
    } catch {
      flash("Network error while sending the statement.");
    }
    setBusyId(null);
  }

  async function toggleArchive(client: ClientRow) {
    setBusyId(client.id);
    const archived = client.status === "archived";
    const res = await fetch(`/api/clients/${client.id}/archive`, { method: archived ? "DELETE" : "POST" });
    if (res.ok) {
      setClients((rows) => rows.map((r) => (r.id === client.id ? { ...r, status: archived ? "active" : "archived" } : r)));
      flash(archived ? "Client reactivated" : "Client archived");
    } else {
      flash("Could not update this client.");
    }
    setBusyId(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    setDeleteError("");
    const res = await fetch(`/api/clients/${deleteTarget.id}`, { method: "DELETE" });
    const json = (await res.json()) as { ok?: boolean; error?: string };
    if (res.ok && json.ok) {
      setClients((rows) => rows.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      flash("Client deleted");
    } else {
      setDeleteError(json.error || "Could not delete this client.");
    }
    setBusyId(null);
  }

  if (viewingId) {
    return (
      <ClientProfile
        clientId={viewingId}
        onBack={() => { setViewingId(null); load(); }}
        onEdit={(c) => { setEditingClient(c); setModalOpen(true); }}
        onArchiveChanged={load}
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button
          type="button"
          onClick={() => { setEditingClient(null); setModalOpen(true); }}
          className="flex items-center gap-1.5 rounded-full bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d]"
        >
          <PlusIcon /> New client
        </button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Total clients</p>
          <p className="text-[20px] font-bold text-ink">{totalClients}</p>
        </div>
        <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Active clients</p>
          <p className="text-[20px] font-bold text-ink">{activeClients}</p>
        </div>
        <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Total invoiced</p>
          <p className="text-[20px] font-bold tabular-nums text-ink">{formatMoney(totalInvoiced, displayCcy)}</p>
        </div>
        <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">Outstanding</p>
          <p className="text-[20px] font-bold tabular-nums text-ink">{formatMoney(totalOutstanding, displayCcy)}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"><SearchIcon /></span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full rounded-lg border border-[#e5e7eb] py-2 pl-9 pr-3 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] outline-none focus:border-[#166534]"
        >
          <option value="all">All clients</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="outstanding">Has outstanding balance</option>
          <option value="paid">Paid in full</option>
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] outline-none focus:border-[#166534]"
        >
          <option value="name">Sort: Name</option>
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="highest_invoiced">Sort: Highest invoiced</option>
          <option value="highest_outstanding">Sort: Highest outstanding</option>
        </select>
      </div>

      {notice ? <p className="mb-3 text-[13px] text-[#166534]">{notice}</p> : null}

      {loading ? (
        <p className="py-12 text-center text-[14px] text-[#6b7280]">Loading…</p>
      ) : clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e7eb] py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fog text-[#9ca3af]"><BuildingIcon /></div>
          <p className="text-[15px] font-medium text-ink">No clients yet</p>
          <p className="mt-1 text-[13px] text-[#6b7280]">Add your first client to start creating invoices faster.</p>
          <button
            type="button"
            onClick={() => { setEditingClient(null); setModalOpen(true); }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d]"
          >
            <PlusIcon /> Add client
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-[#6b7280]">No clients match your search/filter.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Client</th>
                <th className="px-4 py-2.5 text-right font-semibold">Invoices</th>
                <th className="px-4 py-2.5 text-right font-semibold">Total invoiced</th>
                <th className="px-4 py-2.5 text-right font-semibold">Paid</th>
                <th className="px-4 py-2.5 text-right font-semibold">Outstanding</th>
                <th className="px-4 py-2.5 font-semibold">Last invoice</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const fin = financials[c.id] || zero();
                const outstanding = remainingBalance(fin.total_invoiced, fin.total_paid);
                const ccy = c.currency || "USD";
                return (
                  <tr key={c.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{c.name}</p>
                      <p className="text-[12px] text-[#6b7280]">{c.email || c.contact_name || "—"}</p>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#6b7280]">{fin.invoice_count}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{formatMoney(fin.total_invoiced, ccy)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[#00875a]">{formatMoney(fin.total_paid, ccy)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">{formatMoney(outstanding, ccy)}</td>
                    <td className="px-4 py-3 text-[#6b7280]">
                      {fin.last_invoice_at ? new Date(fin.last_invoice_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2.5">
                        <button type="button" onClick={() => setViewingId(c.id)} className="text-[12px] font-medium text-[#166534] hover:underline">
                          View
                        </button>
                        <button type="button" onClick={() => startNewInvoice(c)} className="text-[12px] text-[#6b7280] hover:text-[#166534]">
                          + Invoice
                        </button>
                        <ClientRowMenu
                          client={c}
                          onView={() => setViewingId(c.id)}
                          onNewInvoice={() => startNewInvoice(c)}
                          onNewQuote={() => startNewInvoice(c, "quote")}
                          onStatement={() => void sendStatement(c)}
                          onEmail={() => { if (c.email) window.location.href = `mailto:${c.email}`; else flash("This client has no email on file."); }}
                          onEdit={() => { setEditingClient(c); setModalOpen(true); }}
                          onArchiveToggle={() => void toggleArchive(c)}
                          onDelete={() => { setDeleteTarget(c); setDeleteError(""); }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {teams.length > 0 ? (
        <p className="mt-3 text-[12px] text-[#9ca3af]">Share a client with a team from its Edit form or profile.</p>
      ) : null}

      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editingClient}
        onSaved={(client, wasEdit) => {
          setClients((rows) => (wasEdit ? rows.map((r) => (r.id === client.id ? client : r)) : [...rows, client].sort((a, b) => a.name.localeCompare(b.name))));
          flash(wasEdit ? "Client updated" : "Client added");
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete client?"
        body={deleteError || "This action cannot be undone. Clients with invoice history can't be deleted — archive them instead."}
        confirmLabel="Delete client"
        busy={!!deleteTarget && busyId === deleteTarget.id}
      />
    </div>
  );
}
