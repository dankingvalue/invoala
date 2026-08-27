"use client";

import { useEffect, useState, useRef, FormEvent } from "react";

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

type Flags = Record<string, boolean> & { announcement?: string };

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

export function SuperAdminDashboard() {
  const [tab, setTab] = useState<"stats" | "users" | "flags" | "email" | "messages">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<Flags>({});
  const [announcement, setAnnouncement] = useState("");
  const [saving, setSaving] = useState(false);

  // Messages state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tab === "stats") {
      setLoading(true);
      fetch("/api/admin/stats")
        .then((r) => r.json())
        .then((d) => { setStats(d); setLoading(false); })
        .catch(() => setLoading(false));
    } else if (tab === "flags") {
      setLoading(true);
      fetch("/api/admin/flags")
        .then((r) => r.json())
        .then((d) => { setFlags(d.flags || {}); setAnnouncement(d.announcement || ""); setLoading(false); })
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (tab === "messages") {
      loadConversations();
    }
  }, [tab, statusFilter, convPage]);

  const loadConversations = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(convPage), status: statusFilter });
    const res = await fetch(`/api/admin/messages?${params}`);
    const data = await res.json();
    setConversations(data.conversations || []);
    setConvTotalPages(data.totalPages || 1);
    setLoading(false);
  };

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
    
    if (data.ok) {
      setReply("");
      loadConversation(selectedConv);
      loadConversations();
    }
    setSendingMsg(false);
  };

  const updateConvStatus = async (convId: string, status: string) => {
    await fetch(`/api/admin/messages/${convId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadConversations();
    if (selectedConv?.id === convId) {
      setSelectedConv((prev) => prev ? { ...prev, status } : null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const handleGrantPro = async (userId: string, plan: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grantPro: plan }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isPro: true, plan } : u));
    }
  };

  const handleRevokePro = async (userId: string) => {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revokePro: true }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isPro: false, plan: null } : u));
    }
  };

  const handleSaveFlags = async () => {
    setSaving(true);
    await fetch("/api/admin/flags", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flags, announcement }),
    });
    setSaving(false);
  };

  const [emailForm, setEmailForm] = useState({ audience: "all", to: "", subject: "", text: "" });
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  const handleSendEmail = async () => {
    if (!emailForm.subject || !emailForm.text) return;
    setSending(true);
    setSendResult(null);
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailForm),
    });
    const data = await res.json();
    setSendResult(data.ok ? `Sent to ${data.sent || 0} recipients` : data.error || "Failed to send");
    setSending(false);
  };

  const tabs = [
    { id: "stats" as const, label: "Overview" },
    { id: "users" as const, label: "Users" },
    { id: "messages" as const, label: "Messages" },
    { id: "flags" as const, label: "Feature Flags" },
    { id: "email" as const, label: "Email" },
  ];

  return (
    <div>
      <div className="mb-6 flex gap-1 rounded-lg bg-white p-1 shadow-sm ring-1 ring-[#e5e7eb]">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setPage(1); setConvPage(1); setSelectedConv(null); }}
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
                      <th className="pb-2 font-medium text-right">Actions</th>
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
                          <select
                            value={u.role}
                            onChange={(e) => void handleRoleChange(u.id, e.target.value)}
                            className="rounded border border-[#e5e7eb] px-2 py-1 text-xs focus:border-[#166534] focus:outline-none"
                          >
                            {["user", "support", "admin", "superadmin"].map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2 text-[#6b7280]">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          {u.isPro ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center rounded-full bg-[#dcfce7] px-2 py-0.5 text-xs font-medium text-[#166534]">
                                {u.plan || "pro"}
                              </span>
                              <button
                                onClick={() => void handleRevokePro(u.id)}
                                className="text-xs text-red-600 hover:underline"
                              >
                                Revoke
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => void handleGrantPro(u.id, "pro_monthly")}
                                className="text-xs text-[#166534] hover:underline"
                              >
                                Pro Monthly
                              </button>
                              <button
                                onClick={() => void handleGrantPro(u.id, "pro_yearly")}
                                className="text-xs text-[#166534] hover:underline"
                              >
                                Pro Yearly
                              </button>
                              <button
                                onClick={() => void handleGrantPro(u.id, "teams_monthly")}
                                className="text-xs text-[#166534] hover:underline"
                              >
                                Teams Monthly
                              </button>
                              <button
                                onClick={() => void handleGrantPro(u.id, "teams_yearly")}
                                className="text-xs text-[#166534] hover:underline"
                              >
                                Teams Yearly
                              </button>
                              <button
                                onClick={() => void handleGrantPro(u.id, "lifetime")}
                                className="text-xs font-semibold text-[#166534] hover:underline"
                              >
                                Lifetime
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="py-2 text-right">
                          <button
                            onClick={() => void handleDeleteUser(u.id, u.email)}
                            className="text-xs text-red-600 hover:underline"
                          >
                            Delete
                          </button>
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

      {tab === "flags" && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb]">
          {loading ? (
            <p className="text-sm text-[#6b7280]">Loading...</p>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111827]">Site Switches</h3>
                <div className="space-y-2">
                  {["aiComposer", "emailCapture", "trustpilotStrip", "printButton", "logoUpload", "signupPrompt", "maintenanceMode"].map((key) => (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!flags[key]}
                        onChange={(e) => setFlags((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded border-[#d1d5db] text-[#166534] focus:ring-[#166534]"
                      />
                      <span className="text-sm text-[#374151]">{formatFlagName(key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111827]">Pro & Upcoming</h3>
                <div className="space-y-2">
                  {["proTeaser", "quoteMode", "recurringTerms", "savedClients", "multiBusinessProfiles", "onlinePayments"].map((key) => (
                    <label key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!flags[key]}
                        onChange={(e) => setFlags((prev) => ({ ...prev, [key]: e.target.checked }))}
                        className="h-4 w-4 rounded border-[#d1d5db] text-[#166534] focus:ring-[#166534]"
                      />
                      <span className="text-sm text-[#374151]">{formatFlagName(key)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-[#111827]">Announcement Bar</h3>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  placeholder="Leave empty to hide announcement bar"
                  rows={3}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>

              <button
                onClick={() => void handleSaveFlags()}
                disabled={saving}
                className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "email" && (
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-[#e5e7eb]">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">Send to</label>
              <select
                value={emailForm.audience}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, audience: e.target.value }))}
                className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              >
                <option value="all">All users</option>
                <option value="pro">Pro subscribers only</option>
                <option value="free">Free users only</option>
                <option value="one">Single user</option>
              </select>
            </div>

            {emailForm.audience === "one" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-[#374151]">Email address</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm((prev) => ({ ...prev, to: e.target.value }))}
                  className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">Subject</label>
              <input
                type="text"
                value={emailForm.subject}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))}
                maxLength={200}
                className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#374151]">Message</label>
              <textarea
                value={emailForm.text}
                onChange={(e) => setEmailForm((prev) => ({ ...prev, text: e.target.value }))}
                rows={8}
                maxLength={10000}
                className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
              />
              <p className="mt-1 text-xs text-[#6b7280]">{emailForm.text.length}/10,000 characters</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => void handleSendEmail()}
                disabled={sending || !emailForm.subject || !emailForm.text}
                className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Email"}
              </button>
              {sendResult && (
                <span className="text-sm text-[#6b7280]">{sendResult}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "messages" && (
        <div className="rounded-lg bg-white shadow-sm ring-1 ring-[#e5e7eb]">
          {selectedConv ? (
            /* Conversation View */
            <div className="flex h-[600px]">
              {/* Messages */}
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">
                      {selectedConv.user_name || selectedConv.user_email}
                    </p>
                    <p className="text-xs text-[#6b7280]">{selectedConv.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConv.status}
                      onChange={(e) => void updateConvStatus(selectedConv.id, e.target.value)}
                      className="rounded border border-[#e5e7eb] px-2 py-1 text-xs"
                    >
                      <option value="ai">AI</option>
                      <option value="escalated">Escalated</option>
                      <option value="support">Human Support</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="rounded-lg px-3 py-1.5 text-xs text-[#6b7280] hover:bg-[#f3f4f6]"
                    >
                      Back
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_type === "user" ? "justify-start" : msg.sender_type === "support" ? "justify-end" : "justify-center"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                            msg.sender_type === "user"
                              ? "bg-[#f3f4f6] text-[#111827]"
                              : msg.sender_type === "support"
                                ? "bg-[#166534] text-white"
                                : msg.sender_type === "ai"
                                  ? "bg-[#e0e7ff] text-[#3730a3]"
                                  : "bg-[#fef3c7] text-[#92400e]"
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                <form onSubmit={sendReply} className="border-t border-[#e5e7eb] p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type a reply..."
                      disabled={sendingMsg}
                      className="flex-1 rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534] disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !reply.trim()}
                      className="rounded-lg bg-[#166534] px-4 py-2 text-sm font-medium text-white hover:bg-[#14532d] disabled:opacity-50"
                    >
                      {sendingMsg ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Conversations List */
            <div className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setConvPage(1); }}
                  className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm"
                >
                  <option value="all">All conversations</option>
                  <option value="escalated">Escalated</option>
                  <option value="support">Human Support</option>
                  <option value="ai">AI</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              {loading ? (
                <p className="text-sm text-[#6b7280]">Loading...</p>
              ) : conversations.length === 0 ? (
                <p className="text-sm text-[#6b7280]">No conversations found.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => void loadConversation(conv)}
                        className="w-full rounded-lg border border-[#e5e7eb] p-4 text-left transition hover:bg-[#f9fafb]"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-[#111827]">
                                {conv.user_name || conv.user_email}
                              </p>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                conv.status === "escalated"
                                  ? "bg-[#fef3c7] text-[#92400e]"
                                  : conv.status === "support"
                                    ? "bg-[#dbeafe] text-[#1e40af]"
                                    : conv.status === "resolved"
                                      ? "bg-[#dcfce7] text-[#166534]"
                                      : "bg-[#f3f4f6] text-[#6b7280]"
                              }`}>
                                {conv.status}
                              </span>
                              {conv.unread_count > 0 && (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#166534] text-[10px] font-bold text-white">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-xs text-[#6b7280]">{conv.subject}</p>
                            <p className="mt-1 line-clamp-1 text-sm text-[#374151]">
                              {conv.last_sender === "user" ? "User: " : conv.last_sender === "support" ? "Support: " : "AI: "}
                              {conv.last_message}
                            </p>
                          </div>
                          <p className="text-xs text-[#6b7280]">
                            {new Date(conv.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setConvPage((p) => Math.max(1, p - 1))}
                      disabled={convPage === 1}
                      className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-sm text-[#6b7280] hover:bg-[#f9fafb] disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-[#6b7280]">
                      Page {convPage} of {convTotalPages}
                    </span>
                    <button
                      onClick={() => setConvPage((p) => Math.min(convTotalPages, p + 1))}
                      disabled={convPage === convTotalPages}
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

function formatFlagName(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
