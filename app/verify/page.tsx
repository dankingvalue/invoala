"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState(
    error === "expired"
      ? "This link has expired. Please enter the code from your email, or request a new one."
      : error === "invalid"
        ? "Invalid verification link. Please enter the code from your email."
        : "",
  );
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setStatus("done");
        setTimeout(() => router.push("/dashboard?verified=1"), 1500);
      } else {
        setStatus("error");
        setMessage(json.error || "Invalid code.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  async function resend() {
    setResending(true);
    setResendMsg("");
    try {
      const res = await fetch("/api/auth/resend", { method: "POST" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      setResendMsg(res.ok ? "Code sent. Check your inbox." : json.error || "Failed to resend.");
    } catch {
      setResendMsg("Network error.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[400px] text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e8f4fd]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m3.5 7 7.4 5.4a2 2 0 0 0 2.2 0L20.5 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">Verify your email</h1>
        <p className="mt-2 text-[15px] text-subtle">
          Enter the 6-digit code we sent to your email, or click the link in the email.
        </p>

        {message ? (
          <p className="mt-4 text-sm text-subtle">{message}</p>
        ) : null}

        {status === "done" ? (
          <p className="mt-6 text-sm font-medium text-[#00875a]">Verified! Redirecting…</p>
        ) : (
          <form onSubmit={verify} className="mt-6">
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                if (status === "error") setStatus("idle");
              }}
              placeholder="000000"
              maxLength={6}
              inputMode="numeric"
              className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-center text-[22px] font-mono tracking-[0.3em] text-ink outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/15"
            />
            <button
              type="submit"
              disabled={status === "loading" || code.length !== 6}
              className="mt-4 w-full rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              {status === "loading" ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}

        <div className="mt-6 border-t border-hairline pt-5">
          <button
            type="button"
            onClick={() => void resend()}
            disabled={resending}
            className="text-sm text-link hover:underline disabled:opacity-50"
          >
            {resending ? "Sending…" : "Resend code"}
          </button>
          {resendMsg ? <p className="mt-2 text-xs text-subtle">{resendMsg}</p> : null}
        </div>

        <Link href="/login" className="mt-4 block text-sm text-subtle hover:text-ink">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
