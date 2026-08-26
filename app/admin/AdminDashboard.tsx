"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FLAG_DEFS, type FlagKey, type FlagsState } from "@/lib/flags";

type Tab = "switches" | "stats" | "users" | "email";

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

type AdminUser = {
  id: string;
  email: string;
  role: string;
  created_at: number;
  isPro: boolean;
  sub_status: string | null;
};

export function AdminDashboard({ myRole }: { myRole: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("switches");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-1 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5">
          {(["switches", "stats", "users", "email"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition ${
                tab === t ? "bg-accent text-white" : "text-subtle hover:text-ink"
              }`}
            >
              {t === "switches" ? "Switches" : t}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => void logout()}
          className="rounded-full border border-hairline px-5 py-2 text-sm font-medium text-subtle transition hover:border-ink hover:text-ink"
        >
          Sign out
        </button>
      </div>

      {tab === "switches" ? <SwitchesTab /> : null}
      {tab === "stats" ? <StatsTab /> : null}
      {tab === "users" ? <UsersTab myRole={myRole} /> : null}
      {tab === "email" ? <EmailTab /> : null}
    </div>
  );
}

function SwitchesTab() {
  const [state, setState] = useState<FlagsState | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/api/admin/flags")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return (await res.json()) as FlagsState;
      })
      .then(setState)
      .catch(() => setLoadError("Could not load settings. Refresh to retry."));
  }, []);

  async function save(next: FlagsState) {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/flags", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!res.ok) {
        setMessage("Save failed.");
        return;
      }
      setState(next);
      setMessage("Saved. Live immediately.");
    } catch {
      setMessage("Network error.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 4000);
    }
  }

  function toggle(key: FlagKey) {
    if (!state || saving) return;
    void save({ ...state, flags: { ...state.flags, [key]: !state.flags[key] } });
  }

  if (loadError) return <Panel><p className="text-[15px] text-subtle">{loadError}</p></Panel>;

  const siteDefs = FLAG_DEFS.filter((d) => d.group === "site");
  const proReady = FLAG_DEFS.filter((d) => d.group === "pro" && d.status === "ready");
  const proPlanned = FLAG_DEFS.filter((d) => d.group === "pro" && d.status === "planned");

  function renderSwitch(def: (typeof FLAG_DEFS)[number]) {
    const on = state ? state.flags[def.key] : false;
    return (
      <div key={def.key} className="flex items-center justify-between gap-4 py-4">
        <div>
          <p className="text-[15px] font-medium text-ink">{def.label}</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">{def.description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          disabled={!state || saving}
          onClick={() => toggle(def.key)}
          className={`relative h-[30px] w-[52px] shrink-0 rounded-full p-[2px] transition-colors ${
            on ? "bg-[#34c759]" : "bg-[#d2d2d7]"
          } disabled:opacity-50`}
        >
          <span
            className={`block h-[26px] w-[26px] rounded-full bg-white shadow transition-transform ${
              on ? "translate-x-[22px]" : ""
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHead title="Site switches" subtitle="Changes apply to the live site instantly." />
        <div className="mt-4 divide-y divide-[#e8e8ed]">
          {siteDefs.map((def) => renderSwitch(def))}
        </div>
      </Panel>

      <Panel>
        <SectionHead title="Pro & upcoming updates" pro subtitle="Flip when you want them visible." />
        <div className="mt-4 divide-y divide-[#e8e8ed]">
          {proReady.map((def) => renderSwitch(def))}
          {proPlanned.map((def) => (
            <div key={def.key} className="flex items-center justify-between gap-4 py-4 opacity-60">
              <div>
                <p className="text-[15px] font-medium text-ink">
                  {def.label}
                  <span className="ml-2 rounded-full bg-fog px-2 py-0.5 text-xs font-medium text-subtle">Reserved</span>
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-subtle">{def.description}</p>
              </div>
              <span className="h-[30px] w-[52px] shrink-0 rounded-full bg-[#e8e8ed] p-[2px]">
                <span className="block h-[26px] w-[26px] rounded-full bg-white shadow" />
              </span>
            </div>
          ))}
        </div>
        {message ? <p className="mt-3 text-[13px] text-accent">{message}</p> : null}
      </Panel>

      <Panel>
        <SectionHead title="Announcement bar" subtitle="Shown at the very top of every page. Empty = hidden." />
        <textarea
          value={state?.announcement ?? ""}
          onChange={(e) => state && setState({ ...state, announcement: e.target.value })}
          rows={2}
          maxLength={300}
          placeholder="New: AI invoice drafting is live."
          className="mt-4 w-full resize-none rounded-xl border border-hairline px-3.5 py-3 text-[15px] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={() => state && void save(state)}
          disabled={!state || saving}
          className="mt-4 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </Panel>
    </div>
  );
}

function StatsTab() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then(async (res) => (res.ok ? ((await res.json()) as Stats) : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  if (!stats) return <Panel><p className="text-sm text-subtle">Loading…</p></Panel>;

  const cards = [
    { label: "Users", value: stats.users.toLocaleString(), sub: `+${stats.newUsers7d} this week` },
    { label: "Documents", value: stats.invoices.toLocaleString(), sub: `${stats.invoices30d} in 30 days` },
    { label: "Active Pro", value: stats.activeSubs.toLocaleString(), sub: "subscriptions" },
    {
      label: "MRR",
      value: `$${(stats.mrrCents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      sub: "monthly equivalent",
    },
    { label: "Emails sent", value: stats.emailsSent7d.toLocaleString(), sub: "last 7 days" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-black/5">
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{c.label}</p>
            <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight">{c.value}</p>
            <p className="mt-1.5 text-xs text-subtle">{c.sub}</p>
          </div>
        ))}
      </div>

      <Panel>
        <SectionHead title="Recent subscriptions" />
        {stats.recentSubs.length === 0 ? (
          <p className="py-6 text-sm text-subtle">No subscriptions yet.</p>
        ) : (
          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-hairline text-xs uppercase tracking-wider text-subtle">
                <th className="pb-2 font-semibold">User</th>
                <th className="pb-2 font-semibold">Plan</th>
                <th className="pb-2 font-semibold">Status</th>
                <th className="pb-2 font-semibold">Provider</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSubs.map((s, i) => (
                <tr key={`${s.email}-${i}`} className="border-b border-[#e8e8ed] last:border-0">
                  <td className="py-2.5 pr-4">{s.email}</td>
                  <td className="py-2.5 pr-4">{s.plan}</td>
                  <td className="py-2.5 pr-4 capitalize">{s.status}</td>
                  <td className="py-2.5">{s.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}

function UsersTab({ myRole }: { myRole: string }) {
  const [data, setData] = useState<{ users: AdminUser[]; total: number; page: number; pageSize: number } | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${page}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [q, page]);

  async function refresh() {
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}&page=${page}`);
    if (res.ok) setData(await res.json());
  }

  async function mutate(id: string, body: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
    setBusy(false);
    void refresh();
  }

  async function remove(id: string) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" }).catch(() => {});
    setBusy(false);
    void refresh();
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <Panel>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHead title={`Users${data ? ` (${data.total.toLocaleString()})` : ""}`} />
        <input
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search email…"
          className="w-56 rounded-full border border-hairline px-4 py-2 text-sm outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline text-xs uppercase tracking-wider text-subtle">
              <th className="pb-2 font-semibold">Email</th>
              <th className="pb-2 font-semibold">Role</th>
              <th className="pb-2 font-semibold">Joined</th>
              <th className="pb-2 font-semibold">Pro</th>
              <th className="pb-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data?.users ?? []).map((u) => (
              <tr key={u.id} className="border-b border-[#e8e8ed] last:border-0">
                <td className="py-3 pr-4 font-medium">{u.email}</td>
                <td className="py-3 pr-4">
                  {myRole === "superadmin" ? (
                    <select
                      value={u.role}
                      disabled={busy}
                      onChange={(e) => void mutate(u.id, { role: e.target.value })}
                      className="rounded-lg border border-hairline px-2 py-1 text-xs"
                    >
                      {["user", "support", "admin", "superadmin"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    u.role
                  )}
                </td>
                <td className="py-3 pr-4 text-subtle">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 pr-4">
                  {u.isPro ? (
                    <span className="rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">Pro</span>
                  ) : (
                    <span className="text-xs text-subtle">Free</span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <div className="flex justify-end gap-2 text-xs">
                    {!u.isPro ? (
                      <>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "pro_monthly" })} className="font-medium text-link hover:underline disabled:opacity-50">
                          Grant monthly
                        </button>
                        <button type="button" disabled={busy} onClick={() => void mutate(u.id, { grantPro: "pro_yearly" })} className="font-medium text-link hover:underline disabled:opacity-50">
                          Grant yearly
                        </button>
                      </>
                    ) : (
                      <button type="button" disabled={busy} onClick={() => void mutate(u.id, { revokePro: true })} className="text-subtle hover:text-ink disabled:opacity-50">
                        Revoke Pro
                      </button>
                    )}
                    {myRole === "superadmin" ? (
                      <button type="button" disabled={busy} onClick={() => void remove(u.id)} className="text-[#d70015] hover:underline disabled:opacity-50">
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3 text-sm text-subtle">
        <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="hover:text-ink disabled:opacity-40">
          ← Prev
        </button>
        <span>{page} / {pages}</span>
        <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="hover:text-ink disabled:opacity-40">
          Next →
        </button>
      </div>
    </Panel>
  );
}

function EmailTab() {
  const router = useRouter();
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
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, to, subject, text }),
      });
      const json = (await res.json()) as {
        recipients?: number;
        sent?: number;
        simulated?: number;
        failed?: number;
        error?: string;
      };
      setResult(
        res.ok
          ? `Sent to ${json.recipients} (${json.sent} delivered, ${json.simulated} simulated, ${json.failed} failed).`
          : json.error || "Send failed.",
      );
      if (res.ok) {
        setSubject("");
        setText("");
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <SectionHead
        title="Broadcast email"
        subtitle="Delivered via Resend when RESEND_API_KEY is set — otherwise simulated and logged."
      />
      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap gap-2">
          {([
            ["all", "All users"],
            ["pro", "Pro only"],
            ["free", "Free only"],
            ["one", "Single user"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setAudience(value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                audience === value ? "bg-ink text-white" : "bg-fog text-subtle hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {audience === "one" ? (
          <input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="user@example.com"
            type="email"
            className="w-full rounded-xl border border-hairline px-3.5 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"
          />
        ) : null}

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject"
          maxLength={200}
          className="w-full rounded-xl border border-hairline px-3.5 py-2.5 text-[15px] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          maxLength={10000}
          placeholder="Plain-text message body…"
          className="w-full resize-y rounded-xl border border-hairline px-3.5 py-3 text-[15px] leading-relaxed outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={busy}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-60"
        >
          {busy ? "Sending…" : "Send"}
        </button>
        {result ? <p className="text-[13px] text-subtle">{result}</p> : null}
      </div>
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      {children}
    </section>
  );
}

function SectionHead({ title, subtitle, pro }: { title: string; subtitle?: string; pro?: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {pro ? (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">PRO</span>
        ) : null}
      </div>
      {subtitle ? <p className="mt-1 text-[13px] text-subtle">{subtitle}</p> : null}
    </div>
  );
}
