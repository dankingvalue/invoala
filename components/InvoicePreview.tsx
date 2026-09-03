import {
  computeTotals,
  docTitle,
  formatDate,
  formatMoney,
  themeColor,
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
  const { subtotal, taxAmount, total, discountAmount, shipping } = computeTotals(invoice);
  const businessName = invoice.businessName.trim() || "Your Company";
  const clientName = invoice.clientName.trim() || "Client Name";
  const accent = themeColor(invoice.theme);
  const isQuote = invoice.docType === "quote" || invoice.docType === "estimate";
  const isReceipt = invoice.docType === "receipt";
  const docTitleText = docTitle(invoice.docType);
  const dueLabel = isQuote ? "Valid until" : isReceipt ? "Received" : "Due";
  const metaLabel = isReceipt ? "Receipt #" : `${docTitleText} #`;

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
            style={{ color: accent }}
          >
            {docTitleText}
          </p>
          {isReceipt && total > 0 ? (
            <p className="mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white" style={{ background: accent }}>
              Paid
            </p>
          ) : null}
          <table className="mt-4 text-xs" style={{ color: subtle }}>
            <tbody>
              <tr>
                <td className="pr-4 pb-1 text-right">{metaLabel}</td>
                <td className="pb-1 font-medium" style={{ color: ink }}>
                  {invoice.invoiceNumber || "—"}
                </td>
              </tr>
              <tr>
                <td className="pr-4 pb-1 text-right">{isReceipt ? "Date paid" : "Issued"}</td>
                <td className="pb-1 font-medium" style={{ color: ink }}>
                  {formatDate(invoice.issueDate) || "—"}
                </td>
              </tr>
              <tr>
                <td className="pr-4 text-right">{dueLabel}</td>
                <td className="font-medium" style={{ color: ink }}>
                  {isReceipt ? formatDate(invoice.dueDate) || formatDate(invoice.issueDate) || "—" : formatDate(invoice.dueDate) || "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: faint }}>
          {isReceipt ? "Received from" : "Billed to"}
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
          <tr className="border-b" style={{ borderColor: accent }}>
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
            {discountAmount > 0 ? (
              <tr>
                <td className="pb-1.5" style={{ color: subtle }}>
                  {invoice.discountMode === "fixed"
                    ? `Discount (${formatMoney(discountAmount, invoice.currency)})`
                    : `Discount (${invoice.discount}%)`}
                </td>
                <td className="pb-1.5 text-right tabular-nums" style={{ color: ink }}>
                  &minus;{formatMoney(discountAmount, invoice.currency)}
                </td>
              </tr>
            ) : null}
            {shipping > 0 ? (
              <tr>
                <td className="pb-1.5" style={{ color: subtle }}>
                  Shipping
                </td>
                <td className="pb-1.5 text-right tabular-nums" style={{ color: ink }}>
                  {formatMoney(shipping, invoice.currency)}
                </td>
              </tr>
            ) : null}
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
            {invoice.amountPaid && invoice.amountPaid > 0 ? (
              <>
                <tr>
                  <td className="pt-2 text-xs" style={{ color: subtle }}>
                    Paid
                  </td>
                  <td className="pt-2 text-right text-xs tabular-nums" style={{ color: "#00875a" }}>
                    &minus;{formatMoney(invoice.amountPaid, invoice.currency)}
                  </td>
                </tr>
                <tr className="border-t" style={{ borderColor: hairline }}>
                  <td className="pt-2 text-xs font-semibold" style={{ color: ink }}>
                    Balance due
                  </td>
                  <td className="pt-2 text-right text-xs font-semibold tabular-nums" style={{ color: ink }}>
                    {formatMoney(Math.max(0, total - invoice.amountPaid), invoice.currency)}
                  </td>
                </tr>
              </>
            ) : null}
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

      {(invoice.customFields ?? []).filter((f) => f.label.trim() || f.value.trim()).length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-2 border-t pt-5" style={{ borderColor: hairline }}>
          {(invoice.customFields ?? [])
            .filter((f) => f.label.trim() || f.value.trim())
            .map((f) => (
              <div key={f.id}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: faint }}>
                  {f.label.trim() || "Field"}
                </p>
                <p className="mt-0.5 text-xs whitespace-pre-line" style={{ color: ink }}>
                  {f.value.trim() || "—"}
                </p>
              </div>
            ))}
        </div>
      ) : null}

      {invoice.paymentEnabled && (invoice.paymentInstructions || invoice.paymentLink) ? (
        <div className="mt-8 border-t pt-5" style={{ borderColor: hairline }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: faint }}>
            How to pay
          </p>
          {invoice.paymentInstructions ? (
            <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed" style={{ color: subtle }}>
              {invoice.paymentInstructions}
            </p>
          ) : null}
          {invoice.paymentLink ? (
            <a
              href={invoice.paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block rounded-full px-5 py-2 text-xs font-semibold text-white"
              style={{ background: accent }}
            >
              Pay online
            </a>
          ) : null}
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
