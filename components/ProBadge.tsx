// Small inline "this needs Pro" indicator — used next to any action a free
// user can see but can't use, so the gate is visible before they click, not
// just an error after. Server-side enforcement lives in lib/entitlements.ts;
// this is purely the "clear whatever" that tells them why.
export function ProBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-[#166534] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
      Pro
    </span>
  );
}
