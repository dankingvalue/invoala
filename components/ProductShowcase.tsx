import { Reveal } from "@/components/Reveal";

// Small "peek inside the product" mockups — built from the app's own real
// UI tokens (status badge colors, card styles) rather than screenshots, so
// they stay crisp at any size and never go stale when the real UI changes.
// Every tile maps to something Invoala actually does today; nothing here is
// aspirational copy.

function MockCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[190px] items-center justify-center overflow-hidden rounded-2xl bg-[#f3f4f6] p-5">
      <div className="w-full max-w-[220px] rounded-xl bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
        {children}
      </div>
    </div>
  );
}

function ServicesMock() {
  return (
    <>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">Items</p>
      <div className="mt-1.5 rounded-lg border border-[#e5e7eb] px-2 py-1.5 text-[11px] text-[#9ca3af]">
        + Add service
      </div>
      <p className="mt-2.5 text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">Saved services</p>
      <div className="mt-1 flex items-center justify-between rounded-lg bg-[#f9fafb] px-2 py-1.5">
        <span className="text-[11px] font-medium text-ink">Monthly retainer</span>
        <span className="text-[11px] tabular-nums text-[#166534]">$7,500</span>
      </div>
    </>
  );
}

function ClientsMock() {
  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#166534] text-[10px] font-bold text-white">
          C
        </div>
        <span className="text-[12px] font-semibold text-ink">Carter &amp; Finch</span>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
        <div className="rounded-lg bg-[#f9fafb] py-1.5">
          <p className="text-[11px] font-bold text-ink">$12K</p>
          <p className="text-[8px] text-[#9ca3af]">Billed</p>
        </div>
        <div className="rounded-lg bg-[#f9fafb] py-1.5">
          <p className="text-[11px] font-bold text-ink">3</p>
          <p className="text-[8px] text-[#9ca3af]">Invoices</p>
        </div>
        <div className="rounded-lg bg-[#e8f8ee] py-1.5">
          <p className="text-[11px] font-bold text-[#00875a]">Active</p>
          <p className="text-[8px] text-[#9ca3af]">Status</p>
        </div>
      </div>
    </>
  );
}

function TaxMock() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink">Tax · 10% VAT</span>
        <span className="h-3.5 w-6 rounded-full bg-[#166534]" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-ink">Discount</span>
        <span className="h-3.5 w-6 rounded-full bg-[#166534]" />
      </div>
      <div className="flex items-center justify-between border-t border-[#f3f4f6] pt-2 text-[11px] font-semibold">
        <span className="text-[#9ca3af]">Total</span>
        <span className="text-ink">$2,750.00</span>
      </div>
    </div>
  );
}

