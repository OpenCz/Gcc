import { Paper, Group, Stack, Text, ActionIcon } from "@mantine/core";
import { IconLayoutList, IconFile, IconInfoCircle, IconStar } from "@tabler/icons-react";
import { Badge } from "./Badge";
import type { Level } from "./Badge";

export interface Subject {
  id: number;
  title: string;
  tag: string;
  level: Level;
  fileCount: number;
  description: string;
  resources: { name: string; url: string }[];
}

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

export function SubjectCard({ subject, onClick }: SubjectCardProps) {
  return (
    <Paper
      withBorder
      p="md"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <IconLayoutList size={16} color="var(--epi-accent)" style={{ flexShrink: 0 }} />
            <Text size="sm" fw={600}>{subject.title}</Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Badge level={subject.level} />
            <ActionIcon
              variant="subtle"
              color="yellow"
              size="sm"
              onClick={e => e.stopPropagation()}
            >
              <IconStar size={14} />
            </ActionIcon>
          </Group>
        </Group>

        <Text size="xs" c="epitech">{subject.tag}</Text>

        <Group justify="space-between">
          <Group gap={4}>
            <IconFile size={12} color="var(--epi-muted)" />
            <Text size="xs" c="dimmed">
              {subject.fileCount} fichier{subject.fileCount > 1 ? "s" : ""}
            </Text>
          </Group>
          <Group gap={4}>
            <IconInfoCircle size={12} color="var(--mantine-color-dark-3)" />
            <Text size="xs" c="dark.2">Cliquer pour voir les détails</Text>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
}
