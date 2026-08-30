import { getSessionUser } from "@/lib/server-auth";
import {
  listSeoOverrides,
  saveSeoOverride,
  removeSeoOverride,
  isEditablePath,
} from "@/lib/seo-overrides.server";

export const dynamic = "force-dynamic";

async function requireSeoAdmin(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "superadmin") return null;
  return user;
}

export async function GET(req: Request) {
  const user = await requireSeoAdmin(req);
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });
  return Response.json({ overrides: listSeoOverrides() });
}

export async function POST(req: Request) {
  const user = await requireSeoAdmin(req);
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });

  let body: {
    path?: string;
    seoTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const path = body.path?.trim();
  if (!path || !isEditablePath(path)) {
    return Response.json({ error: "Invalid or non-editable path." }, { status: 400 });
  }

  const saved = saveSeoOverride(path, {
    seoTitle: body.seoTitle,
    metaDescription: body.metaDescription,
    canonicalUrl: body.canonicalUrl,
    ogTitle: body.ogTitle,
    ogDescription: body.ogDescription,
    ogImage: body.ogImage,
    robotsIndex: body.robotsIndex,
    robotsFollow: body.robotsFollow,
  });
  return Response.json({ ok: true, override: saved });
}

export async function DELETE(req: Request) {
  const user = await requireSeoAdmin(req);
  if (!user) return Response.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const path = url.searchParams.get("path");
  if (!path) return Response.json({ error: "Missing path." }, { status: 400 });
  const removed = removeSeoOverride(path);
  return Response.json({ ok: !!removed });
}
