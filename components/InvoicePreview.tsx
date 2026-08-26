import {
  computeTotals,
  formatDate,
  formatMoney,
  type Invoice,
} from "@/lib/invoice";

const ink = "#1d1d1f";
const subtle = "#6e6e73";
const faint = "#c7c7cc";
const hairline = "#e8e8ed";

export function InvoicePreview({
  invoice,
  innerRef,
}: {
  invoice: Invoice;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const { subtotal, taxAmount, total } = computeTotals(invoice);
  const businessName = invoice.businessName.trim() || "Your Company";
  const clientName = invoice.clientName.trim() || "Client Name";
  const isQuote = invoice.docType === "quote";
  const docTitle = isQuote ? "Quote" : "Invoice";
  const dueLabel = isQuote ? "Valid until" : "Due";

  return (
    <div
      ref={innerRef}
      style={{ background: "#ffffff", color: ink, fontFamily: "inherit" }}
      className="w-full rounded-2xl p-8 sm:p-10"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          {invoice.logoDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={invoice.logoDataUrl}
              alt=""
              className="mb-4 max-h-14 max-w-[160px] object-contain"
            />
          ) : null}
          <p className="text-xl font-semibold tracking-tight" style={{ color: ink }}>
            {businessName}
          </p>
          <div className="mt-2 whitespace-pre-line text-xs leading-relaxed" style={{ color: subtle }}>
            {invoice.businessAddress || "Your address"}
            <br />
            {invoice.businessEmail || "you@example.com"}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className="text-[28px] font-semibold uppercase leading-none tracking-tight"
            style={{ color: ink }}
          >
            {docTitle}
          </p>
          <table className="mt-4 text-xs" style={{ color: subtle }}>
            <tbody>
              <tr>
                <td className="pr-4 pb-1 text-right">Invoice #</td>
                <td className="pb-1 font-medium" style={{ color: ink }}>
                  {invoice.invoiceNumber || "—"}
                </td>
              </tr>
              <tr>
                <td className="pr-4 pb-1 text-right">Issued</td>
                <td className="pb-1 font-medium" style={{ color: ink }}>
                  {formatDate(invoice.issueDate) || "—"}
                </td>
              </tr>
              <tr>
                <td className="pr-4 text-right">{dueLabel}</td>
                <td className="font-medium" style={{ color: ink }}>
                  {formatDate(invoice.dueDate) || "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: faint }}>
          Billed to
        </p>
        <p className="mt-1.5 text-sm font-semibold" style={{ color: ink }}>
          {clientName}
        </p>
        <div className="mt-1 whitespace-pre-line text-xs leading-relaxed" style={{ color: subtle }}>
          {invoice.clientAddress || "Client address"}
          {invoice.clientEmail ? (
            <>
              <br />
              {invoice.clientEmail}
            </>
          ) : null}
        </div>
      </div>

      <table className="mt-10 w-full text-left text-xs">
        <thead>
          <tr className="border-b" style={{ borderColor: subtle }}>
            <th className="pb-2 font-semibold uppercase tracking-wider" style={{ color: subtle }}>
              Description
            </th>
            <th className="pb-2 text-right font-semibold uppercase tracking-wider" style={{ color: subtle }}>
              Qty
            </th>
            <th className="pb-2 text-right font-semibold uppercase tracking-wider" style={{ color: subtle }}>
              Rate
            </th>
            <th className="pb-2 text-right font-semibold uppercase tracking-wider" style={{ color: subtle }}>
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id} className="border-b" style={{ borderColor: hairline }}>
              <td className="py-2.5 pr-4" style={{ color: item.description ? ink : faint }}>
                {item.description || "Item description"}
              </td>
              <td className="py-2.5 text-right tabular-nums" style={{ color: subtle }}>
                {item.quantity}
              </td>
              <td className="py-2.5 text-right tabular-nums" style={{ color: subtle }}>
                {formatMoney(item.rate, invoice.currency)}
              </td>
              <td className="py-2.5 text-right tabular-nums" style={{ color: ink }}>
                {formatMoney(item.quantity * item.rate, invoice.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 flex justify-end">
        <table className="w-full max-w-[240px] text-xs">
          <tbody>
            <tr>
              <td className="pb-1.5" style={{ color: subtle }}>
                Subtotal
              </td>
              <td className="pb-1.5 text-right tabular-nums" style={{ color: ink }}>
                {formatMoney(subtotal, invoice.currency)}
              </td>
            </tr>
            <tr>
              <td className="pb-1.5" style={{ color: subtle }}>
                Tax ({invoice.taxRate}%)
              </td>
              <td className="pb-1.5 text-right tabular-nums" style={{ color: ink }}>
                {formatMoney(taxAmount, invoice.currency)}
              </td>
            </tr>
            <tr className="border-t-2" style={{ borderColor: ink }}>
              <td className="pt-2.5 text-sm font-semibold" style={{ color: ink }}>
                Total due
              </td>
              <td className="pt-2.5 text-right text-sm font-semibold tabular-nums" style={{ color: ink }}>
                {formatMoney(total, invoice.currency)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {invoice.recurring ? (
        <div className="mt-6 flex justify-end">
          <p
            className="rounded-full px-3.5 py-1.5 text-xs font-medium"
            style={{ background: "#f5f5f7", color: subtle }}
          >
            {invoice.recurring.charAt(0).toUpperCase() + invoice.recurring.slice(1)}
          </p>
        </div>
      ) : null}

      {invoice.notes ? (
        <div className="mt-10 border-t pt-5" style={{ borderColor: hairline }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: faint }}>
            Notes
          </p>
          <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed" style={{ color: subtle }}>
            {invoice.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
}
