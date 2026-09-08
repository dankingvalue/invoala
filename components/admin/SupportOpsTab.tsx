"use client";

import { useState } from "react";
import { EscalationsPanel } from "@/components/admin/support-ops/EscalationsPanel";
import { IncidentsPanel } from "@/components/admin/support-ops/IncidentsPanel";
import { AgentsPanel } from "@/components/admin/support-ops/AgentsPanel";
import { QaPanel } from "@/components/admin/support-ops/QaPanel";
import { CsatPanel } from "@/components/admin/support-ops/CsatPanel";
import { KnowledgePanel } from "@/components/admin/support-ops/KnowledgePanel";
import { MacrosPanel } from "@/components/admin/support-ops/MacrosPanel";
import { ReportsPanel } from "@/components/admin/support-ops/ReportsPanel";

type SubTab = "reports" | "escalations" | "incidents" | "agents" | "qa" | "csat" | "knowledge" | "macros";

const SUB_TABS: { id: SubTab; label: string; group: string }[] = [
  { id: "reports", label: "Overview", group: "REPORTS" },
  { id: "escalations", label: "Escalations", group: "SUPPORT" },
  { id: "incidents", label: "Incidents", group: "SUPPORT" },
  { id: "agents", label: "Agents", group: "TEAM" },
  { id: "qa", label: "QA Reviews", group: "QUALITY" },
  { id: "csat", label: "CSAT", group: "QUALITY" },
  { id: "knowledge", label: "Knowledge Base", group: "QUALITY" },
  { id: "macros", label: "Macros", group: "QUALITY" },
];

export function SupportOpsTab({ myRole }: { myRole: string }) {
  const [sub, setSub] = useState<SubTab>("reports");

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1.5">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
              sub === t.id ? "bg-[#166534] text-white" : "bg-white text-[#6b7280] ring-1 ring-[#e5e7eb] hover:text-[#111827]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "reports" && <ReportsPanel />}
      {sub === "escalations" && <EscalationsPanel myRole={myRole} />}
      {sub === "incidents" && <IncidentsPanel />}
      {sub === "agents" && <AgentsPanel />}
      {sub === "qa" && <QaPanel />}
      {sub === "csat" && <CsatPanel />}
      {sub === "knowledge" && <KnowledgePanel />}
      {sub === "macros" && <MacrosPanel />}
    </div>
  );
}
