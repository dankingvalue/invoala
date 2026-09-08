"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead, StatCard } from "@/components/admin/Panel";

type Escalation = { id: string; ref: string; category: string; severity: string; issue_statement: string; is_emergency: number; created_at: number };
type Incident = { id: string; ref: string; title: string; severity: string; status: string };
type DailyReport = { totalConversations: number; slaComplianceRate: number | null; csatAverage: number | null; escalationsToSuperadmin: number };

// Deliberately NOT a general ticket queue — surfaces only what needs
// executive attention: pending decisions, critical incidents, emergencies.
// Ordinary customer conversations never appear here (spec section 34).
export function ExecutivePanel() {
  const [pendingDecisions, setPendingDecisions] = useState<Escalation[]>([]);
  const [criticalIncidents, setCriticalIncidents] = useState<Incident[]>([]);
  const [report, setReport] = useState<DailyReport | null>(null);

  function load() {
    fetch("/api/admin/support/escalations?toRole=superadmin&status=pending")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { escalations?: Escalation[] } | null) => setPendingDecisions(d?.escalations ?? []));
    fetch("/api/admin/support/incidents?active=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { incidents?: Incident[] } | null) => setCriticalIncidents((d?.incidents ?? []).filter((i) => i.severity === "p1" || i.severity === "p2")));
    const to = Date.now();
    fetch(`/api/admin/support/reports/daily?from=${to - 864e5}&to=${to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { report?: DailyReport } | null) => setReport(d?.report ?? null));
  }
  useEffect(load, []);

  const emergencies = pendingDecisions.filter((e) => e.is_emergency);

  return (
    <div className="space-y-6">
      {emergencies.length > 0 ? (
        <div className="rounded-2xl bg-[#fee2e2] p-5 ring-1 ring-[#fecaca]">
          <p className="text-sm font-bold text-[#991b1b]">🚨 {emergencies.length} emergency escalation{emergencies.length > 1 ? "s" : ""} require immediate attention</p>
          <ul className="mt-2 space-y-1 text-[13px] text-[#991b1b]">
            {emergencies.map((e) => <li key={e.id}>{e.ref} — {e.issue_statement}</li>)}
          </ul>
        </div>
      ) : null}

      <Panel>
        <SectionHead title="Critical" subtitle="Active P1/P2 incidents and emergencies." />
        {criticalIncidents.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">No active P1/P2 incidents.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-[13px]">
            {criticalIncidents.map((i) => (
              <li key={i.id} className="flex justify-between rounded-lg border border-[#e5e7eb] p-2.5">
                <span>{i.ref} — {i.title}</span>
                <span className="rounded-full bg-fog px-2 py-0.5 text-[10px] font-semibold uppercase">{i.severity} · {i.status}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <SectionHead title="Requires decision" subtitle="Admin escalations awaiting a Super Admin decision." />
        {pendingDecisions.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">Nothing pending.</p>
        ) : (
          <ul className="mt-3 space-y-1.5 text-[13px]">
            {pendingDecisions.map((e) => (
              <li key={e.id} className="rounded-lg border border-[#e5e7eb] p-2.5">
                <p className="font-medium text-ink">{e.ref} — {e.category}</p>
                <p className="text-subtle">{e.issue_statement}</p>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] text-subtle">Decide these from the Support Ops → Escalations tab.</p>
      </Panel>

      {report ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Support volume (24h)" value={String(report.totalConversations)} />
          <StatCard label="SLA compliance" value={report.slaComplianceRate !== null ? `${Math.round(report.slaComplianceRate * 100)}%` : "—"} />
          <StatCard label="CSAT" value={report.csatAverage !== null ? `${report.csatAverage.toFixed(2)}/5` : "—"} />
          <StatCard label="Escalated to you" value={String(report.escalationsToSuperadmin)} />
        </div>
      ) : null}
    </div>
  );
}
