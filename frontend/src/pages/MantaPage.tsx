import { useState, useEffect } from "react";
import { ScrollArea, Group, Text } from "@mantine/core";
import epitechLogo from "../assets/img/epitech_logo.png";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { MantaSidebar } from "../components/manta/MantaSidebar";
import { SubjectsTab } from "../components/manta/SubjectsTab";
import { ProposeTab } from "../components/manta/ProposeTab";
import { EventsTab } from "../components/manta/EventsTab";
import type { Tab } from "../components/manta/types";
import { API } from "../lib/api";

export function MantaPage() {
  const [tab, setTab] = useState<Tab>("subjects");
  const [userName, setUserName] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(r => {
        if (r.status === 401) { setUnauthorized(true); return null; }
        return r.json() as Promise<{ user?: { email: string } }>;
      })
      .then(d => { if (d) setUserName(d.user?.email ?? ""); })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const logout = () => { window.location.href = `${API}/auth/logout`; };

  if (!ready) return null;

  if (unauthorized) return (
    <div style={{ minHeight: "100vh", background: "var(--epi-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Text c="dimmed">Session expirée. <a href={`${API}/auth/login`} style={{ color: "var(--epi-accent)" }}>Se reconnecter</a></Text>
    </div>
  );

  return (
    <div style={{ height: "100vh", background: "var(--epi-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{
        height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", background: "var(--epi-panel)",
        borderBottom: "1px solid var(--epi-border)", flexShrink: 0,
      }}>
        <Group gap="sm">
          <a href="/"><img src={epitechLogo} height={20} alt="Epitech" style={{ cursor: "pointer" }} /></a>
          <Text size="sm" c="dimmed">/</Text>
          <Text size="sm" fw={600}>Espace Manta</Text>
        </Group>
        <Group gap="sm">
          {userName && <Text size="xs" c="dimmed">{userName}</Text>}
          <ThemeToggle />
        </Group>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <MantaSidebar activeTab={tab} onNavigate={setTab} onLogout={logout} />

        <ScrollArea flex={1} style={{ background: "var(--epi-bg)" }}>
          <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
            {tab === "subjects" && <SubjectsTab token={userName} />}
            {tab === "propose" && <ProposeTab />}
            {tab === "events" && <EventsTab />}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
