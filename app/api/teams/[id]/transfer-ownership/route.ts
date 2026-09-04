import { getSessionUser } from "@/lib/server-auth";
import { transferOwnership } from "@/lib/teams";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let userId = "";
  try {
    const body = (await req.json()) as { userId?: string };
    userId = typeof body.userId === "string" ? body.userId : "";
  } catch {
    // falls through
  }
  if (!userId) return Response.json({ error: "userId is required." }, { status: 400 });

  const ok = await transferOwnership(id, user.id, userId);
  if (!ok) {
    return Response.json(
      { error: "Could not transfer ownership. Only the current owner can transfer to an existing member." },
      { status: 403 },
    );
  }
  return Response.json({ ok: true });
}
