"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead, StatCard } from "@/components/admin/Panel";

type Summary = { average: number | null; total: number; responseRate: number | null; distribution: Record<number, number> };

export function CsatPanel() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [humanOnly, setHumanOnly] = useState(true);

  useEffect(() => {
    const to = Date.now();
    const from = to - 30 * 864e5;
    fetch(`/api/admin/support/csat?from=${from}&to=${to}&humanOnly=${humanOnly ? "1" : "0"}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { summary?: Summary } | null) => setSummary(d?.summary ?? null));
  }, [humanOnly]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SectionHead title="Customer satisfaction" subtitle="Last 30 days." />
        <label className="flex items-center gap-2 text-xs text-subtle">
          <input type="checkbox" checked={humanOnly} onChange={(e) => setHumanOnly(e.target.checked)} />
          Human-handled only (exclude AI-only ratings)
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Average" value={summary?.average !== null && summary?.average !== undefined ? `${summary.average.toFixed(2)} / 5` : "—"} />
        <StatCard label="Total ratings" value={String(summary?.total ?? 0)} />
        <StatCard label="Response rate" value={summary?.responseRate !== null && summary?.responseRate !== undefined ? `${Math.round(summary.responseRate * 100)}%` : "—"} />
        <StatCard label="5-star share" value={summary?.total ? `${Math.round(((summary.distribution[5] || 0) / summary.total) * 100)}%` : "—"} />
      </div>

      {summary ? (
        <Panel>
          <SectionHead title="Rating distribution" />
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star] || 0;
              const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-[13px]">
                  <span className="w-10 shrink-0">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-fog">
                    <div className="h-full bg-[#166534]" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-16 shrink-0 text-right tabular-nums text-subtle">{count} ({Math.round(pct)}%)</span>
                </div>
              );
            })}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
