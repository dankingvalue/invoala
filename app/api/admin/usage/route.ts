import { getSessionUser } from "@/lib/server-auth";
import { getUsageStats } from "@/lib/usage";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json(await getUsageStats());
}
