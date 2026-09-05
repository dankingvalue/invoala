"use client";
import { trackEvent } from "@/lib/analytics";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { InvoiceRow } from "@/lib/data";
import type { Subscription } from "@/lib/billing";
import { PLAN_PITCHES } from "@/lib/plans-content";
import { CURRENCIES, formatMoney, newId, type Invoice, type LineItem } from "@/lib/invoice";
import { deriveDisplayStatus, remainingBalance, type DisplayStatus } from "@/lib/invoice-status";
import { RecordPaymentModal, type PaymentResult } from "@/components/dashboard/RecordPaymentModal";
import { PaymentHistoryModal } from "@/components/dashboard/PaymentHistoryModal";
import { ConfirmDialog, Modal } from "@/components/dashboard/Modal";
import { InvoiceRowMenu } from "@/components/dashboard/InvoiceRowMenu";
import { DownloadIcon, EmailIcon, RecordPaymentIcon, EditIcon, SendIcon, SearchIcon } from "@/components/dashboard/icons";
import { ClientsTab } from "@/components/dashboard/ClientsTab";
import { TeamsTab } from "@/components/dashboard/TeamsTab";
import { GeneralSettings } from "@/components/dashboard/GeneralSettings";
import { WorkspaceSwitcher, type WorkspaceTeam, type WorkspaceValue } from "@/components/dashboard/WorkspaceSwitcher";

type Props = {
  userId: string;
  email: string;
  name: string;
  timezone: string;
  emailVerified: number;
  hasPassword: boolean;
  initialInvoices: InvoiceRow[];
  subscription: Subscription | null;
  isPro: boolean;
  needsVerification: boolean;
  userRole: string;
  promo?: { code: string; expires_at: number } | null;
  fxLatest?: Record<string, number> | null;
  fxInvoice?: Record<string, { usd: number; asOf: string; exact: boolean }> | null;
  initialCheckoutPlan?: string | null;
  initialTab?: string;
};

type Tab = "general" | "documents" | "clients" | "teams" | "billing" | "security" | "messages";

const VALID_TABS: Tab[] = ["general", "documents", "clients", "teams", "billing", "security", "messages"];

const PLAN_KEY_FOR: Record<string, string> = {
  pro: "pro_monthly",
  teams: "teams_monthly",
  lifetime: "lifetime",
};

function planKeyFor(id: string): string {
  return PLAN_KEY_FOR[id] ?? "pro_monthly";
}

// Colors reuse the exact tokens already used elsewhere in this file (accent
// green, paid green, partial amber, destructive red, neutral fog/subtle) —
// no new colors introduced for the statuses this adds (viewed, overdue, void).
const STATUS_STYLES: Record<DisplayStatus, string> = {
  draft: "bg-fog text-subtle",
  sent: "bg-accent/10 text-accent",
  viewed: "bg-accent/10 text-accent",
  partial: "bg-[#fef3c7] text-[#92600a]",
  paid: "bg-[#00b67a]/10 text-[#00875a]",
  overdue: "bg-[#fef2f2] text-[#d70015]",
  void: "bg-fog text-subtle",
  cancelled: "bg-fog text-subtle",
};

const STATUS_LABELS: Record<DisplayStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  partial: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
  cancelled: "Cancelled",
};

