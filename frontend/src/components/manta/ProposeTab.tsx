import { useState, useEffect, useRef } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconPlus, IconCheck, IconUpload, IconX, IconBook, IconLink, IconFileText,
} from "@tabler/icons-react";
import { Badge } from "../ui/Badge";
import { TagInput } from "../ui/TagInput";
import type { Subject } from "../../config";
import { type Difficulty, type SubjectWithVisible, DIFF_COLORS } from "./types";
import { API } from "../../lib/api";

export function ProposeTab() {
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Débutant");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const proposeFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [proposals, setProposals] = useState<SubjectWithVisible[]>([]);
  const [rejected, setRejected] = useState<(SubjectWithVisible & { rejectionReason: string | null })[]>([]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const pdfs = Array.from(list).filter(f => f.type === "application/pdf");
    setPdfFiles(prev => [...prev, ...pdfs]);
  };

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
    setName(""); setDesc(""); setUrls([]); setDifficulty("Débutant");
    setTags([]); setPdfFiles([]); setSuccess(false); setError("");
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
      for (const f of pdfFiles) fd.append("file", f);
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
            background: "var(--epi-blue)", color: "#fff",
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
                      style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--epi-text)", fontSize: 14, fontFamily: "inherit" }}
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
                      padding: "10px 14px", color: "var(--epi-text)", fontSize: 14,
                      fontFamily: "inherit", resize: "vertical", outline: "none",
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
                            style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--epi-text)", fontSize: 14, fontFamily: "inherit" }}
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
                          <IconX size={12} />
                        </button>
                      </div>
                    ))}
                    <div
                      onClick={() => proposeFileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                      style={{
                        border: `2px dashed ${dragOver ? "var(--epi-accent)" : "var(--epi-border)"}`,
                        borderRadius: 10, padding: "24px 20px", textAlign: "center", cursor: "pointer",
                        transition: "border-color 0.2s", background: dragOver ? "rgba(128,157,253,0.05)" : "none",
                      }}
                    >
                      <Group justify="center" gap="xs">
                        <IconUpload size={16} color="var(--epi-ghost)" />
                        <Text size="sm" c="dimmed">Glisse des PDFs ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique</span></Text>
                      </Group>
                    </div>
                    <input ref={proposeFileRef} type="file" accept="application/pdf" multiple style={{ display: "none" }}
                      onChange={e => { addFiles(e.target.files); if (proposeFileRef.current) proposeFileRef.current.value = ""; }} />
                  </Stack>
                </div>

                {error && <Text size="sm" style={{ color: "var(--epi-advanced)" }}>{error}</Text>}

                <button
                  type="submit"
                  disabled={loading || !name}
                  style={{
                    background: name ? "var(--epi-blue)" : "var(--epi-bg)",
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
                  {s.urls?.map(u => (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 4,
                      color: "var(--epi-muted)", fontSize: 11, fontWeight: 600,
                      textDecoration: "none", background: "none",
                      border: "1px solid var(--epi-border)", padding: "2px 8px", borderRadius: 15,
                    }}>
                      <IconLink size={11} /> Lien
                    </a>
                  ))}
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
