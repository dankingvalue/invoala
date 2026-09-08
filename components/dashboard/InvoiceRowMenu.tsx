"use client";

import { RowMenu, type RowMenuItem } from "@/components/dashboard/RowMenu";
import {
  ViewIcon,
  DuplicateIcon,
  PrintIcon,
  LinkIcon,
  HistoryIcon,
  ReminderIcon,
  VoidIcon,
  DeleteIcon,
  ReceiptIcon,
  BuildingIcon,
} from "@/components/dashboard/icons";

export function InvoiceRowMenu({
  isDraft,
  isVoid,
  canReceipt,
  hasClient,
  isPro,
  busy,
  onView,
  onDuplicate,
  onPrint,
  onCopyLink,
  onPaymentHistory,
  onRemind,
  onReceipt,
  onSaveClient,
  onVoid,
  onReopen,
  onDelete,
}: {
  isDraft: boolean;
  isVoid: boolean;
  canReceipt: boolean;
  hasClient: boolean;
  isPro: boolean;
  busy?: boolean;
  onView: () => void;
  onDuplicate: () => void;
  onPrint: () => void;
  onCopyLink: () => void;
  onPaymentHistory: () => void;
  onRemind: () => void;
  onReceipt: () => void;
  onSaveClient: () => void;
  onVoid: () => void;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const items: RowMenuItem[] = [];
  items.push({ key: "view", label: isDraft ? "View draft" : "View invoice", icon: <ViewIcon />, onClick: onView });
  items.push({ key: "duplicate", label: "Duplicate invoice", icon: <DuplicateIcon />, onClick: onDuplicate });
  items.push({ key: "print", label: "Print", icon: <PrintIcon />, onClick: onPrint });
  if (!isDraft) items.push({ key: "link", label: "Copy invoice link", icon: <LinkIcon />, onClick: onCopyLink });
  if (!isDraft) items.push({ key: "history", label: "Payment history", icon: <HistoryIcon />, onClick: onPaymentHistory });
  if (!isDraft && !isVoid) items.push({ key: "remind", label: isPro ? "Send reminder" : "Send reminder (Pro)", icon: <ReminderIcon />, onClick: onRemind });
  if (canReceipt) items.push({ key: "receipt", label: "Generate receipt", icon: <ReceiptIcon />, onClick: onReceipt });
  if (!hasClient) items.push({ key: "save-client", label: isPro ? "Save as client" : "Save as client (Pro)", icon: <BuildingIcon />, onClick: onSaveClient });
  if (isVoid) {
    items.push({ key: "reopen", label: "Reopen invoice", icon: <VoidIcon />, onClick: onReopen });
  } else if (!isDraft) {
    items.push({ key: "void", label: "Void invoice", icon: <VoidIcon />, onClick: onVoid, danger: true });
  }
  items.push({ key: "delete", label: "Delete", icon: <DeleteIcon />, onClick: onDelete, danger: true });

  return <RowMenu items={items} busy={busy} />;
}
