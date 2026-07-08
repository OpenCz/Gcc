import { useState, useEffect } from "react";
import { Stack, Group, Text } from "@mantine/core";
import { IconInbox, IconFileText, IconLink, IconCheck, IconX } from "@tabler/icons-react";
import { Badge } from "../ui/Badge";
import type { Subject } from "../../config";
import { type ProposedSubject } from "./types";
import { API } from "../../lib/api";

export function SuggestionsTab({ token }: { token: string }) {
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
                    padding: "10px 14px", color: "var(--epi-text)", fontSize: 14,
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
