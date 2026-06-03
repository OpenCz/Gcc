import { useState, useEffect } from "react";
import { Stack, Group, Text, ScrollArea } from "@mantine/core";
import { IconEye, IconEyeOff, IconLogout, IconBook } from "@tabler/icons-react";
import { Badge } from "../components/ui/Badge";
import epitechLogo from "../assets/img/epitech_logo.png";
import type { Subject } from "../config";

const API = "http://localhost:8080";

interface SubjectWithVisible extends Subject {
  id: number;
  visible: boolean;
}

export function MantaPage() {
  const [subjects, setSubjects] = useState<SubjectWithVisible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then(r => {
        if (r.status === 401) { setUnauthorized(true); return null; }
        return r.json() as Promise<{ user?: { email: string } }>;
      })
      .then(d => { if (d) setUserName(d.user?.email ?? ""); })
      .catch(() => {});

    fetch(`${API}/manta/subjects`, { credentials: "include" })
      .then(r => {
        if (r.status === 401) { setUnauthorized(true); return null; }
        return r.json() as Promise<{ subjects?: SubjectWithVisible[] }>;
      })
      .then(d => { if (d) setSubjects(d.subjects ?? []); })
      .catch(() => setError("Impossible de charger les sujets."))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (subject: SubjectWithVisible) => {
    const next = !subject.visible;
    setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, visible: next } : s));
    await fetch(`${API}/manta/subjects/${subject.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ visible: next }),
    });
  };

  const logout = () => {
    window.location.href = `${API}/auth/logout`;
  };

  if (unauthorized) return (
    <div style={{ minHeight: "100vh", background: "var(--epi-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Text c="dimmed">Session expirée. <a href={`${API}/auth/login`} style={{ color: "var(--epi-accent)" }}>Se reconnecter</a></Text>
    </div>
  );

  const visible = subjects.filter(s => s.visible).length;
  const invisible = subjects.filter(s => !s.visible).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--epi-bg)", display: "flex", flexDirection: "column" }}>
      <div style={{
        height: 48, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px", background: "var(--epi-panel)",
        borderBottom: "1px solid var(--epi-border)", flexShrink: 0,
      }}>
        <Group gap="sm">
          <a href="/"><img src={epitechLogo} height={22} alt="Epitech" style={{ cursor: "pointer" }} /></a>
          <Text size="sm" c="dimmed">/</Text>
          <Text size="sm" fw={600}>Espace Manta</Text>
        </Group>
        <Group gap="md">
          {userName && <Text size="xs" c="dimmed">{userName}</Text>}
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid var(--epi-border)",
            color: "var(--epi-muted)", fontSize: 12, fontWeight: 600,
            padding: "5px 12px", borderRadius: 6, cursor: "pointer",
            fontFamily: "inherit", transition: "0.2s",
          }}>
            <IconLogout size={13} />
            Se déconnecter
          </button>
        </Group>
      </div>

      <ScrollArea flex={1}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
          <Stack gap="xl">
            <Stack gap={4}>
              <Text fw={700} size="xl" ff="heading">Gestion des sujets</Text>
              <Text size="sm" c="dimmed">Active les sujets pour les rendre visibles aux prospects.</Text>
            </Stack>

            <Group gap="md">
              {[
                { label: "Visibles", value: visible, color: "var(--epi-beginner)" },
                { label: "Masqués", value: invisible, color: "var(--epi-border)" },
                { label: "Total", value: subjects.length, color: "var(--epi-accent)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  background: "var(--epi-surface)", border: "1px solid var(--epi-border)",
                  borderRadius: 10, padding: "14px 20px", flex: 1, textAlign: "center",
                }}>
                  <Text fw={800} size="xl" style={{ color }}>{value}</Text>
                  <Text size="xs" c="dimmed">{label}</Text>
                </div>
              ))}
            </Group>

            {loading ? (
              <Text c="dimmed" ta="center">Chargement…</Text>
            ) : error ? (
              <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>
            ) : subjects.length === 0 ? (
              <Text c="dimmed" ta="center">Aucun sujet créé pour l'instant.</Text>
            ) : (
              <Stack gap="sm">
                {subjects.map(s => (
                  <div key={s.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--epi-surface)", border: `1px solid ${s.visible ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                    borderRadius: 10, padding: "14px 18px", gap: 12,
                    transition: "border-color 0.2s",
                  }}>
                    <Group gap="sm" style={{ minWidth: 0, flex: 1 }}>
                      <IconBook size={16} color={s.visible ? "var(--epi-beginner)" : "var(--epi-ghost)"} style={{ flexShrink: 0 }} />
                      <Stack gap={2} style={{ minWidth: 0 }}>
                        <Text fw={600} size="sm" truncate>{s.name}</Text>
                        <Group gap={6}>
                          <Badge level={s.difficulty as Subject["difficulty"]} />
                          {s.tags.map((t: string) => (
                            <span key={t} style={{
                              background: "var(--epi-bg)", color: "var(--epi-accent)",
                              fontSize: 11, fontWeight: 600, padding: "2px 7px",
                              borderRadius: 15, border: "1px solid var(--epi-border)",
                            }}>{t}</span>
                          ))}
                        </Group>
                      </Stack>
                    </Group>

                    <button
                      onClick={() => toggle(s)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: s.visible ? "rgba(74,222,128,0.1)" : "none",
                        border: `1px solid ${s.visible ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                        color: s.visible ? "var(--epi-beginner)" : "var(--epi-muted)",
                        fontSize: 12, fontWeight: 700,
                        padding: "6px 14px", borderRadius: 20,
                        cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                        flexShrink: 0,
                      }}
                    >
                      {s.visible ? <><IconEye size={13} /> Visible</> : <><IconEyeOff size={13} /> Masqué</>}
                    </button>
                  </div>
                ))}
              </Stack>
            )}
          </Stack>
        </div>
      </ScrollArea>
    </div>
  );
}
