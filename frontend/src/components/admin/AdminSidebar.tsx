import { IconLogout, IconBook, IconInbox, IconPlus, IconUsers } from "@tabler/icons-react";
import type { AdminTab } from "./types";

const NAV = [
  { id: "subjects" as AdminTab, label: "Sujets", Icon: IconBook },
  { id: "suggestions" as AdminTab, label: "Suggestions", Icon: IconInbox },
  { id: "add-subject" as AdminTab, label: "Ajouter un sujet", Icon: IconPlus },
  { id: "whitelist" as AdminTab, label: "Whitelist", Icon: IconUsers },
];

export function AdminSidebar({ activeTab, onNavigate, onLogout }: {
  activeTab: AdminTab;
  onNavigate: (t: AdminTab) => void;
  onLogout: () => void;
}) {
  return (
    <div style={{
      width: 220, background: "var(--epi-panel)",
      borderRight: "1px solid var(--epi-border)",
      display: "flex", flexDirection: "column",
      padding: "16px 12px", flexShrink: 0,
    }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <a href="/" style={{
          display: "flex", alignItems: "center", gap: 10,
          color: "var(--epi-muted)", fontSize: 13, fontWeight: 500,
          padding: "9px 12px", borderRadius: 8,
          textDecoration: "none",
        }}>
          Accueil
        </a>
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: activeTab === id ? "var(--epi-blue)" : "none",
              border: "none",
              color: activeTab === id ? "#fff" : "var(--epi-muted)",
              fontSize: 13, fontWeight: activeTab === id ? 700 : 500,
              padding: "9px 12px", borderRadius: 8,
              cursor: "pointer", transition: "background 0.15s, color 0.15s",
              fontFamily: "inherit", width: "100%", textAlign: "left",
            }}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onLogout}
        style={{
          display: "flex", alignItems: "center", gap: 10,
          background: "none", border: "none",
          color: "var(--epi-ghost)", fontSize: 13, fontWeight: 500,
          padding: "9px 12px", borderRadius: 8,
          cursor: "pointer", fontFamily: "inherit",
          width: "100%", textAlign: "left",
        }}
      >
        <IconLogout size={15} />
        Se déconnecter
      </button>
    </div>
  );
}
