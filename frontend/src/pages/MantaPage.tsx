import { useState, useEffect } from "react";
import { Stack, Group, Text, ScrollArea } from "@mantine/core";
import {
  IconEye, IconEyeOff, IconLogout, IconBook,
  IconCalendarEvent, IconPlus, IconCheck, IconUpload,
  IconX, IconMapPin, IconUsers, IconFileText,
} from "@tabler/icons-react";
import { Badge } from "../components/ui/Badge";
import { TagInput } from "../components/ui/TagInput";
import epitechLogo from "../assets/img/epitech_logo.png";
import type { Subject } from "../config";

const API = "http://localhost:8080";

type Tab = "subjects" | "propose" | "events";
type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

interface SubjectWithVisible extends Subject {
  id: number;
  visible: boolean;
}

interface EventData {
  id: number;
  name: string;
  description: string | null;
  lieu: string;
  date: string;
  capacity: number;
  registeredCount: number;
  isRegistered: boolean;
}

const DIFF_COLORS: Record<Difficulty, string> = {
  "Débutant": "var(--epi-beginner)",
  "Intermédiaire": "var(--epi-intermediate)",
  "Avancé": "var(--epi-advanced)",
};

const NAV = [
  { id: "subjects" as Tab, label: "Sujets", Icon: IconBook },
  { id: "propose" as Tab, label: "Proposer", Icon: IconPlus },
  { id: "events" as Tab, label: "Événements", Icon: IconCalendarEvent },
];

