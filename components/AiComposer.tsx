"use client";

import { useState } from "react";
import type { ParsedInvoice } from "@/lib/parseInvoice";

const PLACEHOLDER =
  "e.g. Designed a logo and landing page for Acme Corp, billing@acme.com — logo $600, 12 hours of design at $75/hr, 8.5% sales tax, payment due in 15 days.";

export function AiComposer({
  onResult,
}: {
  onResult: (data: ParsedInvoice) => void;
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  async function generate() {
    if (!text.trim() || status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/parse-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = (await res.json()) as {
        data?: ParsedInvoice;
        error?: string;
      };
      if (!res.ok || !json.data) {
        setStatus("error");
        setMessage(json.error || "Something went wrong. Try rephrasing.");
        return;
      }
      onResult(json.data);
      setStatus("idle");
      setText("");
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <div className="rounded-2xl bg-fog p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1d1d1f" aria-hidden="true">
          <path d="M12 2l1.9 5.7L19.6 9l-4.4 3.6L16.5 18 12 14.8 7.5 18l1.3-5.4L4.4 9l5.7-1.3L12 2z" />
        </svg>
        <h3 className="text-lg font-semibold tracking-tight text-ink">
          Describe it. We&rsquo;ll draft it.
        </h3>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-subtle">
        Write what you did in plain words — items, prices, client, tax — and the
        invoice fills itself in.
      </p>
      <textarea
        aria-label="Describe the work to draft your invoice"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (status === "error") setStatus("idle");
        }}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") void generate();
        }}
        rows={3}
        placeholder={PLACEHOLDER}
        className="mt-4 w-full resize-none rounded-xl border border-hairline bg-white px-3.5 py-3 text-[15px] leading-relaxed text-ink outline-none transition placeholder:text-[#6b7280] focus:border-accent focus:ring-[3px] focus:ring-accent/20"
      />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => void generate()}
          disabled={status === "loading" || !text.trim()}
          className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          {status === "loading" ? "Drafting invoice…" : "Generate invoice"}
        </button>
        {message ? (
          <p className="text-[13px] text-[#d70015]">{message}</p>
        ) : (
          <p className="text-xs text-subtle">⌘↩ to submit · review before sending</p>
        )}
      </div>
    </div>
  );
}
