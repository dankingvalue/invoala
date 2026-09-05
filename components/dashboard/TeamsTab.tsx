"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog, Modal } from "@/components/dashboard/Modal";
import { RowMenu, type RowMenuItem } from "@/components/dashboard/RowMenu";
import {
  PlusIcon,
  UsersIcon,
  CrownIcon,
  SettingsIcon,
  ActivityIcon,
  ArchiveIcon,
  DeleteIcon,
  LogoutIcon,
  BackIcon,
  BuildingIcon,
} from "@/components/dashboard/icons";
import { PERMISSION_GROUPS } from "@/lib/permissions-matrix";

type TeamRole = "owner" | "admin" | "member";

type TeamCard = {
  id: string;
  name: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
  status: string;
  my_role: TeamRole;
  member_count: number;
  pending_invite_count: number;
};

type IncomingInvite = { id: string; team_name: string; inviter_name: string; email: string; role: string };

type Member = { id: string; user_id: string; role: TeamRole; name: string; email: string; joined_at: number };
type PendingInvite = { id: string; email: string; role: string; created_at: number; expires_at: number };
type ActivityEntry = { id: string; actor_name: string; actor_email: string; action: string; target_type: string | null; target_id: string | null; details: string | null; created_at: number };

const ROLE_LABEL: Record<TeamRole, string> = { owner: "Owner", admin: "Admin", member: "Member" };
const ROLE_BADGE: Record<TeamRole, string> = {
  owner: "bg-[#111827] text-white",
  admin: "bg-[#166534] text-white",
  member: "bg-[#e5e7eb] text-[#6b7280]",
};

function canManageMembers(role: TeamRole): boolean {
  return role === "owner" || role === "admin";
}

function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function activitySentence(a: ActivityEntry): string {
  let details: Record<string, unknown> = {};
  try {
    details = a.details ? JSON.parse(a.details) : {};
  } catch {}
  const who = a.actor_name || a.actor_email;
  switch (a.action) {
    case "team_created":
      return `${who} created this workspace`;
    case "team_updated":
      return `${who} updated workspace settings`;
    case "team_archived":
      return `${who} archived this workspace`;
    case "team_unarchived":
      return `${who} reactivated this workspace`;
    case "ownership_transferred":
      return `${who} transferred ownership to ${(details.newOwnerEmail as string) || "another member"}`;
    case "member_invited":
      return `${who} invited ${(details.email as string) || "someone"} as ${(details.role as string) || "member"}`;
    case "invite_resent":
      return `${who} resent an invitation to ${(details.email as string) || "someone"}`;
    case "invite_role_changed":
      return `${who} changed the invited role for ${(details.email as string) || "someone"} to ${(details.role as string) || "member"}`;
    case "invite_cancelled":
      return `${who} cancelled the invitation to ${(details.email as string) || "someone"}`;
    case "member_role_changed":
      return `${who} changed ${(details.email as string) || "a member"}'s role to ${(details.role as string) || "member"}`;
    case "member_removed":
      return `${who} removed ${(details.email as string) || "a member"} from the team`;
    case "member_left":
      return `${who} left the team`;
    case "invoice_created":
      return `${who} created invoice ${(details.number as string) || ""}`;
    case "invoice_status_changed":
      return `${who} marked an invoice as ${(details.status as string) || "updated"}`;
    case "invoice_deleted":
      return `${who} deleted invoice ${(details.number as string) || ""}`;
    case "payment_recorded":
      return `${who} recorded a payment of ${(details.amount as number) ?? ""} on ${(details.number as string) || "an invoice"}`;
    case "client_created":
      return `${who} added client ${(details.name as string) || ""}`;
    case "client_updated":
      return `${who} edited client ${(details.name as string) || ""}`;
    case "client_deleted":
      return `${who} deleted client ${(details.name as string) || ""}`;
    default:
      return `${who} — ${a.action}`;
  }
}

