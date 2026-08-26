"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import type { InvoiceRow, ClientRow } from "@/lib/data";
import type { Subscription } from "@/lib/billing";
import { formatMoney } from "@/lib/invoice";

type Props = {
  userId: string;
  email: string;
  name: string;
  timezone: string;
  emailVerified: number;
  initialInvoices: InvoiceRow[];
  initialClients: ClientRow[];
  subscription: Subscription | null;
  isPro: boolean;
  needsVerification: boolean;
  userRole: string;
  initialTab?: string;
};

type Tab = "general" | "documents" | "clients" | "teams" | "billing" | "security";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-fog text-subtle",
  sent: "bg-accent/10 text-accent",
  paid: "bg-[#00b67a]/10 text-[#00875a]",
};
const NEXT_STATUS: Record<string, string> = { draft: "sent", sent: "paid", paid: "draft" };

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Phoenix",
  "America/Sao_Paulo",
  "America/Toronto",
  "America/Vancouver",
  "America/Mexico_City",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Lisbon",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Warsaw",
  "Europe/Zurich",
  "Europe/Helsinki",
  "Europe/Istanbul",
  "Europe/Moscow",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "Africa/Cairo",
  "Asia/Dubai",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Bangkok",
  "Asia/Singapore",
  "Asia/Hong_Kong",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Pacific/Auckland",
  "Pacific/Honolulu",
];

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  {
    key: "general",
    label: "General",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    key: "documents",
    label: "Documents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    key: "clients",
    label: "Clients",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "teams",
    label: "Teams",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "billing",
    label: "Billing",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    key: "security",
    label: "Security",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
];

