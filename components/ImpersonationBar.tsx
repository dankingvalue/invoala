"use client";

import { useState } from "react";

export function ImpersonationBar({
  targetEmail,
  adminEmail,
}: {
  targetEmail: string;
  adminEmail: string;
}) {
  const [busy, setBusy] = useState(false);

  async function stop() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/admin/impersonate", { method: "DELETE" });
    } catch {}
    // Hard navigation: the admin's session cookie just changed server-side,
    // and every already-rendered page (this one included) was fetched and
    // cached as the impersonated user — only a fresh load reflects the swap.
    window.location.assign("/superadmin");
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex items-center justify-center gap-3 bg-[#92400e] px-4 py-2 text-[13px] font-medium text-white shadow-[0_-2px_8px_rgba(0,0,0,0.15)]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <span>
        Impersonating <strong>{targetEmail}</strong> as {adminEmail}
      </span>
      <button
        type="button"
        onClick={() => void stop()}
        disabled={busy}
        className="rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-white transition hover:bg-white/25 disabled:opacity-50"
      >
        {busy ? "Stopping…" : "Stop impersonating"}
      </button>
    </div>
  );
}
