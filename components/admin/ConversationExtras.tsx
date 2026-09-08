"use client";

import { useEffect, useState } from "react";

export type ConvExtra = {
  id: string;
  priority?: string;
  category?: string;
  assigned_to?: string | null;
};

const PRIORITIES = ["p1", "p2", "p3", "p4"];
const CATEGORIES = ["technical_bug", "billing", "payment", "account", "security", "abuse", "refund", "feature_request", "product_decision", "infrastructure", "customer_complaint", "other"];

// Shared across Support/Admin/Super Admin conversation detail views — the
// priority/category/assignment controls, incident badge, and escalate/
// emergency actions, so all three stay in sync instead of drifting apart.
export function ConversationHeaderExtras({
  conv,
  myRole,
  myId,
  incident,
  onUpdated,
}: {
  conv: ConvExtra;
  myRole: string;
  myId: string;
  incident: { ref: string; title: string } | null;
  onUpdated: () => void;
}) {
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function patch(fields: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/messages/${conv.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    }).catch(() => {});
    setBusy(false);
    onUpdated();
  }

  const isMine = conv.assigned_to === myId;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2 text-xs">
      <select disabled={busy} value={conv.priority || "p3"} onChange={(e) => patch({ priority: e.target.value })} className="rounded border border-[#e5e7eb] bg-white px-1.5 py-1 uppercase">
        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <select disabled={busy} value={conv.category || ""} onChange={(e) => patch({ category: e.target.value })} className="rounded border border-[#e5e7eb] bg-white px-1.5 py-1 capitalize">
        <option value="">No category</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
      </select>

      {incident ? (
        <span className="rounded-full bg-[#ede9fe] px-2 py-1 font-semibold text-[#5b21b6]">Incident: {incident.ref}</span>
      ) : null}

      {!conv.assigned_to ? (
        <button disabled={busy} onClick={() => patch({ assignedTo: myId })} className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 font-medium text-[#166534] hover:bg-[#f0fdf4]">Claim</button>
      ) : isMine ? (
        <button disabled={busy} onClick={() => patch({ assignedTo: null })} className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 font-medium text-subtle hover:bg-fog">Unclaim</button>
      ) : (
        <span className="rounded-full bg-fog px-2 py-1 text-subtle">Assigned</span>
      )}

      <button onClick={() => setEscalateOpen(true)} className="rounded-full border border-[#e5e7eb] bg-white px-2.5 py-1 font-medium text-[#1e40af] hover:bg-[#eff6ff]">Escalate</button>
      {myRole === "support" ? (
        <button onClick={() => setEmergencyOpen(true)} className="rounded-full bg-[#fee2e2] px-2.5 py-1 font-semibold text-[#991b1b] hover:bg-[#fecaca]">🚨 Emergency</button>
      ) : null}

      {escalateOpen ? <EscalateModal conversationId={conv.id} myRole={myRole} onClose={() => { setEscalateOpen(false); onUpdated(); }} /> : null}
      {emergencyOpen ? <EmergencyModal conversationId={conv.id} onClose={() => { setEmergencyOpen(false); onUpdated(); }} /> : null}
    </div>
  );
}

