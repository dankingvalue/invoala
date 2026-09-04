"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

export function SubscribersTab() {
  const [rows, setRows] = useState<Array<{ email: string; source: string; created_at: number }>>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { subscribers?: Array<{ email: string; source: string; created_at: number }>; total?: number } | null) => {
        if (data?.subscribers) {
          setRows(data.subscribers);
          setTotal(data.total ?? data.subscribers.length);
        }
      })
      .catch(() => {})
      .finally(() => setBusy(false));
  }, []);

  function exportCsv() {
    const csv = ["email,source,signed_up_at", ...rows.map((r) => `"${r.email}",${r.source},${new Date(r.created_at).toISOString()}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionHead title="Email list" subtitle={`${total} email${total === 1 ? "" : "s"} captured from the site signup forms.`} />
        <button
          type="button"
          onClick={exportCsv}
          disabled={rows.length === 0}
          className="rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#6b7280] transition hover:border-[#166534] hover:text-[#166534] disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>
      {busy ? (
        <p className="mt-4 text-sm text-[#6b7280]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center text-sm text-[#9ca3af]">
          No subscribers yet. Emails entered in the site signup forms will appear here.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#e5e7eb]">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="bg-[#f9fafb] text-xs uppercase tracking-wider text-[#6b7280]">
              <tr>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Signed up</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.email} className="border-t border-[#e5e7eb]">
                  <td className="px-4 py-2.5 text-[#111827]">{r.email}</td>
                  <td className="px-4 py-2.5 text-[#6b7280]">{r.source}</td>
                  <td className="px-4 py-2.5 text-[#6b7280]">
                    {new Date(r.created_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