// Pure client-side FX (rates are pre-fetched server-side; this module never
// imports the DB layer).
function convertFx(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  if (!fromRate || !toRate) return amount;
  return (amount / fromRate) * toRate;
}

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
  {
    key: "messages",
    label: "Messages",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
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
  hasPassword: initialHasPassword,
  initialInvoices,
  subscription,
  isPro,
  needsVerification,
  promo = null,
  fxLatest = null,
  fxInvoice = null,
  initialCheckoutPlan = null,
  initialTab = "general",
}: Props) {
  const router = useRouter();
  const checkoutHandled = useRef(false);

  // Landing from a pricing page "Get …" button with a chosen term: start the
  // checkout once, then drop the ?checkout= param so refresh doesn't redo it.
  // (Guard is set inside the timeout so React StrictMode's effect double-run
  // doesn't clear the timer after the first invocation.)
  useEffect(() => {
    if (!initialCheckoutPlan) return;
    if (subscription?.plan === initialCheckoutPlan) {
      router.replace("/dashboard?tab=billing");
      return;
    }
    const t = setTimeout(() => {
      if (checkoutHandled.current) return;
      checkoutHandled.current = true;
      void subscribe(initialCheckoutPlan);
      router.replace("/dashboard?tab=billing");
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCheckoutPlan]);
  // Teams are only available on the Teams/Lifetime plans (dev subs simulate
  // them). Mirrors the server-side canUseTeams check.
  const teamsEnabled = !!(
    subscription &&
    subscription.status === "active" &&
    (subscription.provider === "dev" ||
      subscription.plan === "teams_monthly" ||
      subscription.plan === "teams_yearly" ||
      subscription.plan === "lifetime")
  );
  const [tab, setTab] = useState<Tab>(VALID_TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "general");
  // Keep the active tab in sync with ?tab= in the URL (top-nav links like
  // "Clients" navigate to /dashboard?tab=clients without remounting us).
  const [urlTab, setUrlTab] = useState(initialTab);
  if (urlTab !== initialTab) {
    setUrlTab(initialTab);
    if (VALID_TABS.includes(initialTab as Tab)) {
      setTab(initialTab as Tab);
    }
  }
  const [invoices, setInvoices] = useState(initialInvoices);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const [profileName, setProfileName] = useState(initialName);
  const [profileTimezone, setProfileTimezone] = useState(initialTimezone);
  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "done">("idle");

  const [newEmail, setNewEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [emailMsg, setEmailMsg] = useState("");

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [pwMsg, setPwMsg] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "loading" | "error">("idle");
  const [deleteMsg, setDeleteMsg] = useState("");

  // Lightweight team list — powers the workspace switcher and the Clients
  // page's "share to team" dropdown. The Teams tab itself (member
  // management, invites, activity, settings) self-fetches its own richer
  // data, same pattern as ClientsTab; this just needs enough to render the
  // switcher and knows to refresh whenever TeamsTab signals a team was
  // created/left/deleted.
  const [teams, setTeams] = useState<WorkspaceTeam[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceValue>(() => {
    try {
      const saved = window.localStorage.getItem("invoala.workspace");
      if (saved === "personal" || saved?.startsWith("team:")) return saved as WorkspaceValue;
    } catch {}
    return "personal";
  });

  function refreshTeams() {
    fetch("/api/teams")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.teams) setTeams(data.teams);
      })
      .catch(() => {});
  }

  useEffect(() => {
    refreshTeams();
  }, []);

  function changeWorkspace(next: WorkspaceValue) {
    setActiveWorkspace(next);
    try {
      window.localStorage.setItem("invoala.workspace", next);
    } catch {}
    // A workspace a user just left/was removed from can still be "active"
    // in their stale localStorage value — fall back to Personal instead of
    // silently showing another workspace's now-inaccessible data.
    if (next.startsWith("team:") && !teams.some((t) => `team:${t.id}` === next)) {
      setActiveWorkspace("personal");
    }
  }

  // Documents are SSR'd for Personal on first load, then re-fetched here on
  // every workspace change (including the first, which just re-confirms
  // Personal — a cheap extra request that keeps this the one place that
  // knows how to load invoices for whatever workspace is active).
  useEffect(() => {
    fetch(`/api/invoices?workspace=${encodeURIComponent(activeWorkspace)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.invoices) setInvoices(data.invoices);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkspace]);

  async function removeInvoice(id: string) {
    setBusy(true);
    await fetch(`/api/invoices/${id}`, { method: "DELETE" }).catch(() => {});
    setInvoices((rows) => rows.filter((r) => r.id !== id));
    setBusy(false);
  }

  function editInvoice(row: InvoiceRow) {
    try {
      localStorage.setItem(
        "invoala.edit",
        JSON.stringify({ id: row.id, invoice: row.data, clientId: row.client_id }),
      );
    } catch {}
    // A hard navigation, not router.push: Next's client-side route cache can
    // reuse the homepage's already-mounted InvoiceGenerator instance on a
    // soft nav, and its one-time hydration effect then never re-fires for
    // this new edit — the payload sits unread and the form stays on
    // whatever it last loaded. A full page load guarantees a fresh mount.
    window.location.assign("/#generate");
  }

  // "+ New invoice" from Documents follows whichever workspace is active in
  // the switcher — same invoala.edit handoff as editInvoice, just with a
  // blank invoice and no id (so it's a create, not an update).
  function startNewInvoice() {
    const teamId = activeWorkspace.startsWith("team:") ? activeWorkspace.slice(5) : null;
    try {
      localStorage.setItem(
        "invoala.edit",
        JSON.stringify({
          teamId,
          invoice: { items: [{ id: newId(), description: "", quantity: 1, rate: 0 }] },
        }),
      );
    } catch {}
    window.location.assign("/#generate");
  }

  function makeReceipt(row: InvoiceRow) {
    const data = row.data as Partial<Invoice> & { items?: LineItem[] };
    const receipt = {
      ...(typeof row.data === "object" && row.data ? row.data : {}),
      docType: "receipt",
      invoiceNumber: `RCPT-${String(row.number || "").replace(/^INV-?/i, "") || row.number || "001"}`,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date().toISOString().slice(0, 10),
      notes: `Receipt for payment of invoice #${row.number || ""}. Thanks for your business!`,
      items: Array.isArray(data.items) ? data.items : [],
    };
    try {
      localStorage.setItem("invoala.edit", JSON.stringify({ invoice: receipt }));
    } catch {}
    router.push("/receipt-generator");
  }

  // The share link needs a token minted server-side (POST) — the API route
  // rejects a plain /share URL with no ?token= as "not found". Shared by
  // copyInvoiceLink and viewInvoice so there's one place that knows how to
  // get a live link for an invoice.
  async function getShareUrl(row: InvoiceRow): Promise<string> {
    try {
      const res = await fetch(`/api/invoices/${row.id}/share`, { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; url?: string };
      return json.url || "";
    } catch {
      return "";
    }
  }

  // On phones with a native share sheet (WhatsApp, Messages, etc.) this opens
  // that instead — the OS shows its own confirmation. Everywhere else, skip
  // guessing whether an auto-copy silently worked (clipboard permission
  // behavior is inconsistent across browsers, notably Safari, and gave no
  // feedback at all when it failed) — just show the link in a field so the
  // user can select and copy it themselves, every time.
  async function copyInvoiceLink(row: InvoiceRow) {
    const url = await getShareUrl(row);
    if (!url) {
      setNotice("Could not create a share link. Please try again.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${row.number || ""} — ${row.client_name || "Invoala"}`,
          text: `Invoice #${row.number || ""} for ${row.client_name || "client"} — ${formatMoney(row.total, row.currency)}`,
          url,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        // Share sheet unavailable or failed — fall through to the link field.
      }
    }
    setLinkModalUrl(url);
  }

  async function viewInvoice(row: InvoiceRow) {
    const url = await getShareUrl(row);
    if (!url) {
      setNotice("Could not open this invoice. Please try again.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
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
      if ((json.mode === "payment" || json.mode === "polar") && json.url) {
        trackEvent("checkout_started", { plan });
        window.location.href = json.url;
        return;
      }
      if (json.mode === "not_configured") {
        setNotice(json.error || "Payment processing is not configured yet. We're working on integrating a payment provider — stay tuned!");
        return;
      }
      setNotice(json.error || "Checkout failed.");
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
        setPwMsg(
          hasPassword
            ? "Password updated. You've been signed in with a new session."
            : "Password set. You can now sign in with your email and this password, in addition to Google.",
        );
        setHasPassword(true);
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

  // ---- FX-aware documents summary ----
  const fxRates = fxLatest && Object.keys(fxLatest).length > 0 ? fxLatest : { USD: 1 };
  const [displayCcy, setDisplayCcy] = useState<string>(() => {
    try {
      const saved = window.localStorage.getItem("invoala.ccy");
      if (saved && /^[A-Z]{3}$/.test(saved)) return saved;
    } catch {}
    return "USD";
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [docSearch, setDocSearch] = useState("");
  const [docStatusFilter, setDocStatusFilter] = useState<"all" | DisplayStatus>("all");
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [recordPaymentRow, setRecordPaymentRow] = useState<InvoiceRow | null>(null);
  const [paymentHistoryRow, setPaymentHistoryRow] = useState<InvoiceRow | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: "void" | "delete"; row: InvoiceRow } | null>(null);
  // Last-resort fallback when even the legacy copy trick fails (rare, but
  // some locked-down browser configs block both) — show the link so the
  // user can select and copy it themselves instead of the action just
  // silently doing nothing.
  const [linkModalUrl, setLinkModalUrl] = useState<string | null>(null);

  // "paid" status is definitionally "amountPaid >= total" (see
  // lib/invoice-status.ts ledgerStatusForAmount), so that's used directly
  // rather than trusting data.amountPaid alone — a handful of older/seeded
  // invoices have status='paid' with no payment ever recorded through the
  // ledger, which left that cached field unset.
  const paidAmt = (row: InvoiceRow) => {
    if (row.status === "paid") return row.total || 0;
    return typeof (row.data as { amountPaid?: number } | undefined)?.amountPaid === "number"
      ? ((row.data as { amountPaid?: number }).amountPaid as number)
      : 0;
  };
  // Void/cancelled invoices are no longer active receivables, so they never
  // contribute to an outstanding balance regardless of what was paid.
  const balanceOf = (row: InvoiceRow) =>
    row.status === "paid" || row.status === "void" || row.status === "cancelled"
      ? 0
      : remainingBalance(row.total || 0, paidAmt(row));
  const displayStatusOf = (row: InvoiceRow): DisplayStatus =>
    deriveDisplayStatus({
      status: row.status,
      total: row.total || 0,
      amountPaid: paidAmt(row),
      dueDate: row.data?.dueDate,
      viewedAt: row.viewed_at,
    });
  const usdValue = (row: InvoiceRow, amount: number) =>
    amount * (fxInvoice?.[row.id]?.usd ?? 1);
  const inDisplay = (usd: number) => convertFx(usd, "USD", displayCcy, fxRates);

  const filteredInvoices = useMemo(() => {
    const q = docSearch.trim().toLowerCase();
    return invoices.filter((row) => {
      if (docStatusFilter !== "all" && displayStatusOf(row) !== docStatusFilter) return false;
      if (!q) return true;
      return (
        (row.number || "").toLowerCase().includes(q) ||
        (row.client_name || "").toLowerCase().includes(q) ||
        (row.data?.clientEmail || "").toLowerCase().includes(q)
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoices, docSearch, docStatusFilter]);

  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const outstandingUsd = invoices.reduce((sum, i) => sum + usdValue(i, balanceOf(i)), 0);
  const outstanding = inDisplay(outstandingUsd);
  const totalsUsd = invoices.reduce((sum, i) => sum + usdValue(i, i.total || 0), 0);
  const totalsInDisplay = inDisplay(totalsUsd);
  // Dashboard "at a glance" totals — same balance/paid helpers the
  // Documents table already uses, just summed a different way: overdue is
  // the open balance specifically on invoices past due, paid is the actual
  // amount collected (including partial payments), not a count of invoices.
  const overdueUsd = invoices.reduce(
    (sum, i) => sum + (displayStatusOf(i) === "overdue" ? usdValue(i, balanceOf(i)) : 0),
    0,
  );
  const overdueTotal = inDisplay(overdueUsd);
  const paidUsd = invoices.reduce((sum, i) => sum + usdValue(i, paidAmt(i)), 0);
  const paidTotal = inDisplay(paidUsd);



  function selectAllVisible(rows: InvoiceRow[]) {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = rows.every((r) => next.has(r.id));
      for (const r of rows) {
        if (allSelected) next.delete(r.id);
        else next.add(r.id);
      }
      return next;
    });
  }

  const downloadInvoicePdf = async (row: InvoiceRow) => {
    try {
      const res = await fetch(`/api/invoices/${row.id}/pdf`);
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(json?.error || "Could not generate the PDF right now. Please try again.");
        return;
      }
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `Invoice-${(row.number || "invoice").replace(/[^\w.-]+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {}
  };

  const printInvoicePdf = async (row: InvoiceRow) => {
    try {
      // Direct PDF in a hidden iframe; Chrome's PDF viewer fires 'load' when
      // the document is ready, then we print the frame.
      const res = await fetch(`/api/invoices/${row.id}/pdf?inline=1`);
      if (!res.ok) {
        alert("Could not load the PDF for printing.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.style.visibility = "hidden";
      document.body.appendChild(iframe);
      const cleanup = () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
          iframe.remove();
        }, 60_000);
      };
      iframe.onload = () => {
        setTimeout(() => {
          const win = iframe.contentWindow;
          if (win) {
            win.focus();
            win.print();
          }
          cleanup();
        }, 350);
      };
      iframe.onerror = () => {
        iframe.remove();
        URL.revokeObjectURL(url);
        alert("Could not load the PDF for printing.");
      };
      iframe.src = url;
    } catch {
      alert("Something went wrong preparing the print view.");
    }
  };

  const emailInvoice = async (row: InvoiceRow) => {
    const toEmail = window.prompt(
      `Send invoice ${row.number || ""} to (client email):`,
      (row.data?.clientEmail as string | undefined) || "",
    );
    if (!toEmail || !toEmail.includes("@")) return;
    try {
      const res = await fetch(`/api/invoices/${row.id}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: toEmail }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) alert("Invoice sent!");
      else alert(json.error || "Failed to send email.");
    } catch {
      alert("Network error while emailing the invoice.");
    }
  };

  async function applyRowStatus(row: InvoiceRow, status: string) {
    const amountPaid = paidAmt(row);
    const res = await fetch("/api/invoices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: row.id, status, amountPaid }),
    });
    if (res.ok) {
      setInvoices((rows) => rows.map((r) => (r.id === row.id ? { ...r, status } : r)));
    }
  }

  // Applies a payments-derived {amountPaid, total, status} back onto the row
  // list — the single place every payment mutation (record/edit/delete) and
  // reopen funnels through, so the table and summary cards update instantly
  // with no page refresh and can never show stale numbers.
  function applyInvoiceSummary(id: string, summary: PaymentResult) {
    setInvoices((rows) =>
      rows.map((r) =>
        r.id === id
          ? { ...r, status: summary.status, data: { ...r.data, amountPaid: summary.amountPaid || undefined } }
          : r,
      ),
    );
  }

  function onPaymentRecorded(id: string, summary: PaymentResult) {
    applyInvoiceSummary(id, summary);
    if (summary.status === "paid") trackEvent("payment_received", { invoiceId: id });
    setNotice("Payment recorded");
    setTimeout(() => setNotice(""), 3000);
  }

  async function duplicateInvoiceRow(row: InvoiceRow) {
    setRowBusy(row.id);
    try {
      const res = await fetch(`/api/invoices/${row.id}/duplicate`, { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; invoice?: InvoiceRow; error?: string };
      if (!res.ok || !json.ok || !json.invoice) {
        setNotice(json.error || "Could not duplicate this invoice.");
      } else {
        setInvoices((rows) => [json.invoice as InvoiceRow, ...rows]);
        setNotice(`Duplicated as ${json.invoice.number}`);
      }
    } catch {
      setNotice("Network error while duplicating.");
    }
    setRowBusy(null);
    setTimeout(() => setNotice(""), 3000);
  }

  async function sendReminder(row: InvoiceRow) {
    setRowBusy(row.id);
    try {
      const res = await fetch(`/api/invoices/${row.id}/remind`, { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      setNotice(json.ok ? "Reminder sent" : json.error || "Could not send the reminder.");
    } catch {
      setNotice("Network error while sending the reminder.");
    }
    setRowBusy(null);
    setTimeout(() => setNotice(""), 3000);
  }

  async function saveRowClient(row: InvoiceRow) {
    if (!row.client_name?.trim()) {
      setNotice("This invoice has no client name to save.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }
    setRowBusy(row.id);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.client_name,
          email: row.data?.clientEmail || "",
          address: row.data?.clientAddress || "",
          quickSave: true,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; client?: { id: string }; error?: string };
      if (!res.ok || !json.ok || !json.client) {
        setNotice(json.error || "Could not save this client.");
      } else {
        const linkRes = await fetch("/api/invoices", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: row.id, invoice: row.data, clientId: json.client.id }),
        });
        if (linkRes.ok) {
          setInvoices((rows) => rows.map((r) => (r.id === row.id ? { ...r, client_id: json.client!.id } : r)));
          setNotice("Client saved to your client book");
        } else {
          setNotice("Client saved, but could not link it to this invoice.");
        }
      }
    } catch {
      setNotice("Network error while saving this client.");
    }
    setRowBusy(null);
    setTimeout(() => setNotice(""), 3000);
  }

  async function voidInvoiceRow(row: InvoiceRow) {
    setRowBusy(row.id);
    try {
      const res = await fetch(`/api/invoices/${row.id}/void`, { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setNotice(json.error || "Could not void this invoice.");
      } else {
        setInvoices((rows) => rows.map((r) => (r.id === row.id ? { ...r, status: "void" } : r)));
        setNotice("Invoice voided");
      }
    } catch {
      setNotice("Network error while voiding.");
    }
    setRowBusy(null);
    setConfirmAction(null);
    setTimeout(() => setNotice(""), 3000);
  }

  async function reopenInvoiceRow(row: InvoiceRow) {
    setRowBusy(row.id);
    try {
      const res = await fetch(`/api/invoices/${row.id}/void`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; invoice?: PaymentResult; error?: string };
      if (!res.ok || !json.ok || !json.invoice) {
        setNotice(json.error || "Could not reopen this invoice.");
      } else {
        applyInvoiceSummary(row.id, json.invoice);
        setNotice("Invoice reopened");
      }
    } catch {
      setNotice("Network error while reopening.");
    }
    setRowBusy(null);
    setTimeout(() => setNotice(""), 3000);
  }

  async function deleteInvoiceRow(row: InvoiceRow) {
    setRowBusy(row.id);
    await removeInvoice(row.id);
    setRowBusy(null);
    setConfirmAction(null);
  }

  const inputCls =
    "w-full rounded-lg border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15";

  return (
    <div>
      {/* Page header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
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
        <div className="flex items-center gap-3">
          {tab !== "billing" && tab !== "security" ? (
            <WorkspaceSwitcher teams={teams} value={activeWorkspace} onChange={changeWorkspace} />
          ) : null}
          <NotificationsBell />
        </div>
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
              {/* At-a-glance totals */}
              {invoices.length > 0 ? (
                <section>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDocStatusFilter("all");
                        setTab("documents");
                      }}
                      className="rounded-xl border border-[#e5e7eb] p-4 text-left transition hover:border-[#166534]/40 hover:bg-[#f9fafb]"
                    >
                      <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Open</p>
                      <p className="mt-1 text-[22px] font-bold tabular-nums text-ink">{formatMoney(outstanding, displayCcy)}</p>
                      <p className="mt-0.5 text-[12px] text-[#9ca3af]">Unpaid balance across active invoices</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocStatusFilter("overdue");
                        setTab("documents");
                      }}
                      className="rounded-xl border border-[#e5e7eb] p-4 text-left transition hover:border-[#d70015]/40 hover:bg-[#f9fafb]"
                    >
                      <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Overdue</p>
                      <p className={`mt-1 text-[22px] font-bold tabular-nums ${overdueTotal > 0 ? "text-[#d70015]" : "text-ink"}`}>
                        {formatMoney(overdueTotal, displayCcy)}
                      </p>
                      <p className="mt-0.5 text-[12px] text-[#9ca3af]">Past due and still unpaid</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocStatusFilter("all");
                        setTab("documents");
                      }}
                      className="rounded-xl border border-[#e5e7eb] p-4 text-left transition hover:border-[#166534]/40 hover:bg-[#f9fafb]"
                    >
                      <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Paid</p>
                      <p className="mt-1 text-[22px] font-bold tabular-nums text-[#00875a]">{formatMoney(paidTotal, displayCcy)}</p>
                      <p className="mt-0.5 text-[12px] text-[#9ca3af]">Collected, including partial payments</p>
                    </button>
                  </div>
                  {totalsUsd > 0 && displayCcy !== "USD" ? (
                    <p className="mt-2 text-[11px] text-[#9ca3af]">Totals in {displayCcy} · converted at invoice-date rates</p>
                  ) : null}
                </section>
              ) : null}

              {/* Profile */}
              <section>
                <h2 className="text-[16px] font-bold text-ink">Profile</h2>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  Your account name and timezone. Invoices use your business profile below, not this.
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

              <GeneralSettings workspace={activeWorkspace} />
            </div>
          )}

          {/* Documents Tab */}
          {tab === "documents" && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Total</p>
                    <p className="text-[20px] font-bold text-ink">{invoices.length}</p>
                  </div>
                  <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">Paid</p>
                    <p className="text-[20px] font-bold text-[#00875a]">{paidCount}</p>
                  </div>
                  <div className="rounded-lg bg-[#f3f4f6] px-4 py-2.5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Outstanding ({displayCcy})
                    </p>
                    <p className="text-[20px] font-bold text-ink tabular-nums">
                      {formatMoney(outstanding, displayCcy)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-[#6b7280]">
                      Totals in
                    </label>
                    <select
                      aria-label="Display currency for totals"
                      value={displayCcy}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDisplayCcy(v);
                        try {
                          window.localStorage.setItem("invoala.ccy", v);
                        } catch {}
                      }}
                      className="rounded-lg border border-[#e5e7eb] bg-white px-2 py-1.5 text-[13px] font-medium text-ink outline-none focus:border-[#166534]"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  {totalsUsd > 0 && displayCcy !== "USD" ? (
                    <p className="pb-1 text-[11px] text-[#9ca3af]">
                      Σ {formatMoney(totalsInDisplay, displayCcy)} · converted at invoice-date rates
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={startNewInvoice}
                  className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22]"
                >
                  + New invoice
                </button>
              </div>
              {notice ? <p className="mb-4 text-[13px] font-medium text-[#166534]">{notice}</p> : null}

              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
                  <input
                    type="text"
                    value={docSearch}
                    onChange={(e) => setDocSearch(e.target.value)}
                    placeholder="Search by number, client, or email…"
                    aria-label="Search documents"
                    className="w-full rounded-lg border border-[#e5e7eb] bg-white py-2 pl-9 pr-3 text-[13px] text-ink outline-none focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20"
                  />
                </div>
                <select
                  aria-label="Filter by status"
                  value={docStatusFilter}
                  onChange={(e) => setDocStatusFilter(e.target.value as "all" | DisplayStatus)}
                  className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] font-medium text-ink outline-none focus:border-[#166534]"
                >
                  <option value="all">All statuses</option>
                  {(Object.keys(STATUS_LABELS) as DisplayStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                {docSearch || docStatusFilter !== "all" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setDocSearch("");
                      setDocStatusFilter("all");
                    }}
                    className="text-[12px] font-medium text-[#6b7280] hover:text-ink"
                  >
                    Clear filters
                  </button>
                ) : null}
                <p className="ml-auto text-[12px] text-[#6b7280]">
                  {filteredInvoices.length} of {invoices.length}
                </p>
              </div>

              {selected.size > 0 ? (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#166534]/30 bg-[#f0fdf4] px-4 py-3">
                  <p className="text-[13px] font-medium text-[#166534]">
                    {selected.size} selected
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      for (const r of invoices) {
                        if (selected.has(r.id)) void applyRowStatus(r, "sent");
                      }
                      setSelected(new Set());
                    }}
                    className="rounded-full border border-[#166534] px-4 py-1.5 text-[12px] font-semibold text-[#166534] transition hover:bg-[#f0fdf4] disabled:opacity-50"
                  >
                    Reopen as sent
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      for (const r of invoices) {
                        if (selected.has(r.id)) void removeInvoice(r.id);
                      }
                      setSelected(new Set());
                    }}
                    className="rounded-full border border-[#e5e7eb] px-4 py-1.5 text-[12px] font-medium text-[#d70015] transition hover:bg-[#fef2f2] disabled:opacity-50"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="ml-auto text-[12px] text-[#6b7280] hover:text-ink"
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              {invoices.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[15px] text-[#6b7280]">No documents yet.</p>
                  <button type="button" onClick={startNewInvoice} className="mt-3 inline-block text-[14px] font-medium text-[#166534] hover:underline">
                    Create your first invoice →
                  </button>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-[15px] text-[#6b7280]">No documents match your search.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDocSearch("");
                      setDocStatusFilter("all");
                    }}
                    className="mt-3 inline-block text-[14px] font-medium text-[#166534] hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] text-[12px] uppercase tracking-wider text-[#6b7280]">
                        <th className="pb-2.5 pr-3 font-semibold">
                          <input
                            type="checkbox"
                            aria-label="Select all invoices"
                            checked={filteredInvoices.length > 0 && selected.size === filteredInvoices.length}
                            onChange={() => selectAllVisible(filteredInvoices)}
                            className="h-4 w-4 accent-[#166534]"
                          />
                        </th>
                        <th className="pb-2.5 pr-4 font-semibold">Number</th>
                        <th className="pb-2.5 pr-4 font-semibold">Client</th>
                        <th className="pb-2.5 pr-4 font-semibold">Date</th>
                        <th className="pb-2.5 pr-4 text-right font-semibold">Total</th>
                        <th className="pb-2.5 pr-4 font-semibold">Status</th>
                        <th className="pb-2.5 pr-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInvoices.map((row) => {
                        const rowPaid = paidAmt(row);
                        const rowBalance = balanceOf(row);
                        const rowStatus = displayStatusOf(row);
                        const isDraft = row.status === "draft";
                        const isVoid = row.status === "void" || row.status === "cancelled";
                        return (
                          <tr key={row.id} className="border-b border-[#f3f4f6] last:border-0 hover:bg-[#f9fafb]">
                            <td className="py-3 pr-3">
                              <input
                                type="checkbox"
                                aria-label={`Select invoice ${row.number || ""}`}
                                checked={selected.has(row.id)}
                                onChange={() => {
                                  setSelected((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(row.id)) next.delete(row.id);
                                    else next.add(row.id);
                                    return next;
                                  });
                                }}
                                className="h-4 w-4 accent-[#166534]"
                              />
                            </td>
                            <td className="py-3 pr-4 font-medium text-ink">{row.number || "—"}</td>
                            <td className="py-3 pr-4 text-[#6b7280]">{row.client_name || "—"}</td>
                            <td className="py-3 pr-4 text-[#6b7280]">
                              {new Date(row.updated_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="py-3 pr-4 text-right">
                              <p className="font-medium tabular-nums text-ink">
                                {formatMoney(row.total, row.currency)}
                              </p>
                              {rowPaid > 0 && row.status !== "paid" ? (
                                <p className="text-[11px] tabular-nums text-[#00875a]">
                                  {formatMoney(rowPaid, row.currency)} paid
                                </p>
                              ) : null}
                              {row.status === "paid" ? (
                                <p className="text-[11px] text-[#00875a]">Paid in full</p>
                              ) : null}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[rowStatus]}`}
                              >
                                {(rowStatus === "partial" || rowStatus === "overdue") && rowBalance > 0
                                  ? `${STATUS_LABELS[rowStatus]} · ${formatMoney(rowBalance, row.currency)} left`
                                  : STATUS_LABELS[rowStatus]}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1 text-[12px]">
                                <button
                                  type="button"
                                  onClick={() => void downloadInvoicePdf(row)}
                                  className="flex items-center gap-1 font-medium text-[#166534] hover:underline"
                                  title="Download PDF"
                                >
                                  <DownloadIcon /> Download
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void emailInvoice(row)}
                                  className="flex items-center gap-1 text-[#6b7280] hover:text-[#166534]"
                                  title="Email invoice as PDF"
                                >
                                  <EmailIcon /> Email
                                </button>
                                {isDraft ? (
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() => void applyRowStatus(row, "sent")}
                                    className="flex items-center gap-1 font-medium text-[#166534] hover:underline disabled:opacity-50"
                                    title="Issue this invoice so it can be sent and paid"
                                  >
                                    <SendIcon /> Issue
                                  </button>
                                ) : !isVoid && rowBalance > 0 ? (
                                  <button
                                    type="button"
                                    onClick={() => setRecordPaymentRow(row)}
                                    className="flex items-center gap-1 font-medium text-[#166534] hover:underline"
                                    title="Record a payment against this invoice"
                                  >
                                    <RecordPaymentIcon /> Record payment
                                  </button>
                                ) : null}
                                <button
                                  type="button"
                                  onClick={() => editInvoice(row)}
                                  className="flex items-center gap-1 text-[#6b7280] hover:text-ink"
                                >
                                  <EditIcon /> Edit
                                </button>
                                <InvoiceRowMenu
                                  isDraft={isDraft}
                                  isVoid={isVoid}
                                  canReceipt={row.status === "paid"}
                                  hasClient={!!row.client_id}
                                  busy={rowBusy === row.id}
                                  onView={() => void viewInvoice(row)}
                                  onDuplicate={() => void duplicateInvoiceRow(row)}
                                  onPrint={() => void printInvoicePdf(row)}
                                  onCopyLink={() => void copyInvoiceLink(row)}
                                  onPaymentHistory={() => setPaymentHistoryRow(row)}
                                  onRemind={() => void sendReminder(row)}
                                  onReceipt={() => makeReceipt(row)}
                                  onSaveClient={() => void saveRowClient(row)}
                                  onVoid={() => setConfirmAction({ type: "void", row })}
                                  onReopen={() => void reopenInvoiceRow(row)}
                                  onDelete={() => setConfirmAction({ type: "delete", row })}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {recordPaymentRow ? (
            <RecordPaymentModal
              open={!!recordPaymentRow}
              onClose={() => setRecordPaymentRow(null)}
              invoiceId={recordPaymentRow.id}
              number={recordPaymentRow.number}
              currency={recordPaymentRow.currency}
              total={recordPaymentRow.total}
              amountPaid={paidAmt(recordPaymentRow)}
              onRecorded={(summary) => onPaymentRecorded(recordPaymentRow.id, summary)}
            />
          ) : null}

          {paymentHistoryRow ? (
            <PaymentHistoryModal
              open={!!paymentHistoryRow}
              onClose={() => setPaymentHistoryRow(null)}
              invoiceId={paymentHistoryRow.id}
              number={paymentHistoryRow.number}
              currency={paymentHistoryRow.currency}
              total={paymentHistoryRow.total}
              onChanged={(summary) => applyInvoiceSummary(paymentHistoryRow.id, summary)}
            />
          ) : null}

          <ConfirmDialog
            open={confirmAction?.type === "void"}
            onClose={() => setConfirmAction(null)}
            onConfirm={() => confirmAction && void voidInvoiceRow(confirmAction.row)}
            title="Void invoice?"
            body="Voiding an invoice prevents it from being treated as an active receivable. It stays in your records and can be reopened later — this doesn't delete it."
            confirmLabel="Void invoice"
            busy={!!confirmAction && rowBusy === confirmAction.row.id}
          />

          <ConfirmDialog
            open={confirmAction?.type === "delete"}
            onClose={() => setConfirmAction(null)}
            onConfirm={() => confirmAction && void deleteInvoiceRow(confirmAction.row)}
            title="Delete invoice?"
            body="This action cannot be undone."
            confirmLabel="Delete invoice"
            busy={!!confirmAction && rowBusy === confirmAction.row.id}
          />

          <Modal open={!!linkModalUrl} onClose={() => setLinkModalUrl(null)} title="Invoice link" maxWidth="440px">
            <p className="mb-3 text-[13px] text-[#6b7280]">
              Here&apos;s your invoice link — select it and copy.
            </p>
            <input
              type="text"
              readOnly
              value={linkModalUrl ?? ""}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-[#166534]"
            />
          </Modal>

          {/* Clients Tab */}
          {tab === "clients" && (
            <ClientsTab teams={teams.map((t) => ({ id: t.id, name: t.name }))} workspace={activeWorkspace} />
          )}

          {/* Teams Tab */}
          {tab === "teams" && (
            <TeamsTab
              userId={userId}
              teamsEnabled={teamsEnabled}
              busy={busy}
              notice={notice}
              onSubscribe={(plan) => void subscribe(plan)}
              onTeamsChanged={refreshTeams}
              onOpenSettings={(teamId) => {
                changeWorkspace(`team:${teamId}`);
                setTab("general");
              }}
            />
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
                      </p>
                    ) : (
                      <p className="mt-1 text-[13px] text-[#6b7280]">
                        Recurring invoices, saved clients, quotes, and priority support.
                      </p>
                    )}
                  </div>
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

              {/* Plans compared */}
              <div>
                <h3 className="text-[16px] font-bold text-ink">Compare plans</h3>
                <p className="mt-1 text-[13px] text-[#6b7280]">
                  Pick the plan that fits how you work. Switch or cancel anytime.
                </p>
                {promo && !isPro ? (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#16a34a]/30 bg-[#f0fdf4] px-4 py-3">
                    <p className="text-[13px] text-[#166534]">
                      Your new-account offer: <strong>50% off Lifetime</strong> —{" "}
                      {promo.code} · valid until{" "}
                      {new Date(promo.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <button
                      type="button"
                      onClick={() => void subscribe("lifetime")}
                      disabled={busy}
                      className="rounded-full bg-[#14532d] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                    >
                      Claim $249 Lifetime
                    </button>
                  </div>
                ) : null}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {PLAN_PITCHES.map((plan) => {
                    const active =
                      plan.id === "free"
                        ? !isPro
                        : plan.id === "lifetime"
                          ? subscription?.plan === "lifetime"
                          : subscription?.plan?.startsWith(plan.id);
                    return (
                      <div
                        key={plan.id}
                        className={`flex flex-col rounded-xl border p-5 ${
                          active
                            ? "border-[#166534] bg-[#f0fdf4] ring-1 ring-[#166534]/40"
                            : "border-[#e5e7eb] bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[14px] font-bold text-ink">{plan.name}</p>
                          {plan.tag ? (
                            <span className="rounded-full bg-[#166534] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              {plan.tag}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-[26px] font-extrabold leading-none text-ink">
                          {promo && !isPro && plan.id === "lifetime" ? "$249" : plan.price}
                        </p>
                        <p className="mt-1 text-[12px] text-[#6b7280]">
                          {promo && !isPro && plan.id === "lifetime"
                            ? "one-time · 50% off for new accounts"
                            : plan.priceNote}
                        </p>
                        <ul className="mt-4 space-y-2.5 text-[13px] text-[#374151]">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2">
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#166534"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mt-0.5 shrink-0"
                                aria-hidden="true"
                              >
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        {active ? (
                          <p className="mt-5 rounded-full bg-[#dcfce7] px-4 py-2 text-center text-[13px] font-semibold text-[#166534]">
                            Current plan
                          </p>
                        ) : plan.id === "free" ? (
                          <p className="mt-5 rounded-full border border-[#e5e7eb] px-4 py-2 text-center text-[13px] text-[#6b7280]">
                            Free forever
                          </p>
                        ) : plan.id === "pro" || plan.id === "teams" ? (
                          <div className="mt-5 flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => void subscribe(`${plan.id}_monthly`)}
                              disabled={busy}
                              className="rounded-full bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                            >
                              {plan.id === "pro" ? "Pro · $9/mo" : "Teams · $29/mo"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void subscribe(`${plan.id}_yearly`)}
                              disabled={busy}
                              className="rounded-full border border-[#166534] px-4 py-2 text-[13px] font-semibold text-[#166534] transition hover:bg-[#f0fdf4] disabled:opacity-50"
                            >
                              {plan.id === "pro" ? "Pro yearly · $79" : "Teams yearly · $249"}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void subscribe(planKeyFor(plan.id))}
                            disabled={busy}
                            className="mt-5 rounded-full bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                          >
                            {plan.cta}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {notice ? <p className="mt-3 text-[13px] text-[#166534]">{notice}</p> : null}
              </div>
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
                {!hasPassword ? (
                  <p className="mt-1 text-[13px] text-[#6b7280]">
                    You signed up with Google, so there&apos;s no password on this account yet. Set one below to also be able to sign in with your email address.
                  </p>
                ) : null}
                <form onSubmit={changePassword} className="mt-4 space-y-3">
                  {hasPassword ? (
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
                  ) : null}
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
                    {pwStatus === "loading" ? "Saving…" : hasPassword ? "Change password" : "Set password"}
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

          {tab === "messages" && (
            <UserMessagesTab workspace={activeWorkspace} />
          )}
        </div>
      </div>
    </div>
  );
}

const EMAIL_KIND_LABEL: Record<string, string> = {
  invoice: "Invoice",
  quote: "Quote",
  receipt: "Receipt",
  reminder: "Payment reminder",
  other: "Email",
};

function EmailActivityTab({ workspace }: { workspace: string }) {
  const [activity, setActivity] = useState<Array<{
    id: string;
    to_email: string;
    subject: string;
    status: string;
    kind: string | null;
    created_at: number;
    invoice_id: string | null;
    invoice_number: string | null;
    invoice_viewed_at: number | null;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/email-activity?workspace=${encodeURIComponent(workspace)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setActivity(d?.activity || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workspace]);

  if (loading) return <p className="text-[13px] text-[#6b7280]">Loading…</p>;

  if (activity.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16v16H4z" />
            <path d="m4 6 8 7 8-7" />
          </svg>
        </div>
        <p className="text-[14px] font-medium text-ink">No email activity yet</p>
        <p className="mt-1 text-[13px] text-[#6b7280]">
          Invoices, quotes, receipts, and reminders you send from Documents will show up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#f3f4f6] rounded-lg border border-[#e5e7eb]">
      {activity.map((a) => (
        <li key={a.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[14px] font-medium text-ink">
              {a.invoice_number ? `${EMAIL_KIND_LABEL[a.kind ?? "other"] ?? "Email"} ${a.invoice_number}` : a.subject}
              {" "}sent
            </p>
            <p className="mt-0.5 truncate text-[12px] text-[#6b7280]">
              To {a.to_email} · {new Date(a.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className={`flex items-center gap-1 text-[12px] font-medium ${a.status === "failed" ? "text-[#d70015]" : "text-[#00875a]"}`}>
              {a.status === "failed" ? "✕ Failed" : "✓ Sent"}
            </span>
            {a.invoice_id && a.invoice_viewed_at ? (
              <span className="flex items-center gap-1 text-[12px] font-medium text-[#166534]">✓ Viewed</span>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function UserMessagesTab({ workspace }: { workspace: string }) {
  const [view, setView] = useState<"activity" | "support">("activity");
  const [conversations, setConversations] = useState<Array<{
    id: string;
    status: string;
    subject: string;
    last_message: string;
    last_sender: string;
    unread_count: number;
    updated_at: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (view !== "support") return;
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((d) => { setConversations(d.conversations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [view]);

  const tabBtnCls = (active: boolean) =>
    `flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition ${
      active ? "border-[#166534] text-[#166534]" : "border-transparent text-[#6b7280] hover:text-ink"
    }`;

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-[#e5e7eb]">
        <button type="button" onClick={() => setView("activity")} className={tabBtnCls(view === "activity")}>
          Email activity
        </button>
        <button type="button" onClick={() => setView("support")} className={tabBtnCls(view === "support")}>
          Support
        </button>
      </div>

      {view === "activity" ? <EmailActivityTab workspace={workspace} /> : <SupportInbox conversations={conversations} loading={loading} />}
    </div>
  );
}

function SupportInbox({
  conversations,
  loading,
}: {
  conversations: Array<{
    id: string;
    status: string;
    subject: string;
    last_message: string;
    last_sender: string;
    unread_count: number;
    updated_at: number;
  }>;
  loading: boolean;
}) {
  if (loading) {
    return <p className="text-[13px] text-[#6b7280]">Loading messages...</p>;
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0fdf4]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-[14px] font-medium text-ink">No messages yet</p>
        <p className="mt-1 text-[13px] text-[#6b7280]">
          Use the chat button in the bottom-right corner to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className="rounded-lg border border-[#e5e7eb] p-4 transition hover:border-[#166534]/40 hover:bg-[#fafaf9]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-medium text-ink">{conv.subject}</p>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  conv.status === "escalated"
                    ? "bg-[#fef3c7] text-[#92400e]"
                    : conv.status === "support"
                      ? "bg-[#dbeafe] text-[#1e40af]"
                      : conv.status === "resolved"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : "bg-[#f3f4f6] text-[#6b7280]"
                }`}>
                  {conv.status === "ai" ? "AI Support" : conv.status === "escalated" ? "Waiting for support" : conv.status === "support" ? "Human Support" : "Resolved"}
                </span>
                {conv.unread_count > 0 && (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#166534] text-[10px] font-bold text-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-[13px] text-[#6b7280]">
                {conv.last_sender === "user" ? "You: " : conv.last_sender === "support" ? "Support: " : "AI: "}
                {conv.last_message}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <p className="text-[12px] text-[#6b7280]">
                {new Date(conv.updated_at).toLocaleDateString()}
              </p>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(
                    new CustomEvent("invoala:open-chat", { detail: { conversationId: conv.id } })
                  );
                }}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12px] font-medium text-[#166534] transition hover:bg-[#f0fdf4]"
              >
                Open chat
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string; type: string; title: string; body: string; read: number; created_at: number;
  }>>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);

  function load() {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => { setNotifications(d.notifications || []); setUnread(d.unread || 0); setLoaded(true); })
      .catch(() => setLoaded(true));
  }

  function toggle() {
    if (!loaded) load();
    setOpen((prev) => !prev);
    if (!open && unread > 0) {
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      }).then(() => setUnread(0));
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative rounded-full p-2 text-[#6b7280] hover:bg-[#f3f4f6] hover:text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#166534] text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-[#e5e7eb] bg-white shadow-xl">
            <div className="border-b border-[#e5e7eb] px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[#6b7280]">No notifications yet.</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`border-b border-[#f3f4f6] px-4 py-3 ${n.read ? "" : "bg-[#f0fdf4]"}`}>
                    <p className="text-sm font-medium text-[#111827]">{n.title}</p>
                    {n.body && <p className="mt-0.5 line-clamp-2 text-xs text-[#6b7280]">{n.body}</p>}
                    <p className="mt-1 text-[11px] text-[#6b7280]">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
