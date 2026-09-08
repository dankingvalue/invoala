import { describe, expect, it } from "vitest";
import { statementPdfBuffer } from "@/lib/statement-pdf";
import type { StatementData } from "@/lib/statement-html";

function sampleStatement(over: Partial<StatementData> = {}): StatementData {
  return {
    business: {
      name: "Acme Studio",
      addressLines: "123 Main St\nNairobi",
      email: "hello@acme.studio",
      logoDataUrl: "",
      accent: "#166534",
    },
    client: {
      name: "Globex Corp",
      contactName: "Jane Doe",
      email: "bill@globex.com",
      phone: "+254700000000",
      addressLines: "1 Loop Rd\nMombasa",
      taxNumber: "TAX-123",
    },
    currency: "USD",
    rows: [
      { date: Date.parse("2026-01-05"), label: "Invoice INV-001", debit: 500, credit: 0 },
      { date: Date.parse("2026-01-20"), label: "Payment received — INV-001", debit: 0, credit: 200 },
    ],
    openingBalance: 0,
    closingBalance: 300,
    generatedAt: Date.now(),
    ...over,
  };
}

describe("statementPdfBuffer", () => {
  it("produces a valid-looking PDF buffer", async () => {
    const { buffer } = await statementPdfBuffer(sampleStatement());
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("renders an empty statement (no ledger rows) without throwing", async () => {
    const { buffer } = await statementPdfBuffer(sampleStatement({ rows: [], closingBalance: 0 }));
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
