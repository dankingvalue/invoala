"use client";

import { useEffect, useRef, useState } from "react";

export type TourStep = {
  selector: string;
  title: string;
  body: string;
};

// A lightweight first-visit walkthrough: highlights one real element on the
// page at a time with a positioned tooltip, Next/Back/Skip, and remembers
// completion in localStorage so it never nags a returning user. No backdrop
// library, no portal-hungry positioning engine — just getBoundingClientRect
// re-measured on scroll/resize, matching how RowMenu already does fixed
// positioning elsewhere in this codebase.
export function ProductTour({ tourId, steps }: { tourId: string; steps: TourStep[] }) {
  const storageKey = `invoala.tour.${tourId}`;
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(storageKey)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActive(true);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!active) return;
    function measure() {
      const el = document.querySelector(steps[step]?.selector || "");
      setRect(el ? el.getBoundingClientRect() : null);
      if (el) el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    measure();
    const onScrollResize = () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", onScrollResize, true);
    window.addEventListener("resize", onScrollResize);
    return () => {
      window.removeEventListener("scroll", onScrollResize, true);
      window.removeEventListener("resize", onScrollResize);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [active, step, steps]);

  function finish() {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {}
    setActive(false);
  }

  if (!active || steps.length === 0) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  // Tooltip placement: below the target by default, flipped above if there's
  // not enough room, clamped horizontally so it never runs off-screen.
  const TIP_W = 320;
  const top = rect ? (rect.bottom + 190 < window.innerHeight ? rect.bottom + 12 : Math.max(12, rect.top - 190)) : window.innerHeight / 2 - 90;
  const left = rect ? Math.min(Math.max(12, rect.left), window.innerWidth - TIP_W - 12) : window.innerWidth / 2 - TIP_W / 2;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/40" onClick={finish} />
      {rect ? (
        <div
          className="pointer-events-none fixed z-[91] rounded-lg ring-2 ring-white"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.4)",
          }}
        />
      ) : null}
      <div
        className="fixed z-[92] w-80 rounded-2xl bg-white p-5 shadow-2xl"
        style={{ top, left }}
        role="dialog"
        aria-label={current.title}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-subtle">
          Step {step + 1} of {steps.length}
        </p>
        <h3 className="mt-1 text-[16px] font-bold tracking-tight text-ink">{current.title}</h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-subtle">{current.body}</p>
        <div className="mt-4 flex items-center justify-between">
          <button type="button" onClick={finish} className="text-[13px] font-medium text-subtle hover:text-ink">
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                className="rounded-full border border-hairline px-3.5 py-1.5 text-[13px] font-medium text-ink hover:bg-fog"
              >
                Back
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
              className="rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-accent-hover"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
