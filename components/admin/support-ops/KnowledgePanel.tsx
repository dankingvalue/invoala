"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type Article = { id: string; title: string; body: string; category: string; audience: "customer" | "internal"; verified: number; archived: number };

export function KnowledgePanel() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [audience, setAudience] = useState<"customer" | "internal">("internal");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [creating, setCreating] = useState(false);

  function load() {
    fetch(`/api/admin/support/knowledge?audience=${audience}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { articles?: Article[] } | null) => setArticles(d?.articles ?? []));
  }
  useEffect(load, [audience]);

  async function create() {
    if (!title.trim() || !body.trim()) return;
    setCreating(true);
    await fetch("/api/admin/support/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category, audience }),
    }).catch(() => {});
    setCreating(false);
    setTitle("");
    setBody("");
    load();
  }

  async function toggleVerified(a: Article) {
    await fetch(`/api/admin/support/knowledge/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verified: !a.verified }),
    }).catch(() => {});
    load();
  }

  async function archive(a: Article) {
    await fetch(`/api/admin/support/knowledge/${a.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archived: true }),
    }).catch(() => {});
    load();
  }

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex items-center justify-between">
          <SectionHead title="Knowledge base" subtitle="Customer-facing articles are the only ones AI support can draw on — internal ones never reach the customer." />
          <div className="flex gap-1 rounded-full bg-fog p-1">
            {(["internal", "customer"] as const).map((a) => (
              <button key={a} onClick={() => setAudience(a)} className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${audience === a ? "bg-white shadow-sm" : "text-subtle"}`}>{a}</button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-xl border border-[#e5e7eb] p-3.5">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]" />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category" className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body…" rows={3} className="w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
          <button disabled={creating || !title.trim() || !body.trim()} onClick={create} className="rounded-full bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
            {creating ? "Creating…" : `Add ${audience} article`}
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {articles.length === 0 ? <p className="text-sm text-subtle">No articles yet.</p> : articles.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-[#e5e7eb] p-3 text-[13px]">
              <div className="min-w-0">
                <p className="font-medium text-ink">{a.title} {a.verified ? <span className="ml-1 rounded-full bg-[#dcfce7] px-1.5 py-0.5 text-[10px] font-semibold text-[#166534]">verified</span> : null}</p>
                <p className="text-[11px] text-subtle">{a.category}</p>
                <p className="mt-1 line-clamp-2 text-subtle">{a.body}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button onClick={() => toggleVerified(a)} className="text-[11px] font-medium text-[#166534] hover:underline">{a.verified ? "Unverify" : "Verify"}</button>
                <button onClick={() => archive(a)} className="text-[11px] font-medium text-[#dc2626] hover:underline">Archive</button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
