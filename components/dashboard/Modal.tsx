"use client";

import { useEffect, useState } from "react";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = "440px",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[85vh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        style={{ maxWidth }}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-[13px] text-[#6b7280]">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Shared confirmation dialog — used for every destructive/irreversible
// action (void, delete invoice, delete payment) so they all look and behave
// the same way.
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  danger = true,
  busy = false,
  requireTypedConfirmation,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  busy?: boolean;
  // When set, the confirm button stays disabled until the user types this
  // exact string — extra friction for the handful of truly irreversible
  // actions (deleting a workspace) where a plain click is too easy to
  // trigger by mistake. Every other ConfirmDialog in the app omits this and
  // keeps its existing single-click behavior.
  requireTypedConfirmation?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="400px">
      <p className="text-[14px] leading-relaxed text-[#6b7280]">{body}</p>
      {/* Modal fully unmounts its children while closed (returns null), so
          this footer's own `typed` state is naturally fresh every time the
          dialog reopens — no effect or ref needed to reset it. */}
      <ConfirmDialogFooter
        onClose={onClose}
        onConfirm={onConfirm}
        confirmLabel={confirmLabel}
        danger={danger}
        busy={busy}
        requireTypedConfirmation={requireTypedConfirmation}
      />
    </Modal>
  );
}

function ConfirmDialogFooter({
  onClose,
  onConfirm,
  confirmLabel,
  danger,
  busy,
  requireTypedConfirmation,
}: {
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  danger: boolean;
  busy: boolean;
  requireTypedConfirmation?: string;
}) {
  const [typed, setTyped] = useState("");
  const locked = !!requireTypedConfirmation && typed !== requireTypedConfirmation;

  return (
    <>
      {requireTypedConfirmation ? (
        <div className="mt-4">
          <label className="mb-1.5 block text-[12px] font-medium text-[#6b7280]">
            Type <span className="font-semibold text-ink">{requireTypedConfirmation}</span> to confirm
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#d70015] focus:ring-2 focus:ring-[#d70015]/15"
          />
        </div>
      ) : null}
      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6] disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy || locked}
          className={`rounded-full px-4 py-2 text-[13px] font-semibold text-white transition disabled:opacity-60 ${
            danger ? "bg-[#d70015] hover:bg-[#b0000f]" : "bg-[#166534] hover:bg-[#14532d]"
          }`}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </>
  );
}
