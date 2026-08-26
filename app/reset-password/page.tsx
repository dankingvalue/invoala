"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords don't match.");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setStatus("done");
        setTimeout(() => router.push("/login?reset=1"), 2000);
      } else {
        setStatus("error");
        setMessage(json.error || "Failed to reset password.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-[28px] font-semibold tracking-tight">Invalid link</h1>
          <p className="mt-2 text-[15px] text-subtle">This password reset link is invalid.</p>
          <Link href="/forgot-password" className="mt-4 block text-sm text-link hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f4fd]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">Set new password</h1>

        {status === "done" ? (
          <p className="mt-6 text-sm font-medium text-[#00875a]">Password updated! Redirecting to sign in…</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            {message ? <p className="text-sm text-[#d70015]">{message}</p> : null}
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password (8+ characters)"
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
            />
            <input
              type="password"
              required
              minLength={8}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-[15px] outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {status === "loading" ? "Saving…" : "Set password"}
            </button>
          </form>
        )}

        <Link href="/login" className="mt-4 block text-sm text-subtle hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
