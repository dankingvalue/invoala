import { getSessionUser } from "@/lib/server-auth";
import { submitToIndexNow } from "@/lib/indexnow";
import { logAudit } from "@/lib/audit";
import sitemap from "@/app/sitemap";

// Submits every URL already in the real sitemap — one list, no separate
// hand-maintained copy that could drift from what's actually public.
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = sitemap().map((entry) => entry.url);
  const result = await submitToIndexNow(urls);

  if (result.ok) {
    await logAudit({
      action: "settings_change",
      targetType: "indexnow",
      details: { urlCount: urls.length, status: result.status },
      req,
    });
    return Response.json({ ok: true, submitted: urls.length });
  }
  return Response.json({ error: result.error || "IndexNow submission failed." }, { status: 502 });
}
