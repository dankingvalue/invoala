import { listPublicRoadmap, submitRoadmapItem } from "@/lib/roadmap";
import { rateLimit } from "@/lib/server-auth";

export async function GET() {
  return Response.json({ items: await listPublicRoadmap() });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`roadmap-submit:${ip}`, 5, 60 * 60e3)) {
    return Response.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let body: { title?: string; description?: string; name?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = (body.title || "").trim();
  const description = (body.description || "").trim();
  const name = (body.name || "").trim();
  const email = (body.email || "").trim();

  if (!title || title.length > 140) {
    return Response.json({ error: "Give it a short title (up to 140 characters)." }, { status: 400 });
  }
  if (description.length > 2000) {
    return Response.json({ error: "Description is too long." }, { status: 400 });
  }
  if (email && !EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email, or leave it blank." }, { status: 400 });
  }

  const item = await submitRoadmapItem({ title, description, name, email });
  return Response.json({ ok: true, item });
}