export function DashboardClient({
  userId,
  email,
  name: initialName,
  timezone: initialTimezone,
  emailVerified,
  initialInvoices,
  initialClients,
  subscription,
  isPro,
  needsVerification,
  initialTab = "general",
}: Props) {
  const router = useRouter();
  const validTabs: Tab[] = ["general", "documents", "clients", "teams", "billing", "security"];
  const [tab, setTab] = useState<Tab>(validTabs.includes(initialTab as Tab) ? (initialTab as Tab) : "general");
  const [invoices, setInvoices] = useState(initialInvoices);
  const [clients, setClients] = useState(initialClients);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [profileName, setProfileName] = useState(initialName);
  const [profileTimezone, setProfileTimezone] = useState(initialTimezone);
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "done">("idle");

  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [emailMsg, setEmailMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [pwMsg, setPwMsg] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "error">("idle");
  const [deleteMsg, setDeleteMsg] = useState("");

  // Teams state
  const [teams, setTeams] = useState<Array<{ id: string; name: string; owner_id: string; plan: string }>>([]);
  const [teamInvites, setTeamInvites] = useState<Array<{ id: string; team_name: string; inviter_name: string; email: string }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<Array<{ id: string; user_id: string; role: string; name: string; email: string }>>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [teamStatus, setTeamStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [teamMsg, setTeamMsg] = useState("");
  const [newTeamName, setNewTeamName] = useState("");

  function isTeamAdminLocal(teamId: string, uid?: string): boolean {
    const checkId = uid || userId;
    const team = teams.find((t) => t.id === teamId);
    if (team?.owner_id === checkId) return true;
    const member = teamMembers.find((m) => m.user_id === checkId);
    return member?.role === "admin";
  }

  // Fetch teams data when teams tab is selected
  useEffect(() => {
    if (tab !== "teams") return;
    fetch("/api/teams")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setTeams(data.teams || []);
          setTeamInvites(data.invites || []);
        }
      })
      .catch(() => {});
  }, [tab]);

  // Fetch team members when a team is selected
  useEffect(() => {
    if (!selectedTeam) return;
    fetch(`/api/teams/${selectedTeam}/members`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.members) setTeamMembers(data.members);
      })
      .catch(() => {});
  }, [selectedTeam]);

  async function cycleStatus(row: InvoiceRow) {
    const next = NEXT_STATUS[row.status] || "draft";
    setBusy(true);
    await fetch("/api/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status: next }),
    }).catch(() => {});
    setInvoices((rows) => rows.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    setBusy(false);
  }

  async function removeInvoice(id: string) {
    setBusy(true);
    await fetch(`/api/invoices/${id}`, { method: "DELETE" }).catch(() => {});
    setInvoices((rows) => rows.filter((r) => r.id !== id));
    setBusy(false);
  }

  function editInvoice(row: InvoiceRow) {
    try {
      localStorage.setItem("invoala.edit", JSON.stringify({ id: row.id, invoice: row.data }));
    } catch {}
    router.push("/#generate");
  }

  async function addClient(e: FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || busy) return;
    setBusy(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: clientName, email: clientEmail }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) {
      const json = (await res.json()) as { client: ClientRow };
      setClients((rows) =>
        [...rows, json.client].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setClientName("");
      setClientEmail("");
    }
  }

  async function removeClient(id: string) {
    setBusy(true);
    await fetch(`/api/clients/${id}`, { method: "DELETE" }).catch(() => {});
    setClients((rows) => rows.filter((c) => c.id !== id));
    setBusy(false);
  }

  async function subscribe(plan: string) {
    setBusy(true);
    setNotice("");
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = (await res.json()) as { mode?: string; url?: string; error?: string };
      if (json.mode === "stripe" && json.url) {
        window.location.href = json.url;
        return;
      }
      if (res.ok && json.mode === "dev") {
        setNotice("Dev billing: Pro activated instantly. Add STRIPE_SECRET_KEY for live payments.");
        router.refresh();
      } else {
        setNotice(json.error || "Checkout failed.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function cancelSub() {
    setBusy(true);
    await fetch("/api/billing/cancel", { method: "POST" }).catch(() => {});
    setBusy(false);
    router.refresh();
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileStatus("loading");
    try {
      await fetch("/api/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, timezone: profileTimezone }),
      });
    } catch {}
    setProfileStatus("done");
    setTimeout(() => setProfileStatus("idle"), 2000);
  }

  async function requestEmailChange(e: FormEvent) {
    e.preventDefault();
    setEmailStatus("loading");
    setEmailMsg("");
    try {
      const res = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setEmailStatus("done");
        setEmailMsg("Confirmation sent to your new email. Click the link to complete the change.");
        setNewEmail("");
      } else {
        setEmailStatus("error");
        setEmailMsg(json.error || "Failed.");
      }
    } catch {
      setEmailStatus("error");
      setEmailMsg("Network error.");
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwStatus("loading");
    setPwMsg("");
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setPwStatus("done");
        setPwMsg("Password updated. You've been signed in with a new session.");
        setCurrentPw("");
        setNewPw("");
      } else {
        setPwStatus("error");
        setPwMsg(json.error || "Failed.");
      }
    } catch {
      setPwStatus("error");
      setPwMsg("Network error.");
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== "DELETE") return;
    setDeleteStatus("loading");
    setDeleteMsg("");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: "DELETE" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        router.push("/");
        router.refresh();
      } else {
        setDeleteStatus("error");
        setDeleteMsg(json.error || "Failed.");
      }
    } catch {
      setDeleteStatus("error");
      setDeleteMsg("Network error.");
    }
  }

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const outstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((sum, i) => sum + i.total, 0);

  const inputCls =
    "w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15";

  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight text-ink md:text-[32px]">
          {tab === "general" && "General"}
          {tab === "documents" && "Documents"}
          {tab === "clients" && "Clients"}
          {tab === "billing" && "Billing"}
          {tab === "security" && "Security"}
        </h1>
        <p className="mt-1 text-[14px] text-[#6b7280]">
          {tab === "general" && "Manage your profile and invoicing defaults."}
          {tab === "documents" && "View and manage all your invoices and quotes."}
          {tab === "clients" && "Your saved client book. Auto-fills new invoices."}
          {tab === "billing" && "Subscription plan, payment method, and invoices."}
          {tab === "security" && "Email, password, and account deletion."}
        </p>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-[#e5e7eb] bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex gap-0 overflow-x-auto border-b border-[#e5e7eb]">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 text-[13px] font-medium transition sm:px-5 ${
                tab === t.key
                  ? "border-[#166534] text-[#166534]"
                  : "border-transparent text-[#6b7280] hover:text-ink"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-8">
          {needsVerification ? (
            <div className="mb-6 rounded-lg border border-[#f0c000]/30 bg-[#fef9e7] p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[14px] font-medium text-[#92600a]">Please verify your email address</p>
                <p className="mt-0.5 text-[13px] text-[#b48a0e]">
                  Check your inbox for a verification code, or{" "}
                  <Link href="/verify" className="underline">enter it here</Link>.
                </p>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/resend", { method: "POST" });
                  alert("Verification email resent.");
                }}
                className="shrink-0 rounded-lg border border-[#92600a] px-3 py-1.5 text-[12px] font-medium text-[#92600a] transition hover:bg-[#92600a] hover:text-white"
              >
                Resend
              </button>
            </div>
          ) : null}

          {/* General Tab */}
          {tab === "general" && (
            <div className="space-y-8">
              {/* Profile */}
              <section>
                <h2 className="text-[16px] font-bold text-ink">Profile</h2>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  Your name and timezone. These appear on invoices and affect date formatting.
                </p>
                <form onSubmit={saveProfile} className="mt-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">Name</label>
                      <input
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        placeholder="Your name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">Email</label>
                      <input
                        value={email}
                        disabled
                        className={`${inputCls} bg-[#f9fafb] text-[#9ca3af]`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">Timezone</label>
                    <select
                      value={profileTimezone}
                      onChange={(e) => setProfileTimezone(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">System default</option>
                      {TIMEZONES.map((tz) => (
                        <option key={tz} value={tz}>{tz.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={profileStatus === "loading"}
                    className="rounded-lg bg-[#14532d] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                  >
                    {profileStatus === "loading" ? "Saving…" : profileStatus === "done" ? "Saved!" : "Save changes"}
                  </button>
                </form>
              </section>

              <div className="border-t border-[#e5e7eb]" />

              {/* Invoicing defaults */}
              <section>
                <h2 className="text-[16px] font-bold text-ink">Invoicing defaults</h2>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  These values apply to new invoices. Edit your account name, country, and currency from the generator.
                </p>
                <div className="mt-5 rounded-lg border border-[#e5e7eb]">
                  <div className="flex items-center border-b border-[#e5e7eb] px-4 py-3">
                    <span className="w-[200px] text-[13px] text-[#6b7280]">Account name</span>
                    <span className="text-[14px] font-medium text-ink">{profileName || "—"}</span>
                  </div>
                  <div className="flex items-center border-b border-[#e5e7eb] px-4 py-3">
                    <span className="w-[200px] text-[13px] text-[#6b7280]">Email</span>
                    <span className="text-[14px] font-medium text-ink">{email}</span>
                  </div>
                  <div className="flex items-center border-b border-[#e5e7eb] px-4 py-3">
                    <span className="w-[200px] text-[13px] text-[#6b7280]">Timezone</span>
                    <span className="text-[14px] font-medium text-ink">{profileTimezone || "System default"}</span>
                  </div>
                  <div className="flex items-center px-4 py-3">
                    <span className="w-[200px] text-[13px] text-[#6b7280]">Plan</span>
                    <span className="text-[14px] font-medium text-ink">{isPro ? "Pro" : "Free"}</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Documents Tab */}
          {tab === "documents" && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Total</p>
                    <p className="text-[20px] font-bold text-ink">{invoices.length}</p>
                  </div>
                  <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Paid</p>
                    <p className="text-[20px] font-bold text-[#00875a]">{paidCount}</p>
                  </div>
                  <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Outstanding</p>
                    <p className="text-[20px] font-bold text-ink">{formatMoney(outstanding, "USD")}</p>
                  </div>
                </div>
                <Link
                  href="/#generate"
                  className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22]"
                >
                  + New invoice
                </Link>
              </div>

              {invoices.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[15px] text-[#6b7280]">No documents yet.</p>
                  <Link href="/#generate" className="mt-3 inline-block text-[14px] font-medium text-[#166534] hover:underline">
                    Create your first invoice →
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] text-[12px] uppercase tracking-wider text-[#6b7280]">
                        <th className="pb-2.5 pr-4 font-semibold">Number</th>
                        <th className="pb-2.5 pr-4 font-semibold">Client</th>
                        <th className="pb-2.5 pr-4 font-semibold">Date</th>
                        <th className="pb-2.5 pr-4 text-right font-semibold">Total</th>
                        <th className="pb-2.5 pr-4 font-semibold">Status</th>
                        <th className="pb-2.5 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((row) => (
                        <tr key={row.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#f9fafb]">
                          <td className="py-3 pr-4 font-medium text-ink">{row.number || "—"}</td>
                          <td className="py-3 pr-4 text-[#6b7280]">{row.client_name || "—"}</td>
                          <td className="py-3 pr-4 text-[#6b7280]">
                            {new Date(row.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="py-3 pr-4 text-right tabular-nums font-medium text-ink">
                            {formatMoney(row.total, row.currency)}
                          </td>
                          <td className="py-3 pr-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                                STATUS_STYLES[row.status] || STATUS_STYLES.draft
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2 text-[12px]">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void cycleStatus(row)}
                                className="font-medium text-[#166534] hover:underline disabled:opacity-50"
                              >
                                {NEXT_STATUS[row.status]}
                              </button>
                              <button
                                type="button"
                                onClick={() => editInvoice(row)}
                                className="text-[#6b7280] hover:text-ink"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => void removeInvoice(row.id)}
                                className="text-[#d70015] hover:underline disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Clients Tab */}
          {tab === "clients" && (
            <div>
              <form onSubmit={addClient} className="mb-6 flex flex-wrap gap-2.5">
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                  required
                  maxLength={80}
                  className="min-w-[180px] flex-1 rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
                />
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email (optional)"
                  type="email"
                  className="min-w-[180px] flex-1 rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-lg bg-[#14532d] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                >
                  Add client
                </button>
              </form>

              {clients.length > 0 ? (
                <div className="rounded-lg border border-[#e5e7eb]">
                  {clients.map((c, i) => (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between px-4 py-3 ${
                        i < clients.length - 1 ? "border-b border-[#e5e7eb]" : ""
                      }`}
                    >
                      <div>
                        <p className="text-[14px] font-medium text-ink">{c.name}</p>
                        {c.email ? <p className="text-[12px] text-[#6b7280]">{c.email}</p> : null}
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void removeClient(c.id)}
                        className="text-[12px] text-[#d70015] hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[14px] text-[#6b7280]">No clients saved yet.</p>
                  <p className="mt-1 text-[13px] text-[#9ca3af]">
                    Add clients above to auto-fill new invoices.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Teams Tab */}
          {tab === "teams" && (
            <div className="space-y-6">
              {/* Pending Invites */}
              {teamInvites.length > 0 && (
                <div className="rounded-lg border border-[#e5e7eb] p-6">
                  <h3 className="text-[16px] font-bold text-ink">Pending Invitations</h3>
                  <div className="mt-4 space-y-3">
                    {teamInvites.map((invite) => (
                      <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f9fafb] px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-ink">{invite.team_name}</p>
                          <p className="text-[12px] text-[#6b7280]">
                            Invited by {invite.inviter_name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            setTeamStatus("loading");
                            const res = await fetch(`/api/teams/${invite.id}/invite`, { method: "POST" });
                            if (res.ok) {
                              setTeamInvites((prev) => prev.filter((i) => i.id !== invite.id));
                              setTeamStatus("done");
                              setTeamMsg("Joined team!");
                              // Refresh teams list
                              const data = await fetch("/api/teams").then((r) => r.json());
                              if (data?.teams) setTeams(data.teams);
                            } else {
                              setTeamStatus("error");
                              setTeamMsg("Could not accept invite.");
                            }
                          }}
                          disabled={teamStatus === "loading"}
                          className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                        >
                          Accept
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Teams */}
              <div className="rounded-lg border border-[#e5e7eb] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="text-[16px] font-bold text-ink">My Teams</h3>
                  {isPro && (
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newTeamName.trim()) return;
                        setTeamStatus("loading");
                        const res = await fetch("/api/teams", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name: newTeamName }),
                        });
                        if (res.ok) {
                          const json = await res.json();
                          setTeams((prev) => [...prev, json.team]);
                          setNewTeamName("");
                          setTeamStatus("done");
                          setTeamMsg("Team created!");
                        } else {
                          const json = await res.json();
                          setTeamStatus("error");
                          setTeamMsg(json.error || "Could not create team.");
                        }
                      }}
                      className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                    >
                      + New team
                    </button>
                  )}
                </div>

                {!isPro && (
                  <p className="mt-3 text-[13px] text-[#6b7280]">
                    Upgrade to Teams plan to create and manage teams.
                  </p>
                )}

                {teams.length === 0 && isPro ? (
                  <div className="mt-4 rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center">
                    <p className="text-[14px] text-[#6b7280]">No teams yet.</p>
                    <p className="mt-1 text-[12px] text-[#9ca3af]">
                      Create a team to collaborate with your team members.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className={`flex flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-3 transition ${
                          selectedTeam === team.id
                            ? "bg-[#f0fdf4] ring-1 ring-[#166534]"
                            : "bg-[#f9fafb] hover:bg-[#f3f4f6]"
                        }`}
                      >
                        <div
                          className="cursor-pointer flex-1"
                          onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                        >
                          <p className="text-[14px] font-medium text-ink">{team.name}</p>
                          <p className="text-[12px] text-[#6b7280]">
                            {team.owner_id === userId ? "Owner" : "Member"}
                          </p>
                        </div>
                        {team.owner_id === userId && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm("Delete this team? This cannot be undone.")) return;
                              setTeamStatus("loading");
                              const res = await fetch(`/api/teams/${team.id}`, {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ action: "delete" }),
                              });
                              if (res.ok) {
                                setTeams((prev) => prev.filter((t) => t.id !== team.id));
                                setSelectedTeam(null);
                                setTeamStatus("done");
                                setTeamMsg("Team deleted.");
                              }
                            }}
                            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12px] font-medium text-[#d70015] transition hover:bg-[#fef2f2]"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {teamMsg ? (
                  <p className={`mt-3 text-[13px] ${teamStatus === "error" ? "text-[#d70015]" : "text-[#166534]"}`}>
                    {teamMsg}
                  </p>
                ) : null}
              </div>

              {/* Team Members */}
              {selectedTeam && (
                <div className="rounded-lg border border-[#e5e7eb] p-6">
                  <h3 className="text-[16px] font-bold text-ink">Team Members</h3>

                  {/* Invite form */}
                  {isPro && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="Email address"
                        className="flex-1 min-w-[200px] rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/20"
                      />
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-[13px] outline-none focus:border-[#166534]"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!inviteEmail.trim()) return;
                          setTeamStatus("loading");
                          setTeamMsg("");
                          const res = await fetch(`/api/teams/${selectedTeam}/members`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
                          });
                          if (res.ok) {
                            setInviteEmail("");
                            setTeamStatus("done");
                            setTeamMsg("Invitation sent!");
                          } else {
                            const json = await res.json();
                            setTeamStatus("error");
                            setTeamMsg(json.error || "Could not send invitation.");
                          }
                        }}
                        disabled={!inviteEmail.trim() || teamStatus === "loading"}
                        className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                      >
                        Invite
                      </button>
                    </div>
                  )}

                  {/* Members list */}
                  <div className="mt-4 space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center justify-between gap-3 rounded-lg bg-[#f9fafb] px-4 py-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#166534] text-[12px] font-bold text-white">
                            {member.name?.charAt(0)?.toUpperCase() || member.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-ink">{member.name || member.email}</p>
                            <p className="text-[12px] text-[#6b7280]">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            member.role === "admin" ? "bg-[#166534] text-white" : "bg-[#e5e7eb] text-[#6b7280]"
                          }`}>
                            {member.role}
                          </span>
                          {member.role !== "admin" && isTeamAdminLocal(selectedTeam, userId) && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm(`Remove ${member.name || member.email} from this team?`)) return;
                                setTeamStatus("loading");
                                const res = await fetch(`/api/teams/${selectedTeam}/members`, {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ userId: member.user_id }),
                                });
                                if (res.ok) {
                                  setTeamMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
                                  setTeamStatus("done");
                                }
                              }}
                              className="text-[12px] text-[#d70015] hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <p className="text-[13px] text-[#6b7280]">No team members yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Billing Tab */}
          {tab === "billing" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-[#e5e7eb] p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-ink">
                      Invoala {isPro ? "Pro" : "Free"}
                    </h3>
                    {isPro && subscription ? (
                      <p className="mt-1 text-[13px] text-[#6b7280]">
                        Plan: {subscription.plan.replace(/_/g, " ")} ·{" "}
                        {subscription.cancel_at_period_end ? "Cancels" : "Renews"}{" "}
                        {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {subscription.provider === "dev" ? " · dev billing" : ""}
                      </p>
                    ) : (
                      <p className="mt-1 text-[13px] text-[#6b7280]">
                        Recurring invoices, saved clients, quotes, and priority support.
                      </p>
                    )}
                  </div>
                  {subscription?.provider === "dev" ? (
                    <div className="mb-4 rounded-lg border border-[#f0c000]/30 bg-[#fef9e7] px-4 py-3 text-[13px] text-[#92600a]">
                      <strong>Dev mode:</strong> Billing is simulated. No real charges. Add{" "}
                      <code className="rounded bg-[#fef3c7] px-1">STRIPE_SECRET_KEY</code> to enable
                      live payments.
                    </div>
                  ) : null}
                  {isPro ? (
                    <button
                      type="button"
                      onClick={() => void cancelSub()}
                      disabled={busy}
                      className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-[#6b7280] transition hover:border-ink hover:text-ink disabled:opacity-50"
                    >
                      Cancel plan
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void subscribe("pro_monthly")}
                        disabled={busy}
                        className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                      >
                        Pro $9/mo
                      </button>
                      <button
                        type="button"
                        onClick={() => void subscribe("pro_yearly")}
                        disabled={busy}
                        className="rounded-lg border border-[#166534] px-4 py-2 text-[13px] font-semibold text-[#166534] transition hover:bg-[#f0fdf4] disabled:opacity-50"
                      >
                        Pro $79/yr
                      </button>
                      <button
                        type="button"
                        onClick={() => void subscribe("teams_monthly")}
                        disabled={busy}
                        className="rounded-lg border border-[#166534] px-4 py-2 text-[13px] font-semibold text-[#166534] transition hover:bg-[#f0fdf4] disabled:opacity-50"
                      >
                        Teams $29/mo
                      </button>
                      <button
                        type="button"
                        onClick={() => void subscribe("lifetime")}
                        disabled={busy}
                        className="rounded-lg border border-[#86efac] bg-[#f0fdf4] px-4 py-2 text-[13px] font-semibold text-[#0f3d22] transition hover:bg-[#dcfce7] disabled:opacity-50"
                      >
                        Lifetime $499
                      </button>
                    </div>
                  )}
                </div>
                {notice ? <p className="mt-3 text-[13px] text-[#166534]">{notice}</p> : null}
              </div>

              {!isPro && (
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: "Recurring invoices", desc: "Automatically generate and send invoices on a schedule." },
                    { title: "Saved clients", desc: "Client book with history and auto-fill on new invoices." },
                    { title: "Quotes & estimates", desc: "Create professional quotes before starting work." },
                  ].map((f) => (
                    <div key={f.title} className="rounded-lg border border-[#e5e7eb] p-4">
                      <h4 className="text-[14px] font-semibold text-ink">{f.title}</h4>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">{f.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {tab === "security" && (
            <div className="space-y-8">
              {/* Email */}
              <section>
                <h2 className="text-[16px] font-bold text-ink">Email address</h2>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  Current: <span className="font-medium text-ink">{email}</span>
                  {emailVerified ? (
                    <span className="ml-2 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#166534]">Verified</span>
                  ) : (
                    <span className="ml-2 rounded-full bg-[#fef3c7] px-2 py-0.5 text-[11px] font-semibold text-[#92400e]">Unverified</span>
                  )}
                </p>
                {!emailVerified ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await fetch("/api/auth/resend", { method: "POST" });
                      alert("Verification email resent. Check your inbox.");
                    }}
                    className="mt-2 text-[13px] font-medium text-[#166534] hover:underline"
                  >
                    Resend verification email
                  </button>
                ) : null}
                <form onSubmit={requestEmailChange} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">New email</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="new@example.com"
                      className={inputCls}
                    />
                  </div>
                  {emailMsg ? <p className={`text-[13px] ${emailStatus === "error" ? "text-[#d70015]" : "text-[#166534]"}`}>{emailMsg}</p> : null}
                  <button
                    type="submit"
                    disabled={emailStatus === "loading"}
                    className="rounded-lg bg-[#14532d] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                  >
                    {emailStatus === "loading" ? "Sending…" : "Change email"}
                  </button>
                </form>
              </section>

              <div className="border-t border-[#e5e7eb]" />

              {/* Password */}
              <section>
                <h2 className="text-[16px] font-bold text-ink">Password</h2>
                <form onSubmit={changePassword} className="mt-4 space-y-3">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">Current password</label>
                    <input
                      type="password"
                      required
                      value={currentPw}
                      onChange={(e) => setCurrentPw(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">New password (8+ characters)</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  {pwMsg ? <p className={`text-[13px] ${pwStatus === "error" ? "text-[#d70015]" : "text-[#166534]"}`}>{pwMsg}</p> : null}
                  <button
                    type="submit"
                    disabled={pwStatus === "loading"}
                    className="rounded-lg bg-[#14532d] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                  >
                    {pwStatus === "loading" ? "Saving…" : "Change password"}
                  </button>
                </form>
              </section>

              <div className="border-t border-[#e5e7eb]" />

              {/* Delete */}
              <section>
                <h2 className="text-[16px] font-bold text-[#d70015]">Delete account</h2>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  Permanently deletes your account, all invoices, clients, and subscriptions. This cannot be undone.
                </p>
                <div className="mt-4 space-y-3">
                  <input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder='Type "DELETE" to confirm'
                    className={inputCls}
                  />
                  {deleteMsg ? <p className="text-[13px] text-[#d70015]">{deleteMsg}</p> : null}
                  <button
                    type="button"
                    onClick={() => void deleteAccount()}
                    disabled={deleteConfirm !== "DELETE" || deleteStatus === "loading"}
                    className="rounded-lg border border-[#d70015] px-5 py-2 text-[13px] font-semibold text-[#d70015] transition hover:bg-[#d70015] hover:text-white disabled:opacity-40"
                  >
                    {deleteStatus === "loading" ? "Deleting…" : "Delete my account"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
