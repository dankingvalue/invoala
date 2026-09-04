import { getSessionUser } from "@/lib/server-auth";
import { listInvoices, setInvoiceStatus, upsertInvoice } from "@/lib/data";
import { isTeamMember } from "@/lib/teams";
import type { Invoice } from "@/lib/invoice";

function isValidInvoice(v: unknown): v is Invoice {
  if (!v || typeof v !== "object") return false;
  const inv = v as Invoice;
  return (
    Array.isArray(inv.items) &&
    typeof inv.invoiceNumber === "string" &&
    typeof inv.docType === "string"
  );
}

// ?workspace=team:<id> scopes strictly to that team (membership verified
// here, and again inside listInvoices); ?workspace=personal scopes
// strictly to the caller's own unshared invoices; omitted keeps the legacy
// "everything I created" view untouched for any caller that hasn't been
// updated to send a workspace.
async function resolveTeamIdParam(req: Request, userId: string): Promise<{ teamId?: string | null; error?: string }> {
  const workspace = new URL(req.url).searchParams.get("workspace");
  if (!workspace) return {};
  if (workspace === "personal") return { teamId: null };
  if (workspace.startsWith("team:")) {
    const teamId = workspace.slice(5);
    if (!(await isTeamMember(teamId, userId))) return { error: "Not a member of that workspace." };
    return { teamId };
  }
  return { error: "Invalid workspace." };
}

export async function GET(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { teamId, error } = await resolveTeamIdParam(req, user.id);
  if (error) return Response.json({ error }, { status: 403 });
  return Response.json({ invoices: await listInvoices(user.id, teamId) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser(req);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    invoice?: unknown;
    id?: string;
    status?: string;
    clientId?: string | null;
    teamId?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  if (body.id && typeof body.status === "string" && !body.invoice) {
    // "paid"/"partial" are derived from the payments ledger (see
    // /api/invoices/[id]/payments) and can't be set directly here — that
    // would let the stored status disagree with the actual payments sum.
    if (!["draft", "sent", "void"].includes(body.status)) {
      return Response.json({ error: "Invalid status." }, { status: 400 });
    }
    const ok = await setInvoiceStatus(user.id, body.id, body.status);
    if (!ok) return Response.json({ error: "Invoice not found." }, { status: 404 });
    return Response.json({ ok: true, id: body.id });
  }

  if (!isValidInvoice(body.invoice)) {
    return Response.json({ error: "Invalid invoice payload." }, { status: 400 });
  }

  // Only relevant for a brand-new invoice (upsertInvoice ignores it on an
  // update) — the team it should be created in, membership verified here.
  let teamId: string | null | undefined = undefined;
  if (typeof body.teamId === "string") {
    if (!(await isTeamMember(body.teamId, user.id))) {
      return Response.json({ error: "Not a member of that workspace." }, { status: 403 });
    }
    teamId = body.teamId;
  } else if (body.teamId === null) {
    teamId = null;
  }

  try {
    const result = await upsertInvoice(user.id, body.invoice, {
      id: body.id,
      clientId: typeof body.clientId === "string" || body.clientId === null ? body.clientId : undefined,
      teamId,
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof Error && err.message === "not-found") {
      return Response.json({ error: "Invoice not found." }, { status: 404 });
    }
    throw err;
  }
}
