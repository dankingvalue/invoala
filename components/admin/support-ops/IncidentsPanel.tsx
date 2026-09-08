"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type Incident = {
  id: string;
  ref: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  root_cause: string;
  investigation: string;
  workaround: string;
  resolution: string;
  created_at: number;
};

const STATUSES = ["investigating", "identified", "monitoring", "resolved", "closed"];
const SEVERITIES = ["p1", "p2", "p3", "p4"];

export function IncidentsPanel() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("p2");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Incident | null>(null);

  function load() {
    fetch("/api/admin/support/incidents")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { incidents?: Incident[] } | null) => setIncidents(data?.incidents ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  async function createIncident() {
    if (!title.trim()) return;
    setCreating(true);
    await fetch("/api/admin/support/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, severity, description }),
    }).catch(() => {});
    setCreating(false);
    setTitle("");
    setDescription("");
    load();
  }

  async function patch(id: string, fields: Partial<Incident>) {
    await fetch(`/api/admin/support/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    }).catch(() => {});
    load();
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHead title="New incident" subtitle="Multiple customer conversations can link to one incident instead of being investigated separately." />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_140px]">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Invoice PDF generation failing" className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]" />
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]">
            {SEVERITIES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
        </div>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description…" rows={2} className="mt-3 w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
        <button disabled={creating || !title.trim()} onClick={createIncident} className="mt-3 rounded-full bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
          {creating ? "Creating…" : "Create incident"}
        </button>
      </Panel>

      <Panel>
        <SectionHead title="Incidents" />
        {loading ? (
          <p className="mt-6 text-sm text-subtle">Loading…</p>
        ) : incidents.length === 0 ? (
          <p className="mt-6 text-sm text-subtle">No incidents.</p>
        ) : (
          <div className="mt-5 space-y-2">
            {incidents.map((inc) => (
              <div key={inc.id} className="rounded-xl border border-[#e5e7eb] p-3.5">
                <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setSelected(selected?.id === inc.id ? null : inc)}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-subtle">{inc.ref}</span>
                      <span className="rounded-full bg-fog px-2 py-0.5 text-[10px] font-semibold uppercase">{inc.severity}</span>
                      <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#1e40af]">{inc.status}</span>
                    </div>
                    <p className="mt-1 font-medium text-ink">{inc.title}</p>
                  </div>
                  <span className="shrink-0 text-[11px] text-subtle">{new Date(inc.created_at).toLocaleDateString()}</span>
                </button>

                {selected?.id === inc.id ? (
                  <div className="mt-3 space-y-3 border-t border-[#e5e7eb] pt-3 text-[13px]">
                    <div className="flex flex-wrap gap-2">
                      <select value={inc.status} onChange={(e) => patch(inc.id, { status: e.target.value as never })} className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-xs">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select value={inc.severity} onChange={(e) => patch(inc.id, { severity: e.target.value as never })} className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-xs">
                        {SEVERITIES.map((s) => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                      </select>
                    </div>
                    <IncidentEditableField label="Root cause" value={inc.root_cause} onSave={(v) => patch(inc.id, { rootCause: v } as never)} />
                    <IncidentEditableField label="Investigation" value={inc.investigation} onSave={(v) => patch(inc.id, { investigation: v } as never)} />
                    <IncidentEditableField label="Workaround" value={inc.workaround} onSave={(v) => patch(inc.id, { workaround: v } as never)} />
                    <IncidentEditableField label="Resolution" value={inc.resolution} onSave={(v) => patch(inc.id, { resolution: v } as never)} />
                    <IncidentDetail incidentId={inc.id} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function IncidentEditableField({ label, value, onSave }: { label: string; value: string; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">{label}</p>
      <textarea value={v} onChange={(e) => setV(e.target.value)} onBlur={() => v !== value && onSave(v)} rows={2} className="mt-1 w-full rounded-lg border border-[#e5e7eb] p-2 text-[13px] outline-none focus:border-[#166534]" />
    </div>
  );
}

function IncidentDetail({ incidentId }: { incidentId: string }) {
  const [data, setData] = useState<{ conversations: Array<{ id: string; subject: string; user_email: string }>; updates: Array<{ id: string; author_name: string; body: string; created_at: number; is_customer_broadcast: number }> } | null>(null);
  const [note, setNote] = useState("");
  const [broadcast, setBroadcast] = useState(false);
  const [posting, setPosting] = useState(false);

  function load() {
    fetch(`/api/admin/support/incidents/${incidentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: typeof data) => setData(d));
  }
  useEffect(load, [incidentId]);

  async function postUpdate() {
    if (!note.trim()) return;
    setPosting(true);
    await fetch(`/api/admin/support/incidents/${incidentId}/updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: note, isCustomerBroadcast: broadcast }),
    }).catch(() => {});
    setPosting(false);
    setNote("");
    setBroadcast(false);
    load();
  }

  if (!data) return null;

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Linked conversations ({data.conversations.length})</p>
        {data.conversations.length === 0 ? <p className="mt-1 text-subtle">None linked yet.</p> : (
          <ul className="mt-1 space-y-1">
            {data.conversations.map((c) => <li key={c.id}>{c.subject || "(no subject)"} — {c.user_email}</li>)}
          </ul>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Timeline</p>
        <ul className="mt-1 space-y-1.5">
          {data.updates.map((u) => (
            <li key={u.id} className="rounded-lg bg-fog/60 p-2">
              <p>{u.body} {u.is_customer_broadcast ? <span className="text-[10px] font-semibold text-[#166534]">(sent to customers)</span> : null}</p>
              <p className="text-[11px] text-subtle">{u.author_name} · {new Date(u.created_at).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a timeline update…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2 text-[13px] outline-none focus:border-[#166534]" />
        <div className="mt-1.5 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-[11px] text-subtle">
            <input type="checkbox" checked={broadcast} onChange={(e) => setBroadcast(e.target.checked)} />
            Also email this update to affected customers
          </label>
          <button disabled={posting || !note.trim()} onClick={postUpdate} className="rounded-full bg-[#166534] px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">
            {posting ? "Posting…" : "Post update"}
          </button>
        </div>
      </div>
    </div>
  );
}
