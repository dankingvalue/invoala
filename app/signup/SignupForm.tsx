"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
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
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string; needsVerification?: boolean };
      if (res.ok && json.ok) {
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
    "w-full rounded-xl border border-hairline bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-[#86868b] focus:border-accent focus:ring-[3px] focus:ring-accent/20";

  return (
    <div className="space-y-5">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-subtle">Name</label>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[13px] font-medium text-subtle">Email</label>
          <input
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
          <label className="mb-1.5 block text-[13px] font-medium text-subtle">
            Password <span className="font-normal text-subtle/70">(min 8 characters)</span>
          </label>
          <input
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
          <label className="mb-1.5 block text-[13px] font-medium text-subtle">Confirm password</label>
          <input
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
    </div>
  );
}
