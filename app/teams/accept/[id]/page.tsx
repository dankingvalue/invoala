import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server-auth";
import { AcceptInviteClient } from "./AcceptInviteClient";

export const metadata: Metadata = {
  title: "Accept Team Invitation",
};

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;

  return <AcceptInviteClient inviteId={id} />;
}
