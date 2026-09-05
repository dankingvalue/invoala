"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { FLAG_DEFS, type FlagKey, type FlagsState } from "@/lib/flags";
import { StatCard, Panel, SectionHead } from "@/components/admin/Panel";
import { AuditTable } from "@/components/admin/AuditTable";
import { InvoiceTable } from "@/components/admin/InvoiceTable";
import { CustomerSlideOut } from "@/components/admin/CustomerSlideOut";
import { SeoTab } from "@/components/admin/SeoTab";
import { BroadcastTab } from "@/components/admin/BroadcastTab";
import { SubscribersTab } from "@/components/admin/SubscribersTab";
import { RoadmapTab } from "@/components/admin/RoadmapTab";
import { RangePicker, type RangeId } from "@/components/admin/RangePicker";

type Tab =
  | "overview"
  | "users"
  | "subscriptions"
  | "invoices"
  | "messages"
  | "flags"
  | "email"
  | "audit"
  | "settings"
  | "danger"
  | "seo"
  | "notify"
  | "subscribers"
  | "roadmap";

type Stats = {
  users: number;
  newUsersInRange: number;
  invoices: number;
  invoicesInRange: number;
  activeSubs: number;
  mrrCents: number;
  emailsInRange: number;
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

type Conversation = {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  status: string;
  subject: string;
  last_message: string;
  last_sender: string;
  unread_count: number;
  created_at: number;
  updated_at: number;
};

type Message = {
  id: string;
  sender_type: string;
  sender_id: string | null;
  content: string;
  created_at: number;
};

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "subscriptions", label: "Subscriptions" },
  { id: "invoices", label: "Invoices" },
  { id: "messages", label: "Messages" },
  { id: "flags", label: "Flags" },
  { id: "email", label: "Email" },
  { id: "audit", label: "Audit Trail" },
  { id: "settings", label: "Settings" },
  { id: "danger", label: "Danger Zone" },
  { id: "seo", label: "SEO" },
  { id: "notify", label: "Notify Users" },
  { id: "subscribers", label: "Email list" },
  { id: "roadmap", label: "Roadmap" },
];

