import { runRecurringPass } from "@/lib/recurring";

export const dynamic = "force-dynamic";

// Daily job (see vercel.json): generates + emails due recurring invoices for
// paying users and stores the new invoice in their dashboard.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const expected = process.env.CRON_SECRET;
  if (!expected || auth !== `Bearer ${expected}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runRecurringPass().catch((err) => {
    console.error("[cron:recurring] failed", err);
    return { generated: 0, scanned: 0 };
  });

  return Response.json({ ok: true, ...result });
}
