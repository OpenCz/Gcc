import { useState } from "react";
import {
  Stack, Group, Text, TextInput, Button,
  SimpleGrid, Paper, ActionIcon,
} from "@mantine/core";
import {
  IconSearch, IconCalendar, IconMapPin, IconLayoutList,
  IconFile, IconSortAscending, IconLayoutGrid, IconList,
} from "@tabler/icons-react";
import { SubjectCard, type Subject } from "../components/ui/SubjectCard";
import { SubjectDetail } from "../components/ui/SubjectDetail";

const MOCK_SUBJECTS: Subject[] = [
  {
    id: 1,
    title: "Workshop C",
    tag: "C",
    level: "Débutant",
    fileCount: 1,
    description:
      "Workshop d'introduction au langage C. Découvrez les bases de la programmation en C : variables, conditions, boucles, fonctions et pointeurs.",
    resources: [{ name: "WorkshopC.pdf", url: "#" }],
  },
  {
    id: 2,
    title: "Workshop C++",
    tag: "C++",
    level: "Intermédiaire",
    fileCount: 1,
    description:
      "Workshop d'introduction au C++. Apprenez les concepts objets : classes, héritage, polymorphisme et la STL.",
    resources: [{ name: "WorkshopCpp.pdf", url: "#" }],
  },
];

const FILTERS = ["Tous", "Débutant", "Intermédiaire", "Avancé", "Favoris"] as const;

export function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Tous");
  const [viewGrid, setViewGrid] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const filtered = MOCK_SUBJECTS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.title.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q);
    const matchFilter = activeFilter === "Tous" || activeFilter === "Favoris" || s.level === activeFilter;
    return matchSearch && matchFilter;
  });

  const totalFiles = MOCK_SUBJECTS.reduce((acc, s) => acc + s.fileCount, 0);

  return (
    <Stack gap="md" p="md">
      {/* Hero banner */}
      <Paper
        withBorder
        p="md"
        style={{ borderLeft: "4px solid var(--epi-accent)" }}
      >
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Text fw={700} size="lg">CODING CLUB</Text>
            <Text size="sm" c="dimmed">
              Bienvenue au Coding Club ! Retrouvez ici les ressources et sujets de la session.
            </Text>
          </Stack>
          <Stack gap={4} style={{ flexShrink: 0, textAlign: "right" }}>
            <Group gap="xs" justify="flex-end">
              <IconCalendar size={14} color="var(--epi-accent)" />
              <Text size="xs" c="dimmed">Samedi 8 Mars 2026</Text>
            </Group>
            <Group gap="xs" justify="flex-end">
              <IconMapPin size={14} color="var(--epi-accent)" />
              <Text size="xs" c="dimmed">Epitech — Le Hub</Text>
            </Group>
            <Group gap="md" justify="flex-end">
              <Group gap={4}>
                <IconLayoutList size={12} color="var(--mantine-color-dark-3)" />
                <Text size="xs" c="dark.2">{filtered.length} sujets</Text>
              </Group>
              <Group gap={4}>
                <IconFile size={12} color="var(--mantine-color-dark-3)" />
                <Text size="xs" c="dark.2">{totalFiles} fichiers</Text>
              </Group>
            </Group>
          </Stack>
        </Group>
      </Paper>

      {/* Search */}
      <TextInput
        placeholder="Rechercher un sujet ou un tag..."
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
      />

      {/* Filters + view controls */}
      <Group justify="space-between" wrap="nowrap">
        <Group gap="xs" wrap="wrap">
          {FILTERS.map(f => (
            <Button
              key={f}
              size="xs"
              variant={activeFilter === f ? "filled" : "outline"}
              color={activeFilter === f ? "epitech" : "gray"}
              onClick={() => setActiveFilter(f)}
              style={{ borderRadius: 999 }}
            >
              {f}
            </Button>
          ))}
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Button
            variant="outline"
            color="gray"
            size="xs"
            leftSection={<IconSortAscending size={14} />}
            rightSection={<Text size="xs">▾</Text>}
          >
            Par défaut
          </Button>
          <Group gap={0} style={{ border: "1px solid var(--epi-border)", borderRadius: 8, overflow: "hidden" }}>
            <ActionIcon
              variant={viewGrid ? "filled" : "subtle"}
              color={viewGrid ? "epitech" : "gray"}
              radius={0}
              onClick={() => setViewGrid(true)}
            >
              <IconLayoutGrid size={16} />
            </ActionIcon>
            <ActionIcon
              variant={!viewGrid ? "filled" : "subtle"}
              color={!viewGrid ? "epitech" : "gray"}
              radius={0}
              onClick={() => setViewGrid(false)}
            >
              <IconList size={16} />
            </ActionIcon>
          </Group>
        </Group>
      </Group>

      {/* Cards */}
      {viewGrid ? (
        <SimpleGrid cols={2} spacing="md">
          {filtered.map(s => (
            <SubjectCard key={s.id} subject={s} onClick={() => setSelectedSubject(s)} />
          ))}
        </SimpleGrid>
      ) : (
        <Stack gap="sm">
          {filtered.map(s => (
            <SubjectCard key={s.id} subject={s} onClick={() => setSelectedSubject(s)} />
          ))}
        </Stack>
      )}

      {filtered.length === 0 && (
        <Text c="dimmed" size="sm" ta="center" py="xl">
          Aucun sujet trouvé
        </Text>
      )}

      {selectedSubject && (
        <SubjectDetail
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
        />
      )}
    </Stack>
  );
}
