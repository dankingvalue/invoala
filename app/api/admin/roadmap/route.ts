import { getSessionUser } from "@/lib/server-auth";
import { listAllRoadmapItems, submitRoadmapItem, updateRoadmapItem, isRoadmapStatus } from "@/lib/roadmap";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin", "support"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return Response.json({ items: await listAllRoadmapItems() });
}

// Lets staff add a roadmap item directly (already-decided work), skipping
// the public "open" queue — created straight into whatever status is given.
export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string; description?: string; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = (body.title || "").trim();
  if (!title) return Response.json({ error: "Title is required." }, { status: 400 });

  const item = await submitRoadmapItem({
    title,
    description: (body.description || "").trim(),
    name: "Invoala team",
    email: "",
  });

  if (body.status && isRoadmapStatus(body.status) && body.status !== "open") {
    await updateRoadmapItem(item.id, { status: body.status });
    item.status = body.status;
  }

  return Response.json({ ok: true, item });
}
