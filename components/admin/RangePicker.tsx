"use client";

import { useState } from "react";

export type RangeId = "today" | "7d" | "30d" | "month" | "all" | "custom";

const PRESETS: { id: RangeId; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

function toDateInputValue(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

// Every admin stats card should be reading the same window at the same
// time — that's the whole point of this component existing instead of each
// panel hardcoding its own "last 7 days" / "last 30 days".
export function RangePicker({
  onChange,
}: {
  onChange: (params: { range: RangeId; from?: number; to?: number }) => void;
}) {
  const [range, setRange] = useState<RangeId>("7d");
  const [todayStr] = useState(() => toDateInputValue(Date.now()));
  const [customFrom, setCustomFrom] = useState(() => toDateInputValue(Date.now() - 30 * 864e5));
  const [customTo, setCustomTo] = useState(() => toDateInputValue(Date.now()));

  function pick(id: RangeId) {
    setRange(id);
    if (id === "custom") {
      onChange({
        range: "custom",
        from: new Date(customFrom).getTime(),
        to: new Date(customTo).getTime() + 864e5 - 1,
      });
    } else {
      onChange({ range: id });
    }
  }

  function applyCustom(from: string, to: string) {
    setCustomFrom(from);
    setCustomTo(to);
    onChange({ range: "custom", from: new Date(from).getTime(), to: new Date(to).getTime() + 864e5 - 1 });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => pick(p.id)}
          className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
            range === p.id ? "bg-[#14532d] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-ink"
          }`}
        >
          {p.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => pick("custom")}
        className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
          range === "custom" ? "bg-[#14532d] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-ink"
        }`}
      >
        Custom
      </button>
      {range === "custom" ? (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={customFrom}
            max={customTo}
            onChange={(e) => applyCustom(e.target.value, customTo)}
            className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-[13px] outline-none focus:border-[#166534]"
          />
          <span className="text-[13px] text-[#9ca3af]">to</span>
          <input
            type="date"
            value={customTo}
            min={customFrom}
            max={todayStr}
            onChange={(e) => applyCustom(customFrom, e.target.value)}
            className="rounded-lg border border-[#e5e7eb] px-2 py-1 text-[13px] outline-none focus:border-[#166534]"
          />
        </div>
      ) : null}
    </div>
  );
}
