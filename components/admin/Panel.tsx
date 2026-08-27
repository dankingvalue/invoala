export function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
      {children}
    </section>
  );
}

export function SectionHead({
  title,
  subtitle,
  pro,
}: {
  title: string;
  subtitle?: string;
  pro?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {pro ? (
          <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-white">
            PRO
          </span>
        ) : null}
      </div>
      {subtitle ? <p className="mt-1 text-[13px] text-subtle">{subtitle}</p> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight">{value}</p>
      {sub ? <p className="mt-1.5 text-xs text-subtle">{sub}</p> : null}
    </div>
  );
}
