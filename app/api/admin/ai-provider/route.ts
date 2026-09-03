import { getSessionUser } from "@/lib/server-auth";
import { listProviders, getActiveProviderId, setActiveProviderId, isAiProviderId } from "@/lib/ai-provider";
import { logAudit } from "@/lib/audit";

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [providers, active] = await Promise.all([listProviders(), getActiveProviderId()]);
  return Response.json({ providers, active });
}

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user || !["superadmin", "admin"].includes(user.role)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { provider?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isAiProviderId(body.provider)) {
    return Response.json({ error: "Unknown provider." }, { status: 400 });
  }

  const providers = listProviders();
  const target = providers.find((p) => p.id === body.provider);
  if (!target?.configured) {
    return Response.json(
      { error: `No API key configured for ${target?.label ?? body.provider}. Add its key on Vercel first.` },
      { status: 400 },
    );
  }

  const previous = await getActiveProviderId();
  await setActiveProviderId(body.provider);

  await logAudit({
    action: "settings_change",
    targetType: "ai_provider",
    details: { old: previous, new: body.provider },
    actor: { id: user.id, email: user.email, role: user.role },
  });

  return Response.json({ ok: true, active: body.provider });
}
