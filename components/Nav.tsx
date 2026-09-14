import { getCurrentUser, getImpersonatorAdmin } from "@/lib/server-auth";
import { NavShell } from "./NavShell";

// Server-rendered, cookie-dependent — fine here since the dashboard (this
// component's only remaining caller) is already force-dynamic and gets no
// caching benefit either way. The homepage uses HomeNav instead, which
// fetches the same data client-side so the page itself can be static.
export async function Nav() {
  const [user, impersonator] = await Promise.all([getCurrentUser(), getImpersonatorAdmin()]);
  return <NavShell user={user} impersonatorEmail={impersonator?.email ?? null} />;
}
