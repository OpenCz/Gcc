import { useState, useEffect } from "react";
import { Stack, Group, Text } from "@mantine/core";
import { IconCalendarEvent, IconPlus, IconCheck, IconMapPin, IconUsers } from "@tabler/icons-react";
import { type EventData } from "./types";
import { API } from "../../lib/api";

export function EventsTab() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/manta/events`, { credentials: "include" })
      .then(r => r.json() as Promise<{ events?: EventData[] }>)
      .then(d => setEvents(d.events ?? []))
      .catch(() => setError("Impossible de charger les événements."))
      .finally(() => setLoading(false));
  }, []);

  const toggleRegistration = async (event: EventData) => {
    const next = !event.isRegistered;
    setEvents(prev => prev.map(e => e.id === event.id
      ? { ...e, isRegistered: next, registeredCount: e.registeredCount + (next ? 1 : -1) }
      : e
    ));
    await fetch(`${API}/manta/events/${event.id}/register`, {
      method: next ? "POST" : "DELETE",
      credentials: "include",
    });
  };

  if (loading) return <Text c="dimmed" ta="center">Chargement…</Text>;
  if (error) return <Text style={{ color: "var(--epi-advanced)" }}>{error}</Text>;
  if (events.length === 0) return <Text c="dimmed" ta="center">Aucun événement à venir.</Text>;

  return (
    <Stack gap="sm">
      {events.map(ev => {
        const date = new Date(ev.date);
        const full = ev.registeredCount >= ev.capacity;
        return (
          <div key={ev.id} style={{
            background: "var(--epi-surface)",
            border: `1px solid ${ev.isRegistered ? "var(--epi-accent)" : "var(--epi-border)"}`,
            borderRadius: 10, padding: "18px 20px",
            transition: "border-color 0.2s",
          }}>
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={6} style={{ minWidth: 0, flex: 1 }}>
                <Text fw={700} size="sm">{ev.name}</Text>
                <Group gap="md">
                  <Group gap={5}>
                    <IconCalendarEvent size={12} color="var(--epi-accent)" />
                    <Text size="xs" c="dimmed">
                      {date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                      {" · "}
                      {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </Group>
                  <Group gap={5}>
                    <IconMapPin size={12} color="var(--epi-accent)" />
                    <Text size="xs" c="dimmed">{ev.lieu}</Text>
                  </Group>
                  <Group gap={5}>
                    <IconUsers size={12} color="var(--epi-ghost)" />
                    <Text size="xs" c="dimmed">{ev.registeredCount} / {ev.capacity}</Text>
                  </Group>
                </Group>
                {ev.description && (
                  <Text size="xs" c="dimmed" style={{ lineHeight: 1.5 }}>{ev.description}</Text>
                )}
              </Stack>

              <button
                onClick={() => toggleRegistration(ev)}
                disabled={full && !ev.isRegistered}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  background: ev.isRegistered ? "rgba(128,157,253,0.1)" : "none",
                  border: `1px solid ${ev.isRegistered ? "var(--epi-accent)" : "var(--epi-border)"}`,
                  color: ev.isRegistered ? "var(--epi-accent)" : full ? "var(--epi-ghost)" : "var(--epi-muted)",
                  fontSize: 12, fontWeight: 700,
                  padding: "6px 14px", borderRadius: 20,
                  cursor: full && !ev.isRegistered ? "not-allowed" : "pointer",
                  transition: "0.2s", fontFamily: "inherit", flexShrink: 0,
                }}
              >
                {ev.isRegistered ? <><IconCheck size={13} /> Inscrit</> : full ? "Complet" : <><IconPlus size={13} /> S'inscrire</>}
              </button>
            </Group>
          </div>
        );
      })}
    </Stack>
  );
}
