import { useState } from "react";
import { ScrollArea, Group, Text } from "@mantine/core";
import epitechLogo from "../assets/img/epitech_logo.png";
import { PasswordGate } from "../components/admin/PasswordGate";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { SubjectForm } from "../components/admin/SubjectForm";
import { AdminSubjectsTab } from "../components/admin/AdminSubjectsTab";
import { SuggestionsTab } from "../components/admin/SuggestionsTab";
import { WhitelistTab } from "../components/admin/WhitelistTab";
import type { AdminTab } from "../components/admin/types";

function AdminApp({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("subjects");
  const [defaultFolderId, setDefaultFolderId] = useState<number | null>(null);

  const addSubjectInFolder = (folderId: number | null) => {
    setDefaultFolderId(folderId);
    setTab("add-subject");
  };

  return (
    <div style={{ height: "100vh", background: "var(--epi-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{
        height: 48, display: "flex", alignItems: "center",
        padding: "0 24px", background: "var(--epi-panel)",
        borderBottom: "1px solid var(--epi-border)", flexShrink: 0,
      }}>
        <Group gap="sm">
          <a href="/"><img src={epitechLogo} height={20} alt="Epitech" style={{ cursor: "pointer" }} /></a>
          <Text size="sm" c="dimmed">/</Text>
          <Text size="sm" fw={600}>Zone Admin</Text>
        </Group>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <AdminSidebar activeTab={tab} onNavigate={setTab} onLogout={onLogout} />

        <ScrollArea flex={1} style={{ background: "var(--epi-bg)" }}>
          <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
            {tab === "subjects" && <AdminSubjectsTab token={token} onAddSubject={addSubjectInFolder} />}
            {tab === "suggestions" && <SuggestionsTab token={token} />}
            {tab === "add-subject" && <SubjectForm token={token} defaultFolderId={defaultFolderId} key={defaultFolderId ?? "root"} />}
            {tab === "whitelist" && <WhitelistTab token={token} />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") ?? "");

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    setToken("");
  };

  if (!token) return <PasswordGate onUnlock={setToken} />;
  return <AdminApp token={token} onLogout={logout} />;
}
