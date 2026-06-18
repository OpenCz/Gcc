import { useState, useEffect } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconEye, IconEyeOff, IconBook, IconFileText, IconLink,
} from "@tabler/icons-react";
import { Badge } from "../ui/Badge";
import type { Subject } from "../../config";
import { type SubjectWithVisible } from "./types";
import { API } from "../../lib/api";

export function SubjectsTab({ token }: { token: string }) {
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
