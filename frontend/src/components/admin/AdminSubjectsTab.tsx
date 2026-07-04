import { useState, useEffect, useMemo, useRef } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconBook, IconFileText, IconLink,
  IconEye, IconEyeOff, IconPencil, IconPin, IconPinnedOff,
  IconFolder, IconFolderPlus, IconPlus, IconTrash, IconX,
  IconArrowLeft, IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "../ui/Badge";
import type { Subject } from "../../config";
import { type AdminSubject, type Folder } from "./types";
import { EditModal } from "./EditModal";
import { API } from "../../lib/api";

type FolderModal = | { mode: "create" } | { mode: "rename"; folder: Folder } | null;

export function AdminSubjectsTab({ token, onAddSubject }: {
  token: string;
  onAddSubject: (folderId: number | null) => void;
}) {
  const [subjects, setSubjects] = useState<AdminSubject[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editTarget, setEditTarget] = useState<AdminSubject | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [folderModal, setFolderModal] = useState<FolderModal>(null);
  const [folderName, setFolderName] = useState("");
  const [folderLoading, setFolderLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotice = (message: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(""), 4000);
  };

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/admin/subjects`, { headers: authHeaders }).then(r => r.ok ? r.json() as Promise<{ subjects?: AdminSubject[] }> : Promise.reject()),
      fetch(`${API}/admin/folders`, { headers: authHeaders }).then(r => r.ok ? r.json() as Promise<{ folders?: Folder[] }> : Promise.reject()),
    ]).then(([subs, fols]) => {
      if (subs.status === "fulfilled") setSubjects(subs.value.subjects ?? []);
      else setError("Impossible de charger les sujets.");
      if (fols.status === "fulfilled") setFolders(fols.value.folders ?? []);
    }).finally(() => setLoading(false));
  }, [token]);

  const toggle = async (s: AdminSubject) => {
    const next = !s.visible;
    setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, visible: next } : x));
    await fetch(`${API}/admin/subjects/${s.id}/visible`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ visible: next }),
    });
  };

  const togglePin = async (s: AdminSubject) => {
    const next = !s.pinned;
    setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, pinned: next } : x));
    const res = await fetch(`${API}/admin/subjects/${s.id}/pinned`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ pinned: next }),
    });
    if (!res.ok) setSubjects(prev => prev.map(x => x.id === s.id ? { ...x, pinned: s.pinned } : x));
  };

  const submitFolderModal = async () => {
    const name = folderName.trim();
    if (!name || !folderModal) return;
    setFolderLoading(true);
    try {
      if (folderModal.mode === "create") {
        const res = await fetch(`${API}/admin/folders`, {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const { folder } = await res.json() as { folder: Folder };
          setFolders(prev => [...prev, { ...folder, _count: { subjects: 0 } }].sort((a, b) => a.name.localeCompare(b.name)));
        }
      } else {
        const id = folderModal.folder.id;
        const res = await fetch(`${API}/admin/folders/${id}`, {
          method: "PATCH",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok)
          setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f).sort((a, b) => a.name.localeCompare(b.name)));
      }
    } finally {
      setFolderLoading(false);
      setFolderModal(null);
      setFolderName("");
    }
  };

  const deleteFolder = async (folder: Folder) => {
    if (!confirm(`Supprimer le dossier « ${folder.name} » ? Les sujets qu'il contient retourneront à la racine.`)) return;
    setFolders(prev => prev.filter(f => f.id !== folder.id));
    setSubjects(prev => prev.map(s => s.folderId === folder.id ? { ...s, folderId: null } : s));
    if (currentFolderId === folder.id) setCurrentFolderId(null);
    await fetch(`${API}/admin/folders/${folder.id}`, {
      method: "DELETE",
      headers: authHeaders,
    });
  };

  const makeAllVisible = async () => {
    const before = subjects;
    setSubjects(prev => prev.map(s => ({ ...s, visible: true })));
    const res = await fetch(`${API}/admin/subjects/visible-all`, {
      method: "PATCH",
      headers: { ...authHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ visible: true }),
    });
    if (!res.ok) setSubjects(before);
  };

  const currentFolder = folders.find(f => f.id === currentFolderId) ?? null;
  const shownSubjects = useMemo(
    () => subjects.filter(s => s.folderId === currentFolderId),
    [subjects, currentFolderId]
  );
  const folderCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const s of subjects)
      if (s.folderId !== null) counts.set(s.folderId, (counts.get(s.folderId) ?? 0) + 1);
    return counts;
  }, [subjects]);

  const visible = subjects.filter(s => s.visible).length;
  const pinned = subjects.filter(s => s.pinned).length;

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;

  return (
    <>
      <Stack gap="xl">
        {currentFolder === null ? (
          <Stack gap="sm">
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
            {visible < subjects.length && (
              <Group justify="flex-end">
                <button
                  onClick={makeAllVisible}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    background: "rgba(74,222,128,0.1)", border: "1px solid var(--epi-beginner)",
                    color: "var(--epi-beginner)", fontSize: 12, fontWeight: 700,
                    padding: "6px 14px", borderRadius: 20,
                    cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                  }}
                >
                  <IconEye size={13} /> Mettre tous les sujets visibles
                </button>
              </Group>
            )}
          </Stack>
        ) : (
          <Group gap="xs">
            <button
              onClick={() => setCurrentFolderId(null)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "none",
                color: "var(--epi-muted)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", padding: "4px 0",
              }}
            >
              <IconArrowLeft size={15} /> Sujets
            </button>
            <IconChevronRight size={13} color="var(--epi-ghost)" />
            <Group gap={6}>
              <IconFolder size={15} color="var(--epi-accent)" />
              <Text fw={700} size="sm">{currentFolder.name}</Text>
            </Group>
          </Group>
        )}

        {currentFolder === null && folders.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 10,
          }}>
            {folders.map(f => {
              const count = folderCounts.get(f.id) ?? 0;
              return (
                <div
                  key={f.id}
                  onClick={() => setCurrentFolderId(f.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "var(--epi-surface)",
                    border: "1px solid var(--epi-border)",
                    borderRadius: 10, padding: "12px 14px",
                    cursor: "pointer", transition: "border-color 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--epi-accent)";
                    const actions = e.currentTarget.querySelector<HTMLDivElement>("[data-folder-actions]");
                    if (actions) actions.style.opacity = "1";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "var(--epi-border)";
                    const actions = e.currentTarget.querySelector<HTMLDivElement>("[data-folder-actions]");
                    if (actions) actions.style.opacity = "0";
                  }}
                >
                  <IconFolder size={18} color="var(--epi-accent)" style={{ flexShrink: 0 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <Text fw={600} size="sm" truncate>{f.name}</Text>
                    <Text size="xs" c="dimmed">{count} sujet{count > 1 ? "s" : ""}</Text>
                  </div>
                  <div data-folder-actions style={{ display: "flex", gap: 4, opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}>
                    <button
                      onClick={e => { e.stopPropagation(); setFolderName(f.name); setFolderModal({ mode: "rename", folder: f }); }}
                      title="Renommer"
                      style={{ background: "none", border: "none", color: "var(--epi-muted)", cursor: "pointer", display: "flex", padding: 3 }}
                    >
                      <IconPencil size={14} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); deleteFolder(f); }}
                      title="Supprimer"
                      style={{ background: "none", border: "none", color: "var(--epi-advanced)", cursor: "pointer", display: "flex", padding: 3 }}
                    >
                      <IconTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {shownSubjects.length === 0 ? (
          <Text c="dimmed" ta="center">
            {currentFolder === null
              ? (subjects.length === 0 ? "Aucun sujet créé pour l'instant." : "Aucun sujet à la racine.")
              : "Ce dossier est vide."}
          </Text>
        ) : (
          <Stack gap="sm">
            {shownSubjects.map(s => (
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

      {/* Toast d'information */}
      {notice && (
        <div style={{
          position: "fixed", bottom: 96, right: 32, zIndex: 100,
          background: "var(--epi-panel)", border: "1px solid var(--epi-intermediate)",
          borderRadius: 10, padding: "12px 16px", maxWidth: 320,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          animation: "noticeIn 0.2s ease",
        }}>
          <Text size="sm" style={{ color: "var(--epi-intermediate)", lineHeight: 1.5 }}>{notice}</Text>
          <style>{`
            @keyframes noticeIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* FAB + dropdown */}
      <div style={{ position: "fixed", bottom: 32, right: 32, zIndex: 100 }}>
        {fabOpen && (
          <>
            <div onClick={() => setFabOpen(false)} style={{ position: "fixed", inset: 0 }} />
            <div style={{
              position: "absolute", bottom: 60, right: 0,
              background: "var(--epi-panel)", border: "1px solid var(--epi-border)",
              borderRadius: 10, padding: 6, minWidth: 190,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}>
              {[
                { label: "Créer un dossier", Icon: IconFolderPlus, action: () => {
                  if (currentFolderId !== null) {
                    showNotice("Les dossiers ne peuvent pas être imbriqués. Retourne à la racine pour en créer un.");
                    return;
                  }
                  setFolderName(""); setFolderModal({ mode: "create" });
                } },
                { label: "Ajouter un sujet", Icon: IconBook, action: () => onAddSubject(currentFolderId) },
              ].map(({ label, Icon, action }) => (
                <button
                  key={label}
                  onClick={() => { setFabOpen(false); action(); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "none", border: "none", width: "100%",
                    color: "var(--epi-muted)", fontSize: 13, fontWeight: 600,
                    padding: "9px 12px", borderRadius: 7, textAlign: "left",
                    cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(128,157,253,0.1)";
                    e.currentTarget.style.color = "var(--epi-accent)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "var(--epi-muted)";
                  }}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          title="Ajouter"
          style={{
            width: 48, height: 48, borderRadius: "50%",
            background: "var(--epi-accent)", border: "none",
            color: "#fff", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 14px rgba(128,157,253,0.35)",
            transition: "transform 0.2s",
            transform: fabOpen ? "rotate(45deg)" : "rotate(0)",
          }}
        >
          <IconPlus size={22} />
        </button>
      </div>

      {/* Modal création / renommage dossier */}
      {folderModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <div style={{
            background: "var(--epi-panel)", border: "1px solid var(--epi-border)",
            borderRadius: 14, padding: 28, width: "100%", maxWidth: 400,
          }}>
            <form onSubmit={e => { e.preventDefault(); submitFolderModal(); }}>
              <Stack gap="lg">
                <Group justify="space-between">
                  <Text fw={700} size="md">
                    {folderModal.mode === "create" ? "Créer un dossier" : "Renommer le dossier"}
                  </Text>
                  <button type="button" onClick={() => { setFolderModal(null); setFolderName(""); }}
                    style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}>
                    <IconX size={18} />
                  </button>
                </Group>

                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "var(--epi-bg)", border: "1px solid var(--epi-border)",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <IconFolder size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
                  <input
                    value={folderName}
                    onChange={e => setFolderName(e.target.value)}
                    placeholder="ex : Winter Camp 2026"
                    autoFocus
                    style={{
                      flex: 1, background: "none", border: "none", outline: "none",
                      color: "#fff", fontSize: 14, fontFamily: "inherit",
                    }}
                  />
                </div>

                <Group justify="flex-end" gap="sm">
                  <button type="button" onClick={() => { setFolderModal(null); setFolderName(""); }}
                    style={{
                      background: "none", border: "1px solid var(--epi-border)", color: "var(--epi-muted)",
                      fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Annuler</button>
                  <button type="submit" disabled={folderLoading || !folderName.trim()}
                    style={{
                      background: folderName.trim() ? "var(--epi-accent)" : "var(--epi-bg)",
                      border: "1px solid var(--epi-border)", color: folderName.trim() ? "#fff" : "var(--epi-ghost)",
                      fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8,
                      cursor: folderName.trim() && !folderLoading ? "pointer" : "not-allowed",
                      transition: "0.2s", fontFamily: "inherit",
                    }}>
                    {folderLoading ? "…" : folderModal.mode === "create" ? "Créer" : "Renommer"}
                  </button>
                </Group>
              </Stack>
            </form>
          </div>
        </div>
      )}

      {editTarget && (
        <EditModal
          subject={editTarget}
          token={token}
          folders={folders}
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