export function TeamsTab({
  userId,
  teamsEnabled,
  busy,
  notice,
  onSubscribe,
  onTeamsChanged,
  onOpenSettings,
}: {
  userId: string;
  teamsEnabled: boolean;
  busy: boolean;
  notice: string;
  onSubscribe: (plan: string) => void;
  onTeamsChanged: () => void;
  onOpenSettings: (teamId: string) => void;
}) {
  const [teams, setTeams] = useState<TeamCard[]>([]);
  const [incoming, setIncoming] = useState<IncomingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [msg, setMsg] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<TeamCard | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<TeamCard | null>(null);

  function flash(text: string, isError = false) {
    setMsg(text);
    setStatus(isError ? "error" : "idle");
    setTimeout(() => setMsg(""), 3500);
  }

  function load() {
    fetch("/api/teams")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.teams) setTeams(data.teams);
        if (data?.invites) setIncoming(data.invites);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || null;

  async function createTeam() {
    if (!newTeamName.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setNewTeamName("");
        setNewTeamOpen(false);
        load();
        onTeamsChanged();
        flash("Team created.");
      } else {
        flash(json.error || "Could not create team.", true);
      }
    } catch {
      flash("Network error while creating the team.", true);
    }
    setStatus("idle");
  }

  async function acceptInvite(invite: IncomingInvite) {
    setStatus("loading");
    const res = await fetch(`/api/teams/${invite.id}/invite`, { method: "POST" });
    if (res.ok) {
      setIncoming((prev) => prev.filter((i) => i.id !== invite.id));
      load();
      onTeamsChanged();
      flash(`Joined ${invite.team_name}!`);
    } else {
      const json = await res.json().catch(() => ({}));
      flash(json.error || "Could not accept invite.", true);
    }
    setStatus("idle");
  }

  async function declineInvite(invite: IncomingInvite) {
    setStatus("loading");
    const res = await fetch(`/api/teams/${invite.id}/invite`, { method: "DELETE" });
    if (res.ok) {
      setIncoming((prev) => prev.filter((i) => i.id !== invite.id));
      flash("Invitation declined.");
    } else {
      flash("Could not decline invite.", true);
    }
    setStatus("idle");
  }

  async function leaveTeam(team: TeamCard) {
    setStatus("loading");
    const res = await fetch(`/api/teams/${team.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      setLeaveTarget(null);
      load();
      onTeamsChanged();
      flash(`Left ${team.name}.`);
    } else {
      flash(json.error || "Could not leave this workspace.", true);
    }
    setStatus("idle");
  }

  async function deleteTeam(team: TeamCard) {
    setStatus("loading");
    const res = await fetch(`/api/teams/${team.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete" }),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      setDeleteTarget(null);
      if (selectedTeamId === team.id) setSelectedTeamId(null);
      load();
      onTeamsChanged();
      flash(`Deleted ${team.name}.`);
    } else {
      flash(json.error || "Could not delete this workspace.", true);
    }
    setStatus("idle");
  }

  async function archiveTeam(team: TeamCard, archive: boolean) {
    setStatus("loading");
    const res = await fetch(`/api/teams/${team.id}/archive`, { method: archive ? "POST" : "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (res.ok && json.ok) {
      load();
      flash(archive ? `Archived ${team.name}.` : `Reactivated ${team.name}.`);
    } else {
      flash(json.error || "Could not update this workspace.", true);
    }
    setStatus("idle");
  }

  if (selectedTeam) {
    return (
      <TeamDetail
        team={selectedTeam}
        userId={userId}
        onBack={() => setSelectedTeamId(null)}
        onOpenSettings={() => onOpenSettings(selectedTeam.id)}
        onChanged={load}
      />
    );
  }

  return (
    <div className="space-y-6">
      {incoming.length > 0 ? (
        <div className="rounded-lg border border-[#e5e7eb] p-6">
          <h3 className="text-[16px] font-bold text-ink">Pending invitations</h3>
          <div className="mt-4 space-y-3">
            {incoming.map((invite) => (
              <div key={invite.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f9fafb] px-4 py-3">
                <div>
                  <p className="text-[14px] font-medium text-ink">{invite.team_name}</p>
                  <p className="text-[12px] text-[#6b7280]">Invited by {invite.inviter_name} as {invite.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void declineInvite(invite)}
                    disabled={status === "loading"}
                    className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6] disabled:opacity-50"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => void acceptInvite(invite)}
                    disabled={status === "loading"}
                    className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-[#e5e7eb] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-bold text-ink">My Teams</h3>
            <p className="mt-1 text-[13px] text-[#6b7280]">Each team is its own workspace — clients, invoices, and payments stay separate.</p>
          </div>
          {teamsEnabled ? (
            <button
              type="button"
              onClick={() => setNewTeamOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              <PlusIcon /> New team
            </button>
          ) : null}
        </div>

        {!teamsEnabled ? (
          <div className="mt-4">
            <p className="text-[13px] text-[#6b7280]">Upgrade to the Teams plan to create and manage workspaces.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSubscribe("teams_monthly")}
                disabled={busy}
                className="rounded-lg bg-[#14532d] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22] disabled:opacity-50"
              >
                Upgrade to Teams — $29/mo
              </button>
              <button
                type="button"
                onClick={() => onSubscribe("teams_yearly")}
                disabled={busy}
                className="rounded-lg border border-[#166534] px-4 py-2 text-[13px] font-semibold text-[#166534] transition hover:bg-[#f0fdf4] disabled:opacity-50"
              >
                Teams $249/yr
              </button>
              {notice ? <span className="text-[13px] text-[#166534]">{notice}</span> : null}
            </div>
          </div>
        ) : loading ? (
          <p className="mt-4 text-[13px] text-[#6b7280]">Loading…</p>
        ) : teams.length === 0 ? (
          <div className="mt-4 rounded-lg border border-dashed border-[#e5e7eb] p-6 text-center">
            <p className="text-[14px] text-[#6b7280]">No teams yet.</p>
            <p className="mt-1 text-[12px] text-[#9ca3af]">Create a team to collaborate with your team members.</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => {
              const items: RowMenuItem[] = [
                { key: "manage", label: "Manage team", icon: <UsersIcon />, onClick: () => setSelectedTeamId(team.id) },
                { key: "settings", label: "Team settings", icon: <SettingsIcon />, onClick: () => onOpenSettings(team.id) },
              ];
              if (team.my_role !== "owner") {
                items.push({ key: "leave", label: "Leave team", icon: <LogoutIcon />, onClick: () => setLeaveTarget(team) });
              }
              if (team.my_role === "owner") {
                items.push({
                  key: "archive",
                  label: team.status === "archived" ? "Reactivate team" : "Archive team",
                  icon: <ArchiveIcon />,
                  onClick: () => void archiveTeam(team, team.status !== "archived"),
                });
                items.push({ key: "delete", label: "Delete team", icon: <DeleteIcon />, onClick: () => setDeleteTarget(team), danger: true });
              }
              return (
                <div key={team.id} className="flex flex-col justify-between rounded-xl border border-[#e5e7eb] p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#166534] text-[13px] font-bold text-white">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                            {team.name}
                            {team.status === "archived" ? (
                              <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] font-medium text-[#6b7280]">Archived</span>
                            ) : null}
                          </p>
                          <p className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[team.my_role]}`}>
                            {team.my_role === "owner" ? <CrownIcon className="h-2.5 w-2.5" /> : null}
                            {ROLE_LABEL[team.my_role]}
                          </p>
                        </div>
                      </div>
                      <RowMenu items={items} label="Team actions" />
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[12px] text-[#6b7280]">
                      <span>{team.member_count} member{team.member_count === 1 ? "" : "s"}</span>
                      {team.pending_invite_count > 0 ? <span>{team.pending_invite_count} pending</span> : null}
                    </div>
                    <p className="mt-1 text-[11px] text-[#9ca3af]">Owner: {team.owner_name || team.owner_email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    className="mt-4 rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12px] font-semibold text-ink transition hover:bg-[#f3f4f6]"
                  >
                    Manage team
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {msg ? (
          <p className={`mt-4 text-[13px] ${status === "error" ? "text-[#d70015]" : "text-[#166534]"}`}>{msg}</p>
        ) : null}
      </div>

      <Modal open={newTeamOpen} onClose={() => setNewTeamOpen(false)} title="New team" maxWidth="380px">
        <div className="space-y-3">
          <input
            type="text"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void createTeam(); }}
            placeholder="e.g. Acme Design Studio"
            autoFocus
            className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setNewTeamOpen(false)}
              className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void createTeam()}
              disabled={!newTeamName.trim() || status === "loading"}
              className="rounded-full bg-[#166534] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60"
            >
              {status === "loading" ? "Creating…" : "Create team"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!leaveTarget}
        onClose={() => setLeaveTarget(null)}
        onConfirm={() => leaveTarget && void leaveTeam(leaveTarget)}
        title="Leave team?"
        body={`You'll lose access to ${leaveTarget?.name || "this workspace"}'s clients, invoices, and payments unless you're invited back.`}
        confirmLabel="Leave team"
        busy={status === "loading"}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && void deleteTeam(deleteTarget)}
        title="Delete team?"
        body={`This removes ${deleteTarget?.name || "this workspace"} and its membership permanently. Clients, invoices, and payment history are kept, not deleted. This cannot be undone.`}
        confirmLabel="Delete team"
        busy={status === "loading"}
        requireTypedConfirmation={deleteTarget?.name}
      />
    </div>
  );
}

function TeamDetail({
  team,
  userId,
  onBack,
  onOpenSettings,
  onChanged,
}: {
  team: TeamCard;
  userId: string;
  onBack: () => void;
  onOpenSettings: () => void;
  onChanged: () => void;
}) {
  const [view, setView] = useState<"overview" | "members" | "permissions" | "activity">("overview");
  const [profileTarget, setProfileTarget] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilterActor, setActivityFilterActor] = useState("");
  const [activityFilterAction, setActivityFilterAction] = useState("");
  const [activityFrom, setActivityFrom] = useState("");
  const [activityTo, setActivityTo] = useState("");
  const ACTIVITY_PAGE_SIZE = 25;
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"member" | "admin">("member");
  const [inviteError, setInviteError] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [notice, setNotice] = useState("");

  const canManage = canManageMembers(team.my_role);

  function flash(text: string) {
    setNotice(text);
    setTimeout(() => setNotice(""), 3000);
  }

  function loadMembers() {
    fetch(`/api/teams/${team.id}/members`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.members) setMembers(data.members);
        if (data?.invites) setInvites(data.invites);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id]);

  function activityQuery(offset: number) {
    const params = new URLSearchParams({ limit: String(ACTIVITY_PAGE_SIZE), offset: String(offset) });
    if (activityFilterActor) params.set("actorId", activityFilterActor);
    if (activityFilterAction) params.set("action", activityFilterAction);
    if (activityFrom) params.set("from", String(new Date(activityFrom).getTime()));
    if (activityTo) params.set("to", String(new Date(activityTo).getTime() + 86400000 - 1));
    return params;
  }

  function loadActivity(offset: number, append: boolean) {
    fetch(`/api/teams/${team.id}/activity?${activityQuery(offset)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setActivity((prev) => (append ? [...prev, ...data.activity] : data.activity));
        setActivityTotal(data.total ?? 0);
      })
      .finally(() => setActivityLoading(false));
  }

  useEffect(() => {
    if (view !== "activity") return;
    loadActivity(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, team.id, activityFilterActor, activityFilterAction, activityFrom, activityTo]);

  const activityActions = [...new Set(activity.map((a) => a.action))].sort();

  function isValidEmail(v: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
  }

  async function sendInvite() {
    if (!isValidEmail(inviteEmail)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    setBusyKey("invite");
    setInviteError("");
    try {
      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setInviteEmail("");
        setInviteOpen(false);
        loadMembers();
        onChanged();
        flash("Invitation sent.");
      } else {
        setInviteError(json.error || "Could not send invitation.");
      }
    } catch {
      setInviteError("Network error while sending the invitation.");
    }
    setBusyKey(null);
  }

  async function resendInvite(invite: PendingInvite) {
    setBusyKey(invite.id);
    const res = await fetch(`/api/teams/${team.id}/invites/${invite.id}`, { method: "POST" });
    flash(res.ok ? "Invitation resent." : "Could not resend invitation.");
    setBusyKey(null);
  }

  async function changeInviteRole(invite: PendingInvite, role: string) {
    setBusyKey(invite.id);
    const res = await fetch(`/api/teams/${team.id}/invites/${invite.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      setInvites((prev) => prev.map((i) => (i.id === invite.id ? { ...i, role } : i)));
    } else {
      flash("Could not change the invited role.");
    }
    setBusyKey(null);
  }

  async function cancelInvite(invite: PendingInvite) {
    setBusyKey(invite.id);
    const res = await fetch(`/api/teams/${team.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteId: invite.id }),
    });
    if (res.ok) {
      setInvites((prev) => prev.filter((i) => i.id !== invite.id));
      onChanged();
    }
    setBusyKey(null);
  }

  async function changeMemberRole(member: Member, role: string) {
    setBusyKey(member.user_id);
    const res = await fetch(`/api/teams/${team.id}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: member.user_id, role }),
    });
    if (res.ok) {
      setMembers((prev) => prev.map((m) => (m.user_id === member.user_id ? { ...m, role: role as TeamRole } : m)));
    } else {
      const json = await res.json().catch(() => ({}));
      flash(json.error || "Could not change role.");
    }
    setBusyKey(null);
  }

  async function removeMember(member: Member) {
    setBusyKey(member.user_id);
    const res = await fetch(`/api/teams/${team.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: member.user_id }),
    });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
      setRemoveTarget(null);
      onChanged();
      flash("Member removed.");
    } else {
      const json = await res.json().catch(() => ({}));
      flash(json.error || "Could not remove member.");
    }
    setBusyKey(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to teams"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#6b7280] transition hover:bg-[#f3f4f6]"
          >
            <BackIcon />
          </button>
          <div>
            <h3 className="flex items-center gap-2 text-[17px] font-bold text-ink">
              {team.name}
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${ROLE_BADGE[team.my_role]}`}>{ROLE_LABEL[team.my_role]}</span>
            </h3>
            <p className="text-[12px] text-[#6b7280]">{members.length} member{members.length === 1 ? "" : "s"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canManage ? (
            <button
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3.5 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
            >
              <SettingsIcon /> Team settings
            </button>
          ) : null}
          {canManage ? (
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#14532d] px-3.5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f3d22]"
            >
              <PlusIcon /> Invite member
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[#e5e7eb]">
        <button
          type="button"
          onClick={() => setView("overview")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition ${
            view === "overview" ? "border-[#166534] text-[#166534]" : "border-transparent text-[#6b7280] hover:text-ink"
          }`}
        >
          <BuildingIcon /> Overview
        </button>
        <button
          type="button"
          onClick={() => setView("members")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition ${
            view === "members" ? "border-[#166534] text-[#166534]" : "border-transparent text-[#6b7280] hover:text-ink"
          }`}
        >
          <UsersIcon /> Members
        </button>
        <button
          type="button"
          onClick={() => setView("permissions")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition ${
            view === "permissions" ? "border-[#166534] text-[#166534]" : "border-transparent text-[#6b7280] hover:text-ink"
          }`}
        >
          <CrownIcon /> Roles &amp; permissions
        </button>
        <button
          type="button"
          onClick={() => setView("activity")}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] font-medium transition ${
            view === "activity" ? "border-[#166534] text-[#166534]" : "border-transparent text-[#6b7280] hover:text-ink"
          }`}
        >
          <ActivityIcon /> Activity
        </button>
      </div>

      {notice ? <p className="text-[13px] text-[#166534]">{notice}</p> : null}

      {view === "overview" ? (
        <OverviewPanel teamId={team.id} />
      ) : view === "permissions" ? (
        <PermissionsMatrix />
      ) : view === "members" ? (
        loading ? (
          <p className="text-[13px] text-[#6b7280]">Loading…</p>
        ) : (
          <div className="space-y-5">
            {invites.length > 0 ? (
              <div className="rounded-lg border border-[#e5e7eb]">
                <p className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">
                  Pending invitations
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] text-[11px] uppercase tracking-wider text-[#9ca3af]">
                        <th className="px-4 py-2 font-semibold">Email</th>
                        <th className="px-4 py-2 font-semibold">Role</th>
                        <th className="px-4 py-2 font-semibold">Invited</th>
                        <th className="px-4 py-2 font-semibold">Status</th>
                        <th className="px-4 py-2 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map((invite) => (
                        <tr key={invite.id} className="border-b border-[#f3f4f6] last:border-0">
                          <td className="px-4 py-2.5 font-medium text-ink">{invite.email}</td>
                          <td className="px-4 py-2.5">
                            {canManage ? (
                              <select
                                value={invite.role}
                                onChange={(e) => void changeInviteRole(invite, e.target.value)}
                                disabled={busyKey === invite.id}
                                className="rounded-md border border-[#e5e7eb] px-2 py-1 text-[12px] outline-none focus:border-[#166534]"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className="capitalize text-[#6b7280]">{invite.role}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-[#6b7280]">{timeAgo(invite.created_at)}</td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-[#fef9e7] px-2 py-0.5 text-[11px] font-semibold text-[#92600a]">Pending</span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            {canManage ? (
                              <div className="flex justify-end gap-3 text-[12px]">
                                <button type="button" disabled={busyKey === invite.id} onClick={() => void resendInvite(invite)} className="text-[#166534] hover:underline disabled:opacity-50">
                                  Resend
                                </button>
                                <button type="button" disabled={busyKey === invite.id} onClick={() => void cancelInvite(invite)} className="text-[#d70015] hover:underline disabled:opacity-50">
                                  Cancel
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="rounded-lg border border-[#e5e7eb]">
              <p className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">
                Members
              </p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-[13px]">
                  <thead>
                    <tr className="border-b border-[#e5e7eb] text-[11px] uppercase tracking-wider text-[#9ca3af]">
                      <th className="px-4 py-2 font-semibold">Member</th>
                      <th className="px-4 py-2 font-semibold">Role</th>
                      <th className="px-4 py-2 font-semibold">Status</th>
                      <th className="px-4 py-2 font-semibold">Joined</th>
                      <th className="px-4 py-2 text-right font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => {
                      const isOwner = member.role === "owner";
                      const isSelf = member.user_id === userId;
                      return (
                        <tr key={member.user_id} className="border-b border-[#f3f4f6] last:border-0">
                          <td className="px-4 py-2.5">
                            <button
                              type="button"
                              onClick={() => setProfileTarget(member)}
                              className="flex items-center gap-2.5 text-left"
                            >
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#166534] text-[11px] font-bold text-white">
                                {(member.name || member.email).charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-ink hover:underline">{member.name || member.email}{isSelf ? " (you)" : ""}</p>
                                <p className="text-[11px] text-[#6b7280]">{member.email}</p>
                              </div>
                            </button>
                          </td>
                          <td className="px-4 py-2.5">
                            {canManage && !isOwner ? (
                              <select
                                value={member.role}
                                onChange={(e) => void changeMemberRole(member, e.target.value)}
                                disabled={busyKey === member.user_id}
                                className="rounded-md border border-[#e5e7eb] px-2 py-1 text-[12px] outline-none focus:border-[#166534]"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[member.role]}`}>
                                {isOwner ? <CrownIcon className="h-2.5 w-2.5" /> : null}
                                {ROLE_LABEL[member.role]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2.5">
                            <span className="rounded-full bg-[#e8f8ee] px-2 py-0.5 text-[11px] font-semibold text-[#00875a]">Active</span>
                          </td>
                          <td className="px-4 py-2.5 text-[#6b7280]">{new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                          <td className="px-4 py-2.5 text-right">
                            {canManage && !isOwner && !isSelf ? (
                              <button
                                type="button"
                                onClick={() => setRemoveTarget(member)}
                                className="flex items-center gap-1 text-[12px] text-[#d70015] hover:underline"
                              >
                                <DeleteIcon /> Remove
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activityFilterActor}
              onChange={(e) => setActivityFilterActor(e.target.value)}
              className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#166534]"
            >
              <option value="">All members</option>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>{m.name || m.email}</option>
              ))}
            </select>
            <select
              value={activityFilterAction}
              onChange={(e) => setActivityFilterAction(e.target.value)}
              className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#166534]"
            >
              <option value="">All actions</option>
              {activityActions.map((a) => (
                <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
              ))}
            </select>
            <input
              type="date"
              value={activityFrom}
              onChange={(e) => setActivityFrom(e.target.value)}
              className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#166534]"
            />
            <span className="text-[12px] text-[#9ca3af]">to</span>
            <input
              type="date"
              value={activityTo}
              onChange={(e) => setActivityTo(e.target.value)}
              className="rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#166534]"
            />
            <a
              href={`/api/teams/${team.id}/activity?format=csv&${activityQuery(0)}`}
              className="ml-auto rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-[12px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6]"
            >
              Export CSV
            </a>
          </div>

          <div className="rounded-lg border border-[#e5e7eb]">
            {activity.length === 0 ? (
              <p className="px-4 py-8 text-center text-[13px] text-[#6b7280]">
                {activityLoading ? "Loading…" : "No activity yet."}
              </p>
            ) : (
              <ul className="divide-y divide-[#f3f4f6]">
                {activity.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#6b7280]">
                      <ActivityIcon className="h-3 w-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] text-ink">{activitySentence(entry)}</p>
                      <p className="text-[11px] text-[#9ca3af]">{timeAgo(entry.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {activity.length < activityTotal ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => { setActivityLoading(true); loadActivity(activity.length, true); }}
                disabled={activityLoading}
                className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6] disabled:opacity-50"
              >
                {activityLoading ? "Loading…" : `Load more (${activityTotal - activity.length} left)`}
              </button>
            </div>
          ) : null}
        </div>
      )}

      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite member" subtitle={team.name} maxWidth="420px">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#6b7280]">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@example.com"
              autoFocus
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534] focus:ring-2 focus:ring-[#166534]/15"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] font-medium text-[#6b7280]">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "member" | "admin")}
              className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[14px] outline-none focus:border-[#166534]"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {inviteError ? <p className="text-[13px] text-[#d70015]">{inviteError}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setInviteOpen(false)}
              className="rounded-full border border-[#e5e7eb] px-4 py-2 text-[13px] font-medium text-ink transition hover:bg-[#f3f4f6]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void sendInvite()}
              disabled={busyKey === "invite" || !inviteEmail.trim()}
              className="rounded-full bg-[#166534] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#14532d] disabled:opacity-60"
            >
              {busyKey === "invite" ? "Sending…" : "Send invitation"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => removeTarget && void removeMember(removeTarget)}
        title="Remove member?"
        body={`${removeTarget?.name || removeTarget?.email || "This member"} will lose access to ${team.name}.`}
        confirmLabel="Remove member"
        busy={busyKey === removeTarget?.user_id}
      />

      {profileTarget ? (
        <MemberProfileModal
          teamId={team.id}
          member={profileTarget}
          onClose={() => setProfileTarget(null)}
        />
      ) : null}
    </div>
  );
}

function OverviewPanel({ teamId }: { teamId: string }) {
  const [data, setData] = useState<{
    stats: {
      memberCount: number;
      pendingInviteCount: number;
      clientCount: number;
      invoiceCount: number;
      byCurrency: Array<{ currency: string; outstanding: number; paid: number }>;
    };
    recentActivity: ActivityEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/overview`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [teamId]);

  if (loading) return <p className="text-[13px] text-[#6b7280]">Loading…</p>;
  if (!data) return <p className="text-[13px] text-[#6b7280]">Failed to load.</p>;

  const { stats, recentActivity } = data;
  const money = (n: number, ccy: string) =>
    n.toLocaleString("en-US", { style: "currency", currency: ccy, maximumFractionDigits: 0 });

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Members</p>
          <p className="mt-1 text-[20px] font-bold text-ink">{stats.memberCount}</p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Pending invites</p>
          <p className="mt-1 text-[20px] font-bold text-ink">{stats.pendingInviteCount}</p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Clients</p>
          <p className="mt-1 text-[20px] font-bold text-ink">{stats.clientCount}</p>
        </div>
        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Invoices</p>
          <p className="mt-1 text-[20px] font-bold text-ink">{stats.invoiceCount}</p>
        </div>
      </div>

      {stats.byCurrency.length > 0 ? (
        <div className="rounded-lg border border-[#e5e7eb] p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Outstanding &amp; paid</p>
          <div className="space-y-2">
            {stats.byCurrency.map((c) => (
              <div key={c.currency} className="flex items-center justify-between text-[13px]">
                <span className="text-[#6b7280]">{c.currency}</span>
                <span>
                  <span className="font-semibold text-[#d70015]">{money(c.outstanding, c.currency)}</span>
                  <span className="mx-1.5 text-[#d1d5db]">·</span>
                  <span className="font-semibold text-[#00875a]">{money(c.paid, c.currency)} paid</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-[#e5e7eb]">
        <p className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">
          Recent activity
        </p>
        {recentActivity.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13px] text-[#6b7280]">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-[#f3f4f6]">
            {recentActivity.map((entry) => (
              <li key={entry.id} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#6b7280]">
                  <ActivityIcon className="h-3 w-3" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink">{activitySentence(entry)}</p>
                  <p className="text-[11px] text-[#9ca3af]">{timeAgo(entry.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PermissionsMatrix() {
  return (
    <div className="space-y-6">
      <p className="text-[13px] text-[#6b7280]">
        What each role can do in this workspace. This reflects what the server actually enforces —
        not just what the interface happens to show.
      </p>
      {PERMISSION_GROUPS.map((group) => (
        <div key={group.label} className="rounded-lg border border-[#e5e7eb]">
          <p className="border-b border-[#e5e7eb] bg-[#f9fafb] px-4 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-[#6b7280]">
            {group.label}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e7eb] text-[11px] uppercase tracking-wider text-[#9ca3af]">
                  <th className="px-4 py-2 font-semibold">Permission</th>
                  <th className="px-4 py-2 text-center font-semibold">Owner</th>
                  <th className="px-4 py-2 text-center font-semibold">Admin</th>
                  <th className="px-4 py-2 text-center font-semibold">Member</th>
                </tr>
              </thead>
              <tbody>
                {group.rows.map((r) => (
                  <tr key={r.label} className="border-b border-[#f3f4f6] last:border-0">
                    <td className="px-4 py-2.5 text-ink">{r.label}</td>
                    {(["owner", "admin", "member"] as const).map((role) => (
                      <td key={role} className="px-4 py-2.5 text-center">
                        {r.allowed[role] ? (
                          <span className="text-[#166534]">✓</span>
                        ) : (
                          <span className="text-[#d1d5db]">–</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberProfileModal({
  teamId,
  member,
  onClose,
}: {
  teamId: string;
  member: Member;
  onClose: () => void;
}) {
  const [data, setData] = useState<{
    stats: { invoicesCreated: number; paymentsRecorded: number };
    recentActivity: ActivityEntry[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teams/${teamId}/members/${member.user_id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, [teamId, member.user_id]);

  return (
    <Modal open onClose={onClose} title={member.name || member.email} maxWidth="480px">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#166534] text-[14px] font-bold text-white">
            {(member.name || member.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink">{member.name || member.email}</p>
            <p className="text-[12px] text-[#6b7280]">{member.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9ca3af]">Role</p>
            <p className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_BADGE[member.role]}`}>
              {ROLE_LABEL[member.role]}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[#9ca3af]">Joined</p>
            <p className="mt-0.5 text-ink">{new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
          </div>
        </div>

        {loading ? (
          <p className="text-[13px] text-[#6b7280]">Loading…</p>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9ca3af]">Invoices created</p>
                <p className="mt-0.5 font-semibold text-ink">{data.stats.invoicesCreated}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-[#9ca3af]">Payments recorded</p>
                <p className="mt-0.5 font-semibold text-ink">{data.stats.paymentsRecorded}</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#9ca3af]">Recent activity</p>
              {data.recentActivity.length === 0 ? (
                <p className="text-[13px] text-[#6b7280]">No activity yet in this workspace.</p>
              ) : (
                <ul className="space-y-2">
                  {data.recentActivity.map((entry) => (
                    <li key={entry.id} className="text-[13px] text-ink">
                      {activitySentence(entry)}
                      <span className="ml-1.5 text-[11px] text-[#9ca3af]">{timeAgo(entry.created_at)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
