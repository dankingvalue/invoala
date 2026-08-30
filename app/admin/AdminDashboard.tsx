"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { FLAG_DEFS, type FlagKey, type FlagsState } from "@/lib/flags";
import { StatCard, Panel, SectionHead } from "@/components/admin/Panel";
import { AuditTable } from "@/components/admin/AuditTable";
import { InvoiceTable } from "@/components/admin/InvoiceTable";
import { CustomerSlideOut } from "@/components/admin/CustomerSlideOut";
import { SeoTab } from "@/components/admin/SeoTab";

type Tab = "overview" | "users" | "invoices" | "messages" | "flags" | "email" | "audit" | "seo";

type Stats = {
  users: number;
  newUsers7d: number;
  invoices: number;
  invoices30d: number;
  activeSubs: number;
  mrrCents: number;
  emailsSent7d: number;
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
  { id: "invoices", label: "Invoices" },
  { id: "messages", label: "Messages" },
  { id: "flags", label: "Flags" },
  { id: "email", label: "Email" },
  { id: "audit", label: "Audit Trail" },
  { id: "seo", label: "SEO" },
];

export function AdminDashboard({ myRole }: { myRole: string }) {
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
      {tab === "users" && <UsersTab myRole={myRole} />}
      {tab === "invoices" && <InvoicesTab />}
      {tab === "messages" && <MessagesTab />}
      {tab === "flags" && <FlagsTab />}
      {tab === "email" && <EmailTab />}
      {tab === "audit" && <AuditTab />}
      {tab === "seo" && <SeoTab />}
    </div>
  );
}

function OverviewTab() {
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Users" value={stats.users.toLocaleString()} sub={`+${stats.newUsers7d} this week`} />
        <StatCard label="Documents" value={stats.invoices.toLocaleString()} sub={`${stats.invoices30d} in 30 days`} />
        <StatCard label="Pro Subscribers" value={stats.activeSubs.toLocaleString()} />
        <StatCard label="MRR" value={`$${(stats.mrrCents / 100).toFixed(0)}`} sub="monthly equivalent" />
        <StatCard label="Emails (7d)" value={stats.emailsSent7d.toLocaleString()} />
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
                    <td className="py-2">{s.email}</td>
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
    </div>
  );
}

function UsersTab({ myRole }: { myRole: string }) {
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
          <table className="w-full min-w-[500px] text-left text-sm">
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
                    <button type="button" onClick={() => setViewUser(u.id)} className="font-medium text-[#166534] hover:underline">{u.email}</button>
                    {u.name && <span className="ml-2 text-[#6b7280]">({u.name})</span>}
                  </td>
                  <td className="py-2.5 pr-4">
                    {myRole === "superadmin" ? (
                      <select value={u.role} disabled={busy} onChange={(e) => void mutate(u.id, { role: e.target.value })} className="rounded border border-[#e5e7eb] px-2 py-1 text-xs">
                        {["user", "support", "admin", "superadmin"].map((r) => (<option key={r} value={r}>{r}</option>))}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.role === "superadmin" ? "bg-[#fef3c7] text-[#92400e]" : u.role === "admin" ? "bg-[#dbeafe] text-[#1e40af]" : u.role === "support" ? "bg-[#e0e7ff] text-[#3730a3]" : "bg-[#f3f4f6] text-[#6b7280]"
                      }`}>{u.role}</span>
                    )}
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
                    {myRole === "superadmin" ? (
                      <button type="button" disabled={busy} onClick={async () => { if (!confirm(`Delete ${u.email}?`)) return; setBusy(true); await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" }); setBusy(false); load(); }} className="text-xs text-red-600 hover:underline disabled:opacity-50">Delete</button>
                    ) : null}
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

function InvoicesTab() {
  return (
    <Panel>
      <SectionHead title="All invoices" subtitle="Full invoice preview available for any document." />
      <div className="mt-4">
        <InvoiceTable role="admin" />
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

  useEffect(() => {
    fetch("/api/admin/flags")
      .then(async (r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d: FlagsState) => setState(d))
      .catch(() => {});
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
  const [audience, setAudience] = useState<"all" | "pro" | "free" | "one">("all");
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
          {([["all", "All users"], ["pro", "Pro only"], ["free", "Free only"], ["one", "Single user"]] as const).map(([v, l]) => (
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
      <SectionHead title="Audit trail" subtitle="Showing support staff activity only." />
      <div className="mt-4">
        <AuditTable role="admin" />
      </div>
    </Panel>
  );
}
