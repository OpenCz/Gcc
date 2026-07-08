import { useState, useEffect, useMemo } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconSearch, IconCalendar, IconMapPin, IconLayoutGrid, IconList,
  IconBook, IconFile, IconX, IconPin,
} from "@tabler/icons-react";
import { session } from "../config";
import type { Subject } from "../config";
import { SubjectCard } from "../components/ui/SubjectCard";
import { Badge } from "../components/ui/Badge";
import { SubjectDetail } from "../components/ui/SubjectDetail";

import { API } from "../lib/api";

type DiffFilter = "Tous" | Subject["difficulty"];
type SortMode = "default" | "az" | "za" | "diff-asc" | "diff-desc";
type ViewMode = "grid" | "list";

const DIFF_FILTERS: DiffFilter[] = ["Tous", "Débutant", "Intermédiaire", "Avancé"];
const SORT_OPTIONS = [
  { value: "default", label: "Par défaut" },
  { value: "az", label: "Nom A → Z" },
  { value: "za", label: "Nom Z → A" },
  { value: "diff-asc", label: "Difficulté ↑" },
  { value: "diff-desc", label: "Difficulté ↓" },
];
const DIFF_ORDER: Record<Subject["difficulty"], number> = { Débutant: 0, Intermédiaire: 1, Avancé: 2 };