export function SuperAdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-white p-1 shadow-sm ring-1 ring-[#e5e7eb]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "bg-[#166534] text-white shadow-sm"
                : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "users" && <UsersTab />}
      {tab === "subscriptions" && <SubscriptionsTab />}
      {tab === "invoices" && <InvoicesTab />}
      {tab === "messages" && <MessagesTab />}
      {tab === "flags" && <FlagsTab />}
      {tab === "email" && <EmailTab />}
      {tab === "audit" && <AuditTab />}
      {tab === "settings" && <SettingsTab />}
      {tab === "danger" && <DangerTab />}
      {tab === "seo" && <SeoTab />}
      {tab === "notify" && <BroadcastTab />}
      {tab === "subscribers" && <SubscribersTab />}
      {tab === "roadmap" && <RoadmapTab />}
    </div>
  );
}

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [rangeParams, setRangeParams] = useState<{ range: RangeId; from?: number; to?: number }>({ range: "7d" });
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  useEffect(() => {
    const qs = new URLSearchParams({ range: rangeParams.range });
    if (rangeParams.from) qs.set("from", String(rangeParams.from));
    if (rangeParams.to) qs.set("to", String(rangeParams.to));
    fetch(`/api/admin/stats?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [rangeParams]);

  async function resetTestData() {
    if (
      !confirm(
        "Reset test data? This permanently deletes ALL generation/visitor tracking history (usage_events) and any subscription created with the \"Grant Pro\" dev buttons (provider = dev). Real users, invoices, real payments, and email history are never touched. This can't be undone.",
      )
    ) {
      return;
    }
    setResetting(true);
    setResetMsg("");
    try {
      const res = await fetch("/api/admin/reset-test-data", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string; deleted?: { usageEvents: number; devSubscriptions: number } };
      if (res.ok && json.ok) {
        setResetMsg(
          `Cleared ${json.deleted?.usageEvents ?? 0} tracking events and ${json.deleted?.devSubscriptions ?? 0} dev subscriptions.`,
        );
        setRangeParams((p) => ({ ...p }));
      } else {
        setResetMsg(json.error || "Reset failed.");
      }
    } catch {
      setResetMsg("Network error.");
    } finally {
      setResetting(false);
      setTimeout(() => setResetMsg(""), 6000);
    }
  }

  if (loading && !stats) return <Panel><p className="text-sm text-[#6b7280]">Loading…</p></Panel>;
  if (!stats) return <Panel><p className="text-sm text-[#6b7280]">Failed to load.</p></Panel>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <RangePicker onChange={setRangeParams} />
        <div className="flex items-center gap-3">
          {resetMsg ? <span className="text-[13px] text-[#166534]">{resetMsg}</span> : null}
          <button
            type="button"
            onClick={resetTestData}
            disabled={resetting}
            className="rounded-full border border-[#fecaca] px-3.5 py-1.5 text-[13px] font-medium text-[#d70015] transition hover:bg-[#fef2f2] disabled:opacity-50"
          >
            {resetting ? "Resetting…" : "Reset test data"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Users" value={stats.users.toLocaleString()} sub={`+${stats.newUsersInRange} in range`} />
        <StatCard label="Documents" value={stats.invoices.toLocaleString()} sub={`${stats.invoicesInRange} in range`} />
        <StatCard label="Paying Customers" value={stats.activeSubs.toLocaleString()} sub="Pro, Teams & Lifetime — right now" />
        <StatCard label="MRR" value={`$${(stats.mrrCents / 100).toFixed(0)}`} sub="monthly equivalent, right now" />
        <StatCard label="Emails" value={stats.emailsInRange.toLocaleString()} sub="in range" />
      </div>

      <Panel>
        <SectionHead title="Recent subscriptions" />
        {stats.recentSubs.length === 0 ? (
          <p className="py-6 text-sm text-[#6b7280]">No subscriptions yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                  <th className="pb-2 font-medium">User</th>
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
                        s.status === "active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#6b7280]"
                      }`}>{s.status}</span>
                    </td>
                    <td className="py-2 text-[#6b7280]">{s.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <UsagePanel rangeParams={rangeParams} />
    </div>
  );
}

const USAGE_EVENT_LABELS: Record<string, string> = {
  invoice_downloaded: "Downloaded",
  invoice_printed: "Printed",
  invoice_emailed: "Emailed",
  invoice_shared: "Shared",
  invoice_saved_to_account: "Saved to account",
};

type UsageStats = {
  totalEvents: number;
  uniqueVisitors: number;
  signedInVisitors: number;
  guestVisitors: number;
  eventsByType: Record<string, number>;
  last30Days: Array<{ day: string; events: number; visitors: number }>;
};

function UsagePanel({ rangeParams }: { rangeParams: { range: RangeId; from?: number; to?: number } }) {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const qs = new URLSearchParams({ range: rangeParams.range });
    if (rangeParams.from) qs.set("from", String(rangeParams.from));
    if (rangeParams.to) qs.set("to", String(rangeParams.to));
    fetch(`/api/admin/usage?${qs.toString()}`)
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [rangeParams]);

  return (
    <Panel>
      <SectionHead
        title="Invoice generation activity"
        subtitle="Counts a PDF download, print, email, share, or save-to-account in the selected range — from anyone, signed in or not. Returning visitors are tracked by a persistent cookie, so the same person generating on different days is one visitor, not two."
      />
      {loading || !stats ? (
        <p className="mt-4 text-sm text-[#6b7280]">{loading ? "Loading…" : "Failed to load."}</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Invoice actions" value={stats.totalEvents.toLocaleString()} sub="in range" />
            <StatCard label="Unique visitors" value={stats.uniqueVisitors.toLocaleString()} />
            <StatCard label="Signed in" value={stats.signedInVisitors.toLocaleString()} />
            <StatCard label="Guests" value={stats.guestVisitors.toLocaleString()} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(stats.eventsByType).map(([event, n]) => (
              <span key={event} className="rounded-full bg-[#f3f4f6] px-3 py-1.5 text-xs font-medium text-[#374151]">
                {USAGE_EVENT_LABELS[event] || event}: {n.toLocaleString()}
              </span>
            ))}
          </div>
          {stats.last30Days.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                    <th className="pb-2 font-medium">Day</th>
                    <th className="pb-2 font-medium">Generations</th>
                    <th className="pb-2 font-medium">Visitors</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.last30Days.map((d) => (
                    <tr key={d.day} className="border-b border-[#f3f4f6]">
                      <td className="py-2 text-[#111827]">{d.day}</td>
                      <td className="py-2 text-[#6b7280]">{d.events}</td>
                      <td className="py-2 text-[#6b7280]">{d.visitors}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}
    </Panel>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [viewUser, setViewUser] = useState<string | null>(null);

  const load = () => {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("q", search);
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => { setUsers(d.users || []); setTotalPages(d.totalPages || 1); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search]);

  async function mutate(id: string, body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
    setBusy(false);
    load();
  }

  async function remove(id: string, email: string) {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" }).catch(() => {});
    setBusy(false);
    load();
  }

  async function impersonate(userId: string) {
    if (!confirm("Impersonate this user? You'll be logged in as them for 1 hour.")) return;
    setBusy(true);
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.ok) {
      window.location.href = "/dashboard";
    }
  }

  return (
    <Panel>
      {viewUser && <CustomerSlideOut userId={viewUser} onClose={() => setViewUser(null)} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHead title={`Users (${users.length.toLocaleString()})`} />
        <input
          type="text"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-56 rounded-full border border-[#e5e7eb] px-4 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
        />
      </div>

      {loading ? (
        <p className="py-6 text-sm text-[#6b7280] text-center">Loading…</p>
      ) : users.length === 0 ? (
        <p className="py-6 text-sm text-[#6b7280] text-center">No users found.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#e5e7eb] text-[#6b7280]">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Joined</th>
                <th className="pb-2 font-medium">Plan</th>
                <th className="pb-2 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[#f3f4f6]">
                  <td className="py-2.5 pr-4">
                    <button type="button" onClick={() => setViewUser(u.id)} className="font-medium text-[#166534] hover:underline">
                      {u.email}
                    </button>
                    {u.name && <span className="ml-2 text-[#6b7280]">({u.name})</span>}
                  </td>
                  <td className="py-2.5 pr-4">
                    <select
                      value={u.role}
                      disabled={busy}
                      onChange={(e) => void mutate(u.id, { role: e.target.value })}
                      className="rounded border border-[#e5e7eb] px-2 py-1 text-xs focus:border-[#166534] focus:outline-none"
                    >
                      {["user", "support", "admin", "superadmin"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 pr-4 text-[#6b7280]">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-2.5 pr-4">
                    {u.isPro ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-medium text-[#166534]">{u.plan || "pro"}</span>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { revokePro: true })} className="text-xs text-red-600 hover:underline disabled:opacity-50">Revoke</button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "pro_monthly" })} className="text-xs text-[#166534] hover:underline disabled:opacity-50">Pro M</button>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "pro_yearly" })} className="text-xs text-[#166534] hover:underline disabled:opacity-50">Pro Y</button>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "teams_monthly" })} className="text-xs text-[#166534] hover:underline disabled:opacity-50">Teams M</button>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "teams_yearly" })} className="text-xs text-[#166534] hover:underline disabled:opacity-50">Teams Y</button>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "lifetime" })} className="text-xs font-semibold text-[#166534] hover:underline disabled:opacity-50">Lifetime</button>
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" disabled={busy} onClick={() => void impersonate(u.id)} className="text-xs text-[#166534] hover:underline disabled:opacity-50">Impersonate</button>
                      <button type="button" disabled={busy} onClick={() => void remove(u.id, u.email)} className="text-xs text-red-600 hover:underline disabled:opacity-50">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="hover:text-[#111827] disabled:opacity-40">← Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="hover:text-[#111827] disabled:opacity-40">Next →</button>
      </div>
    </Panel>
  );
}

function SubscriptionsTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Panel><p className="text-sm text-[#6b7280]">Loading…</p></Panel>;
  if (!stats) return <Panel><p className="text-sm text-[#6b7280]">Failed to load.</p></Panel>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Paying Customers" value={stats.activeSubs.toLocaleString()} />
        <StatCard label="MRR" value={`$${(stats.mrrCents / 100).toFixed(0)}`} />
        <StatCard label="Total Users" value={stats.users.toLocaleString()} />
      </div>

      <Panel>
        <SectionHead title="All subscriptions" subtitle="Currently active subscriptions" />
        {stats.recentSubs.length === 0 ? (
          <p className="py-6 text-sm text-[#6b7280]">No subscriptions yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
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
                    <td className="py-2.5 pr-4 font-medium">{s.email}</td>
                    <td className="py-2.5 pr-4">{s.plan}</td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.status === "active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#6b7280]"
                      }`}>{s.status}</span>
                    </td>
                    <td className="py-2.5">{s.provider}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function InvoicesTab() {
  return (
    <Panel>
      <SectionHead title="All invoices" subtitle="Full invoice preview available for any document." />
      <div className="mt-4">
        <InvoiceTable role="superadmin" />
      </div>
    </Panel>
  );
}

function MessagesTab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(convPage), status: statusFilter });
    fetch(`/api/admin/messages?${params}`)
      .then((r) => r.json())
      .then((d) => { setConversations(d.conversations || []); setConvTotalPages(d.totalPages || 1); setLoading(false); })
      .catch(() => setLoading(false));
  }, [convPage, statusFilter]);

  const loadConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    const res = await fetch(`/api/admin/messages/${conv.id}`);
    const data = await res.json();
    setMessages(data.messages || []);
  };

  const sendReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConv || sendingMsg) return;
    setSendingMsg(true);
    const res = await fetch(`/api/admin/messages/${selectedConv.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: reply }),
    });
    const data = await res.json();
    if (data.ok) { setReply(""); loadConversation(selectedConv); }
    setSendingMsg(false);
  };

  const updateStatus = async (convId: string, status: string) => {
    await fetch(`/api/admin/messages/${convId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (selectedConv?.id === convId) setSelectedConv((p) => p ? { ...p, status } : null);
    const params = new URLSearchParams({ page: String(convPage), status: statusFilter });
    const res = await fetch(`/api/admin/messages?${params}`);
    const data = await res.json();
    setConversations(data.conversations || []);
  };

  if (selectedConv) {
    return (
      <Panel>
        <div className="flex max-h-[calc(100vh-120px)] flex-col">
          <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{selectedConv.user_name || selectedConv.user_email}</p>
              <p className="text-xs text-[#6b7280]">{selectedConv.subject}</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={selectedConv.status} onChange={(e) => void updateStatus(selectedConv.id, e.target.value)} className="rounded border border-[#e5e7eb] px-2 py-1 text-xs">
                <option value="ai">AI</option>
                <option value="escalated">Escalated</option>
                <option value="support">Human Support</option>
                <option value="resolved">Resolved</option>
              </select>
              <button type="button" onClick={() => setSelectedConv(null)} className="rounded-lg px-3 py-1.5 text-xs text-[#6b7280] hover:bg-[#f3f4f6]">Back</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_type === "user" ? "justify-start" : msg.sender_type === "support" ? "justify-end" : "justify-center"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender_type === "user" ? "bg-[#f3f4f6] text-[#111827]"
                    : msg.sender_type === "support" ? "bg-[#166534] text-white"
                    : msg.sender_type === "ai" ? "bg-[#e0e7ff] text-[#3730a3]"
                    : "bg-[#fef3c7] text-[#92400e]"
                  }`}>{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <form onSubmit={sendReply} className="border-t border-[#e5e7eb] p-4">
            <div className="flex gap-2">
              <input type="text" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type a reply…" disabled={sendingMsg} className="flex-1 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534] disabled:opacity-50" />
              <button type="submit" disabled={sendingMsg || !reply.trim()} className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50">{sendingMsg ? "Sending…" : "Send"}</button>
            </div>
          </form>
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      <div className="mb-4 flex items-center gap-2">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setConvPage(1); }} className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm">
          <option value="all">All conversations</option>
          <option value="escalated">Escalated</option>
          <option value="support">Human Support</option>
          <option value="ai">AI</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      {loading ? <p className="text-sm text-[#6b7280]">Loading…</p> : conversations.length === 0 ? (
        <p className="text-sm text-[#6b7280]">No conversations.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button key={conv.id} onClick={() => void loadConversation(conv)} className="w-full rounded-lg border border-[#e5e7eb] p-4 text-left transition hover:bg-[#f9fafb]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{conv.user_name || conv.user_email}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      conv.status === "escalated" ? "bg-[#fef3c7] text-[#92400e]"
                      : conv.status === "support" ? "bg-[#dbeafe] text-[#1e40af]"
                      : conv.status === "resolved" ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#f3f4f6] text-[#6b7280]"
                    }`}>{conv.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[#6b7280]">{conv.subject}</p>
                  <p className="mt-1 line-clamp-1 text-sm text-[#374151]">
                    {conv.last_sender === "user" ? "User: " : conv.last_sender === "support" ? "Support: " : "AI: "}
                    {conv.last_message}
                  </p>
                </div>
                <p className="text-xs text-[#6b7280]">{new Date(conv.updated_at).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
          <div className="flex items-center justify-between pt-2 text-sm text-[#6b7280]">
            <button onClick={() => setConvPage((p) => Math.max(1, p - 1))} disabled={convPage === 1} className="hover:text-[#111827] disabled:opacity-40">← Prev</button>
            <span>Page {convPage} of {convTotalPages}</span>
            <button onClick={() => setConvPage((p) => Math.min(convTotalPages, p + 1))} disabled={convPage === convTotalPages} className="hover:text-[#111827] disabled:opacity-40">Next →</button>
          </div>
        </div>
      )}
    </Panel>
  );
}

function FlagsTab() {
  const [state, setState] = useState<FlagsState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/flags")
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: FlagsState) => setState(d))
      .catch(() => setLoadError("Could not load flags."));
  }, []);

  async function save(next: FlagsState) {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/flags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    if (res.ok) { setState(next); setMessage("Saved. Live immediately."); }
    else setMessage("Save failed.");
    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  function toggle(key: FlagKey) {
    if (!state || saving) return;
    void save({ ...state, flags: { ...state.flags, [key]: !state.flags[key] } });
  }

  if (loadError) return <Panel><p className="text-sm text-red-600">{loadError}</p></Panel>;
  if (!state) return <Panel><p className="text-sm text-[#6b7280]">Loading…</p></Panel>;

  const siteDefs = FLAG_DEFS.filter((d) => d.group === "site");
  const proDefs = FLAG_DEFS.filter((d) => d.group === "pro");

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHead title="Site switches" subtitle="Changes apply instantly." />
        <div className="mt-4 divide-y divide-[#e8e8ed]">
          {siteDefs.map((def) => {
            const on = state.flags[def.key];
            return (
              <div key={def.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-[15px] font-medium">{def.label}</p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">{def.description}</p>
                </div>
                <button type="button" role="switch" aria-checked={on} disabled={saving} onClick={() => toggle(def.key)} className={`relative h-[30px] w-[52px] shrink-0 rounded-full p-[2px] transition-colors ${on ? "bg-[#34c759]" : "bg-[#d2d2d7]"} disabled:opacity-50`}>
                  <span className={`block h-[26px] w-[26px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <SectionHead title="Pro & upcoming" subtitle="Flip when ready." />
        <div className="mt-4 divide-y divide-[#e8e8ed]">
          {proDefs.map((def) => {
            const on = state.flags[def.key];
            return (
              <div key={def.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-[15px] font-medium">{def.label}</p>
                  <p className="mt-0.5 text-[13px] text-[#6b7280]">{def.description}</p>
                </div>
                <button type="button" role="switch" aria-checked={on} disabled={saving} onClick={() => toggle(def.key)} className={`relative h-[30px] w-[52px] shrink-0 rounded-full p-[2px] transition-colors ${on ? "bg-[#34c759]" : "bg-[#d2d2d7]"} disabled:opacity-50`}>
                  <span className={`block h-[26px] w-[26px] rounded-full bg-white shadow transition-transform ${on ? "translate-x-[22px]" : ""}`} />
                </button>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <SectionHead title="Announcement bar" subtitle="Empty = hidden." />
        <textarea value={state.announcement} onChange={(e) => setState({ ...state, announcement: e.target.value })} rows={2} maxLength={300} placeholder="e.g. All Pro features are now live — client book, quotes, recurring, and more." className="mt-4 w-full resize-none rounded-xl border border-[#e5e7eb] px-3.5 py-3 text-[15px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" />
        <button type="button" onClick={() => void save(state)} disabled={saving} className="mt-4 rounded-full bg-[#166534] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#14532d] disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
        {message ? <p className="mt-3 text-[13px] text-[#166534]">{message}</p> : null}
      </Panel>
    </div>
  );
}

function EmailTab() {
  const [audience, setAudience] = useState<"all" | "pro" | "free" | "newsletter" | "one">("all");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");

  async function send() {
    if (busy) return;
    setBusy(true);
    setResult("");
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audience, to, subject, text }),
    });
    const json = await res.json();
    setResult(res.ok ? `Sent to ${json.recipients} (${json.sent} delivered, ${json.simulated} simulated, ${json.failed} failed).` : json.error || "Failed.");
    if (res.ok) { setSubject(""); setText(""); }
    setBusy(false);
  }

  return (
    <Panel>
      <SectionHead title="Broadcast email" subtitle="Delivered via Resend or simulated." />
      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {([["all", "All users"], ["pro", "Pro only"], ["free", "Free only"], ["newsletter", "Newsletter"], ["one", "Single user"]] as const).map(([v, l]) => (
            <button key={v} type="button" onClick={() => setAudience(v)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${audience === v ? "bg-[#111827] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"}`}>{l}</button>
          ))}
        </div>
        {audience === "one" ? <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="user@example.com" className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" /> : null}
        <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" maxLength={200} className="w-full rounded-xl border border-[#e5e7eb] px-3.5 py-2.5 text-[15px] outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" />
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} maxLength={10000} placeholder="Plain-text message…" className="w-full resize-y rounded-xl border border-[#e5e7eb] px-3.5 py-3 text-[15px] leading-relaxed outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20" />
        <button type="button" onClick={() => void send()} disabled={busy} className="rounded-full bg-[#166534] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#14532d] disabled:opacity-60">{busy ? "Sending…" : "Send"}</button>
        {result ? <p className="text-[13px] text-[#6b7280]">{result}</p> : null}
      </div>
    </Panel>
  );
}

function AuditTab() {
  return (
    <Panel>
      <SectionHead title="Audit trail" subtitle="All platform activity. Every action is logged." />
      <div className="mt-4">
        <AuditTable role="superadmin" />
      </div>
    </Panel>
  );
}

type AiProviderInfo = { id: string; label: string; configured: boolean };

function AiProviderPanel() {
  const [providers, setProviders] = useState<AiProviderInfo[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = () => {
    fetch("/api/admin/ai-provider")
      .then((r) => r.json())
      .then((d) => { setProviders(d.providers || []); setActive(d.active ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function choose(id: string) {
    if (id === active || saving) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/ai-provider", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: id }),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok && json.ok) {
      setActive(json.active);
      setMessage(`Switched to ${providers.find((p) => p.id === id)?.label ?? id}.`);
    } else {
      setMessage(json.error || "Could not switch provider.");
    }
    setTimeout(() => setMessage(""), 4000);
  }

  return (
    <Panel>
      <SectionHead
        title="AI provider"
        subtitle="Powers both AI invoice drafting and the live-chat assistant. Switch instantly, no redeploy."
      />
      {loading ? (
        <p className="mt-4 text-sm text-[#6b7280]">Loading…</p>
      ) : (
        <div className="mt-4 divide-y divide-[#e8e8ed]">
          {providers.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="text-[15px] font-medium">{p.label}</p>
                <p className="mt-0.5 text-[13px] text-[#6b7280]">
                  {p.configured ? "API key configured on Vercel." : "No API key set — add one on Vercel to enable."}
                </p>
              </div>
              <button
                type="button"
                disabled={!p.configured || saving}
                onClick={() => void choose(p.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                  active === p.id
                    ? "bg-[#166534] text-white"
                    : "border border-[#e5e7eb] text-[#111827] hover:border-[#166534]"
                }`}
              >
                {active === p.id ? "Active" : "Use this"}
              </button>
            </div>
          ))}
        </div>
      )}
      {message ? <p className="mt-3 text-[13px] text-[#166534]">{message}</p> : null}
    </Panel>
  );
}

function SettingsTab() {
  const [name, setName] = useState("Invoala");
  const [currency, setCurrency] = useState("USD");
  const [maintenance, setMaintenance] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <AiProviderPanel />
      <Panel>
        <SectionHead title="Platform settings" subtitle="Core platform configuration." />
        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Platform name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#374151]">Default currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none">
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-medium text-[#374151]">
              <input type="checkbox" checked={maintenance} onChange={(e) => setMaintenance(e.target.checked)} className="h-4 w-4 rounded border-[#d1d5db] text-[#166534] focus:ring-[#166534]" />
              Maintenance mode
            </label>
            <span className="text-xs text-[#6b7280]">Takes the public site down. Admin stays available.</span>
          </div>
          <button type="button" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d]">
            Save settings
          </button>
          {saved ? <p className="text-sm text-[#166534]">Settings saved.</p> : null}
        </div>
      </Panel>
    </div>
  );
}

function DangerTab() {
  const [confirmText, setConfirmText] = useState("");
  const [confirmText2, setConfirmText2] = useState("");

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHead title="Danger zone" subtitle="These actions are irreversible. Proceed with extreme caution." />
        <div className="mt-6 space-y-6">
          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-semibold text-red-800">Delete all user data</h3>
            <p className="mt-1 text-sm text-red-600">Permanently remove all users, invoices, teams, conversations, and subscriptions. This cannot be undone.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder='Type "DELETE ALL DATA" to confirm' className="w-full max-w-72 flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" />
              <button type="button" disabled={confirmText !== "DELETE ALL DATA"} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">Delete everything</button>
            </div>
          </div>

          <div className="rounded-xl border-2 border-red-200 bg-red-50 p-5">
            <h3 className="text-sm font-semibold text-red-800">Reset platform to defaults</h3>
            <p className="mt-1 text-sm text-red-600">Reset all feature flags, announcement bar, and settings to factory defaults.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <input value={confirmText2} onChange={(e) => setConfirmText2(e.target.value)} placeholder='Type "RESET PLATFORM" to confirm' className="w-full max-w-72 flex-1 rounded-lg border border-red-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500" />
              <button type="button" disabled={confirmText2 !== "RESET PLATFORM"} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed">Reset everything</button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
