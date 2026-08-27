"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  actor_id: string;
  actor_email: string;
  actor_role: string;
  action: string;
  target_id: string | null;
  target_type: string | null;
  details: string | null;
  ip_address: string | null;
  created_at: number;
};

const ACTION_LABELS: Record<string, string> = {
  role_change: "Role changed",
  grant_plan: "Plan granted",
  revoke_plan: "Plan revoked",
  delete_user: "User deleted",
  flag_toggle: "Flags updated",
  send_broadcast: "Email broadcast",
  conversation_status: "Status changed",
  conversation_reply: "Message sent",
  settings_change: "Settings changed",
  danger_reset: "Danger reset",
};

function formatDetails(d: string | null): string {
  if (!d) return "—";
  try {
    const obj = JSON.parse(d);
    const parts: string[] = [];
    if (obj.from !== undefined && obj.to !== undefined) {
      parts.push(`${String(obj.from)} → ${String(obj.to)}`);
    } else if (obj.plan) {
      parts.push(`Plan: ${obj.plan}`);
    } else if (obj.email) {
      parts.push(`Email: ${obj.email}`);
    } else if (obj.subject) {
      parts.push(`Subject: ${obj.subject}`);
      if (obj.total !== undefined) parts.push(`→ ${obj.total} recipients`);
    } else if (obj.contentPreview) {
      parts.push(`"${obj.contentPreview}"`);
    } else if (obj.old && obj.new) {
      parts.push("Flags updated");
    }
    return parts.length > 0 ? parts.join(", ") : JSON.stringify(obj).slice(0, 120);
  } catch {
    return d.slice(0, 120);
  }
}

export function AuditTable({ role }: { role: string }) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const pageSize = 30;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (actionFilter) params.set("action", actionFilter);
    fetch(`/api/admin/audit?${params}`)
      .then(async (r) => (r.ok ? r.json() : { logs: [], total: 0 }))
      .then((d) => {
        if (!cancelled) {
          setLogs(d.logs);
          setTotal(d.total);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, actionFilter]);

  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={actionFilter}
          onChange={(e) => {
            setPage(1);
            setActionFilter(e.target.value);
          }}
          className="rounded-lg border border-hairline px-3 py-2 text-sm"
        >
          <option value="">All actions</option>
          {Object.entries(ACTION_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <span className="text-sm text-subtle">
          {total.toLocaleString()} total
        </span>
      </div>

      {loading ? (
        <p className="py-8 text-sm text-subtle text-center">Loading…</p>
      ) : logs.length === 0 ? (
        <p className="py-8 text-sm text-subtle text-center">No audit logs found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-wider text-subtle">
                <th className="pb-2 font-semibold">Time</th>
                <th className="pb-2 font-semibold">Actor</th>
                <th className="pb-2 font-semibold">Role</th>
                <th className="pb-2 font-semibold">Action</th>
                <th className="pb-2 font-semibold">Details</th>
                <th className="pb-2 font-semibold">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b border-[#e8e8ed] last:border-0">
                  <td className="py-2.5 pr-4 text-subtle whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="py-2.5 pr-4 font-medium">{l.actor_email}</td>
                  <td className="py-2.5 pr-4">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        l.actor_role === "superadmin"
                          ? "bg-[#166534] text-white"
                          : l.actor_role === "admin"
                            ? "bg-accent/10 text-accent"
                            : "bg-fog text-subtle"
                      }`}
                    >
                      {l.actor_role}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">
                      {ACTION_LABELS[l.action] || l.action}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-subtle max-w-[300px] truncate">
                    {formatDetails(l.details)}
                  </td>
                  <td className="py-2.5 text-subtle">{l.ip_address || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="hover:text-ink disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            {page} / {pages}
          </span>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
            className="hover:text-ink disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      ) : null}
    </div>
  );
}
