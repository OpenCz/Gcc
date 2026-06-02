import { useState, useEffect, useMemo } from "react";
import { Stack, Group, Text } from "@mantine/core";
import {
  IconSearch, IconCalendar, IconMapPin, IconLayoutGrid, IconList,
  IconBook, IconFile, IconX, IconStar,
} from "@tabler/icons-react";
import { subjects, session } from "../config";
import type { Subject } from "../config";
import { SubjectCard } from "../components/ui/SubjectCard";
import { SubjectDetail } from "../components/ui/SubjectDetail";

type DiffFilter = "Tous" | Subject["difficulty"];
type SortMode = "default" | "az" | "za" | "diff-asc" | "diff-desc";
type ViewMode = "grid" | "list";

const DIFF_FILTERS: DiffFilter[] = ["Tous", "Débutant", "Intermédiaire", "Avancé"];
const SORT_OPTIONS = [
  { value: "default",   label: "Par défaut" },
  { value: "az",        label: "Nom A → Z" },
  { value: "za",        label: "Nom Z → A" },
  { value: "diff-asc",  label: "Difficulté ↑" },
  { value: "diff-desc", label: "Difficulté ↓" },
];
const DIFF_ORDER: Record<Subject["difficulty"], number> = {
  Débutant: 0, Intermédiaire: 1, Avancé: 2,
};

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem("cc-favorites");
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveFavorites(favs: Set<string>) {
  localStorage.setItem("cc-favorites", JSON.stringify([...favs]));
}

export function ResourcesPage() {
  const [search, setSearch]           = useState("");
  const [diffFilter, setDiffFilter]   = useState<DiffFilter>("Tous");
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [sortMode, setSortMode]       = useState<SortMode>("default");
  const [viewMode, setViewMode]       = useState<ViewMode>("grid");
  const [favorites, setFavorites]     = useState<Set<string>>(loadFavorites);
  const [selected, setSelected]       = useState<Subject | null>(null);

  useEffect(() => { saveFavorites(favorites); }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = [...subjects];
    if (showFavOnly)        list = list.filter(s => favorites.has(s.name));
    if (diffFilter !== "Tous") list = list.filter(s => s.difficulty === diffFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortMode === "az")        list.sort((a, b) => a.name.localeCompare(b.name));
    if (sortMode === "za")        list.sort((a, b) => b.name.localeCompare(a.name));
    if (sortMode === "diff-asc")  list.sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty]);
    if (sortMode === "diff-desc") list.sort((a, b) => DIFF_ORDER[b.difficulty] - DIFF_ORDER[a.difficulty]);
    return list;
  }, [search, diffFilter, showFavOnly, sortMode, favorites]);

  const activeFiltersCount = [
    search, diffFilter !== "Tous", showFavOnly, sortMode !== "default",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearch(""); setDiffFilter("Tous");
    setShowFavOnly(false); setSortMode("default");
  };

  const totalFiles = subjects.reduce((acc, s) => acc + s.files.length, 0);

  return (
    <Stack gap="md" p="md" style={{ background: "var(--epi-bg)", minHeight: "100%" }}>

      {/* Session banner */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "var(--epi-surface)",
        border: "1px solid var(--epi-border)",
        borderLeft: "3px solid var(--epi-accent)",
        borderRadius: 10, padding: "20px 24px", gap: 20,
      }}>
        <Stack gap={6}>
          <Text fw={700} size="lg" ff="heading">{session.title}</Text>
          <Text size="sm" c="dimmed">{session.description}</Text>
        </Stack>
        <Stack gap={8} align="flex-end" style={{ flexShrink: 0 }}>
          <Group gap="xs">
            <IconCalendar size={13} color="var(--epi-accent)" />
            <Text size="xs" c="dimmed">{session.date}</Text>
          </Group>
          <Group gap="xs">
            <IconMapPin size={13} color="var(--epi-accent)" />
            <Text size="xs" c="dimmed">{session.location}</Text>
          </Group>
          <Group gap="md">
            <Group gap={6}>
              <IconBook size={11} color="var(--epi-ghost)" />
              <Text size="xs" style={{ color: "var(--epi-ghost)" }}>
                {subjects.length} sujet{subjects.length > 1 ? "s" : ""}
              </Text>
            </Group>
            <Group gap={6}>
              <IconFile size={11} color="var(--epi-ghost)" />
              <Text size="xs" style={{ color: "var(--epi-ghost)" }}>
                {totalFiles} fichier{totalFiles > 1 ? "s" : ""}
              </Text>
            </Group>
          </Group>
        </Stack>
      </div>

      {/* Search */}
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
            color: "#fff", fontSize: 14, fontFamily: "inherit",
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

      {/* Toolbar */}
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="xs" wrap="wrap">
          {DIFF_FILTERS.map(f => {
            const active = diffFilter === f;
            const color = f === "Débutant" ? "var(--epi-beginner)"
              : f === "Intermédiaire" ? "var(--epi-intermediate)"
              : f === "Avancé" ? "var(--epi-advanced)"
              : "var(--epi-accent)";
            return (
              <button
                key={f}
                onClick={() => setDiffFilter(f)}
                style={{
                  background: active ? color : "none",
                  border: `1px solid ${active ? color : "var(--epi-border)"}`,
                  color: active ? "#111" : "var(--epi-muted)",
                  fontSize: 12, fontWeight: 600,
                  padding: "5px 12px", borderRadius: 20,
                  cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
                }}
              >
                {f}
              </button>
            );
          })}
          <button
            onClick={() => setShowFavOnly(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: showFavOnly ? "var(--epi-intermediate)" : "none",
              border: `1px solid ${showFavOnly ? "var(--epi-intermediate)" : "var(--epi-border)"}`,
              color: showFavOnly ? "#111" : "var(--epi-muted)",
              fontSize: 12, fontWeight: 600,
              padding: "5px 12px", borderRadius: 20,
              cursor: "pointer", transition: "0.2s", fontFamily: "inherit",
            }}
          >
            <IconStar size={12} fill={showFavOnly ? "currentColor" : "none"} />
            Favoris
          </button>
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
                color: "#ccc", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
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
                  background: viewMode === v ? "var(--epi-accent)" : "none",
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

      {/* Cards */}
      <div style={{
        display: "flex",
        flexWrap: viewMode === "grid" ? "wrap" : "nowrap",
        flexDirection: viewMode === "list" ? "column" : "row",
        gap: 20,
      }}>
        {filtered.map(s => (
          <div
            key={s.name}
            style={{ width: viewMode === "grid" ? "calc(33.333% - 14px)" : "100%", minWidth: 200 }}
          >
            <SubjectCard
              subject={s}
              isFavorite={favorites.has(s.name)}
              onToggleFavorite={toggleFavorite}
              onClick={() => setSelected(s)}
            />
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <Stack align="center" gap="xs" mt="xl">
          <IconSearch size={32} color="var(--epi-border)" />
          <Text size="sm" c="dimmed">
            Aucun sujet trouvé{search ? ` pour "${search}"` : ""}
          </Text>
        </Stack>
      )}

      {selected && (
        <SubjectDetail subject={selected} onClose={() => setSelected(null)} />
      )}
    </Stack>
  );
}
