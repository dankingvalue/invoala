"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const DISMISS_KEY = "invoala.popup.dismissedAt";
const SUBSCRIBED_KEY = "invoala.popup.subscribed";
const ENGAGED_KEY = "invoala.popup.engaged";
const RESHOW_AFTER_MS = 7 * 24 * 60 * 60 * 1000;
const SHOW_DELAY_MS = 6000;

export function SignupPrompt() {
  const [phase, setPhase] = useState<"hidden" | "shown" | "closing">("hidden");
  const phaseRef = useRef(phase);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    try {
      if (localStorage.getItem(SUBSCRIBED_KEY)) return;
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY)) || 0;
      if (Date.now() - dismissedAt < RESHOW_AFTER_MS) return;
      if (sessionStorage.getItem(ENGAGED_KEY)) return;
    } catch {
      // storage unavailable — default to showing
    }

    const timer = window.setTimeout(() => {
      if (phaseRef.current === "hidden") setPhase("shown");
    }, SHOW_DELAY_MS);

    function onClickCapture(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (target?.closest('a[href="#generate"]')) {
        try {
          sessionStorage.setItem(ENGAGED_KEY, "1");
        } catch {}
        if (phaseRef.current === "hidden") {
          window.clearTimeout(timer);
          document.removeEventListener("click", onClickCapture, true);
        }
      }
    }
    document.addEventListener("click", onClickCapture, true);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  function dismiss() {
    setPhase((p) => (p === "shown" ? "closing" : p));
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setTimeout(() => setPhase("hidden"), 320);
  }

  async function submit(e: FormEvent) {
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
        try {
          localStorage.setItem(SUBSCRIBED_KEY, String(Date.now()));
        } catch {}
        setTimeout(dismiss, 2400);
      } else {
        setStatus("error");
        setMessage(json.error || "Please check your email address.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current === "shown") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (phase === "hidden") return null;

  const inputCls =
    "w-full min-w-0 rounded-full border border-hairline bg-white px-4 py-2 text-sm text-ink outline-none transition placeholder:text-[#a1a1a6] focus:border-accent focus:ring-[3px] focus:ring-accent/15 sm:w-52";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[55] flex justify-center px-4 pb-5">
      <div
        role="region"
        aria-label="Product updates"
        className="pointer-events-auto relative w-full max-w-[760px] overflow-visible"
        style={{
          animation: phase === "closing" ? "bannerOut .3s ease forwards" : "bannerIn .45s cubic-bezier(.25,.9,.35,1)",
        }}
      >
        {/* soft decorative glows */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -left-8 -top-10 h-28 w-28 rounded-full bg-[#bbf7d0] opacity-40 blur-2xl" />
          <div className="absolute -bottom-12 -right-6 h-32 w-32 rounded-full bg-[#86efac] opacity-40 blur-2xl" />
        </div>

        <div className="relative flex flex-col gap-4 rounded-2xl border border-[#e5e7eb] bg-white/90 p-4 pl-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-5 sm:p-4 sm:pl-5">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-base leading-none text-[#6b7280] transition hover:bg-[#f3f4f6] hover:text-ink"
          >
            &times;
          </button>

          {/* icon */}
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-2xl sm:self-center"
            style={{ background: "linear-gradient(135deg,#dcfce7,#d1fae5)" }}
            aria-hidden="true"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="3" />
              <path d="m3.5 7 7.4 5.4a2 2 0 0 0 2.2 0L20.5 7" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-[#166534] ring-2 ring-white" />
          </div>

          {/* copy */}
          <div className="min-w-0 flex-1 pr-4">
            <p className="text-[15px] font-semibold tracking-tight text-ink">
              Good things are shipping soon.
            </p>
            <p className="mt-0.5 text-[13px] leading-snug text-subtle">
              Recurring invoices, client books, online payments. One quiet email
              when they land&nbsp;&mdash;&nbsp;never spam.
            </p>
          </div>

          {/* form */}
          {status === "done" ? (
            <p className="flex shrink-0 items-center gap-2 pr-6 text-[14px] font-medium text-[#166534]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              You&rsquo;re on the list.
            </p>
          ) : (
            <form onSubmit={submit} className="shrink-0">
              <div className={`flex items-center gap-2 ${message ? "flex-col" : ""}`}>
                <div className="flex items-center gap-2">
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
                    className={inputCls}
                  />
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="shrink-0 whitespace-nowrap rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] active:scale-[0.99] disabled:opacity-60"
                  >
                    {status === "loading" ? "…" : "Notify me"}
                  </button>
                </div>
                {status === "error" && message ? (
                  <p className="pr-1 text-xs text-[#d70015]">{message}</p>
                ) : null}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
