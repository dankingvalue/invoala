"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, BuildingIcon, UsersIcon } from "@/components/dashboard/icons";

export type WorkspaceTeam = { id: string; name: string; my_role: "owner" | "admin" | "member"; member_count: number };

// Personal (no team) or "team:<id>" — the same shape /api/invoices,
// /api/clients, and /api/workspace-settings accept as ?workspace=.
export type WorkspaceValue = "personal" | `team:${string}`;

export function WorkspaceSwitcher({
  teams,
  value,
  onChange,
}: {
  teams: WorkspaceTeam[];
  value: WorkspaceValue;
  onChange: (value: WorkspaceValue) => void;
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

  const activeTeam = value.startsWith("team:") ? teams.find((t) => t.id === value.slice(5)) : null;
  const label = activeTeam ? activeTeam.name : "Personal";

  // Nothing to switch between — a bare "Personal" label instead of a
  // dropdown that only ever has one option.
  if (teams.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-medium text-ink">
        <BuildingIcon className="text-[#9ca3af]" />
        Personal
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 text-[13px] font-medium text-ink transition hover:bg-[#f9fafb]"
      >
        {activeTeam ? <UsersIcon className="text-[#166534]" /> : <BuildingIcon className="text-[#9ca3af]" />}
        <span className="max-w-[160px] truncate">{label}</span>
        <ChevronDownIcon className={`text-[#9ca3af] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div role="menu" className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-xl border border-[#e5e7eb] bg-white py-1.5 shadow-lg">
          <p className="px-3.5 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Workspace</p>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onChange("personal");
              setOpen(false);
            }}
            className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition hover:bg-[#f3f4f6] ${
              value === "personal" ? "font-semibold text-[#166534]" : "text-ink"
            }`}
          >
            <BuildingIcon className={value === "personal" ? "text-[#166534]" : "text-[#9ca3af]"} />
            Personal
          </button>
          {teams.length > 0 ? <div className="my-1 border-t border-[#e5e7eb]" /> : null}
          {teams.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitem"
              onClick={() => {
                onChange(`team:${t.id}`);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition hover:bg-[#f3f4f6] ${
                value === `team:${t.id}` ? "font-semibold text-[#166534]" : "text-ink"
              }`}
            >
              <UsersIcon className={value === `team:${t.id}` ? "text-[#166534]" : "text-[#9ca3af]"} />
              <span className="flex-1 truncate">{t.name}</span>
              <span className="text-[11px] text-[#9ca3af]">{t.member_count}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
