import { useState, useRef, useEffect } from "react";
import { Stack, Group, Text, ScrollArea } from "@mantine/core";
import {
  IconLock, IconLogout, IconUpload, IconX, IconCheck,
  IconPlus, IconBook, IconInbox, IconFileText, IconLink,
  IconEye, IconEyeOff, IconPencil, IconUsers, IconTrash,
  IconPin, IconPinnedOff,
} from "@tabler/icons-react";
import epitechLogo from "../assets/img/epitech_logo.png";
import { Badge } from "../components/ui/Badge";
import { TagInput } from "../components/ui/TagInput";
import type { Subject } from "../config";

import { API } from "../lib/api";

type AdminTab = "subjects" | "add-subject" | "suggestions" | "whitelist";
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
  { id: "whitelist" as AdminTab, label: "Whitelist", Icon: IconUsers },
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
  const [urls, setUrls] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Débutant");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const pdfs = Array.from(list).filter(f => f.type === "application/pdf");
    setPdfFiles(prev => [...prev, ...pdfs]);
  };

  const reset = () => {
    setName(""); setDesc(""); setUrls([]); setDifficulty("Débutant");
    setTags([]); setPdfFiles([]); setSuccess(false); setError("");
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
      const validUrls = urls.map(u => u.trim()).filter(Boolean);
      if (validUrls.length > 0) fd.append("urls", validUrls.join("\n"));
      for (const f of pdfFiles) fd.append("file", f);

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
              <Text size="sm" fw={600} mb={8}>Liens <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <Stack gap={8}>
                {urls.map((u, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 10, flex: 1,
                      background: "var(--epi-bg)", border: "1px solid var(--epi-border)",
                      borderRadius: 8, padding: "10px 14px",
                    }}>
                      <IconLink size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                      <input
                        value={u}
                        onChange={e => { const next = [...urls]; next[i] = e.target.value; setUrls(next); }}
                        placeholder="https://…"
                        style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }}
                      />
                    </div>
                    <button type="button" onClick={() => setUrls(urls.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "1px solid var(--epi-border)", color: "var(--epi-ghost)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", padding: "0 10px" }}>
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setUrls([...urls, ""])}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: "none", border: "1px dashed var(--epi-border)",
                    color: "var(--epi-muted)", fontSize: 13, fontWeight: 600,
                    padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", width: "100%",
                  }}>
                  <IconPlus size={14} /> Ajouter un lien
                </button>
              </Stack>
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
              <Text size="sm" fw={600} mb={8}>Fichiers PDF <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <Stack gap={8}>
                {pdfFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--epi-bg)", border: "1px solid var(--epi-beginner)", borderRadius: 8, padding: "10px 14px" }}>
                    <Group gap="xs">
                      <IconCheck size={14} color="var(--epi-beginner)" />
                      <Text size="sm" fw={600} style={{ color: "var(--epi-beginner)" }}>{f.name}</Text>
                    </Group>
                    <button type="button" onClick={() => setPdfFiles(pdfFiles.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  style={{
                    border: `2px dashed ${dragOver ? "var(--epi-accent)" : "var(--epi-border)"}`,
                    borderRadius: 10, padding: "24px 20px", textAlign: "center", cursor: "pointer",
                    transition: "border-color 0.2s", background: dragOver ? "rgba(128,157,253,0.05)" : "none",
                  }}
                >
                  <Stack gap={6} align="center">
                    <IconUpload size={22} color="var(--epi-ghost)" />
                    <Text size="sm" c="dimmed">Glisse des PDFs ici ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique pour choisir</span></Text>
                    <Text size="xs" c="dimmed">PDF uniquement — plusieurs fichiers acceptés</Text>
                  </Stack>
                </div>
                <input ref={fileInputRef} type="file" accept="application/pdf" multiple style={{ display: "none" }}
                  onChange={e => { addFiles(e.target.files); if (fileInputRef.current) fileInputRef.current.value = ""; }} />
              </Stack>
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
  pinned: boolean;
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
  const [urls, setUrls] = useState<string[]>(subject.urls ?? []);
  const [difficulty, setDifficulty] = useState<Difficulty>(subject.difficulty as Difficulty);
  const [tags, setTags] = useState<string[]>(subject.tags);
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([]);
  const [keepFiles, setKeepFiles] = useState<string[]>(subject.files);
  const [dragOver, setDragOver] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const pdfs = Array.from(list).filter(f => f.type === "application/pdf");
    setNewPdfFiles(prev => [...prev, ...pdfs]);
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
      const validUrls = urls.map(u => u.trim()).filter(Boolean);
      if (validUrls.length > 0) fd.append("urls", validUrls.join("\n"));
      if (keepFiles.length > 0) fd.append("existingFiles", keepFiles.join(","));
      for (const f of newPdfFiles) fd.append("file", f);

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
              <Text size="sm" fw={600} mb={8}>Liens <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <Stack gap={8}>
                {urls.map((u, i) => (
                  <div key={i} style={{ display: "flex", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, background: "var(--epi-bg)", border: "1px solid var(--epi-border)", borderRadius: 8, padding: "10px 14px" }}>
                      <IconLink size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                      <input value={u} onChange={e => { const next = [...urls]; next[i] = e.target.value; setUrls(next); }} placeholder="https://…"
                        style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "inherit" }} />
                    </div>
                    <button type="button" onClick={() => setUrls(urls.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "1px solid var(--epi-border)", color: "var(--epi-ghost)", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", padding: "0 10px" }}>
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => setUrls([...urls, ""])}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: "1px dashed var(--epi-border)", color: "var(--epi-muted)", fontSize: 13, fontWeight: 600, padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", width: "100%" }}>
                  <IconPlus size={14} /> Ajouter un lien
                </button>
              </Stack>
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
              <Text size="sm" fw={600} mb={8}>Fichiers PDF <Text component="span" size="xs" c="dimmed">(optionnel)</Text></Text>
              <Stack gap={8}>
                {keepFiles.map(name => (
                  <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--epi-bg)", border: "1px solid var(--epi-border)", borderRadius: 8, padding: "10px 14px" }}>
                    <Group gap="xs">
                      <IconFileText size={14} color="var(--epi-accent)" />
                      <Text size="sm" c="dimmed">{name}</Text>
                    </Group>
                    <button type="button" onClick={() => setKeepFiles(keepFiles.filter(f => f !== name))}
                      style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
                {newPdfFiles.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--epi-bg)", border: "1px solid var(--epi-beginner)", borderRadius: 8, padding: "10px 14px" }}>
                    <Group gap="xs">
                      <IconCheck size={14} color="var(--epi-beginner)" />
                      <Text size="sm" fw={600} style={{ color: "var(--epi-beginner)" }}>{f.name}</Text>
                    </Group>
                    <button type="button" onClick={() => setNewPdfFiles(newPdfFiles.filter((_, j) => j !== i))}
                      style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
                      <IconX size={14} />
                    </button>
                  </div>
                ))}
                <div onClick={() => editFileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                  style={{ border: `2px dashed ${dragOver ? "var(--epi-accent)" : "var(--epi-border)"}`, borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer", transition: "border-color 0.2s", background: dragOver ? "rgba(128,157,253,0.05)" : "none" }}>
                  <Group justify="center" gap="xs">
                    <IconUpload size={16} color="var(--epi-ghost)" />
                    <Text size="sm" c="dimmed">Glisse des PDFs ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique</span></Text>
                  </Group>
                </div>
                <input ref={editFileRef} type="file" accept="application/pdf" multiple style={{ display: "none" }}
                  onChange={e => { addFiles(e.target.files); if (editFileRef.current) editFileRef.current.value = ""; }} />
              </Stack>
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

  const togglePin = async (s: AdminSubject) => {
    const next = !s.pinned;
    setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, pinned: next } : x));
    await fetch(`${API}/admin/subjects/${s.id}/pinned`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: next }),
    });
  };

  const visible = subjects.filter(s => s.visible).length;
  const pinned = subjects.filter(s => s.pinned).length;

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;

  return (
    <>
      <Stack gap="xl">
        <Group gap="md">
          {[
            { label: "Visibles", value: visible, color: "var(--epi-beginner)" },
            { label: "Épinglés", value: pinned, color: "var(--epi-intermediate)" },
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
                      {s.urls?.map(u => (
                        <a key={u} href={u} target="_blank" rel="noopener noreferrer" style={{
                          display: "flex", alignItems: "center", gap: 4,
                          color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                          textDecoration: "none", background: "rgba(128,157,253,0.08)",
                          border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                        }}>
                          <IconLink size={11} /> Lien
                        </a>
                      ))}
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
                    onClick={() => togglePin(s)}
                    title={s.pinned ? "Désépingler" : "Épingler pour les prospects"}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      background: s.pinned ? "rgba(255,183,77,0.12)" : "none",
                      border: `1px solid ${s.pinned ? "var(--epi-intermediate)" : "var(--epi-border)"}`,
                      color: s.pinned ? "var(--epi-intermediate)" : "var(--epi-muted)",
                      fontSize: 12, fontWeight: 700, padding: "6px 14px", borderRadius: 20,
                      cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                    }}
                  >
                    {s.pinned ? <><IconPin size={13} /> Épinglé</> : <><IconPinnedOff size={13} /> Épingler</>}
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
              {s.urls?.map(u => (
                <a key={u} href={u} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  color: "var(--epi-accent)", fontSize: 11, fontWeight: 600,
                  textDecoration: "none", background: "rgba(128,157,253,0.08)",
                  border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                }}>
                  <IconLink size={11} /> Lien
                </a>
              ))}
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

