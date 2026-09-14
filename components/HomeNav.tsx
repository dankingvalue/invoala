"use client";

import { useEffect, useState } from "react";
import { NavShell } from "./NavShell";

type MeResponse = {
  user: { email: string; role: string } | null;
  impersonatorEmail?: string | null;
};

// Client-fetched counterpart to Nav (see components/Nav.tsx) — the vast
// majority of homepage visitors are logged out anyway, so defaulting to
// that view and swapping in the logged-in one after the fetch resolves is
// a much smaller trade-off here than it would be on the dashboard. This is
// what lets the homepage route itself skip cookies() entirely and be
// statically cached instead of re-rendered on every request.
export function HomeNav() {
  const [me, setMe] = useState<MeResponse>({ user: null });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: MeResponse | null) => {
        if (data) setMe(data);
      })
      .catch(() => {});
  }, []);

  return <NavShell user={me.user} impersonatorEmail={me.impersonatorEmail} />;
}
