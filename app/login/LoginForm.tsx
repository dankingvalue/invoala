"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "password" | "magic";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; role?: string; error?: string; needsVerification?: boolean };
      if (res.ok && json.ok) {
        router.push(json.role === "user" ? "/dashboard" : "/admin");
        router.refresh();
        return;
      }
      if (json.needsVerification) {
        router.push("/verify");
        return;
      }
      setStatus("error");
      setMessage(json.error || "Login failed. Try again.");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  async function submitMagic(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/magic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (res.ok && json.ok) {
        setMagicSent(true);
        setStatus("idle");
      } else {
        setStatus("error");
        setMessage(json.error || "Failed to send magic link.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-[#86868b] focus:border-accent focus:ring-[3px] focus:ring-accent/20";

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-full bg-fog p-1">
        {([
          ["password", "Password"],
          ["magic", "Magic link"],
        ] as const).map(([m, label]) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setStatus("idle");
              setMessage("");
              setMagicSent(false);
            }}
            className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
              mode === m ? "bg-white text-ink shadow-sm" : "text-subtle hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {magicSent ? (
        <div className="rounded-xl bg-[#e8f8ee] p-4 text-center">
          <p className="text-sm font-medium text-[#00875a]">Check your inbox.</p>
          <p className="mt-1 text-[13px] text-subtle">
            Click the link in the email to sign in. The link expires in 15 minutes.
          </p>
        </div>
      ) : mode === "password" ? (
        <form onSubmit={submitPassword} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-subtle">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[13px] font-medium text-subtle">Password</label>
              <Link href="/forgot-password" className="text-[13px] text-link hover:underline">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="••••••••"
            />
          </div>
          {status === "error" && message ? (
            <p className="text-[13px] text-[#d70015]">{message}</p>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {status === "loading" ? "Signing in…" : "Sign in"}
          </button>
        </form>
      ) : (
        <form onSubmit={submitMagic} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-subtle">Email</label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>
          {status === "error" && message ? (
            <p className="text-[13px] text-[#d70015]">{message}</p>
          ) : null}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-full bg-accent px-6 py-3 text-[15px] font-medium text-white transition hover:bg-accent-hover active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {status === "loading" ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      {googleEnabled ? (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-hairline" />
            </div>
            <div className="relative flex justify-center text-[13px]">
              <span className="bg-white px-3 text-subtle">or</span>
            </div>
          </div>
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-hairline bg-white px-6 py-3 text-[15px] font-medium text-ink transition hover:bg-fog active:scale-[0.99]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </a>
        </>
      ) : null}
    </div>
  );
}
