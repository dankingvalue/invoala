"use client";

import { useEffect, useState } from "react";
import { Panel, SectionHead } from "@/components/admin/Panel";

type Sample = { id: string; subject: string; reason: string };
type Review = { id: string; conversation_id: string; agent_id: string; score: number; notes: string; created_at: number };

const CRITERIA = [
  ["accuracy", "Accurate information?"],
  ["helpfulness", "Helpful?"],
  ["professionalism", "Professional?"],
  ["policyCompliance", "Followed policy?"],
  ["correctEscalation", "Escalated appropriately?"],
  ["correctResolution", "Correctly resolved?"],
  ["documentationQuality", "Documented well?"],
] as const;

export function QaPanel() {
  const [sample, setSample] = useState<Sample[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewing, setReviewing] = useState<Sample | null>(null);
  const [agentId, setAgentId] = useState("");
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(CRITERIA.map(([k]) => [k, 80])));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function loadSample() {
    fetch("/api/admin/support/qa/sample?count=10").then((r) => (r.ok ? r.json() : null)).then((d: { sample?: Sample[] } | null) => setSample(d?.sample ?? []));
  }
  function loadReviews() {
    fetch("/api/admin/support/qa").then((r) => (r.ok ? r.json() : null)).then((d: { reviews?: Review[] } | null) => setReviews(d?.reviews ?? []));
  }
  useEffect(() => {
    loadSample();
    loadReviews();
  }, []);

  async function submit() {
    if (!reviewing || !agentId.trim()) return;
    setSaving(true);
    await fetch("/api/admin/support/qa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: reviewing.id, agentId, scores, notes }),
    }).catch(() => {});
    setSaving(false);
    setReviewing(null);
    setAgentId("");
    setNotes("");
    loadSample();
    loadReviews();
  }

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex items-center justify-between">
          <SectionHead title="QA sample" subtitle="Prioritizes low ratings, reopens, escalations, and P1/P2 first." />
          <button onClick={loadSample} className="text-xs font-medium text-[#166534] hover:underline">Refresh sample</button>
        </div>
        {sample.length === 0 ? (
          <p className="mt-4 text-sm text-subtle">Nothing to review right now.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {sample.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-lg border border-[#e5e7eb] p-3 text-[13px]">
                <div>
                  <p className="font-medium text-ink">{s.subject || "(no subject)"}</p>
                  <p className="text-[11px] text-subtle">Reason: {s.reason}</p>
                </div>
                <button onClick={() => setReviewing(s)} className="rounded-full bg-[#166534] px-3 py-1.5 text-xs font-semibold text-white">Review</button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel>
        <SectionHead title="Recent QA reviews" />
        {reviews.length === 0 ? <p className="mt-4 text-sm text-subtle">No reviews yet.</p> : (
          <ul className="mt-4 space-y-1.5 text-[13px]">
            {reviews.slice(0, 20).map((r) => (
              <li key={r.id} className="flex justify-between border-b border-[#f3f4f6] py-1.5">
                <span>Agent {r.agent_id.slice(0, 8)}… — score {r.score}/100</span>
                <span className="text-[11px] text-subtle">{new Date(r.created_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {reviewing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setReviewing(null)}>
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold tracking-tight">QA review — {reviewing.subject || "conversation"}</h3>
            <input value={agentId} onChange={(e) => setAgentId(e.target.value)} placeholder="Agent user ID" className="mt-3 w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm outline-none focus:border-[#166534]" />
            <div className="mt-3 space-y-3">
              {CRITERIA.map(([key, label]) => (
                <div key={key}>
                  <div className="flex justify-between text-[12px]"><span>{label}</span><span className="tabular-nums">{scores[key]}</span></div>
                  <input type="range" min={0} max={100} value={scores[key]} onChange={(e) => setScores((s) => ({ ...s, [key]: Number(e.target.value) }))} className="w-full" />
                </div>
              ))}
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes…" rows={2} className="mt-3 w-full rounded-lg border border-[#e5e7eb] p-2.5 text-sm outline-none focus:border-[#166534]" />
            <div className="mt-4 flex gap-2">
              <button disabled={saving || !agentId.trim()} onClick={submit} className="rounded-full bg-[#166534] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Submit review"}</button>
              <button onClick={() => setReviewing(null)} className="rounded-full border border-[#e5e7eb] px-4 py-2 text-xs font-medium">Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
