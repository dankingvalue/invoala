"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setStatus("done");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f4fd]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">Reset your password</h1>
        <p className="mt-2 text-[15px] text-subtle">
          Enter your email and we&rsquo;ll send you a link to set a new password.
        </p>

        {status === "done" ? (
          <div className="mt-8">
            <p className="text-sm text-[#00875a] font-medium">Check your inbox.</p>
            <p className="mt-2 text-sm text-subtle">
              If an account exists with that email, you&rsquo;ll receive a reset link shortly.
            </p>
            <Link href="/login" className="mt-6 block text-sm text-link hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-8">
            <input
              aria-label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-4 w-full rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {status === "loading" ? "Sending…" : "Send reset link"}
            </button>
            <Link href="/login" className="mt-4 block text-sm text-subtle hover:text-ink">
              Back to sign in
            </Link>
          </form>
        )}
      </div>
    </main>
  );
}
