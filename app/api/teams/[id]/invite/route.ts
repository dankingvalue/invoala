import { getSessionUser } from "@/lib/server-auth";
import { acceptInvite } from "@/lib/teams";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const accepted = await acceptInvite(id, user.id);
  if (!accepted) {
    return Response.json({ error: "Invite not found, expired, or team is full." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
