"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export function AcceptInviteClient({ inviteId }: { inviteId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/teams/${inviteId}/invite`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setStatus("done");
        setTimeout(() => router.push("/dashboard?tab=teams"), 1500);
      } else {
        setError(json.error || "Could not accept invite.");
        setStatus("error");
      }
    } catch {
      setError("Network error.");
      setStatus("error");
    }
  }

  async function decline() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/teams/${inviteId}/invite`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setDeclined(true);
      } else {
        setError(json.error || "Could not decline invite.");
        setStatus("error");
      }
    } catch {
      setError("Network error.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#dcfce7]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-ink">Welcome to the team!</h1>
          <p className="mt-2 text-[14px] text-[#6b7280]">
            Redirecting you to the dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-6">
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3f4f6]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-ink">Invitation declined</h1>
          <p className="mt-2 text-[14px] text-[#6b7280]">
            You declined this team invitation.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-[#14532d] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#0f3d22]"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f4f6] px-6">
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fdf4]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <h1 className="text-[20px] font-bold text-ink">Team Invitation</h1>
        <p className="mt-2 text-[14px] text-[#6b7280]">
          You&apos;ve been invited to join a team on Invoala.
        </p>

        {error ? (
          <p className="mt-4 rounded-lg bg-[#fef2f2] px-4 py-3 text-[13px] text-[#d70015]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => void accept()}
            disabled={status === "loading"}
            className="rounded-lg bg-[#14532d] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
          >
            {status === "loading" ? "Accepting…" : "Accept invitation"}
          </button>
          <button
            type="button"
            onClick={() => void decline()}
            disabled={status === "loading"}
            className="rounded-lg border border-[#e5e7eb] px-6 py-3 text-[15px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6] disabled:opacity-50"
          >
            Decline
          </button>
          <Link
            href="/dashboard"
            className="text-[13px] font-medium text-[#6b7280] hover:text-ink"
          >
            Go to dashboard instead
          </Link>
        </div>
      </div>
    </div>
  );
}
