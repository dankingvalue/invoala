import { Reveal } from "@/components/Reveal";

const freeFeatures = [
  "Unlimited invoices & quotes",
  "All 154 currencies",
  "PDF download & print",
  "No watermark, no sign-up",
];

const proFeatures = [
  "Everything in Free",
  "Saved client profiles & history",
  "Recurring invoices on autopilot",
  "Quotes & estimates",
  "Multi-business profiles",
  "Priority support",
];

const teamsFeatures = [
  "Everything in Pro",
  "Up to 5 team members",
  "Shared client book",
  "Role-based permissions",
  "Invoice assignments & tracking",
  "Priority support",
];

const lifetimeFeatures = [
  "Everything in Pro",
  "One-time payment, forever access",
  "All future Pro features included",
  "No recurring charges",
  "Priority support",
];

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
          {/* Free */}
          <Reveal>
            <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-[#86efac]">
                Free
              </p>
              <p className="mt-3 text-[40px] font-extrabold leading-none tracking-tight">
                $0
              </p>
              <ul className="mt-6 space-y-3 text-[14px] text-[#d1fae5]">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="#generate"
                className="mt-auto rounded-lg border border-white/20 px-5 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                Start free
              </a>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={80}>
            <div className="relative flex h-full flex-col rounded-xl border border-[#166534] bg-white p-6 text-ink">
              <span className="absolute -top-3 right-6 rounded-full bg-[#166534] px-3 py-1 text-[11px] font-bold text-white">
                Popular
              </span>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Pro
              </p>
              <p className="mt-3 text-[40px] font-extrabold leading-none tracking-tight">
                $9
                <span className="text-lg font-medium text-[#6b7280]">/mo</span>
              </p>
              <p className="text-[13px] text-[#6b7280]">or $79/yr (save 27%)</p>
              <ul className="mt-6 space-y-3 text-[14px] text-[#374151]">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard?tab=billing"
                className="mt-auto rounded-lg bg-[#14532d] px-5 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-[#0f3d22]"
              >
                Get Pro
              </a>
            </div>
          </Reveal>

          {/* Teams */}
          <Reveal delay={160}>
            <div className="flex h-full flex-col rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="text-[13px] font-semibold uppercase tracking-wider text-[#86efac]">
                Teams
              </p>
              <p className="mt-3 text-[40px] font-extrabold leading-none tracking-tight">
                $29
                <span className="text-lg font-medium text-[#bbf7d0]">/mo</span>
              </p>
              <p className="text-[13px] text-[#bbf7d0]">or $249/yr (save 29%)</p>
              <ul className="mt-6 space-y-3 text-[14px] text-[#d1fae5]">
                {teamsFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard?tab=billing"
                className="mt-auto rounded-lg border border-white/20 px-5 py-2.5 text-center text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                Get Teams
              </a>
            </div>
          </Reveal>

          {/* Lifetime */}
          <Reveal delay={240}>
            <div className="relative flex h-full flex-col rounded-xl border border-[#86efac]/30 bg-gradient-to-b from-[#166534]/40 to-[#0f3d22] p-6">
              <span className="absolute -top-3 right-6 rounded-full bg-[#86efac] px-3 py-1 text-[11px] font-bold text-[#0f3d22]">
                Best value
              </span>
              <p className="text-[13px] font-semibold uppercase tracking-wider text-[#86efac]">
                Lifetime
              </p>
              <p className="mt-3 text-[40px] font-extrabold leading-none tracking-tight">
                $499
              </p>
              <p className="text-[13px] text-[#bbf7d0]">One-time, forever</p>
              <ul className="mt-6 space-y-3 text-[14px] text-[#d1fae5]">
                {lifetimeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/dashboard?tab=billing"
                className="mt-auto rounded-lg bg-[#86efac] px-5 py-2.5 text-center text-[14px] font-bold text-[#0f3d22] transition hover:bg-[#6ee7b7]"
              >
                Get Lifetime
              </a>
            </div>
          </Reveal>
        </div>

        <Reveal delay={300}>
          <p className="mt-10 text-center text-[12px] text-[#86efac]">
            Early adopters get 50% off their first year. No credit card required.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
