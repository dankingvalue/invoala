"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type RoadmapStatus = "open" | "planned" | "in_progress" | "done" | "declined";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  votes: number;
  submitted_name: string;
  submitted_email: string;
  created_at: number;
};

const STATUS_LABEL: Record<RoadmapStatus, string> = {
  open: "New",
  planned: "Planned",
  in_progress: "In progress",
  done: "Done",
  declined: "Declined",
};

const STATUS_OPTIONS: RoadmapStatus[] = ["open", "planned", "in_progress", "done", "declined"];

export function RoadmapTab() {
  const [rows, setRows] = useState<RoadmapItem[]>([]);
  const [busy, setBusy] = useState(true);
  const [filter, setFilter] = useState<RoadmapStatus | "all">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<RoadmapStatus>("planned");
  const [adding, setAdding] = useState(false);

  function load() {
    fetch("/api/admin/roadmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { items?: RoadmapItem[] } | null) => setRows(data?.items ?? []))
      .catch(() => {})
      .finally(() => setBusy(false));
  }

  useEffect(load, []);

  async function changeStatus(id: string, status: RoadmapStatus) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await fetch(`/api/admin/roadmap/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  async function remove(id: string) {
    if (!confirm("Delete this roadmap item? This can't be undone.")) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
    await fetch(`/api/admin/roadmap/${id}`, { method: "DELETE" }).catch(() => {});
  }

  async function addItem() {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/admin/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, description: newDescription, status: newStatus }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        load();
      }
    } finally {
      setAdding(false);
    }
  }

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Panel>
        <SectionHead
          title="Roadmap"
          subtitle="Publicly visible at /roadmap. Triage new suggestions into Planned, In progress, or Done — or decline them to hide from the public board."
        />

        <div className="mt-5 rounded-xl border border-dashed border-[#e5e7eb] p-4">
          <p className="text-[13px] font-semibold text-ink">Add an item directly</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title"
              maxLength={140}
              className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RoadmapStatus)}
              className="rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]"
            >
              {STATUS_OPTIONS.filter((s) => s !== "declined").map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addItem}
              disabled={adding || !newTitle.trim()}
              className="rounded-lg bg-[#14532d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
            >
              {adding ? "Adding…" : "Add"}
            </button>
          </div>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            maxLength={2000}
            className="mt-3 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]"
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              filter === "all" ? "bg-[#14532d] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-ink"
            }`}
          >
            All ({rows.length})
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                filter === s ? "bg-[#14532d] text-white" : "bg-[#f3f4f6] text-[#6b7280] hover:text-ink"
              }`}
            >
              {STATUS_LABEL[s]} ({counts[s] || 0})
            </button>
          ))}
        </div>

        {busy ? (
          <p className="mt-4 text-sm text-[#6b7280]">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center text-sm text-[#9ca3af]">
            Nothing here yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {visible.map((item) => (
              <div key={item.id} className="rounded-xl border border-[#e5e7eb] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-[13px] text-[#6b7280]">{item.description}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-[#9ca3af]">
                      {item.votes} vote{item.votes === 1 ? "" : "s"}
                      {item.submitted_name ? ` · from ${item.submitted_name}` : ""}
                      {item.submitted_email ? ` (${item.submitted_email})` : ""}
                      {" · "}
                      {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <select
                      value={item.status}
                      onChange={(e) => changeStatus(item.id, e.target.value as RoadmapStatus)}
                      className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[13px] outline-none focus:border-[#166534]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      className="rounded-lg border border-[#fecaca] px-2.5 py-1.5 text-[13px] font-medium text-[#d70015] transition hover:bg-[#fef2f2]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