export function ResourcesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pinned, setPinned] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<DiffFilter>("Tous");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selected, setSelected] = useState<Subject | null>(null);

  useEffect(() => {
    Promise.allSettled([
      fetch(`${API}/subjects`).then(r => r.ok ? r.json() as Promise<{ subjects: Subject[] }> : Promise.reject()),
      fetch(`${API}/subjects/pinned`).then(r => r.ok ? r.json() as Promise<{ subjects: Subject[] }> : Promise.reject()),
    ]).then(([main, pin]) => {
      setSubjects(main.status === "fulfilled" ? main.value.subjects ?? [] : []);
      setPinned(pin.status === "fulfilled" ? pin.value.subjects ?? [] : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const pinnedNames = new Set(pinned.map(s => s.name));
    let list = subjects.filter(s => !pinnedNames.has(s.name));
    if (diffFilter !== "Tous")
      list = list.filter(s => s.difficulty === diffFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }
    if (sortMode === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === "za") list.sort((a, b) => b.name.localeCompare(a.name));
    if (sortMode === "diff-asc") list.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
    if (sortMode === "diff-desc") list.sort((a, b) => DIFF_ORDER[b.difficulty] - DIFF_ORDER[a.difficulty]);
    return list;
  }, [subjects, search, diffFilter, sortMode]);

  const activeFiltersCount = [
    search, diffFilter !== "Tous", sortMode !== "default",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch(""); setDiffFilter("Tous"); setSortMode("default");
  };

  const totalFiles = subjects.reduce((acc: number, s: Subject) => acc + s.files.length, 0);

  return (
    <Stack gap="md" p="md" style={{ background: "var(--epi-bg)", minHeight: "100%" }}>

      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "var(--epi-blue)",
        borderRadius: 10, padding: "20px 24px", gap: 20,
      }}>
        <Stack gap={6}>
          <Text fw={700} size="lg" ff="heading" c="#fff">{session.title}</Text>
          <Text size="sm" style={{ color: "rgba(255,255,255,0.8)" }}>{session.description}</Text>
        </Stack>
        <Stack gap={8} align="flex-end" style={{ flexShrink: 0 }}>
          <Group gap="xs">
            <IconCalendar size={13} color="#fff" />
            <Text size="xs" style={{ color: "rgba(255,255,255,0.9)" }}>{session.date}</Text>
          </Group>
          <Group gap="xs">
            <IconMapPin size={13} color="#fff" />
            <Text size="xs" style={{ color: "rgba(255,255,255,0.9)" }}>{session.location}</Text>
          </Group>
          <Group gap="md">
            <Group gap={6}>
              <IconBook size={11} color="rgba(255,255,255,0.75)" />
              <Text size="xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                {subjects.length} sujet{subjects.length > 1 ? "s" : ""}
              </Text>
            </Group>
            <Group gap={6}>
              <IconFile size={11} color="rgba(255,255,255,0.75)" />
              <Text size="xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                {totalFiles} fichier{totalFiles > 1 ? "s" : ""}
              </Text>
            </Group>
          </Group>
        </Stack>
      </div>

      {pinned.length > 0 && (
        <Stack gap={8}>
          <Group gap="xs">
            <IconPin size={13} color="var(--epi-intermediate)" />
            <Text size="xs" fw={700} style={{ color: "var(--epi-intermediate)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Épinglé</Text>
          </Group>
          <div style={{
            display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, paddingTop: 4,
            scrollbarWidth: "none",
          }}>
            {pinned.map(s => (
              <div
                key={`pin-${s.name}`}
                onClick={() => setSelected(s)}
                style={{
                  flexShrink: 0, width: 220,
                  background: "var(--epi-surface)",
                  border: "1px solid var(--epi-border)",
                  borderRadius: 10, padding: "14px 16px",
                  cursor: "pointer", display: "flex", flexDirection: "column", gap: 8,
                  transition: "border-color 0.15s, transform 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--epi-accent)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--epi-border)";
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                }}
              >
                <Group justify="space-between" wrap="nowrap" gap="xs">
                  <Text fw={700} size="sm" truncate style={{ minWidth: 0 }}>{s.name}</Text>
                  <Badge level={s.difficulty} />
                </Group>
                {s.description && (
                  <Text size="xs" c="dimmed" style={{
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.5,
                  }}>
                    {s.description}
                  </Text>
                )}
                <Group gap={8} mt="auto">
                  {s.files.length > 0 && (
                    <Text size="xs" c="dimmed">{s.files.length} fichier{s.files.length > 1 ? "s" : ""}</Text>
                  )}
                  {s.urls?.length > 0 && (
                    <Text size="xs" c="dimmed">{s.urls.length} lien{s.urls.length > 1 ? "s" : ""}</Text>
                  )}
                </Group>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--epi-border)" }} />
        </Stack>
      )}

      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: "var(--epi-surface)",
        border: "1px solid var(--epi-border)",
        borderRadius: 8, padding: "10px 14px",
        transition: "border-color 0.2s",
      }}
        onFocus={e => (e.currentTarget.style.borderColor = "var(--epi-accent)")}
        onBlur={e => (e.currentTarget.style.borderColor = "var(--epi-border)")}
      >
        <IconSearch size={14} color="var(--epi-ghost)" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un sujet ou un tag..."
          style={{
            flex: 1, background: "none", border: "none", outline: "none",
            color: "var(--epi-text)", fontSize: 14, fontFamily: "inherit",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            style={{ background: "none", border: "none", color: "var(--epi-ghost)", cursor: "pointer", display: "flex" }}
          >
            <IconX size={14} />
          </button>
        )}
      </div>

      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="xs" wrap="wrap">
          {DIFF_FILTERS.map(f => {
            const active = diffFilter === f;
            const color = f === "Débutant" ? "var(--epi-beginner)"
              : f === "Intermédiaire" ? "var(--epi-intermediate)"
              : f === "Avancé" ? "var(--epi-advanced)"
              : "var(--epi-blue)";
            return (
              <button
                key={f}
                onClick={() => setDiffFilter(f)}
                style={{
                  background: active ? color : "none",
                  border: `1px solid ${active ? color : "var(--epi-border)"}`,
                  color: active ? (f === "Tous" ? "#fff" : "#111") : "var(--epi-muted)",
                  fontSize: 12, fontWeight: 600,
                  padding: "5px 12px", borderRadius: 20,
                  cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                }}
              >
                {f}
              </button>
            );
          })}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "1px solid var(--epi-advanced)",
                color: "var(--epi-advanced)",
                fontSize: 12, fontWeight: 600,
                padding: "5px 12px", borderRadius: 20,
                cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
              }}
            >
              <IconX size={12} />
              Réinitialiser ({activeFiltersCount})
            </button>
          )}
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Group gap="xs" style={{
            background: "var(--epi-surface)",
            border: "1px solid var(--epi-border)",
            borderRadius: 8, padding: "6px 12px",
          }}>
            <IconList size={13} color="var(--epi-accent)" />
            <select
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
              style={{
                background: "none", border: "none", outline: "none",
                color: "var(--epi-text)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value} style={{ background: "var(--epi-surface)" }}>
                  {o.label}
                </option>
              ))}
            </select>
          </Group>

          <Group gap={0} style={{
            background: "var(--epi-surface)",
            border: "1px solid var(--epi-border)",
            borderRadius: 8, overflow: "hidden",
          }}>
            {(["grid", "list"] as ViewMode[]).map(v => (
              <button
                key={v}
                onClick={() => setViewMode(v)}
                style={{
                  background: viewMode === v ? "var(--epi-blue)" : "none",
                  border: "none",
                  color: viewMode === v ? "#fff" : "var(--epi-ghost)",
                  padding: "6px 12px", cursor: "pointer", fontSize: 13, transition: "0.2s",
                  display: "flex",
                }}
              >
                {v === "grid" ? <IconLayoutGrid size={14} /> : <IconList size={14} />}
              </button>
            ))}
          </Group>
        </Group>
      </Group>

      {loading ? (
        <Stack align="center" gap="xs" mt="xl">
          <Text size="sm" c="dimmed">Chargement…</Text>
        </Stack>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: viewMode === "grid" ? "repeat(3, 1fr)" : "1fr",
            gap: 20,
          }}>
            {filtered.map(s => (
              <SubjectCard
                key={s.name}
                subject={s}
                onClick={() => setSelected(s)}
              />
            ))}
          </div>

          {filtered.length === 0 && (
            <Stack align="center" gap="xs" mt="xl">
              <IconSearch size={32} color="var(--epi-border)" />
              <Text size="sm" c="dimmed">
                {subjects.length === 0
                  ? "Aucun sujet disponible pour l'instant."
                  : `Aucun sujet trouvé${search ? ` pour "${search}"` : ""}`}
              </Text>
            </Stack>
          )}
        </>
      )}

      {selected && (
        <SubjectDetail subject={selected} onClose={() => setSelected(null)} />
      )}
    </Stack>
  );
}
