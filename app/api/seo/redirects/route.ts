import { getSessionUser } from "@/lib/server-auth";
import { listRedirects, upsertRedirect, deleteRedirect, toPublicRedirects } from "@/lib/redirects";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Public mode: used by the edge proxy to apply redirects. Only active rows, no sensitive fields.
  const url = new URL(req.url);
  if (url.searchParams.get("public") === "1") {
    const rows = await listRedirects(true);
    return Response.json(
      { redirects: await toPublicRedirects(rows) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  }

  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  return Response.json({ redirects: await listRedirects(false) });
}

export async function POST(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { source?: string; destination?: string; statusCode?: number; active?: boolean; id?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body.source || !body.destination) {
    return Response.json({ error: "Source and destination are required." }, { status: 400 });
  }

  try {
    const row = await upsertRedirect({
      id: body.id,
      source: body.source,
      destination: body.destination,
      statusCode: body.statusCode,
      active: body.active,
      createdBy: user.email,
    });
    return Response.json({ ok: true, redirect: row });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save redirect.";
    const status = message === "loop" || message === "cannot-redirect-home" || message === "cannot-redirect-api" ? 400 : 422;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "admin" && user.role !== "superadmin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return Response.json({ error: "Missing id." }, { status: 400 });
  const ok = await deleteRedirect(id);
  return Response.json({ ok });
}
