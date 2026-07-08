import { useState, useRef } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconUpload, IconX, IconCheck, IconPlus, IconBook,
  IconLink, IconFileText, IconFolder,
} from "@tabler/icons-react";
import { TagInput } from "../ui/TagInput";
import { type AdminSubject, type Difficulty, type Folder, DIFF_COLORS } from "./types";
import { API } from "../../lib/api";

export function EditModal({ subject, token, folders, onClose, onSaved }: {
  subject: AdminSubject;
  token: string;
  folders: Folder[];
  onClose: () => void;
  onSaved: (updated: AdminSubject) => void;
}) {
  const [name, setName] = useState(subject.name);
  const [description, setDesc] = useState(subject.description);
  const [urls, setUrls] = useState<string[]>(subject.urls ?? []);
  const [difficulty, setDifficulty] = useState<Difficulty>(subject.difficulty as Difficulty);
  const [folderId, setFolderId] = useState<string>(subject.folderId !== null ? String(subject.folderId) : "");
  const [tags, setTags] = useState<string[]>(subject.tags);
  const [newPdfFiles, setNewPdfFiles] = useState<File[]>([]);
  const [keepFiles, setKeepFiles] = useState<string[]>(subject.files);
  const [dragOver, setDragOver] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ALLOWED_EXTS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".md"]);
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const valid = Array.from(list).filter(f => {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      return ALLOWED_EXTS.has(ext);
    });
    setNewPdfFiles(prev => [...prev, ...valid]);
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
      fd.append("folderId", folderId);
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
              <Text size="sm" fw={600} mb={8}>Dossier</Text>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                background: "var(--epi-bg)", border: "1px solid var(--epi-border)",
                borderRadius: 8, padding: "10px 14px",
              }}>
                <IconFolder size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                <select
                  value={folderId}
                  onChange={e => setFolderId(e.target.value)}
                  style={{
                    flex: 1, background: "none", border: "none", outline: "none",
                    color: "#fff", fontSize: 14, fontFamily: "inherit", cursor: "pointer",
                  }}
                >
                  <option value="" style={{ background: "var(--epi-surface)" }}>Racine (aucun dossier)</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id} style={{ background: "var(--epi-surface)" }}>{f.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Text size="sm" fw={600} mb={8}>Fichiers <Text component="span" size="xs" c="dimmed">(PDF, image, Markdown (optionnel))</Text></Text>
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
                    <Text size="sm" c="dimmed">Glisse des fichiers ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique</span></Text>
                  </Group>
                </div>
                <input ref={editFileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.md" multiple style={{ display: "none" }}
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
                background: name ? "var(--epi-blue)" : "var(--epi-bg)",
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
