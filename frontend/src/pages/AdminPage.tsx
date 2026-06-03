import { useState, useRef } from "react";
import { Stack, Group, Text, ScrollArea } from "@mantine/core";
import {
  IconLock, IconLogout, IconUpload, IconX, IconCheck,
  IconPlus, IconBook,
} from "@tabler/icons-react";
import epitechLogo from "../assets/img/epitech_logo.png";

const API = "http://localhost:8080";

type Difficulty = "Débutant" | "Intermédiaire" | "Avancé";

const DIFF_COLORS: Record<Difficulty, string> = {
  "Débutant":      "var(--epi-beginner)",
  "Intermédiaire": "var(--epi-intermediate)",
  "Avancé":        "var(--epi-advanced)",
};

// ─── Password Gate ──────────────────────────────────────────────────────────

function PasswordGate({ onUnlock }: { onUnlock: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const submit = async (e: React.FormEvent) => {
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
        console.log(password);
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

// ─── Tag Input ───────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim();
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setInput("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6,
      background: "var(--epi-bg)",
      border: "1px solid var(--epi-border)",
      borderRadius: 8, padding: "8px 12px", minHeight: 42,
    }}>
      {tags.map(tag => (
        <span key={tag} style={{
          display: "flex", alignItems: "center", gap: 4,
          background: "var(--epi-surface)",
          color: "var(--epi-accent)",
          border: "1px solid var(--epi-border)",
          fontSize: 12, fontWeight: 600,
          padding: "2px 8px", borderRadius: 15,
        }}>
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter(t => t !== tag))}
            style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex", padding: 0 }}
          >
            <IconX size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKey}
        onBlur={() => input.trim() && addTag(input)}
        placeholder={tags.length === 0 ? "C, C++, Python… (Entrée pour ajouter)" : ""}
        style={{
          flex: 1, minWidth: 120, background: "none", border: "none", outline: "none",
          color: "#fff", fontSize: 13, fontFamily: "inherit",
        }}
      />
    </div>
  );
}

// ─── Subject Form ────────────────────────────────────────────────────────────

function SubjectForm({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [name, setName]             = useState("");
  const [description, setDesc]      = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Débutant");
  const [tags, setTags]             = useState<string[]>([]);
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [dragOver, setDragOver]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState("");
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (file && file.type === "application/pdf") setPdfFile(file);
  };

  const reset = () => {
    setName(""); setDesc(""); setDifficulty("Débutant");
    setTags([]); setPdfFile(null); setSuccess(false); setError("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pdfFile) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("description", description);
      fd.append("difficulty", difficulty);
      fd.append("tags", tags.join(","));
      fd.append("file", pdfFile);

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

  return (
    <div style={{ minHeight: "100vh", background: "var(--epi-bg)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{
        height: 48, display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 24px",
        background: "var(--epi-panel)",
        borderBottom: "1px solid var(--epi-border)",
        flexShrink: 0,
      }}>
        <Group gap="sm">
          <a href="/"><img src={epitechLogo} height={22} alt="Epitech" style={{ cursor: "pointer" }} /></a>
          <Text size="sm" c="dimmed">Admin</Text>
          <Text size="sm" c="dimmed">/</Text>
          <Text size="sm" fw={600}>Nouveau sujet</Text>
        </Group>
        <button
          onClick={onLogout}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid var(--epi-border)",
            color: "var(--epi-muted)", fontSize: 12, fontWeight: 600,
            padding: "5px 12px", borderRadius: 6,
            cursor: "pointer", fontFamily: "inherit", transition: "0.2s",
          }}
        >
          <IconLogout size={13} />
          Se déconnecter
        </button>
      </div>

      {/* Content */}
      <ScrollArea flex={1}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 24px" }}>
          {success ? (
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
          ) : (
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

                    {/* Name */}
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

                    {/* Description */}
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

                    {/* Difficulty */}
                    <div>
                      <Text size="sm" fw={600} mb={8}>Difficulté</Text>
                      <Group gap="xs">
                        {(["Débutant", "Intermédiaire", "Avancé"] as Difficulty[]).map(d => {
                          const active = difficulty === d;
                          const color  = DIFF_COLORS[d];
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

                    {/* Tags */}
                    <div>
                      <Text size="sm" fw={600} mb={8}>Tags / Langage</Text>
                      <TagInput tags={tags} onChange={setTags} />
                      <Text size="xs" c="dimmed" mt={6}>Appuie sur Entrée ou virgule pour ajouter un tag.</Text>
                    </div>

                    {/* PDF */}
                    <div>
                      <Text size="sm" fw={600} mb={8}>Fichier PDF <span style={{ color: "var(--epi-advanced)" }}>*</span></Text>
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
                      disabled={loading || !name || !pdfFile}
                      style={{
                        background: name && pdfFile ? "var(--epi-accent)" : "var(--epi-bg)",
                        border: "1px solid var(--epi-border)",
                        color: name && pdfFile ? "#fff" : "var(--epi-ghost)",
                        fontSize: 14, fontWeight: 700,
                        padding: "11px", borderRadius: 8,
                        cursor: name && pdfFile && !loading ? "pointer" : "not-allowed",
                        transition: "0.2s", fontFamily: "inherit", width: "100%",
                      }}
                    >
                      {loading ? "Envoi en cours…" : "Créer le sujet"}
                    </button>
                  </Stack>
                </div>
              </Stack>
            </form>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export function AdminPage() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") ?? "");

  const logout = () => {
    sessionStorage.removeItem("adminToken");
    setToken("");
  };

  if (!token) return <PasswordGate onUnlock={setToken} />;
  return <SubjectForm token={token} onLogout={logout} />;
}
