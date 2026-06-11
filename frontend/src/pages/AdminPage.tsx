import { useState, useRef, useEffect } from "react";
import { Stack, Group, Text, ScrollArea } from "@mantine/core";
import {
  IconLock, IconLogout, IconUpload, IconX, IconCheck,
  IconPlus, IconBook, IconInbox, IconFileText, IconLink,
  IconEye, IconEyeOff, IconPencil,
} from "@tabler/icons-react";
import epitechLogo from "../assets/img/epitech_logo.png";
import { Badge } from "../components/ui/Badge";
import { TagInput } from "../components/ui/TagInput";
import type { Subject } from "../config";

import { API } from "../lib/api";

type AdminTab = "subjects" | "add-subject" | "suggestions";
type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

const DIFF_COLORS: Record<Difficulty, string> = {
  "Débutant": "var(--epi-beginner)",
  "Intermédiaire": "var(--epi-intermediate)",
  "Avancé": "var(--epi-advanced)",
};

const NAV = [
  { id: "subjects" as AdminTab, label: "Sujets", Icon: IconBook },
  { id: "suggestions" as AdminTab, label: "Suggestions", Icon: IconInbox },
  { id: "add-subject" as AdminTab, label: "Ajouter un sujet", Icon: IconPlus },
];

function AdminSidebar({ activeTab, onNavigate, onLogout }: {
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

function PasswordGate({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/admin/subjects`, {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        sessionStorage.setItem("adminToken", password);
        onUnlock(password);
      } else {
        setError("Mot de passe incorrect.");
      }
    } catch {
      setError("Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--epi-bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ width: 380 }}>
        <form onSubmit={submit}>
          <Stack gap="xl">
            <Stack gap={6} align="center">
              <a href="/"><img src={epitechLogo} height={28} alt="Epitech" style={{ marginBottom: 4, cursor: "pointer" }} /></a>
              <Text fw={700} size="xl" ff="heading">Zone Admin</Text>
              <Text size="sm" c="dimmed">Accès restreint</Text>
            </Stack>

            <div style={{
              background: "var(--epi-surface)",
              border: "1px solid var(--epi-border)",
              borderRadius: 12, padding: 28,
            }}>
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={600} mb={8}>Mot de passe</Text>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--epi-bg)",
                    border: `1px solid ${error ? "var(--epi-advanced)" : "var(--epi-border)"}`,
                    borderRadius: 8, padding: "10px 14px",
                    transition: "border-color 0.2s",
                  }}>
                    <IconLock size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                    <input
                      type="password"
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="••••••••"
                      autoFocus
                      style={{
                        flex: 1, background: "none", border: "none", outline: "none",
                        color: "#fff", fontSize: 14, fontFamily: "inherit",
                      }}
                    />
                  </div>
                  {error && (
                    <Text size="xs" mt={6} style={{ color: "var(--epi-advanced)" }}>{error}</Text>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !password}
                  style={{
                    width: "100%",
                    background: password ? "var(--epi-accent)" : "var(--epi-bg)",
                    border: "1px solid var(--epi-border)",
                    color: password ? "#fff" : "var(--epi-ghost)",
                    fontSize: 14, fontWeight: 700,
                    padding: "10px", borderRadius: 8,
                    cursor: password && !loading ? "pointer" : "not-allowed",
                    transition: "0.2s", fontFamily: "inherit",
                  }}
                >
                  {loading ? "Vérification…" : "Accéder"}
                </button>
              </Stack>
            </div>
          </Stack>
        </form>
      </div>
    </div>
  );
}



function SubjectForm({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Débutant");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file && file.type === "application/pdf") setPdfFile(file);
  };

  const reset = () => {
    setName(""); setDesc(""); setUrl(""); setDifficulty("Débutant");
    setTags([]); setPdfFile(null); setSuccess(false); setError("");
  };

  const submit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("difficulty", difficulty);
      fd.append("tags", tags.join(","));
      if (url.trim()) fd.append("url", url.trim());
      if (pdfFile) fd.append("file", pdfFile);

      const res = await fetch(`${API}/admin/subjects`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        setSuccess(true);
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

  if (success) return (
    <Stack gap="lg" align="center" mt="xl">
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "rgba(74, 222, 128, 0.1)",
        border: "1px solid var(--epi-beginner)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <IconCheck size={24} color="var(--epi-beginner)" />
      </div>
      <Stack gap={6} align="center">
        <Text fw={700} size="lg">Sujet créé !</Text>
        <Text size="sm" c="dimmed">Le sujet a été ajouté à la base de données.</Text>
      </Stack>
      <button
        onClick={reset}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "var(--epi-accent)", color: "#fff",
          border: "none", fontSize: 14, fontWeight: 700,
          padding: "10px 24px", borderRadius: 8,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        <IconPlus size={14} />
        Ajouter un autre sujet
      </button>
    </Stack>
  );

  return (
    <form onSubmit={submit}>
      <Stack gap="xl">
        <Stack gap={4}>
          <Text fw={700} size="xl" ff="heading">Créer un sujet</Text>
          <Text size="sm" c="dimmed">Le sujet sera visible par les prospects après publication.</Text>
        </Stack>

        <div style={{
          background: "var(--epi-surface)",
          border: "1px solid var(--epi-border)",
          borderRadius: 12, padding: 28,
        }}>
          <Stack gap="lg">
            <div>
              <Text size="sm" fw={600} mb={8}>Titre <span style={{ color: "var(--epi-advanced)" }}>*</span></Text>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--epi-bg)",
                border: "1px solid var(--epi-border)",
                borderRadius: 8, padding: "10px 14px",
              }}>
                <IconBook size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex : Workshop C"
                  required
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#fff", fontSize: 14, fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Description</Text>
              <textarea
                value={description}
                onChange={e => setDesc(e.target.value)}
                placeholder="Courte description du sujet…"
                rows={3}
                style={{
                  width: "100%", background: "var(--epi-bg)",
                  border: "1px solid var(--epi-border)",
                  borderRadius: 8, padding: "10px 14px",
                  color: "#fff", fontSize: 14, fontFamily: "inherit",
                  resize: "vertical", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Lien <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--epi-bg)",
                border: "1px solid var(--epi-border)",
                borderRadius: 8, padding: "10px 14px",
              }}>
                <IconLink size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://…"
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#fff", fontSize: 14, fontFamily: "inherit",
                  }}
                />
              </div>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Difficulté</Text>
              <Group gap="xs">
                {(["Débutant", "Intermédiaire", "Avancé"] as Difficulty[]).map(d => {
                  const active = difficulty === d;
                  const color = DIFF_COLORS[d];
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      style={{
                        background: active ? color : "none",
                        border: `1px solid ${active ? color : "var(--epi-border)"}`,
                        color: active ? "#111" : "var(--epi-muted)",
                        fontSize: 13, fontWeight: 600,
                        padding: "6px 16px", borderRadius: 20,
                        cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </Group>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Tags / Langage</Text>
              <TagInput tags={tags} onChange={setTags} />
              <Text size="xs" c="dimmed" mt={6}>Appuie sur Entrée ou virgule pour ajouter un tag.</Text>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Fichier PDF <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault(); setDragOver(false);
                  handleFile(e.dataTransfer.files[0] ?? null);
                }}
                style={{
                  border: `2px dashed ${dragOver ? "var(--epi-accent)" : pdfFile ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                  borderRadius: 10, padding: "28px 20px",
                  textAlign: "center", cursor: "pointer",
                  transition: "border-color 0.2s",
                  background: dragOver ? "rgba(128,157,253,0.05)" : "none",
                }}
              >
                {pdfFile ? (
                  <Group justify="center" gap="xs">
                    <IconCheck size={18} color="var(--epi-beginner)" />
                    <Text size="sm" fw={600} style={{ color: "var(--epi-beginner)" }}>{pdfFile.name}</Text>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setPdfFile(null); }}
                      style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}
                    >
                      <IconX size={14} />
                    </button>
                  </Group>
                ) : (
                  <Stack gap={6} align="center">
                    <IconUpload size={22} color="var(--epi-ghost)" />
                    <Text size="sm" c="dimmed">Glisse le PDF ici ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique pour choisir</span></Text>
                    <Text size="xs" c="dimmed">PDF uniquement</Text>
                  </Stack>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                style={{ display: "none" }}
                onChange={e => handleFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {error && (
              <Text size="sm" style={{ color: "var(--epi-advanced)" }}>{error}</Text>
            )}

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
              {loading ? "Envoi en cours…" : "Créer le sujet"}
            </button>
          </Stack>
        </div>
      </Stack>
    </form>
  );
}

interface AdminSubject extends Subject {
  id: number;
  visible: boolean;
}

interface ProposedSubject extends Subject {
  id: number;
  visible: boolean;
  proposed: boolean;
}

function EditModal({ subject, token, onClose, onSaved }: {
  subject: AdminSubject;
  token: string;
  onClose: () => void;
  onSaved: (updated: AdminSubject) => void;
}) {
  const [name, setName] = useState(subject.name);
  const [description, setDesc] = useState(subject.description);
  const [url, setUrl] = useState(subject.url ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(subject.difficulty as Difficulty);
  const [tags, setTags] = useState<string[]>(subject.tags);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [keepExisting, setKeepExisting] = useState(subject.files.length > 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (url.trim()) fd.append("url", url.trim());
      if (pdfFile) fd.append("file", pdfFile);
      else if (keepExisting && subject.files.length > 0)
        fd.append("existingFiles", subject.files.join(","));

      const res = await fetch(`${API}/admin/subjects/${subject.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json() as { subject: AdminSubject };
        onSaved({ ...data.subject, difficulty });
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
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div style={{
        background: "var(--epi-panel)", border: "1px solid var(--epi-border)",
        borderRadius: 14, width: "100%", maxWidth: 560,
        maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid var(--epi-border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0,
        }}>
          <Text fw={700} size="md">Modifier le sujet</Text>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
            <IconX size={18} />
          </button>
        </div>

        <form onSubmit={submit}>
          <Stack gap="lg" p={24}>
            <div>
              <Text size="sm" fw={600} mb={8}>Titre <span style={{ color: "var(--epi-advanced)" }}>*</span></Text>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--epi-bg)", border: "1px solid var(--epi-border)", borderRadius: 8, padding: "10px 14px" }}>
                <IconBook size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                <input value={name} onChange={e => setName(e.target.value)} required
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }} />
              </div>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Description</Text>
              <textarea value={description} onChange={e => setDesc(e.target.value)} rows={3}
                style={{ width: "100%", background: "var(--epi-bg)", border: "1px solid var(--epi-border)", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Lien <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--epi-bg)", border: "1px solid var(--epi-border)", borderRadius: 8, padding: "10px 14px" }}>
                <IconLink size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…"
                  style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }} />
              </div>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Difficulté</Text>
              <Group gap="xs">
                {(["Débutant", "Intermédiaire", "Avancé"] as Difficulty[]).map(d => {
                  const active = difficulty === d;
                  const color = DIFF_COLORS[d];
                  return (
                    <button key={d} type="button" onClick={() => setDifficulty(d)} style={{
                      background: active ? color : "none", border: `1px solid ${active ? color : "var(--epi-border)"}`,
                      color: active ? "#111" : "var(--epi-muted)", fontSize: 13, fontWeight: 600,
                      padding: "6px 16px", borderRadius: 20, cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                    }}>{d}</button>
                  );
                })}
              </Group>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Tags / Langage</Text>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Fichier PDF <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              {subject.files[0] && keepExisting && !pdfFile && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--epi-bg)", border: "1px solid var(--epi-border)", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
                  <Group gap="xs">
                    <IconFileText size={14} color="var(--epi-accent)" />
                    <Text size="sm" c="dimmed">{subject.files[0]}</Text>
                  </Group>
                  <button type="button" onClick={() => setKeepExisting(false)}
                    style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
                    <IconX size={14} />
                  </button>
                </div>
              )}
              {(!keepExisting || !subject.files[0] || pdfFile) && (
                <div onClick={() => document.getElementById("edit-pdf")?.click()} style={{
                  border: `2px dashed ${pdfFile ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                  borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s",
                }}>
                  {pdfFile ? (
                    <Group justify="center" gap="xs">
                      <IconCheck size={16} color="var(--epi-beginner)" />
                      <Text size="sm" fw={600} style={{ color: "var(--epi-beginner)" }}>{pdfFile.name}</Text>
                      <button type="button" onClick={e => { e.stopPropagation(); setPdfFile(null); setKeepExisting(subject.files.length > 0); }}
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
              )}
              <input id="edit-pdf" type="file" accept="application/pdf" style={{ display: "none" }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { setPdfFile(f); setKeepExisting(false); } }} />
            </div>

            {error && <Text size="sm" style={{ color: "var(--epi-advanced)" }}>{error}</Text>}

            <Group justify="flex-end" gap="sm">
              <button type="button" onClick={onClose} style={{
                background: "none", border: "1px solid var(--epi-border)", color: "var(--epi-muted)",
                fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8,
                cursor: "pointer", fontFamily: "inherit",
              }}>Annuler</button>
              <button type="submit" disabled={loading || !name} style={{
                background: name ? "var(--epi-accent)" : "var(--epi-bg)",
                border: "1px solid var(--epi-border)", color: name ? "#fff" : "var(--epi-ghost)",
                fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8,
                cursor: name && !loading ? "pointer" : "not-allowed", transition: "0.2s", fontFamily: "inherit",
              }}>{loading ? "Enregistrement…" : "Enregistrer"}</button>
            </Group>
          </Stack>
        </form>
      </div>
    </div>
  );
}

function AdminSubjectsTab({ token }: { token: string }) {
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<AdminSubject | null>(null);

  useEffect(() => {
    fetch(`${API}/admin/subjects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<{ subjects?: AdminSubject[] }>)
      .then(d => setSubjects(d.subjects ?? []))
      .catch(() => setError("Impossible de charger les sujets."))
      .finally(() => setLoading(false));
  }, [token]);

  const toggle = async (s: AdminSubject) => {
    const next = !s.visible;
    setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, visible: next } : x));
    await fetch(`${API}/admin/subjects/${s.id}/visible`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ visible: next }),
    });
  };

  const visible = subjects.filter(s => s.visible).length;

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;

  return (
    <>
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

        {subjects.length === 0 ? (
          <Text c="dimmed" ta="center">Aucun sujet créé pour l'instant.</Text>
        ) : (
          <Stack gap="sm">
            {subjects.map(s => (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--epi-surface)",
                border: `1px solid ${s.visible ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                borderRadius: 10, padding: "14px 18px", gap: 12, transition: "border-color 0.2s",
              }}>
                <Group gap="sm" style={{ minWidth: 0, flex: 1 }}>
                  <IconBook size={16} color={s.visible ? "var(--epi-beginner)" : "var(--epi-ghost)"} style={{ flexShrink: 0 }} />
                  <Stack gap={2} style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm" truncate>{s.name}</Text>
                    <Group gap={6} wrap="wrap">
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
                      {s.url && (
                        <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                          display: "flex", alignItems: "center", gap: 4,
                          color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                          textDecoration: "none", background: "rgba(128,157,253,0.08)",
                          border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                        }}>
                          <IconLink size={11} /> Lien
                        </a>
                      )}
                    </Group>
                  </Stack>
                </Group>
                <Group gap="xs" style={{ flexShrink: 0 }}>
                  <button
                    onClick={() => setEditTarget(s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: "none", border: "1px solid var(--epi-border)",
                      color: "var(--epi-muted)", fontSize: 12, fontWeight: 700,
                      padding: "6px 14px", borderRadius: 20,
                      cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                    }}
                  >
                    <IconPencil size={13} /> Modifier
                  </button>
                  <button
                    onClick={() => toggle(s)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: s.visible ? "rgba(74,222,128,0.1)" : "none",
                      border: `1px solid ${s.visible ? "var(--epi-beginner)" : "var(--epi-border)"}`,
                      color: s.visible ? "var(--epi-beginner)" : "var(--epi-muted)",
                      fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20,
                      cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                    }}
                  >
                    {s.visible ? <><IconEye size={13} /> Visible</> : <><IconEyeOff size={13} /> Masqué</>}
                  </button>
                </Group>
              </div>
            ))}
          </Stack>
        )}
      </Stack>

      {editTarget && (
        <EditModal
          subject={editTarget}
          token={token}
          onClose={() => setEditTarget(null)}
          onSaved={updated => {
            setSubjects(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
            setEditTarget(null);
          }}
        />
      )}
    </>
  );
}

