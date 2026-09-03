"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreIcon } from "@/components/dashboard/icons";

export type RowMenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
};

// Table rows live inside an `overflow-x-auto` scroller (needed so wide
// tables can scroll horizontally on narrow screens). That container clips
// any absolutely-positioned dropdown that tries to hang below it, so the
// menu is portaled straight to <body> and positioned with fixed coordinates
// computed from the trigger button instead of being a DOM descendant.
export function RowMenu({
  items,
  busy,
  label = "More actions",
}: {
  items: RowMenuItem[];
  busy?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const MENU_WIDTH = 208; // matches w-52

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // Right-align to the button by default (matches the old absolute
    // right-0 behavior for the common case: a button near the row's right
    // edge), but fall back to left-aligning — and always clamp to the
    // viewport — so a button near the LEFT edge (e.g. a client card's own
    // corner menu) doesn't push the menu off-screen.
    let left = rect.right - MENU_WIDTH;
    if (left < 8) left = rect.left;
    left = Math.min(left, window.innerWidth - MENU_WIDTH - 8);
    left = Math.max(8, left);
    setCoords({ top: rect.bottom + 4, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function close(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onDismiss() {
      setOpen(false);
    }
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", onDismiss, true);
    window.addEventListener("resize", onDismiss);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", onDismiss, true);
      window.removeEventListener("resize", onDismiss);
    };
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        disabled={busy}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-ink disabled:opacity-50"
      >
        <MoreIcon />
      </button>
      {open && coords && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ position: "fixed", top: coords.top, left: coords.left }}
              className="z-50 w-52 rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg"
            >
              {items.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition ${
                    item.danger ? "text-[#d70015] hover:bg-[#fef2f2]" : "text-ink hover:bg-[#f3f4f6]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
