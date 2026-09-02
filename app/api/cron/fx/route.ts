import { ensureLatestRates } from "@/lib/fx";

export const dynamic = "force-dynamic";

// Daily job (see vercel.json): snapshot FX rates so invoice totals can be
// converted using the rate near each invoice's creation date.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rates = await ensureLatestRates(true).catch(() => null);
  return Response.json({ ok: !!rates, currencies: rates ? Object.keys(rates).length : 0 });
}
