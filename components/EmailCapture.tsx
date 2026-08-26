"use client";

import { FormEvent, useState } from "react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(json.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  return (
    <section id="subscribe" className="scroll-mt-16 border-t border-[#e5e7eb] px-6 py-16 md:py-20">
      <div className="mx-auto max-w-[560px] text-center">
        <h2 className="text-[28px] font-extrabold tracking-tight md:text-[36px]">
          New features, first.
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-subtle">
          Recurring invoices, saved clients, online payments — get notified when
          they land. No spam, ever.
        </p>

        {status === "done" ? (
          <p className="mt-6 rounded-lg bg-[#f0fdf4] px-5 py-3 text-[14px] font-medium text-[#166534]">
            You&rsquo;re on the list. Talk soon.
          </p>
        ) : (
          <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-[420px] gap-2.5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder="you@example.com"
              aria-label="Email address"
              className="min-w-0 flex-1 rounded-lg border border-[#e5e7eb] bg-white px-4 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="shrink-0 rounded-lg bg-[#14532d] px-5 py-2.5 text-[15px] font-semibold text-white transition hover:bg-[#0f3d22] active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
            >
              {status === "loading" ? "…" : "Notify me"}
            </button>
          </form>
        )}
        {status === "error" && message ? (
          <p className="mt-3 text-[13px] text-[#d70015]">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
