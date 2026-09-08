"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead, StatCard } from "@/components/admin/Panel";

type DailyReport = {
  totalConversations: number;
  aiOnly: number;
  humanOnly: number;
  resolved: number;
  open: number;
  avgFirstResponseMins: number | null;
  avgResolutionMins: number | null;
  slaComplianceRate: number | null;
  slaBreaches: number;
  fcr: number;
  reopenRate: number;
  csatAverage: number | null;
  proVolume: number;
  freeVolume: number;
  escalationsToAdmin: number;
  escalationsToSuperadmin: number;
  topCategories: Array<{ category: string; count: number }>;
  anomalies: string[];
};

type Recurring = { category: string; subcategory: string; occurrences: number; affected_customers: number; escalated: number };

type ShiftReport = { id: string; agent_name: string; shift_date: string; recommendations: string; status: string; created_at: number; data: string };

function mins(v: number | null) {
  if (v === null) return "—";
  if (v < 60) return `${Math.round(v)}m`;
  return `${Math.floor(v / 60)}h ${Math.round(v % 60)}m`;
}

export function ReportsPanel() {
  const [report, setReport] = useState<DailyReport | null>(null);
  const [recurring, setRecurring] = useState<Recurring[]>([]);
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([]);
  const [range, setRange] = useState<"today" | "7d" | "30d">("7d");

  useEffect(() => {
    const to = Date.now();
    const from = range === "today" ? to - 864e5 : range === "7d" ? to - 7 * 864e5 : to - 30 * 864e5;
    fetch(`/api/admin/support/reports/daily?from=${from}&to=${to}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { report?: DailyReport; recurring?: Recurring[] } | null) => {
        setReport(d?.report ?? null);
        setRecurring(d?.recurring ?? []);
      });
  }, [range]);

  useEffect(() => {
    fetch("/api/admin/support/reports/shift").then((r) => (r.ok ? r.json() : null)).then((d: { reports?: ShiftReport[] } | null) => setShiftReports(d?.reports ?? []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHead title="Support operations report" />
        <div className="flex gap-1 rounded-full bg-fog p-1">
          {(["today", "7d", "30d"] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${range === r ? "bg-white shadow-sm" : "text-subtle"}`}>
              {r === "today" ? "Today" : r === "7d" ? "7 days" : "30 days"}
            </button>
          ))}
        </div>
      </div>

      {report ? (
        <>
          {report.anomalies.length > 0 ? (
            <Panel>
              <SectionHead title="Anomalies" />
              <ul className="mt-3 space-y-1.5 text-[13px]">
                {report.anomalies.map((a, i) => <li key={i} className="rounded-lg bg-[#fef3c7] px-3 py-2 text-[#92400e]">{a}</li>)}
              </ul>
            </Panel>
          ) : null}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total conversations" value={String(report.totalConversations)} sub={`${report.aiOnly} AI-only · ${report.humanOnly} human`} />
            <StatCard label="Resolved / Open" value={`${report.resolved} / ${report.open}`} />
            <StatCard label="First response" value={mins(report.avgFirstResponseMins)} />
            <StatCard label="Resolution time" value={mins(report.avgResolutionMins)} />
            <StatCard label="SLA compliance" value={report.slaComplianceRate !== null ? `${Math.round(report.slaComplianceRate * 100)}%` : "—"} sub={`${report.slaBreaches} breaches`} />
            <StatCard label="FCR" value={`${Math.round(report.fcr * 100)}%`} />
            <StatCard label="Reopen rate" value={`${Math.round(report.reopenRate * 100)}%`} />
            <StatCard label="CSAT" value={report.csatAverage !== null ? `${report.csatAverage.toFixed(2)}/5` : "—"} />
            <StatCard label="Pro vs Free" value={`${report.proVolume} / ${report.freeVolume}`} />
            <StatCard label="Escalations" value={`${report.escalationsToAdmin} → Admin`} sub={`${report.escalationsToSuperadmin} → Super Admin`} />
          </div>

          <Panel>
            <SectionHead title="Top categories" />
            <div className="mt-3 space-y-1.5 text-[13px]">
              {report.topCategories.map((c) => (
                <div key={c.category} className="flex justify-between border-b border-[#f3f4f6] py-1.5">
                  <span className="capitalize">{c.category.replace(/_/g, " ")}</span>
                  <span className="tabular-nums text-subtle">{c.count}</span>
                </div>
              ))}
              {report.topCategories.length === 0 ? <p className="text-subtle">No categorized conversations in this range.</p> : null}
            </div>
          </Panel>
        </>
      ) : (
        <p className="text-sm text-subtle">Loading…</p>
      )}

      {recurring.length > 0 ? (
        <Panel>
          <SectionHead title="Recurring issues" subtitle="Categories showing up often enough to be a product problem, not one-off tickets." />
          <div className="mt-3 space-y-2">
            {recurring.map((r, i) => (
              <div key={i} className="rounded-lg border border-[#e5e7eb] p-3 text-[13px]">
                <p className="font-medium capitalize text-ink">{r.category.replace(/_/g, " ")}{r.subcategory ? ` — ${r.subcategory.replace(/_/g, " ")}` : ""}</p>
                <p className="text-[11px] text-subtle">{r.occurrences} occurrences · {r.affected_customers} customers affected · {r.escalated} escalated</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

      <Panel>
        <SectionHead title="Shift reports" />
        {shiftReports.length === 0 ? <p className="mt-3 text-sm text-subtle">No shift reports submitted yet.</p> : (
          <div className="mt-3 space-y-2">
            {shiftReports.map((s) => (
              <div key={s.id} className="rounded-lg border border-[#e5e7eb] p-3 text-[13px]">
                <p className="font-medium text-ink">{s.agent_name} — {s.shift_date}</p>
                {s.recommendations ? <p className="mt-1 text-subtle">{s.recommendations}</p> : null}
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
