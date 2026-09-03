import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = {
  title: "Create your account",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await getCurrentUser()) redirect("/dashboard");

  const { next } = await searchParams;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-fog px-6 py-24">
      <div className="w-full max-w-[400px]">
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
          <h1 className="mb-6 text-center text-xl font-semibold tracking-tight">
            Create your account
          </h1>
          <SignupForm googleEnabled={googleEnabled} />
        </div>
        <p className="mt-6 text-center text-sm text-subtle">
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-link hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
