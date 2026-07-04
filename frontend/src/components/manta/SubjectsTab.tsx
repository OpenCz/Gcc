import { useState, useEffect, useMemo } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconEye, IconEyeOff, IconBook, IconFileText, IconLink,
  IconFolder, IconArrowLeft, IconChevronRight,
} from "@tabler/icons-react";
import { Badge } from "../ui/Badge";
import type { Subject } from "../../config";
import { type SubjectWithVisible, type Folder } from "./types";
import { API } from "../../lib/api";

export function SubjectsTab({ token }: { token: string }) {
  const [subjects, setSubjects] = useState<SubjectWithVisible[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/manta/subjects`, { credentials: "include" }).then(r => r.ok ? r.json() as Promise<{ subjects?: SubjectWithVisible[] }> : Promise.reject()),
      fetch(`${API}/manta/folders`, { credentials: "include" }).then(r => r.ok ? r.json() as Promise<{ folders?: Folder[] }> : Promise.reject()),
    ]).then(([subs, fols]) => {
      if (subs.status === "fulfilled") setSubjects(subs.value.subjects ?? []);
      else setError("Impossible de charger les sujets.");
      if (fols.status === "fulfilled") setFolders(fols.value.folders ?? []);
    }).finally(() => setLoading(false));
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

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;

  return (
    <Stack gap="xl">
      {currentFolder === null ? (
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
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--epi-accent)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--epi-border)"; }}
              >
                <IconFolder size={18} color="var(--epi-accent)" style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Text fw={600} size="sm" truncate>{f.name}</Text>
                  <Text size="xs" c="dimmed">{count} sujet{count > 1 ? "s" : ""}</Text>
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
