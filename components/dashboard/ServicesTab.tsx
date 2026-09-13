"use client";

import { useEffect, useState } from "react";
import type { ServiceItem } from "@/lib/service-items";
import { Modal, ConfirmDialog } from "@/components/dashboard/Modal";
import { PlusIcon, SearchIcon, EditIcon, DeleteIcon, ReceiptIcon } from "@/components/dashboard/icons";
import { RowMenu, type RowMenuItem } from "@/components/dashboard/RowMenu";

function ServiceModal({
  open,
  onClose,
  editing,
  teamId,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editing: ServiceItem | null;
  teamId: string | null;
  onSaved: (service: ServiceItem, wasEdit: boolean) => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [rate, setRate] = useState(editing ? String(editing.rate) : "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [initializedFor, setInitializedFor] = useState<string | null>(editing?.id ?? "new");

  // Re-sync form fields when switching between "new" and a specific service
  // to edit, without needing the parent to key/remount this component (same
  // render-time reset pattern as ClientModal).
  const wantKey = editing?.id ?? "new";
  if (open && initializedFor !== wantKey) {
    setName(editing?.name ?? "");
    setDescription(editing?.description ?? "");
    setRate(editing ? String(editing.rate) : "");
    setError("");
    setInitializedFor(wantKey);
  }

  async function save() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setError("");
    try {
      const body = { name: trimmed, description, rate: Number(rate) || 0, teamId };
      const res = await fetch(editing ? `/api/service-items/${editing.id}` : "/api/service-items", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { ok?: boolean; service?: ServiceItem; error?: string };
      if (res.ok && json.ok && json.service) {
        onSaved(json.service, !!editing);
        onClose();
      } else {
        setError(json.error || "Could not save this service.");
      }
    } catch {
      setError("Network error while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit service" : "New service"} maxWidth="420px">
      <div className="space-y-3">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#6b7280]">Service name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Website design"
            autoFocus
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#6b7280]">Rate</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] tabular-nums outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-[#6b7280]">Description (optional)</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What this line item covers"
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
          />
        </div>
        {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!name.trim() || saving}
            className="rounded-full bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function ServicesTab({ workspace = "personal" }: { workspace?: string }) {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  function load() {
    fetch(`/api/service-items?workspace=${encodeURIComponent(workspace)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { services?: ServiceItem[] } | null) => setServices(data?.services ?? []))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [workspace]);

  function flash(msg: string) {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3000);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    const res = await fetch(`/api/service-items/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setServices((rows) => rows.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
      flash("Service deleted");
    } else {
      flash("Could not delete this service.");
    }
    setBusyId(null);
  }

  const teamId = workspace.startsWith("team:") ? workspace.slice(5) : null;
  const personalCount = services.filter((s) => !s.team_id).length;
  const atFreeCap = personalCount >= 5;
  const filtered = services.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${s.name} ${s.description}`.toLowerCase().includes(q);
  });

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-end gap-3">
        {!teamId ? (
          <p className="text-[12px] text-[#6b7280]">
            {personalCount}/5 saved <span className="text-[#9ca3af]">(Free plan · unlimited on Pro)</span>
          </p>
        ) : null}
        <button
          type="button"
          onClick={openNew}
          title={!teamId && atFreeCap ? "Free plan is limited to 5 saved services — upgrade for unlimited" : undefined}
          className="flex items-center gap-1.5 rounded-full bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d]"
        >
          <PlusIcon /> New service
        </button>
      </div>

      <div className="mb-4 relative min-w-[220px]">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"><SearchIcon /></span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search services…"
          className="w-full max-w-[320px] rounded-lg border border-[#e5e7eb] py-2 pl-9 pr-3 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
        />
      </div>

      {notice ? <p className="mb-3 text-[13px] text-[#166534]">{notice}</p> : null}

      {loading ? (
        <p className="py-12 text-center text-[14px] text-[#6b7280]">Loading…</p>
      ) : services.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#e5e7eb] py-16 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-fog text-[#9ca3af]"><ReceiptIcon /></div>
          <p className="text-[15px] font-medium text-ink">No saved services yet</p>
          <p className="mt-1 text-[13px] text-[#6b7280]">
            Save a line item once — name, description, rate — and add it to any invoice in one click. Free plan saves up to 5.
          </p>
          <button
            type="button"
            onClick={openNew}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#166534] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d]"
          >
            <PlusIcon /> Add service
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-[14px] text-[#6b7280]">No services match your search.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#e5e7eb]">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead className="bg-[#f9fafb] text-[11px] uppercase tracking-wider text-[#6b7280]">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Service</th>
                <th className="px-4 py-2.5 text-right font-semibold">Rate</th>
                <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const items: RowMenuItem[] = [
                  { key: "edit", label: "Edit service", icon: <EditIcon />, onClick: () => { setEditing(s); setModalOpen(true); } },
                  { key: "delete", label: "Delete service", icon: <DeleteIcon />, onClick: () => setDeleteTarget(s), danger: true },
                ];
                return (
                  <tr key={s.id} className="border-t border-[#f3f4f6] hover:bg-[#f9fafb]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{s.name}</p>
                      {s.description ? <p className="text-[12px] text-[#6b7280]">{s.description}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-ink">
                      {s.rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2.5">
                        <button type="button" onClick={() => { setEditing(s); setModalOpen(true); }} className="text-[12px] font-medium text-[#166534] hover:underline">
                          Edit
                        </button>
                        <RowMenu items={items} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ServiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editing={editing}
        teamId={teamId}
        onSaved={(service, wasEdit) => {
          setServices((rows) => (wasEdit ? rows.map((r) => (r.id === service.id ? service : r)) : [...rows, service].sort((a, b) => a.name.localeCompare(b.name))));
          flash(wasEdit ? "Service updated" : "Service added");
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete service?"
        body="This action cannot be undone. It won't affect invoices that already used this service."
        confirmLabel="Delete service"
        busy={!!deleteTarget && busyId === deleteTarget.id}
      />
    </div>
  );
}
