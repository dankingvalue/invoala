import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { USER_COOKIE, getUserByToken } from "@/lib/server-auth";
import { SuperAdminDashboard } from "./SuperAdminDashboard";

export const metadata: Metadata = {
  title: "Super Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const store = await cookies();
  const user = getUserByToken(store.get(USER_COOKIE)?.value);
  if (!user) redirect("/login");
  if (user.role !== "superadmin") redirect(user.role === "admin" ? "/admin" : "/dashboard");

  return (
    <main className="min-h-screen bg-fog px-6 py-12">
      <div className="mx-auto max-w-[960px]">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="14.5" fill="#000" />
              <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
            </svg>
            Invoala
          </Link>
          <span className="text-xs uppercase tracking-wider text-subtle">
            Super Admin
          </span>
        </header>
        <SuperAdminDashboard />
      </div>
    </main>
  );
}