function MantaSidebar({ activeTab, onNavigate, onLogout }: {
  activeTab: Tab;
  onNavigate: (t: Tab) => void;
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
              background: activeTab === id ? "rgba(128,157,253,0.1)" : "none",
              border: "none",
              color: activeTab === id ? "var(--epi-accent)" : "var(--epi-muted)",
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


function SubjectsTab({ token }: { token: string }) {
  const [subjects, setSubjects] = useState<SubjectWithVisible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/manta/subjects`, { credentials: "include" })
      .then(r => r.json() as Promise<{ subjects?: SubjectWithVisible[] }>)
      .then(d => setSubjects(d.subjects ?? []))
      .catch(() => setError("Impossible de charger les sujets."))
      .finally(() => setLoading(false));
  }, [token]);

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

  const visible = subjects.filter(s => s.visible).length;

  return (
    <Stack gap="xl">
      <Group gap="md">
        {[
          { label: "Visibles", value: visible, color: "var(--epi-beginner)" },
          { label: "Masqués", value: subjects.length - visible, color: "var(--epi-border)" },
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
                    {s.files[0] && (
                      <a href={`${API}/uploads/${s.files[0]}`} target="_blank" rel="noopener noreferrer" style={{
                        display: "flex", alignItems: "center", gap: 4,
                        color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                        textDecoration: "none", background: "rgba(128,157,253,0.08)",
                        border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                      }}>
                        <IconFileText size={11} /> PDF
                      </a>
                    )}
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
                  cursor: "pointer", transition: "0.2s", fontFamily: "inherit", flexShrink: 0,
                }}
              >
                {s.visible ? <><IconEye size={13} /> Visible</> : <><IconEyeOff size={13} /> Masqué</>}
              </button>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function ProposeTab() {
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Débutant");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<SubjectWithVisible[]>([]);
  const [rejected, setRejected] = useState<(SubjectWithVisible & { rejectionReason: string | null })[]>([]);

  const loadProposals = () => {
    fetch(`${API}/manta/subjects/proposed`, { credentials: "include" })
      .then(r => r.json() as Promise<{ subjects?: SubjectWithVisible[] }>)
      .then(d => setProposals(d.subjects ?? []))
      .catch(() => {});
    fetch(`${API}/manta/subjects/rejected`, { credentials: "include" })
      .then(r => r.json() as Promise<{ subjects?: (SubjectWithVisible & { rejectionReason: string | null })[] }>)
      .then(d => setRejected(d.subjects ?? []))
      .catch(() => {});
  };

  const cancelProposal = async (id: number) => {
    setProposals(prev => prev.filter(s => s.id !== id));
    await fetch(`${API}/manta/subjects/proposed/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
  };

  useEffect(() => { loadProposals(); }, []);

  const reset = () => {
    setName(""); setDesc(""); setDifficulty("Débutant");
    setTags([]); setPdfFile(null); setSuccess(false); setError("");
  };

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true); setError("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("difficulty", difficulty);
      fd.append("tags", tags.join(","));
      if (pdfFile) fd.append("file", pdfFile);
      const res = await fetch(`${API}/manta/subjects/propose`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (res.ok) {
        setSuccess(true);
        loadProposals();
      } else {
        const body = await res.json().catch(() => ({}));
        setError((body as { message?: string }).message ?? "Erreur serveur.");
      }
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      {success ? (
        <Stack gap="lg" align="center">
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "rgba(74,222,128,0.1)", border: "1px solid var(--epi-beginner)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <IconCheck size={24} color="var(--epi-beginner)" />
          </div>
          <Stack gap={6} align="center">
            <Text fw={700} size="lg">Sujet proposé !</Text>
            <Text size="sm" c="dimmed">L'équipe pédagogique pourra le valider.</Text>
          </Stack>
          <button onClick={reset} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "var(--epi-accent)", color: "#fff",
            border: "none", fontSize: 14, fontWeight: 700,
            padding: "10px 24px", borderRadius: 8,
            cursor: "pointer", fontFamily: "inherit",
          }}>
            <IconPlus size={14} />
            Proposer un autre
          </button>
        </Stack>
      ) : (
        <form onSubmit={submit}>
          <Stack gap="lg">
            <div style={{ background: "var(--epi-surface)", border: "1px solid var(--epi-border)", borderRadius: 12, padding: 28 }}>
              <Stack gap="lg">
                <div>
                  <Text size="sm" fw={600} mb={8}>Titre <span style={{ color: "var(--epi-advanced)" }}>*</span></Text>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--epi-bg)", border: "1px solid var(--epi-border)",
                    borderRadius: 8, padding: "10px 14px",
                  }}>
                    <IconBook size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="ex : Workshop Rust"
                      required
                      style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }}
                    />
                  </div>
                </div>

                <div>
                  <Text size="sm" fw={600} mb={8}>Description</Text>
                  <textarea
                    value={description}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Décris brièvement le contenu du sujet…"
                    rows={3}
                    style={{
                      width: "100%", background: "var(--epi-bg)",
                      border: "1px solid var(--epi-border)", borderRadius: 8,
                      padding: "10px 14px", color: "#fff", fontSize: 14,
                      fontFamily: "inherit", resize: "vertical", outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <Text size="sm" fw={600} mb={8}>Difficulté</Text>
                  <Group gap="xs">
                    {(["Débutant", "Intermédiaire", "Avancé"] as Difficulty[]).map(d => {
                      const active = difficulty === d;
                      const color = DIFF_COLORS[d];
                      return (
                        <button key={d} type="button" onClick={() => setDifficulty(d)} style={{
                          background: active ? color : "none",
                          border: `1px solid ${active ? color : "var(--epi-border)"}`,
                          color: active ? "#111" : "var(--epi-muted)",
                          fontSize: 13, fontWeight: 600,
                          padding: "6px 16px", borderRadius: 20,
                          cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                        }}>
                          {d}
                        </button>
                      );
                    })}
                  </Group>
                </div>

                <div>
                  <Text size="sm" fw={600} mb={8}>Tags</Text>
                  <TagInput tags={tags} onChange={setTags} />
                </div>

                <div>
                  <Text size="sm" fw={600} mb={8}>Fichier PDF <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
                  <div
                    onClick={() => document.getElementById("propose-file")?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => {
                      e.preventDefault(); setDragOver(false);
                      const f = e.dataTransfer.files[0];
                      if (f?.type === "application/pdf") setPdfFile(f);
                    }}
                    style={{
                      border: `2px dashed ${dragOver ? "var(--epi-accent)" : pdfFile ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                      borderRadius: 10, padding: "24px 20px",
                      textAlign: "center", cursor: "pointer", transition: "border-color 0.2s",
                      background: dragOver ? "rgba(128,157,253,0.05)" : "none",
                    }}
                  >
                    {pdfFile ? (
                      <Group justify="center" gap="xs">
                        <IconCheck size={16} color="var(--epi-beginner)" />
                        <Text size="sm" fw={600} style={{ color: "var(--epi-beginner)" }}>{pdfFile.name}</Text>
                        <button type="button" onClick={e => { e.stopPropagation(); setPdfFile(null); }}
                          style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
                          <IconX size={12} />
                        </button>
                      </Group>
                    ) : (
                      <Group justify="center" gap="xs">
                        <IconUpload size={16} color="var(--epi-ghost)" />
                        <Text size="sm" c="dimmed">Glisse le PDF ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique</span></Text>
                      </Group>
                    )}
                  </div>
                  <input id="propose-file" type="file" accept="application/pdf" style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) setPdfFile(f); }} />
                </div>

                {error && <Text size="sm" style={{ color: "var(--epi-advanced)" }}>{error}</Text>}

                <button
                  type="submit"
                  disabled={loading || !name}
                  style={{
                    background: name ? "var(--epi-accent)" : "var(--epi-bg)",
                    border: "1px solid var(--epi-border)",
                    color: name ? "#fff" : "var(--epi-ghost)",
                    fontSize: 14, fontWeight: 700,
                    padding: "11px", borderRadius: 8,
                    cursor: name && !loading ? "pointer" : "not-allowed",
                    transition: "0.2s", fontFamily: "inherit", width: "100%",
                  }}
                >
                  {loading ? "Envoi…" : "Proposer le sujet"}
                </button>
              </Stack>
            </div>
          </Stack>
        </form>
      )}

      {proposals.length > 0 && (
        <Stack gap="sm">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>
            Suggestions en attente ({proposals.length})
          </Text>
          {proposals.map(s => (
            <div key={s.id} style={{
              background: "var(--epi-surface)", border: "1px solid var(--epi-border)",
              borderRadius: 10, padding: "12px 16px",
            }}>
              <Group justify="space-between" wrap="nowrap" gap="md">
                <Group gap="sm" wrap="wrap" style={{ minWidth: 0, flex: 1 }}>
                  <Text fw={600} size="sm">{s.name}</Text>
                  <Badge level={s.difficulty as Subject["difficulty"]} />
                  {s.tags.map((t: string) => (
                    <span key={t} style={{
                      background: "var(--epi-bg)", color: "var(--epi-muted)",
                      fontSize: 11, fontWeight: 600, padding: "2px 7px",
                      borderRadius: 15, border: "1px solid var(--epi-border)",
                    }}>{t}</span>
                  ))}
                  {s.files[0] && (
                    <a href={`${API}/uploads/${s.files[0]}`} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 4,
                      color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                      textDecoration: "none", background: "rgba(128,157,253,0.08)",
                      border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                    }}>
                      <IconFileText size={11} /> PDF
                    </a>
                  )}
                </Group>
                <button
                  onClick={() => cancelProposal(s.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "none", border: "1px solid var(--epi-border)",
                    color: "var(--epi-ghost)", fontSize: 11, fontWeight: 600,
                    padding: "4px 10px", borderRadius: 15,
                    cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                  }}
                >
                  <IconX size={11} /> Annuler
                </button>
              </Group>
            </div>
          ))}
        </Stack>
      )}

      {rejected.length > 0 && (
        <Stack gap="sm">
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: "0.06em" }}>
            Suggestions refusées ({rejected.length})
          </Text>
          {rejected.map(s => (
            <div key={s.id} style={{
              background: "var(--epi-surface)",
              border: "1px solid rgba(248,113,113,0.3)",
              borderRadius: 10, padding: "12px 16px",
            }}>
              <Stack gap={6}>
                <Group gap="sm" wrap="wrap">
                  <Text fw={600} size="sm" style={{ color: "var(--epi-muted)" }}>{s.name}</Text>
                  <Badge level={s.difficulty as Subject["difficulty"]} />
                  {s.files[0] && (
                    <a href={`${API}/uploads/${s.files[0]}`} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 4,
                      color: "var(--epi-muted)", fontSize: 11, fontWeight: 600,
                      textDecoration: "none", background: "none",
                      border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                    }}>
                      <IconFileText size={11} /> PDF
                    </a>
                  )}
                </Group>
                {s.rejectionReason && (
                  <div style={{
                    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                    borderRadius: 6, padding: "8px 12px",
                  }}>
                    <Text size="xs" style={{ color: "var(--epi-advanced)", lineHeight: 1.5 }}>
                      {s.rejectionReason}
                    </Text>
                  </div>
                )}
              </Stack>
            </div>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function EventsTab() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/manta/events`, { credentials: "include" })
      .then(r => r.json() as Promise<{ events?: EventData[] }>)
      .then(d => setEvents(d.events ?? []))
      .catch(() => setError("Impossible de charger les événements."))
      .finally(() => setLoading(false));
  }, []);

  const toggleRegistration = async (event: EventData) => {
    const next = !event.isRegistered;
    setEvents(prev => prev.map(e => e.id === event.id
      ? { ...e, isRegistered: next, registeredCount: e.registeredCount + (next ? 1 : -1) }
      : e
    ));
    await fetch(`${API}/manta/events/${event.id}/register`, {
      method: next ? "POST" : "DELETE",
      credentials: "include",
    });
  };

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;
  if (events.length === 0) return <Text c="dimmed" ta="center">Aucun événement à venir.</Text>;

  return (
    <Stack gap="sm">
      {events.map(ev => {
        const date = new Date(ev.date);
        const full = ev.registeredCount >= ev.capacity;
        return (
          <div key={ev.id} style={{
            background: "var(--epi-surface)",
            border: `1px solid ${ev.isRegistered ? "var(--epi-accent)" : "var(--epi-border)"}`,
            borderRadius: 10, padding: "18px 20px",
            transition: "border-color 0.2s",
          }}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
                <Text fw={700} size="sm">{ev.name}</Text>
                <Group gap="md">
                  <Group gap={5}>
                    <IconCalendarEvent size={12} color="var(--epi-accent)" />
                    <Text size="xs" c="dimmed">
                      {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      {" · "}
                      {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </Group>
                  <Group gap={5}>
                    <IconMapPin size={12} color="var(--epi-accent)" />
                    <Text size="xs" c="dimmed">{ev.lieu}</Text>
                  </Group>
                  <Group gap={5}>
                    <IconUsers size={12} color="var(--epi-ghost)" />
                    <Text size="xs" c="dimmed">{ev.registeredCount} / {ev.capacity}</Text>
                  </Group>
                </Group>
                {ev.description && (
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{ev.description}</Text>
                )}
              </Stack>

              <button
                onClick={() => toggleRegistration(ev)}
                disabled={full && !ev.isRegistered}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: ev.isRegistered ? "rgba(128,157,253,0.1)" : "none",
                  border: `1px solid ${ev.isRegistered ? "var(--epi-accent)" : "var(--epi-border)"}`,
                  color: ev.isRegistered ? "var(--epi-accent)" : full ? "var(--epi-ghost)" : "var(--epi-muted)",
                  fontSize: 12, fontWeight: 700,
                  padding: "6px 14px", borderRadius: 20,
                  cursor: full && !ev.isRegistered ? "not-allowed" : "pointer",
                  transition: "0.2s", fontFamily: "inherit", flexShrink: 0,
                }}
              >
                {ev.isRegistered ? <><IconCheck size={13} /> Inscrit</> : full ? "Complet" : <><IconPlus size={13} /> S'inscrire</>}
              </button>
            </Group>
          </div>
        );
      })}
    </Stack>
  );
}

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
    <div style={{ minHeight: "100vh", background: "var(--epi-bg)", display: "flex", flexDirection: "column" }}>
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
        {userName && <Text size="xs" c="dimmed">{userName}</Text>}
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
