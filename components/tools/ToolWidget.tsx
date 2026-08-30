"use client";

import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ToolKind } from "@/lib/tool-content";

const inputCls =
  "w-full rounded-xl border border-[#e5e7eb] bg-white px-3.5 py-2.5 text-[15px] text-[#111827] outline-none transition placeholder:text-[#6b7280] focus:border-[#166534] focus:ring-[3px] focus:ring-[#166534]/20";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#6b7280]">{label}</label>
      {children}
      {hint ? <p className="mt-1 text-[12px] text-[#6b7280]">{hint}</p> : null}
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#166534]/15 bg-[#f0fdf4] px-4 py-3">
      <p className="text-[12px] font-medium uppercase tracking-wide text-[#166534]">{label}</p>
      <p className="mt-0.5 text-[22px] font-bold text-[#111827]">{value}</p>
    </div>
  );
}

function fmt(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function num(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

type WidgetResult =
  | { kind: "numbers"; numbers: string[] }
  | { kind: "late"; interest: number; fee: number; total: number }
  | { kind: "tax"; tax: number; total: number }
  | { kind: "rate"; rate: number }
  | { kind: "margin"; profit: number; margin: number }
  | { kind: "markup"; price: number; profit: number; margin: number }
  | { kind: "vat"; vat: number; other: number }
  | { kind: "due-date"; dueDate: Date | null; daysLeft: number | null };

function parseDate(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v + (v.length === 10 ? "T00:00:00" : ""));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function ToolWidget({ kind }: { kind: ToolKind }) {
  useEffect(() => {
    trackEvent("tool_started", { tool: kind });
  }, [kind]);

  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [d, setD] = useState("");
  const [mode, setMode] = useState<"add" | "remove">("add");
  const [copied, setCopied] = useState(false);

  const result = useMemo<WidgetResult | null>(() => {
    switch (kind) {
      case "invoice-number-generator": {
        const prefix = a.trim() || "INV";
        const start = Math.max(1, Math.floor(num(b) || 1));
        const count = Math.min(500, Math.max(1, Math.floor(num(c) || 10)));
        return { kind: "numbers", numbers: Array.from({ length: count }, (_, i) => `${prefix}-${String(start + i).padStart(3, "0")}`) };
      }
      case "late-payment-calculator": {
        const amount = num(a);
        const days = num(b);
        const annualRate = num(c);
        const fee = num(d);
        const interest = amount * (annualRate / 100) * (days / 365);
        return { kind: "late", interest, fee, total: amount + interest + fee };
      }
      case "invoice-tax-calculator": {
        const subtotal = num(a);
        const rate = num(b);
        const tax = subtotal * (rate / 100);
        return { kind: "tax", tax, total: subtotal + tax };
      }
      case "hourly-rate-calculator": {
        const income = num(a);
        const costs = num(b);
        const hours = num(c);
        return { kind: "rate", rate: hours > 0 ? (income + costs) / hours : 0 };
      }
      case "profit-margin-calculator": {
        const price = num(a);
        const cost = num(b);
        const profit = price - cost;
        return { kind: "margin", profit, margin: price > 0 ? (profit / price) * 100 : 0 };
      }
      case "markup-calculator": {
        const cost = num(a);
        const markup = num(b);
        const price = cost * (1 + markup / 100);
        return { kind: "markup", price, profit: price - cost, margin: price > 0 ? ((price - cost) / price) * 100 : 0 };
      }
      case "vat-calculator": {
        const amount = num(a);
        const rate = num(b);
        if (mode === "add") {
          const vat = amount * (rate / 100);
          return { kind: "vat", vat, other: amount + vat };
        }
        const net = rate === 100 ? amount / 2 : amount / (1 + rate / 100);
        return { kind: "vat", vat: amount - net, other: net };
      }
      case "invoice-due-date-calculator": {
        const issue = parseDate(a);
        const netDays = Math.max(0, Math.floor(num(b) || 0));
        if (!issue) return { kind: "due-date", dueDate: null, daysLeft: null };
        const due = new Date(issue);
        due.setDate(due.getDate() + netDays);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysLeft = Math.round((due.getTime() - today.getTime()) / 86400000);
        return { kind: "due-date", dueDate: due, daysLeft };
      }
    }
  }, [kind, a, b, c, d, mode]);

  async function copyNumbers() {
    if (result?.kind !== "numbers") return;
    try {
      await navigator.clipboard.writeText(result.numbers.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        {kind === "invoice-number-generator" ? (
          <>
            <Field label="Prefix" hint="Shown before the number, e.g. INV">
              <input className={inputCls} value={a} onChange={(e) => setA(e.target.value)} placeholder="INV" />
            </Field>
            <Field label="Starting number">
              <input className={inputCls} inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} placeholder="1" />
            </Field>
            <Field label="How many numbers?">
              <input className={inputCls} inputMode="numeric" value={c} onChange={(e) => setC(e.target.value)} placeholder="10" />
            </Field>
          </>
        ) : null}

        {kind === "late-payment-calculator" ? (
          <>
            <Field label="Invoice amount">
              <input className={inputCls} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="1000" />
            </Field>
            <Field label="Days overdue">
              <input className={inputCls} inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} placeholder="45" />
            </Field>
            <Field label="Annual interest rate (%)">
              <input className={inputCls} inputMode="decimal" value={c} onChange={(e) => setC(e.target.value)} placeholder="8" />
            </Field>
            <Field label="Late fee (optional)">
              <input className={inputCls} inputMode="decimal" value={d} onChange={(e) => setD(e.target.value)} placeholder="20" />
            </Field>
          </>
        ) : null}

        {kind === "invoice-tax-calculator" ? (
          <>
            <Field label="Subtotal">
              <input className={inputCls} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="850" />
            </Field>
            <Field label="Tax rate (%)">
              <input className={inputCls} inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="20" />
            </Field>
          </>
        ) : null}

        {kind === "hourly-rate-calculator" ? (
          <>
            <Field label="Target annual income">
              <input className={inputCls} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="80000" />
            </Field>
            <Field label="Annual business costs">
              <input className={inputCls} inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="12000" />
            </Field>
            <Field label="Billable hours per year" hint="e.g. 1,200 for a full-time freelancer">
              <input className={inputCls} inputMode="numeric" value={c} onChange={(e) => setC(e.target.value)} placeholder="1200" />
            </Field>
          </>
        ) : null}

        {kind === "profit-margin-calculator" ? (
          <>
            <Field label="Selling price">
              <input className={inputCls} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="500" />
            </Field>
            <Field label="Cost to deliver">
              <input className={inputCls} inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="350" />
            </Field>
          </>
        ) : null}

        {kind === "markup-calculator" ? (
          <>
            <Field label="Cost">
              <input className={inputCls} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="80" />
            </Field>
            <Field label="Markup (%)">
              <input className={inputCls} inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="60" />
            </Field>
          </>
        ) : null}

        {kind === "vat-calculator" ? (
          <>
            <div className="sm:col-span-2">
              <div className="inline-flex rounded-full bg-[#f3f4f6] p-1">
                {(["add", "remove"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
                      mode === m ? "bg-white text-[#111827] shadow-sm" : "text-[#6b7280] hover:text-[#111827]"
                    }`}
                  >
                    {m === "add" ? "Add VAT" : "Remove VAT"}
                  </button>
                ))}
              </div>
            </div>
            <Field label={mode === "add" ? "Net amount" : "Gross amount"}>
              <input className={inputCls} inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} placeholder="200" />
            </Field>
            <Field label="VAT rate (%)">
              <input className={inputCls} inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} placeholder="20" />
            </Field>
          </>
        ) : null}

        {kind === "invoice-due-date-calculator" ? (
          <>
            <Field label="Invoice date">
              <input type="date" className={inputCls} value={a} onChange={(e) => setA(e.target.value)} />
            </Field>
            <Field label="Payment terms" hint="Number of days until payment is due">
              <input className={inputCls} inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} placeholder="30" />
            </Field>
            <div className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {[7, 14, 30, 45, 60, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setB(String(d))}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                      String(d) === b.trim()
                        ? "bg-[#166534] text-white"
                        : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
                    }`}
                  >
                    Net {d}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-6 border-t border-[#e5e7eb] pt-5">
        {kind === "invoice-number-generator" && result?.kind === "numbers" ? (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[13px] font-medium text-[#6b7280]">Generated numbers</p>
              <button
                type="button"
                onClick={() => void copyNumbers()}
                className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12px] font-medium text-[#166534] transition hover:bg-[#f0fdf4]"
              >
                {copied ? "Copied!" : "Copy list"}
              </button>
            </div>
            <div className="flex max-h-56 flex-wrap gap-2 overflow-y-auto">
              {result.numbers.map((n) => (
                <span key={n} className="rounded-lg bg-[#f3f4f6] px-3 py-1.5 font-mono text-[13px] text-[#111827]">
                  {n}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {kind === "late-payment-calculator" && result?.kind === "late" ? (
              <>
                <Result label="Interest due" value={`$${fmt(result.interest)}`} />
                <Result label="Late fee" value={`$${fmt(result.fee)}`} />
                <Result label="Total due" value={`$${fmt(result.total)}`} />
              </>
            ) : null}
            {kind === "invoice-tax-calculator" && result?.kind === "tax" ? (
              <>
                <Result label="Tax" value={`$${fmt(result.tax)}`} />
                <Result label="Total" value={`$${fmt(result.total)}`} />
              </>
            ) : null}
            {kind === "hourly-rate-calculator" && result?.kind === "rate" ? (
              <Result label="Required hourly rate" value={`$${fmt(result.rate)}`} />
            ) : null}
            {kind === "profit-margin-calculator" && result?.kind === "margin" ? (
              <>
                <Result label="Profit" value={`$${fmt(result.profit)}`} />
                <Result label="Margin" value={`${fmt(result.margin)}%`} />
              </>
            ) : null}
            {kind === "markup-calculator" && result?.kind === "markup" ? (
              <>
                <Result label="Selling price" value={`$${fmt(result.price)}`} />
                <Result label="Profit" value={`$${fmt(result.profit)}`} />
                <Result label="Margin" value={`${fmt(result.margin)}%`} />
              </>
            ) : null}
            {kind === "vat-calculator" && result?.kind === "vat" ? (
              <>
                <Result label={mode === "add" ? "VAT amount" : "VAT included"} value={`$${fmt(result.vat)}`} />
                <Result label={mode === "add" ? "Gross total" : "Net amount"} value={`$${fmt(result.other)}`} />
              </>
            ) : null}
            {kind === "invoice-due-date-calculator" && result?.kind === "due-date" ? (
              <>
                <Result
                  label="Payment due"
                  value={result.dueDate ? result.dueDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "—"}
                />
                <Result
                  label="Days remaining"
                  value={result.daysLeft === null ? "—" : result.daysLeft < 0 ? `${Math.abs(result.daysLeft)} days overdue` : `${result.daysLeft} days`}
                />
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
