import { voteForItem } from "@/lib/roadmap";
import { rateLimit } from "@/lib/server-auth";

// Anonymous voting: the client generates a random id once and stores it in
// localStorage, sending it as voter_key. Not identity — just enough to stop
// the same browser from voting twice; the UNIQUE(item_id, voter_key)
// constraint in the DB is the actual guard.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`roadmap-vote:${ip}`, 30, 60 * 60e3)) {
    return Response.json({ error: "Too many votes. Please try again later." }, { status: 429 });
  }

  const { id } = await params;

  let body: { voter_key?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const voterKey = (body.voter_key || "").trim();
  if (!voterKey || voterKey.length > 100) {
    return Response.json({ error: "Missing voter key." }, { status: 400 });
  }

  const result = await voteForItem(id, voterKey);
  if (!result.ok) return Response.json({ error: "Not found." }, { status: 404 });
  return Response.json(result);
}