function TrackingMock() {
  const rows = [
    { label: "Sent", cls: "bg-[#e0f2fe] text-[#0369a1]" },
    { label: "Paid", cls: "bg-[#e8f8ee] text-[#00875a]" },
    { label: "Overdue", cls: "bg-[#fef2f2] text-[#d70015]" },
  ];
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between rounded-lg bg-[#f9fafb] px-2 py-1.5">
          <span className="text-[11px] text-ink">INV-100{r.label.length}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${r.cls}`}>{r.label}</span>
        </div>
      ))}
    </div>
  );
}

function TeamMock() {
  return (
    <>
      <div className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-2 py-1.5">
        <span className="text-[11px] text-ink">Acme Design Studio</span>
        <span className="ml-auto text-[9px] text-[#9ca3af]">▾</span>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#166534] text-[9px] font-bold text-white ring-2 ring-white">D</div>
        <div className="-ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#0369a1] text-[9px] font-bold text-white ring-2 ring-white">J</div>
        <div className="-ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#92600a] text-[9px] font-bold text-white ring-2 ring-white">M</div>
        <span className="ml-1.5 rounded-full bg-[#111827] px-1.5 py-0.5 text-[9px] font-semibold text-white">Owner</span>
      </div>
    </>
  );
}

function ShareLinkMock() {
  return (
    <>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">Invoice link</p>
      <div className="mt-1.5 truncate rounded-lg bg-[#f9fafb] px-2 py-1.5 text-[10px] text-[#6b7280]">
        invoala.com/i/8f21a…
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[#00875a]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#00875a]" />
        Viewed 2 minutes ago
      </div>
    </>
  );
}

const showcase = [
  { title: "Reusable services", copy: "So repeat line items are ready instantly.", Mock: ServicesMock },
  { title: "Client records", copy: "To keep every invoice in context.", Mock: ClientsMock },
  { title: "Taxes and discounts", copy: "To handle adjustments without manual math.", Mock: TaxMock },
  { title: "Payment tracking", copy: "So you always know what's open.", Mock: TrackingMock },
  { title: "Team workspaces", copy: "To share clients and invoices with your team.", Mock: TeamMock },
  { title: "Instant share links", copy: "To send a live link, not just a PDF.", Mock: ShareLinkMock },
];

function BrandMock() {
  return (
    <div className="w-full max-w-[240px] rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#166534]">
            <svg width="10" height="10" viewBox="0 0 64 64" aria-hidden="true">
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
          </div>
          <span className="text-[12px] font-bold text-ink">Acme Studio</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#166534]">Invoice</span>
      </div>
      <p className="mt-3 font-mono text-[9px] text-[#9ca3af]">INV-0006</p>
      <div className="mt-2 h-1 w-full rounded-full bg-[#166534]/15">
        <div className="h-1 w-2/3 rounded-full bg-[#166534]" />
      </div>
    </div>
  );
}

function PaymentDetailsMock() {
  return (
    <div className="w-full max-w-[240px] rounded-xl bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-ink">Payment instructions</span>
        <span className="h-3.5 w-6 rounded-full bg-[#166534]" />
      </div>
      <div className="mt-2.5 rounded-lg bg-[#f9fafb] px-2.5 py-2 text-[10px] leading-relaxed text-[#6b7280]">
        Bank transfer — account ending 4421. Reference the invoice number.
      </div>
    </div>
  );
}

function AtAGlanceMock() {
  const cols = [
    { label: "Open", value: "$5,250", cls: "text-ink" },
    { label: "Overdue", value: "$1,500", cls: "text-[#d70015]" },
    { label: "Paid", value: "$500", cls: "text-[#00875a]" },
  ];
  return (
    <div className="grid w-full max-w-[280px] grid-cols-3 gap-2">
      {cols.map((c) => (
        <div key={c.label} className="rounded-xl bg-white p-3 text-center shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-[#9ca3af]">{c.label}</p>
          <p className={`mt-1 text-[13px] font-bold tabular-nums ${c.cls}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}

const benefits = [
  { title: "Look professional", copy: "Give every client a polished, branded invoice that feels like your business.", Mock: BrandMock },
  { title: "Add your payment details", copy: "Bank transfer, PayPal, whatever you use — right on the invoice, every time.", Mock: PaymentDetailsMock },
  { title: "Stay on top of it", copy: "Keep cash flow healthy with a clear view of what's paid, due, or overdue.", Mock: AtAGlanceMock },
];

export function ProductShowcase() {
  return (
    <>
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1024px]">
          <Reveal>
            <h2 className="mx-auto max-w-[640px] text-center text-[36px] font-extrabold tracking-tight md:text-[52px]">
              Invoala lifts the effort off every invoice.
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] text-center text-[17px] font-medium leading-relaxed text-subtle">
              From saved services to team workspaces and live share links, Invoala gives
              you the small tools that make every invoice faster to finish.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((item, i) => (
              <Reveal key={item.title} delay={i * 80}>
                <div>
                  <MockCard>
                    <item.Mock />
                  </MockCard>
                  <h3 className="mt-4 text-[15px] font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-subtle">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f3f4f6] px-6 py-16 md:py-24">
        <div className="mx-auto max-w-[1024px]">
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-3">
            {benefits.map((item, i) => (
              <Reveal key={item.title} delay={i * 100}>
                <div>
                  <div className="flex h-[150px] items-center justify-center rounded-2xl bg-white p-5 ring-1 ring-black/5">
                    <item.Mock />
                  </div>
                  <h3 className="mt-5 text-[16px] font-bold tracking-tight">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-subtle">{item.copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
