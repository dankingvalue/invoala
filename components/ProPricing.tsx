import { Reveal } from "@/components/Reveal";
import { PLAN_PITCHES } from "@/lib/plans-content";

const STYLES: Record<string, { card: string; price: string; note: string; check: string; text: string; name: string; cta: string }> = {
  free: {
    card: "flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6",
    name: "text-[13px] font-semibold uppercase tracking-wider text-[#86efac]",
    price: "mt-3 text-[40px] font-extrabold leading-none tracking-tight text-white",
    note: "text-[13px] text-[#bbf7d0]",
    check: "#86efac",
    text: "text-[#d1fae5]",
    cta: "rounded-lg border border-white/20 px-5 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-white/10",
  },
  pro: {
    card: "relative flex h-full flex-col rounded-xl border border-[#166534] bg-white p-6 text-ink",
    name: "text-[13px] font-semibold uppercase tracking-wider text-[#6b7280]",
    price: "mt-3 text-[40px] font-extrabold leading-none tracking-tight text-ink",
    note: "text-[13px] text-[#6b7280]",
    check: "#166534",
    text: "text-[#374151]",
    cta: "rounded-lg bg-[#14532d] px-5 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]",
  },
  teams: {
    card: "flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6",
    name: "text-[13px] font-semibold uppercase tracking-wider text-[#86efac]",
    price: "mt-3 text-[40px] font-extrabold leading-none tracking-tight text-white",
    note: "text-[13px] text-[#bbf7d0]",
    check: "#86efac",
    text: "text-[#d1fae5]",
    cta: "rounded-lg border border-white/20 px-5 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-white/10",
  },
  lifetime: {
    card: "relative flex h-full flex-col rounded-xl border border-[#86efac]/30 bg-gradient-to-b from-[#166534]/40 to-[#0f3d22] p-6",
    name: "text-[13px] font-semibold uppercase tracking-wider text-[#86efac]",
    price: "mt-3 text-[40px] font-extrabold leading-none tracking-tight text-white",
    note: "text-[13px] text-[#bbf7d0]",
    check: "#86efac",
    text: "text-[#d1fae5]",
    cta: "rounded-lg bg-[#86efac] px-5 py-2.5 text-center text-[14px] font-bold text-[#0f3d22] transition hover:bg-[#6ee7b7]",
  },
};

const PLAN_TARGETS: Record<string, string> = {
  free: "#generate",
  pro: "/dashboard?tab=billing",
  teams: "/dashboard?tab=billing",
  lifetime: "/dashboard?tab=billing",
};

export function ProPricing() {
  return (
    <section id="pricing" className="scroll-mt-16 bg-[#0f3d22] px-6 py-20 text-white md:py-28">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <h2 className="text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
            Simple pricing.
            <span className="block text-[#86efac]">Pick what fits.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-center text-[17px] leading-relaxed text-[#bbf7d0]">
            The free generator stays free, forever. Upgrade when you need
            more — or lock in lifetime access while you can.
          </p>
        </Reveal>

        <div className="mx-auto mt-14 grid max-w-[1100px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_PITCHES.map((plan, i) => {
            const s = STYLES[plan.id];
            return (
              <Reveal key={plan.id} delay={i * 80}>
                <div className={s.card}>
                  {plan.tag ? (
                    <span
                      className={`absolute -top-3 right-6 rounded-full px-3 py-1 text-[11px] font-bold ${
                        plan.id === "pro"
                          ? "bg-[#166534] text-white"
                          : "bg-[#86efac] text-[#0f3d22]"
                      }`}
                    >
                      {plan.tag}
                    </span>
                  ) : null}
                  <p className={s.name}>{plan.name}</p>
                  <p className={s.price}>{plan.price}</p>
                  <p className={s.note}>{plan.priceNote}</p>
                  <ul className="mt-6 space-y-3 text-[14px]">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 ${s.text}`}>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={s.check}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="mt-0.5 shrink-0"
                          aria-hidden="true"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={PLAN_TARGETS[plan.id]}
                    className={`mt-auto ${s.cta}`}
                  >
                    {plan.cta}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={300}>
          <p className="mt-10 text-center text-[12px] text-[#86efac]">
            New accounts get 50% off Lifetime — your personal code lands in your welcome email.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
