import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");

  const { next } = await searchParams;
  const signupHref = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fog px-6 py-24">
      <div className="w-full max-w-[380px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2 text-lg font-semibold tracking-tight text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
            <rect width="64" height="64" rx="14.5" fill="#000" />
            <path d="M35.5 10 19 37h9.5l-3 17L43 27h-9.5l2-17z" fill="#fff" />
          </svg>
          Invoala
        </Link>
        <div className="rounded-[24px] bg-white p-7 shadow-sm ring-1 ring-black/5">
          <h1 className="mb-6 text-center text-xl font-semibold tracking-tight">Welcome back</h1>
          <LoginForm googleEnabled={googleEnabled} />
        </div>
        <p className="mt-6 text-center text-sm text-subtle">
          New to Invoala?{" "}
          <Link href={signupHref} className="font-medium text-link hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-subtle">
          <Link href="/" className="transition-colors hover:text-ink">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
