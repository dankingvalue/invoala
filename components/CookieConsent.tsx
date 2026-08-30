"use client";

import { useState, useEffect } from "react";

const CONSENT_KEY = "invoala.cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (!localStorage.getItem(CONSENT_KEY)) {
          setShow(true);
        }
      } catch {}
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
      window.dispatchEvent(new CustomEvent("invoala:consent"));
    } catch {}
    setShow(false);
  }

  function decline() {
    try {
      localStorage.setItem(CONSENT_KEY, "declined");
    } catch {}
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4">
      <div className="mx-auto flex max-w-[960px] flex-col items-start gap-4 rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#111827]">We use cookies</p>
          <p className="mt-1 text-xs leading-relaxed text-[#6b7280]">
            We use essential cookies to keep you signed in and improve your experience. We do not use tracking or advertising cookies. By continuing to use Invoala, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-[#111827]">Privacy Policy</a>.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-xs font-medium text-[#6b7280] transition hover:text-[#111827]"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-lg bg-[#166534] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#14532d]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
