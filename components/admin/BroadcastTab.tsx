"use client";

import { FormEvent, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

export function BroadcastTab() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<"all" | "pro">("all");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function send(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), body: body.trim(), target }),
      });
      const json = (await res.json()) as { ok?: boolean; count?: number; error?: string };
      if (res.ok && json.ok) {
        setResult({ ok: true, message: `Notification sent to ${json.count?.toLocaleString() ?? 0} user${json.count === 1 ? "" : "s"}.` });
        setTitle("");
        setBody("");
      } else {
        setResult({ ok: false, message: json.error || "Could not send notification." });
      }
    } catch {
      setResult({ ok: false, message: "Network error." });
    }
    setBusy(false);
  }

  return (
    <Panel>
      <SectionHead
        title="Broadcast notification"
        subtitle="Send an in-app notification to every user. It appears under the bell icon on their dashboard."
      />
      <form onSubmit={send} className="mt-4 max-w-[560px] space-y-4">
        <div>
          <label htmlFor="broadcast-title" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">
            Title
          </label>
          <input
            id="broadcast-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New templates are live"
            required
            maxLength={120}
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
          />
        </div>
        <div>
          <label htmlFor="broadcast-body" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">
            Message
          </label>
          <textarea
            id="broadcast-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Details for your users…"
            rows={4}
            maxLength={1000}
            className="w-full resize-none rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none focus:ring-1 focus:ring-[#166534]"
          />
        </div>
        <div>
          <label htmlFor="broadcast-target" className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">
            Audience
          </label>
          <select
            id="broadcast-target"
            value={target}
            onChange={(e) => setTarget(e.target.value as "all" | "pro")}
            className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm focus:border-[#166534] focus:outline-none"
          >
            <option value="all">All users</option>
            <option value="pro">Pro subscribers only</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={busy || !title.trim()}
          className="rounded-lg bg-[#14532d] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send to all"}
        </button>
        {result && (
          <p className={`text-[13px] ${result.ok ? "text-[#166534]" : "text-[#d70015]"}`}>
            {result.message}
          </p>
        )}
      </form>
    </Panel>
  );
}