type WhitelistEntry = { id: number; email: string; role: "MANTA" | "PEDA" };

function WhitelistTab({ token }: { token: string }) {
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"MANTA" | "PEDA">("MANTA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    fetch(`${API}/admin/whitelist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setEntries(d.whitelist ?? []));
  };

  useEffect(() => { load(); }, [token]);

  const add = async () => {
    if (!email.trim()) return;
    setLoading(true); setError("");
    const res = await fetch(`${API}/admin/whitelist`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
    });
    setLoading(false);
    if (res.ok) { setEmail(""); load(); }
    else setError("Erreur lors de l'ajout");
  };

  const remove = async (id: number) => {
    await fetch(`${API}/admin/whitelist/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    load();
  };

  const roleColor = (r: string) => r === "PEDA" ? "var(--epi-accent)" : "var(--epi-beginner)";

  return (
    <Stack gap="xl">
      <Text fw={700} size="lg">Whitelist</Text>

      {/* Formulaire d'ajout */}
      <div style={{ background: "var(--epi-panel)", borderRadius: 10, padding: 20, border: "1px solid var(--epi-border)" }}>
        <Text fw={600} size="sm" mb={12}>Ajouter un accès</Text>
        <Stack gap={10}>
          <input
            placeholder="email@epitech.eu"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
            style={{
              background: "var(--epi-input)", border: "1px solid var(--epi-border)",
              borderRadius: 8, padding: "8px 12px", color: "var(--epi-text)",
              fontSize: 13, width: "100%", boxSizing: "border-box",
            }}
          />
          <Group gap={8}>
            {(["MANTA", "PEDA"] as const).map(r => (
              <button key={r} onClick={() => setRole(r)} style={{
                padding: "6px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: role === r ? roleColor(r) : "transparent",
                color: role === r ? "#fff" : "var(--epi-muted)",
                border: `1px solid ${role === r ? roleColor(r) : "var(--epi-border)"}`,
              }}>{r}</button>
            ))}
            <button onClick={add} disabled={loading || !email.trim()} style={{
              marginLeft: "auto", padding: "6px 16px", borderRadius: 8, fontSize: 12,
              fontWeight: 600, cursor: "pointer", background: "var(--epi-accent)",
              color: "#fff", border: "none", opacity: loading || !email.trim() ? 0.5 : 1,
            }}>
              <Group gap={6}><IconPlus size={12} />{loading ? "Ajout…" : "Ajouter"}</Group>
            </button>
          </Group>
          {error && <Text size="xs" c="red">{error}</Text>}
        </Stack>
      </div>

      {/* Liste */}
      <Stack gap={8}>
        {entries.length === 0 && <Text size="sm" c="dimmed">Aucune entrée dans la whitelist.</Text>}
        {entries.map(e => (
          <div key={e.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "var(--epi-panel)", borderRadius: 8, padding: "10px 14px",
            border: "1px solid var(--epi-border)",
          }}>
            <Group gap={10}>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: roleColor(e.role) + "22", color: roleColor(e.role),
              }}>{e.role}</span>
              <Text size="sm">{e.email}</Text>
            </Group>
            <button onClick={() => remove(e.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "var(--epi-muted)", padding: 4, borderRadius: 4,
              display: "flex", alignItems: "center",
            }}>
              <IconTrash size={14} />
            </button>
          </div>
        ))}
      </Stack>
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
