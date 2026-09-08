import { getSessionUser } from "@/lib/server-auth";
import { requireSupportPermission } from "@/lib/support-permissions";
import { sampleConversationsForQa } from "@/lib/qa-reviews";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  const denied = requireSupportPermission(user, "admin.qa.manage");
  if (denied) return denied;
  const url = new URL(req.url);
  const count = Math.min(Math.max(parseInt(url.searchParams.get("count") || "10", 10) || 10, 1), 50);
  const sample = await sampleConversationsForQa(count);
  return Response.json({ sample });
}
