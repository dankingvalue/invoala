"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalUsers: number;
  newUsersWeek: number;
  totalInvoices: number;
  invoicesMonth: number;
  activePro: number;
  mrr: number;
  emailsSent: number;
  recentSubs: Array<{ email: string; plan: string; status: string; provider: string }>;
};

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: number;
  isPro: boolean;
  plan: string | null;
};

export function SupportDashboard() {
  const [tab, setTab] = useState<"stats" | "users">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === "stats") {
      setLoading(true);
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((d) => { setStats(d); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "users") {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set("q", search);
      fetch(`/api/admin/users?${params}`)
        .then((r) => r.json())
        .then((d) => { setUsers(d.users || []); setTotalPages(d.totalPages || 1); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [tab, page, search]);

  const tabs = [
    { id: "stats" as const, label: "Overview" },
    { id: "users" as const, label: "Users" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-[#e5e7eb]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); }}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-[#166534] text-white shadow-sm"
                : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && (
        <div>
          {loading ? (
            <p className="text-sm text-[#6b7280]">Loading...</p>
          ) : stats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                <StatCard label="Users" value={stats.totalUsers} sub={`+${stats.newUsersWeek} this week`} />
                <StatCard label="Documents" value={stats.totalInvoices} sub={`${stats.invoicesMonth} in 30 days`} />
                <StatCard label="Pro subscribers" value={stats.activePro} />
                <StatCard label="MRR" value={`$${(stats.mrr / 100).toFixed(0)}`} />
                <StatCard label="Emails (7d)" value={stats.emailsSent} />
              </div>

              <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb]">
                <h3 className="mb-4 text-sm font-semibold text-[#111827]">Recent Subscriptions</h3>
                {stats.recentSubs.length === 0 ? (
                  <p className="text-sm text-[#6b7280]">No subscriptions yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                          <th className="pb-2 font-medium">Email</th>
                          <th className="pb-2 font-medium">Plan</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Provider</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentSubs.map((s, i) => (
                          <tr key={i} className="border-b border-[#f3f4f6]">
                            <td className="py-2 text-[#111827]">{s.email}</td>
                            <td className="py-2 text-[#6b7280]">{s.plan}</td>
                            <td className="py-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                s.status === "active"
                                  ? "bg-[#dcfce7] text-[#166534]"
                                  : "bg-[#f3f4f6] text-[#6b7280]"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-2 text-[#6b7280]">{s.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6b7280]">Failed to load stats.</p>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb]">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
            />
          </div>

          {loading ? (
            <p className="text-sm text-[#6b7280]">Loading...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-[#6b7280]">No users found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Role</th>
                      <th className="pb-2 font-medium">Joined</th>
                      <th className="pb-2 font-medium">Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-[#f3f4f6]">
                        <td className="py-2 text-[#111827]">
                          {u.email}
                          {u.name && <span className="ml-2 text-[#6b7280]">({u.name})</span>}
                        </td>
                        <td className="py-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            u.role === "superadmin"
                              ? "bg-[#fef3c7] text-[#92400e]"
                              : u.role === "admin"
                                ? "bg-[#dbeafe] text-[#1e40af]"
                                : u.role === "support"
                                  ? "bg-[#e0e7ff] text-[#3730a3]"
                                  : "bg-[#f3f4f6] text-[#6b7280]"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2 text-[#6b7280]">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          {u.isPro ? (
                            <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-medium text-[#166534]">
                              {u.plan || "pro"}
                            </span>
                          ) : (
                            <span className="text-[#6b7280]">Free</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-[#6b7280]">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-[#e5e7eb]">
      <p className="text-xs font-medium text-[#6b7280]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-[#111827]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[#6b7280]">{sub}</p>}
    </div>
  );
}
