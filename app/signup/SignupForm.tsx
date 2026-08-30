"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
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
    setMessage("");
    trackEvent("signup_started");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; needsVerification?: boolean };
      if (res.ok && json.ok) {
        trackEvent("signup_completed");
        if (json.needsVerification) {
          router.push("/verify");
        } else {
          router.push("/dashboard");
        }
        router.refresh();
        return;
      }
      setStatus("error");
      setMessage(json.error || "Signup failed. Try again.");
    } catch {
      setStatus("error");
      setMessage("Network error. Try again.");
    }
  }

  const inputCls =
    "w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-[#6b7280] focus:border-accent focus:ring-[3px] focus:ring-accent/20";

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="signup-name" className="mb-1.5 block text-[13px] font-medium text-subtle">Name</label>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="mb-1.5 block text-[13px] font-medium text-subtle">Email</label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="mb-1.5 block text-[13px] font-medium text-subtle">
            Password <span className="font-normal text-subtle">(min 8 characters)</span>
          </label>
          <input
            id="signup-password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="signup-confirm" className="mb-1.5 block text-[13px] font-medium text-subtle">Confirm password</label>
          <input
            id="signup-confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {status === "loading" ? "Creating account…" : "Create free account"}
        </button>
      </form>

      <p className="text-center text-xs leading-relaxed text-subtle">
        Free forever. Your invoices are saved to your account — available on any device.
      </p>

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
