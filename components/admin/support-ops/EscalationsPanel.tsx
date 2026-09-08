"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type Escalation = {
  id: string;
  ref: string;
  conversation_id: string;
  from_role: string;
  to_role: string;
  category: string;
  subcategory: string;
  impact: string;
  severity: string;
  issue_statement: string;
  attempted: string;
  evidence: string;
  assessment: string;
  requested_action: string;
  is_emergency: number;
  status: string;
  decision: string | null;
  decision_reason: string | null;
  created_at: number;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-[#fef3c7] text-[#92400e]",
  accepted: "bg-[#dbeafe] text-[#1e40af]",
  resolved: "bg-[#dcfce7] text-[#166534]",
  returned: "bg-[#fee2e2] text-[#991b1b]",
  escalated: "bg-[#ede9fe] text-[#5b21b6]",
};

export function EscalationsPanel({ myRole }: { myRole: string }) {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [loading, setLoading] = useState(true);
  const [toRoleFilter, setToRoleFilter] = useState<"admin" | "superadmin" | "">("admin");
  const [selected, setSelected] = useState<Escalation | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    const qs = toRoleFilter ? `?toRole=${toRoleFilter}` : "";
    fetch(`/api/admin/support/escalations${qs}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { escalations?: Escalation[] } | null) => setEscalations(data?.escalations ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(load, [toRoleFilter]);

  async function decide(decision: "approve" | "reject" | "request_info" | "return") {
    if (!selected) return;
    setBusy(true);
    await fetch(`/api/admin/support/escalations/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, reason: decisionReason }),
    }).catch(() => {});
    setBusy(false);
    setSelected(null);
    setDecisionReason("");
    load();
  }

  const canDecideSuper = myRole === "superadmin";

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHead title="Escalations" subtitle="Structured Support→Admin and Admin→Super Admin escalations." />
          <div className="flex gap-1 rounded-full bg-fog p-1">
            {(["admin", "superadmin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setToRoleFilter(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${toRoleFilter === r ? "bg-white shadow-sm" : "text-subtle"}`}
              >
                To {r === "admin" ? "Admin" : "Super Admin"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-subtle">Loading…</p>
        ) : escalations.length === 0 ? (
          <p className="mt-6 text-sm text-subtle">No escalations in this queue.</p>
        ) : (
          <div className="mt-5 space-y-2">
            {escalations.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="flex w-full items-start justify-between gap-3 rounded-xl border border-[#e5e7eb] p-3.5 text-left transition hover:border-[#166534]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {e.is_emergency ? <span className="rounded-full bg-[#fee2e2] px-2 py-0.5 text-[10px] font-bold text-[#991b1b]">EMERGENCY</span> : null}
                    <span className="text-[11px] font-mono text-subtle">{e.ref}</span>
                    <span className="rounded-full bg-fog px-2 py-0.5 text-[10px] font-semibold uppercase">{e.severity}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[e.status] || "bg-fog"}`}>{e.status}</span>
                  </div>
                  <p className="mt-1 truncate text-[13px] font-medium text-ink">{e.issue_statement}</p>
                  <p className="text-[11px] text-subtle">{e.category}{e.subcategory ? ` · ${e.subcategory}` : ""} · {e.impact}</p>
                </div>
                <span className="shrink-0 text-[11px] text-subtle">{new Date(e.created_at).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        )}
      </Panel>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-subtle">{selected.ref}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[selected.status] || "bg-fog"}`}>{selected.status}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{selected.category}{selected.subcategory ? ` — ${selected.subcategory}` : ""}</h3>

            <dl className="mt-4 space-y-3 text-[13px]">
              <div><dt className="font-semibold text-subtle">Issue</dt><dd className="mt-0.5">{selected.issue_statement}</dd></div>
              {selected.attempted ? <div><dt className="font-semibold text-subtle">What was attempted</dt><dd className="mt-0.5">{selected.attempted}</dd></div> : null}
              {selected.evidence ? <div><dt className="font-semibold text-subtle">Evidence</dt><dd className="mt-0.5 whitespace-pre-line">{selected.evidence}</dd></div> : null}
              {selected.assessment ? <div><dt className="font-semibold text-subtle">Assessment</dt><dd className="mt-0.5">{selected.assessment}</dd></div> : null}
              <div><dt className="font-semibold text-subtle">Requested action</dt><dd className="mt-0.5">{selected.requested_action}</dd></div>
              <div><dt className="font-semibold text-subtle">Impact / Severity</dt><dd className="mt-0.5">{selected.impact} · {selected.severity}</dd></div>
              {selected.decision ? (
                <div><dt className="font-semibold text-subtle">Decision</dt><dd className="mt-0.5">{selected.decision} — {selected.decision_reason}</dd></div>
              ) : null}
            </dl>

            {selected.status === "pending" && (selected.to_role === "admin" || canDecideSuper) ? (
              <div className="mt-5 border-t border-[#e5e7eb] pt-4">
                <textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Decision reason (shown to the requester)…"
                  className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]"
                  rows={2}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button disabled={busy} onClick={() => decide("approve")} className="rounded-full bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button>
                  <button disabled={busy} onClick={() => decide("reject")} className="rounded-full bg-[#dc2626] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Reject</button>
                  <button disabled={busy} onClick={() => decide("request_info")} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-medium disabled:opacity-50">Request info</button>
                  <button disabled={busy} onClick={() => decide("return")} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-medium disabled:opacity-50">Return</button>
                </div>
              </div>
            ) : null}

            <button onClick={() => setSelected(null)} className="mt-5 text-xs font-medium text-subtle hover:text-ink">Close</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
