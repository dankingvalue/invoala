// Small inline icon set for the Documents row actions, matching the stroke
// style already used across the app (e.g. components/NavAuth.tsx) rather
// than pulling in an icon library.

type IconProps = { className?: string };
const base = { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function DownloadIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function EmailIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function RecordPaymentIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M9.5 15a2.5 2.5 0 0 0 2.5 1.5c1.5 0 2.5-.8 2.5-2 0-1.3-1-1.8-2.5-2.2C10.5 12 9.5 11.5 9.5 10.3c0-1.1 1-1.8 2.5-1.8a2.3 2.3 0 0 1 2.5 1.5" />
    </svg>
  );
}

export function EditIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function MoreIcon(p: IconProps) {
  return (
    <svg {...base} width={16} height={16} strokeWidth={0} fill="currentColor" className={p.className} aria-hidden="true">
      <circle cx="5" cy="12" r="1.9" />
      <circle cx="12" cy="12" r="1.9" />
      <circle cx="19" cy="12" r="1.9" />
    </svg>
  );
}

export function ViewIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function DuplicateIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

export function PrintIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M6 9V3h12v6" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M6 17v4h12v-4" />
    </svg>
  );
}

export function LinkIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M9.5 14.5 14.5 9.5" />
      <path d="M11 6.5 13 4.5a3.5 3.5 0 0 1 5 5l-2 2" />
      <path d="M13 17.5 11 19.5a3.5 3.5 0 0 1-5-5l2-2" />
    </svg>
  );
}

export function HistoryIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function ReminderIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10.5 21a1.7 1.7 0 0 0 3 0" />
    </svg>
  );
}

export function VoidIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="m5.5 5.5 13 13" />
    </svg>
  );
}

export function DeleteIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}

export function ReceiptIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M6 3h12v18l-2.5-1.5L13 21l-1-1.5L11 21l-2.5-1.5L6 21Z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function SendIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="m22 2-9 20-3-8-8-3Z" />
      <path d="M22 2 10.5 13.5" />
    </svg>
  );
}

export function ArchiveIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 13h4" />
    </svg>
  );
}

export function PlusIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SearchIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function BackIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

export function BuildingIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h6" />
    </svg>
  );
}

export function ChevronDownIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function UsersIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ActivityIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function CrownIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="m2 8 4 3 6-8 6 8 4-3-2 11H4Z" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function SettingsIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

export function TransferIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="m17 2 4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

export function LogoutIcon(p: IconProps) {
  return (
    <svg {...base} className={p.className} aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
