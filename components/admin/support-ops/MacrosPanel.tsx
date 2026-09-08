"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type Macro = { id: string; name: string; category: string; response_text: string; usage_count: number; active: number };

export function MacrosPanel() {
  const [macros, setMacros] = useState<Macro[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("general");
  const [text, setText] = useState("");
  const [creating, setCreating] = useState(false);

  function load() {
    fetch("/api/admin/support/macros").then((r) => (r.ok ? r.json() : null)).then((d: { macros?: Macro[] } | null) => setMacros(d?.macros ?? []));
  }
  useEffect(load, []);

  async function create() {
    if (!name.trim() || !text.trim()) return;
    setCreating(true);
    await fetch("/api/admin/support/macros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, category, responseText: text }),
    }).catch(() => {});
    setCreating(false);
    setName("");
    setText("");
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this macro?")) return;
    await fetch(`/api/admin/support/macros/${id}`, { method: "DELETE" }).catch(() => {});
    load();
  }

  return (
    <Panel>
      <SectionHead title="Response macros" subtitle="Approved templates agents can insert and customize. Usage is tracked to see which are actually useful." />
      <div className="mt-4 space-y-2 rounded-xl border border-[#e5e7eb] p-3.5">
        <div className="grid gap-2 sm:grid-cols-[1fr_160px]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Macro name (e.g. Payment failed)" className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]" />
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Response text…" rows={3} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
        <button disabled={creating || !name.trim() || !text.trim()} onClick={create} className="rounded-full bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{creating ? "Creating…" : "Add macro"}</button>
      </div>

      <div className="mt-4 space-y-2">
        {macros.length === 0 ? <p className="text-sm text-subtle">No macros yet.</p> : macros.map((m) => (
          <div key={m.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#e5e7eb] p-3 text-[13px]">
            <div className="min-w-0">
              <p className="font-medium text-ink">{m.name} <span className="text-[11px] text-subtle">· {m.category} · used {m.usage_count}×</span></p>
              <p className="mt-1 line-clamp-2 text-subtle">{m.response_text}</p>
            </div>
            <button onClick={() => remove(m.id)} className="shrink-0 text-[11px] font-medium text-[#dc2626] hover:underline">Delete</button>
          </div>
        ))}
      </div>
    </Panel>
  );
}