function EscalateModal({ conversationId, myRole, onClose }: { conversationId: string; myRole: string; onClose: () => void }) {
  const [toRole, setToRole] = useState<"admin" | "superadmin">("admin");
  const [category, setCategory] = useState("technical_bug");
  const [impact, setImpact] = useState("individual_customer");
  const [severity, setSeverity] = useState("p3");
  const [issueStatement, setIssueStatement] = useState("");
  const [attempted, setAttempted] = useState("");
  const [evidence, setEvidence] = useState("");
  const [requestedAction, setRequestedAction] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!issueStatement.trim() || !requestedAction.trim()) {
      setError("Issue statement and requested action are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/admin/support/escalations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, toRole, category, impact, severity, issueStatement, attempted, evidence, requestedAction }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (data.ok) onClose();
    else setError(data.error || "Could not create the escalation.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold tracking-tight">Create escalation</h3>
        <div className="mt-4 space-y-3 text-sm">
          {myRole === "support" ? (
            <p className="text-xs text-subtle">Escalating to Admin.</p>
          ) : (
            <div>
              <label className="text-xs font-semibold text-subtle">Escalate to</label>
              <select value={toRole} onChange={(e) => setToRole(e.target.value as never)} className="mt-1 w-full rounded-lg border border-[#e5e7eb] px-2.5 py-2 text-sm">
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>
          )}
          <div className="grid grid-cols-3 gap-2">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-[#e5e7eb] px-2 py-2 text-xs">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
            </select>
            <select value={impact} onChange={(e) => setImpact(e.target.value)} className="rounded-lg border border-[#e5e7eb] px-2 py-2 text-xs">
              <option value="individual_customer">1 customer</option>
              <option value="multiple_customers">Multiple</option>
              <option value="platform_wide">Platform-wide</option>
            </select>
            <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-lg border border-[#e5e7eb] px-2 py-2 text-xs">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>
          <textarea value={issueStatement} onChange={(e) => setIssueStatement(e.target.value)} placeholder="Issue statement…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
          <textarea value={attempted} onChange={(e) => setAttempted(e.target.value)} placeholder="What has been attempted…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
          <textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Evidence…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
          <textarea value={requestedAction} onChange={(e) => setRequestedAction(e.target.value)} placeholder="Requested action…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
        </div>
        {error ? <p className="mt-2 text-xs text-[#dc2626]">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <button disabled={submitting} onClick={submit} className="rounded-full bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{submitting ? "Submitting…" : "Submit escalation"}</button>
          <button onClick={onClose} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
}

const EMERGENCY_CATEGORIES = ["security", "payment", "infrastructure"];

function EmergencyModal({ conversationId, onClose }: { conversationId: string; onClose: () => void }) {
  const [category, setCategory] = useState("security");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!reason.trim()) {
      setError("A reason is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/admin/support/emergency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, category, reason, evidence }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);
    if (data.ok) onClose();
    else setError(data.error || "Could not trigger the emergency escalation.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-[#991b1b]">🚨 Emergency escalation</h3>
        <p className="mt-1 text-xs text-subtle">Only for security incidents, major payment failures, or infrastructure outages. Pages Super Admin immediately.</p>
        <div className="mt-4 space-y-3 text-sm">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-[#e5e7eb] px-2.5 py-2 text-sm">
            {EMERGENCY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#dc2626]" />
          <textarea value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="Evidence…" rows={2} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#dc2626]" />
        </div>
        {error ? <p className="mt-2 text-xs text-[#dc2626]">{error}</p> : null}
        <div className="mt-4 flex gap-2">
          <button disabled={submitting} onClick={submit} className="rounded-full bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{submitting ? "Sending…" : "Trigger emergency escalation"}</button>
          <button onClick={onClose} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-medium">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function MacroPicker({ onPick }: { onPick: (text: string, macroId: string) => void }) {
  const [macros, setMacros] = useState<Array<{ id: string; name: string; response_text: string }>>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && macros.length === 0) {
      fetch("/api/admin/support/macros").then((r) => (r.ok ? r.json() : null)).then((d: { macros?: typeof macros } | null) => setMacros(d?.macros ?? []));
    }
  }, [open, macros.length]);

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className="shrink-0 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#6b7280] hover:bg-[#f3f4f6]" title="Insert macro">
        📋
      </button>
      {open ? (
        <div className="absolute bottom-full left-0 mb-2 max-h-64 w-72 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-lg">
          {macros.length === 0 ? <p className="p-2 text-xs text-subtle">No macros yet.</p> : macros.map((m) => (
            <button key={m.id} type="button" onClick={() => { onPick(m.response_text, m.id); setOpen(false); }} className="block w-full rounded-lg px-2.5 py-2 text-left text-xs hover:bg-fog">
              <p className="font-medium text-ink">{m.name}</p>
              <p className="line-clamp-1 text-subtle">{m.response_text}</p>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
