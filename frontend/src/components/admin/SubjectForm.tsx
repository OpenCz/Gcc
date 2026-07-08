import { useState, useEffect, useRef } from "react";
import { Stack, Group, Text } from "@mantine/core";
import { IconUpload, IconX, IconCheck, IconPlus, IconBook, IconLink, IconFolder } from "@tabler/icons-react";
import { TagInput } from "../ui/TagInput";
import { type Difficulty, type Folder, DIFF_COLORS } from "./types";
import { API } from "../../lib/api";

export function SubjectForm({ token, defaultFolderId = null }: {
  token: string;
  defaultFolderId?: number | null;
}) {
  const [name, setName] = useState("");
  const [description, setDesc] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("Débutant");
  const [tags, setTags] = useState<string[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderId, setFolderId] = useState<string>(defaultFolderId !== null ? String(defaultFolderId) : "");
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API}/admin/folders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() as Promise<{ folders?: Folder[] }> : Promise.reject())
      .then(d => setFolders(d.folders ?? []))
      .catch(() => {});
  }, [token]);

  const ALLOWED_EXTS = new Set([".pdf", ".png", ".jpg", ".jpeg", ".md"]);
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const valid = Array.from(list).filter(f => {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      return ALLOWED_EXTS.has(ext);
    });
    setPdfFiles(prev => [...prev, ...valid]);
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
      fd.append("folderId", folderId);
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
          background: "var(--epi-blue)", color: "#fff",
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
                    color: "var(--epi-text)", fontSize: 14, fontFamily: "inherit",
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
                  color: "var(--epi-text)", fontSize: 14, fontFamily: "inherit",
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

            {folders.length > 0 && (
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
                      color: "var(--epi-text)", fontSize: 14, fontFamily: "inherit", cursor: "pointer",
                    }}
                  >
                    <option value="" style={{ background: "var(--epi-surface)" }}>Racine (aucun dossier)</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id} style={{ background: "var(--epi-surface)" }}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div>
              <Text size="sm" fw={600} mb={8}>Fichiers <Text component="span" size="xs" c="dimmed">(PDF, image, Markdown (optionnel))</Text></Text>
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
                    <Text size="sm" c="dimmed">Glisse des fichiers ici ou <span style={{ color: "var(--epi-accent)", fontWeight: 600 }}>clique pour choisir</span></Text>
                    <Text size="xs" c="dimmed">PDF, PNG, JPG, Markdown (plusieurs fichiers acceptés)</Text>
                  </Stack>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.md" multiple style={{ display: "none" }}
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
                background: name ? "var(--epi-blue)" : "var(--epi-bg)",
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
