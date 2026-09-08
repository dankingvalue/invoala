"use client";

import { Fragment, useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type AgentRow = {
  agentId: string;
  agentName: string;
  agentEmail: string;
  available: boolean;
  conversationsHandled: number;
  messagesSent: number;
  customersHelped: number;
  resolved: number;
  resolutionRate: number;
  firstContactResolutionRate: number;
  escalations: number;
  escalationRate: number;
  reopenedConversations: number;
  reopenRate: number;
  avgFirstResponseMins: number | null;
  avgResolutionMins: number | null;
  slaComplianceRate: number | null;
  qaScore: number | null;
  qaReviewCount: number;
  csatAverage: number | null;
  csatCount: number;
  positiveRatingRate: number | null;
  pendingWorkload: number;
  score: number;
};

function pct(v: number | null) {
  return v === null ? "—" : `${Math.round(v * 100)}%`;
}
function mins(v: number | null) {
  if (v === null) return "—";
  if (v < 60) return `${Math.round(v)}m`;
  return `${Math.floor(v / 60)}h ${Math.round(v % 60)}m`;
}

export function AgentsPanel() {
  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rankByCsat, setRankByCsat] = useState(false);

  function load() {
    fetch("/api/admin/support/agents")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { agents?: AgentRow[] } | null) => setAgents(data?.agents ?? []))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  const sorted = [...agents].sort((a, b) => (rankByCsat ? (b.csatAverage ?? 0) - (a.csatAverage ?? 0) : b.score - a.score));

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHead title="Support agents" subtitle="Balanced performance — never ranked by message volume alone." />
          <label className="flex items-center gap-2 text-xs text-subtle">
            <input type="checkbox" checked={rankByCsat} onChange={(e) => setRankByCsat(e.target.checked)} />
            Rank by CSAT instead of overall score
          </label>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-subtle">Loading…</p>
        ) : agents.length === 0 ? (
          <p className="mt-6 text-sm text-subtle">No agents found (users with support/admin/superadmin role).</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[13px]">
              <thead className="text-[11px] uppercase tracking-wider text-subtle">
                <tr className="border-b border-[#e5e7eb]">
                  <th className="py-2 pr-3 font-semibold">Agent</th>
                  <th className="py-2 pr-3 text-right font-semibold">Handled</th>
                  <th className="py-2 pr-3 text-right font-semibold">Resolved</th>
                  <th className="py-2 pr-3 text-right font-semibold">FCR</th>
                  <th className="py-2 pr-3 text-right font-semibold">SLA</th>
                  <th className="py-2 pr-3 text-right font-semibold">CSAT</th>
                  <th className="py-2 pr-3 text-right font-semibold">QA</th>
                  <th className="py-2 pr-3 text-right font-semibold">Reopen</th>
                  <th className="py-2 pr-3 text-right font-semibold">Escalation</th>
                  <th className="py-2 pr-3 text-right font-semibold">Workload</th>
                  <th className="py-2 pr-3 text-right font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((a) => (
                  <Fragment key={a.agentId}>
                    <tr className="cursor-pointer border-b border-[#f3f4f6] hover:bg-[#f9fafb]" onClick={() => setExpanded(expanded === a.agentId ? null : a.agentId)}>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-ink">{a.agentName}</p>
                        <p className="text-[11px] text-subtle">{a.available ? "Available" : "Unavailable"}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{a.conversationsHandled}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{a.resolved}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{pct(a.firstContactResolutionRate)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{pct(a.slaComplianceRate)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{a.csatAverage !== null ? `${a.csatAverage.toFixed(1)}/5` : "—"}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{a.qaScore !== null ? Math.round(a.qaScore) : "—"}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{pct(a.reopenRate)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{pct(a.escalationRate)}</td>
                      <td className="py-2.5 pr-3 text-right tabular-nums">{a.pendingWorkload}</td>
                      <td className="py-2.5 pr-3 text-right font-semibold tabular-nums">{a.score}</td>
                    </tr>
                    {expanded === a.agentId ? (
                      <tr className="border-b border-[#f3f4f6] bg-[#f9fafb]">
                        <td colSpan={11} className="p-4">
                          <div className="grid grid-cols-2 gap-4 text-[12px] sm:grid-cols-4">
                            <div>
                              <p className="font-semibold uppercase tracking-wider text-subtle">Activity</p>
                              <p className="mt-1">Messages sent: {a.messagesSent}</p>
                              <p>Customers helped: {a.customersHelped}</p>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-wider text-subtle">Speed</p>
                              <p className="mt-1">First response: {mins(a.avgFirstResponseMins)}</p>
                              <p>Resolution: {mins(a.avgResolutionMins)}</p>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-wider text-subtle">Quality</p>
                              <p className="mt-1">QA reviews: {a.qaReviewCount}</p>
                              <p>Reopened: {a.reopenedConversations}</p>
                            </div>
                            <div>
                              <p className="font-semibold uppercase tracking-wider text-subtle">Satisfaction</p>
                              <p className="mt-1">Ratings: {a.csatCount}</p>
                              <p>Positive (4-5★): {pct(a.positiveRatingRate)}</p>
                            </div>
                          </div>
                          <AgentSkillsEditor agentId={a.agentId} onSaved={load} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

const SKILL_OPTIONS = ["general", "technical", "billing", "payments", "account", "api", "enterprise"];

function AgentSkillsEditor({ agentId, onSaved }: { agentId: string; onSaved: () => void }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/support/agents/${agentId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { agent?: { skills?: string[] } } | null) => setSkills(data?.agent?.skills ?? []))
      .finally(() => setLoaded(true));
  }, [agentId]);

  async function save(next: string[]) {
    setSkills(next);
    setSaving(true);
    await fetch(`/api/admin/support/agents/${agentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: next }),
    }).catch(() => {});
    setSaving(false);
    onSaved();
  }

  if (!loaded) return null;

  return (
    <div className="mt-4 border-t border-[#e5e7eb] pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">Skills</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {SKILL_OPTIONS.map((s) => {
          const active = skills.includes(s);
          return (
            <button
              key={s}
              type="button"
              disabled={saving}
              onClick={() => save(active ? skills.filter((x) => x !== s) : [...skills, s])}
              className={`rounded-full px-3 py-1 text-[12px] font-medium transition ${active ? "bg-[#166534] text-white" : "border border-[#e5e7eb] text-subtle hover:border-[#166534]"}`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </div>
  );
}
