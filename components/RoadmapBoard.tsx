"use client";

import { useEffect, useMemo, useState } from "react";

type RoadmapStatus = "open" | "planned" | "in_progress" | "done" | "declined";

type RoadmapItem = {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  votes: number;
  created_at: number;
};

const COLUMNS: { status: RoadmapStatus; label: string; dot: string }[] = [
  { status: "planned", label: "Planned", dot: "#0369a1" },
  { status: "in_progress", label: "In progress", dot: "#b45309" },
  { status: "done", label: "Done", dot: "#166534" },
];

function voterKey(): string {
  if (typeof window === "undefined") return "";
  try {
    let key = window.localStorage.getItem("invoala.voter");
    if (!key) {
      key = crypto.randomUUID();
      window.localStorage.setItem("invoala.voter", key);
    }
    return key;
  } catch {
    return "";
  }
}

function votedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem("invoala.voted") || "[]";
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function rememberVote(id: string) {
  try {
    const set = votedSet();
    set.add(id);
    window.localStorage.setItem("invoala.voted", JSON.stringify([...set]));
  } catch {}
}

export function RoadmapBoard() {
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState<Set<string>>(() => votedSet());

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  useEffect(() => {
    fetch("/api/roadmap")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { items?: RoadmapItem[] } | null) => setItems(data?.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const byColumn = useMemo(() => {
    const map: Record<RoadmapStatus, RoadmapItem[]> = { open: [], planned: [], in_progress: [], done: [], declined: [] };
    for (const item of items) map[item.status]?.push(item);
    return map;
  }, [items]);

  async function upvote(id: string) {
    if (voted.has(id)) return;
    setVoted((prev) => new Set(prev).add(id));
    rememberVote(id);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, votes: it.votes + 1 } : it)));

    try {
      const res = await fetch(`/api/roadmap/${id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voter_key: voterKey() }),
      });
      const json = (await res.json()) as { votes?: number };
      if (typeof json.votes === "number") {
        setItems((prev) => prev.map((it) => (it.id === id ? { ...it, votes: json.votes! } : it)));
      }
    } catch {}
  }

  async function submitIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);
    setSubmitMsg("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, name, email }),
      });
      const json = (await res.json()) as { ok?: boolean; item?: RoadmapItem; error?: string };
      if (res.ok && json.item) {
        setItems((prev) => [json.item as RoadmapItem, ...prev]);
        setTitle("");
        setDescription("");
        setSubmitMsg("Thanks — your idea is in the queue.");
      } else {
        setSubmitMsg(json.error || "Couldn't submit that. Please try again.");
      }
    } catch {
      setSubmitMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitMsg(""), 5000);
    }
  }

  const openItems = [...byColumn.open].sort((a, b) => b.votes - a.votes);

  return (
    <div>
      {/* Board: Planned / In progress / Done */}
      <div className="grid gap-5 sm:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col.status} className="rounded-2xl bg-[#f9fafb] p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: col.dot }} />
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-ink">
                {col.label}
              </h2>
              <span className="ml-auto text-[12px] text-[#9ca3af]">{byColumn[col.status].length}</span>
            </div>
            <div className="space-y-2.5">
              {loading ? (
                <p className="text-[13px] text-[#9ca3af]">Loading…</p>
              ) : byColumn[col.status].length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#e5e7eb] p-3 text-[13px] text-[#9ca3af]">
                  Nothing here yet.
                </p>
              ) : (
                byColumn[col.status].map((item) => (
                  <div key={item.id} className="rounded-xl bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
                    <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-[12px] leading-relaxed text-[#6b7280]">{item.description}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Feedback board: submit + vote */}
      <div className="mt-16">
        <h2 className="text-[24px] font-bold tracking-tight">Suggest a feature</h2>
        <p className="mt-1.5 text-[14px] text-[#6b7280]">
          Have an idea, or want to see something move faster? Add it below, or upvote one that&apos;s
          already there.
        </p>

        <form onSubmit={submitIdea} className="mt-6 rounded-2xl border border-[#e5e7eb] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What should we build?"
              maxLength={140}
              required
              className="rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]"
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional — for follow-up)"
              type="email"
              className="rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any details — the more specific, the better."
            rows={3}
            maxLength={2000}
            className="mt-3 w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534]"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (optional)"
            maxLength={80}
            className="mt-3 w-full rounded-lg border border-[#e5e7eb] px-3.5 py-2.5 text-[14px] outline-none focus:border-[#166534] sm:w-1/2"
          />
          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="rounded-full bg-[#14532d] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit idea"}
            </button>
            {submitMsg ? <span className="text-[13px] text-[#166534]">{submitMsg}</span> : null}
          </div>
        </form>

        <div className="mt-6 space-y-2.5">
          {loading ? (
            <p className="text-[13px] text-[#9ca3af]">Loading…</p>
          ) : openItems.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e5e7eb] p-6 text-center text-[13px] text-[#9ca3af]">
              No open suggestions yet — be the first.
            </p>
          ) : (
            openItems.map((item) => {
              const hasVoted = voted.has(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-xl border border-[#e5e7eb] p-4"
                >
                  <button
                    type="button"
                    onClick={() => upvote(item.id)}
                    disabled={hasVoted}
                    aria-label={hasVoted ? "Already voted" : "Upvote"}
                    className={`flex shrink-0 flex-col items-center rounded-lg border px-3 py-1.5 transition ${
                      hasVoted
                        ? "border-[#166534] bg-[#f0fdf4] text-[#166534]"
                        : "border-[#e5e7eb] text-[#6b7280] hover:border-[#166534] hover:text-[#166534]"
                    }`}
                  >
                    <span aria-hidden="true" className="text-[13px] leading-none">▲</span>
                    <span className="text-[13px] font-semibold tabular-nums">{item.votes}</span>
                  </button>
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-[13px] leading-relaxed text-[#6b7280]">{item.description}</p>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
