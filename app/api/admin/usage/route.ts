import { getSessionUser } from "@/lib/server-auth";
import { getUsageStats } from "@/lib/usage";
import { resolveRange } from "@/lib/date-range";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const { from, to } = resolveRange(
    url.searchParams.get("range"),
    url.searchParams.get("from"),
    url.searchParams.get("to"),
  );
  return Response.json(await getUsageStats(from, to));
}
