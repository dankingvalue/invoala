"use client";

import { useEffect, useRef, useState } from "react";
import {
  ViewIcon,
  DuplicateIcon,
  PrintIcon,
  LinkIcon,
  HistoryIcon,
  ReminderIcon,
  VoidIcon,
  DeleteIcon,
  MoreIcon,
  ReceiptIcon,
} from "@/components/dashboard/icons";

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
};

export function InvoiceRowMenu({
  isDraft,
  isVoid,
  canReceipt,
  busy,
  onView,
  onDuplicate,
  onPrint,
  onCopyLink,
  onPaymentHistory,
  onRemind,
  onReceipt,
  onVoid,
  onReopen,
  onDelete,
}: {
  isDraft: boolean;
  isVoid: boolean;
  canReceipt: boolean;
  busy?: boolean;
  onView: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onCopyLink: () => void;
  onPaymentHistory: () => void;
  onRemind: () => void;
  onReceipt: () => void;
  onVoid: () => void;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  function pick(fn: () => void) {
    return () => {
      setOpen(false);
      fn();
    };
  }

  const items: MenuItem[] = [];
  if (!isDraft) items.push({ key: "view", label: "View invoice", icon: <ViewIcon />, onClick: pick(onView) });
  items.push({ key: "duplicate", label: "Duplicate invoice", icon: <DuplicateIcon />, onClick: pick(onDuplicate) });
  items.push({ key: "print", label: "Print", icon: <PrintIcon />, onClick: pick(onPrint) });
  if (!isDraft) items.push({ key: "link", label: "Copy invoice link", icon: <LinkIcon />, onClick: pick(onCopyLink) });
  if (!isDraft) items.push({ key: "history", label: "Payment history", icon: <HistoryIcon />, onClick: pick(onPaymentHistory) });
  if (!isDraft && !isVoid) items.push({ key: "remind", label: "Send reminder", icon: <ReminderIcon />, onClick: pick(onRemind) });
  if (canReceipt) items.push({ key: "receipt", label: "Generate receipt", icon: <ReceiptIcon />, onClick: pick(onReceipt) });
  if (isVoid) {
    items.push({ key: "reopen", label: "Reopen invoice", icon: <VoidIcon />, onClick: pick(onReopen) });
  } else if (!isDraft) {
    items.push({ key: "void", label: "Void invoice", icon: <VoidIcon />, onClick: pick(onVoid), danger: true });
  }
  items.push({ key: "delete", label: "Delete", icon: <DeleteIcon />, onClick: pick(onDelete), danger: true });

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-ink disabled:opacity-50"
      >
        <MoreIcon />
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              onClick={item.onClick}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition ${
                item.danger ? "text-[#d70015] hover:bg-[#fef2f2]" : "text-ink hover:bg-[#f3f4f6]"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
