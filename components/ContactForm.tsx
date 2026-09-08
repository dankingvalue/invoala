"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[14px] text-[#111827] outline-none transition placeholder:text-[#9ca3af] focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/15";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (json.ok) {
        setStatus("sent");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
        setError(json.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <div className="rounded-xl border border-[#e5e7eb] bg-white p-6">
        <h2 className="text-[17px] font-bold tracking-tight text-[#111827]">Message sent</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#6b7280]">
          Thanks — we&apos;ll reply to your email within one business day (sooner during support hours).
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#e5e7eb] bg-white p-6">
      <h2 className="text-[17px] font-bold tracking-tight text-[#111827]">Send us a message</h2>
      <p className="mt-1 text-[14px] text-[#6b7280]">We&apos;ll reply by email — no need to open your own mail app.</p>
      <div className="mt-4 space-y-3">
        <input
          className={inputCls}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className={inputCls}
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <textarea
          className={`${inputCls} min-h-[110px] resize-y`}
          placeholder="How can we help?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>
      {error ? <p className="mt-3 text-[13px] text-[#dc2626]">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 rounded-full bg-[#166534] px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