function SuggestionsTab({ token }: { token: string }) {
  const [subjects, setSubjects] = useState<ProposedSubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectTarget, setRejectTarget] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/admin/subjects/proposed`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json() as Promise<{ subjects?: ProposedSubject[] }>)
      .then(d => setSubjects(d.subjects ?? []))
      .catch(() => setError("Impossible de charger les suggestions."))
      .finally(() => setLoading(false));
  }, [token]);

  const approve = async (id: number) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    await fetch(`${API}/admin/subjects/${id}/approve`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const confirmReject = async () => {
    if (rejectTarget === null || !rejectReason.trim()) return;
    setRejectLoading(true);
    setSubjects(prev => prev.filter(s => s.id !== rejectTarget));
    await fetch(`${API}/admin/subjects/${rejectTarget}/reject`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason.trim() }),
    });
    setRejectTarget(null);
    setRejectReason("");
    setRejectLoading(false);
  };

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;
  if (subjects.length === 0) return (
    <Stack align="center" gap="sm" mt="xl">
      <IconInbox size={32} color="var(--epi-ghost)" />
      <Text c="dimmed">Aucune suggestion pour le moment.</Text>
    </Stack>
  );

  return (
    <Stack gap="sm">
      {subjects.map(s => (
        <div key={s.id} style={{
          background: "var(--epi-surface)", border: "1px solid var(--epi-border)",
          borderRadius: 10, padding: "16px 18px",
        }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
            <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
              <Group gap="sm">
                <Text fw={700} size="sm">{s.name}</Text>
                <Badge level={s.difficulty as Subject["difficulty"]} />
              </Group>
              {s.description && (
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{s.description}</Text>
              )}
              {s.tags.length > 0 && (
                <Group gap={6}>
                  {s.tags.map((t: string) => (
                    <span key={t} style={{
                      background: "var(--epi-bg)", color: "var(--epi-accent)",
                      fontSize: 11, fontWeight: 600, padding: "2px 7px",
                      borderRadius: 15, border: "1px solid var(--epi-border)",
                    }}>{t}</span>
                  ))}
                </Group>
              )}
              {s.files[0] && (
                <a href={`${API}/uploads/${s.files[0]}`} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                  textDecoration: "none", background: "rgba(128,157,253,0.08)",
                  border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                }}>
                  <IconFileText size={11} /> PDF
                </a>
              )}
              {s.url && (
                <a href={s.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                  textDecoration: "none", background: "rgba(128,157,253,0.08)",
                  border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                }}>
                  <IconLink size={11} /> Lien
                </a>
              )}
            </Stack>

            <Group gap="xs" style={{ flexShrink: 0 }}>
              <button
                onClick={() => approve(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(74,222,128,0.1)", border: "1px solid var(--epi-beginner)",
                  color: "var(--epi-beginner)", fontSize: 12, fontWeight: 700,
                  padding: "6px 12px", borderRadius: 20,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <IconCheck size={12} /> Approuver
              </button>
              <button
                onClick={() => setRejectTarget(s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(248,113,113,0.1)", border: "1px solid var(--epi-advanced)",
                  color: "var(--epi-advanced)", fontSize: 12, fontWeight: 700,
                  padding: "6px 12px", borderRadius: 20,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                <IconX size={12} /> Refuser
              </button>
            </Group>
          </Group>
        </div>
      ))}

      {rejectTarget !== null && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24,
        }}>
          <div style={{
            background: "var(--epi-panel)", border: "1px solid var(--epi-border)",
            borderRadius: 14, padding: 28, width: "100%", maxWidth: 460,
          }}>
            <Stack gap="lg">
              <Stack gap={4}>
                <Text fw={700} size="md">Refuser la suggestion</Text>
                <Text size="sm" c="dimmed">Explique au Manta pourquoi son sujet n'est pas retenu.</Text>
              </Stack>

              <div>
                <Text size="sm" fw={600} mb={8}>Raison <span style={{ color: "var(--epi-advanced)" }}>*</span></Text>
                <textarea
                  autoFocus
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="ex : Sujet trop similaire à un existant, niveau inadapté…"
                  rows={4}
                  style={{
                    width: "100%", background: "var(--epi-bg)",
                    border: "1px solid var(--epi-border)", borderRadius: 8,
                    padding: "10px 14px", color: "#fff", fontSize: 14,
                    fontFamily: "inherit", resize: "vertical", outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <Group justify="flex-end" gap="sm">
                <button
                  onClick={() => { setRejectTarget(null); setRejectReason(""); }}
                  style={{
                    background: "none", border: "1px solid var(--epi-border)",
                    color: "var(--epi-muted)", fontSize: 13, fontWeight: 600,
                    padding: "8px 18px", borderRadius: 8,
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={confirmReject}
                  disabled={rejectLoading || !rejectReason.trim()}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: rejectReason.trim() ? "rgba(248,113,113,0.15)" : "none",
                    border: `1px solid ${rejectReason.trim() ? "var(--epi-advanced)" : "var(--epi-border)"}`,
                    color: rejectReason.trim() ? "var(--epi-advanced)" : "var(--epi-ghost)",
                    fontSize: 13, fontWeight: 700,
                    padding: "8px 18px", borderRadius: 8,
                    cursor: rejectReason.trim() && !rejectLoading ? "pointer" : "not-allowed",
                    fontFamily: "inherit", transition: "0.15s",
                  }}
                >
                  <IconX size={13} />
                  {rejectLoading ? "Refus…" : "Confirmer le refus"}
                </button>
              </Group>
            </Stack>
          </div>
        </div>
      )}
    </Stack>
  );
}

function AdminApp({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("subjects");

  return (
    <div style={{ minHeight: "100vh", background: "var(--epi-bg)", display: "flex", flexDirection: "column" }}>
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
            {tab === "subjects" && <AdminSubjectsTab token={token} />}
            {tab === "suggestions" && <SuggestionsTab token={token} />}
            {tab === "add-subject" && <SubjectForm token={token} />}
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
