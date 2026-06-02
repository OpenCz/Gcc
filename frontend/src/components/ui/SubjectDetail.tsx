import { Stack, Group, Text, Button, Paper, ActionIcon, ScrollArea } from "@mantine/core";
import { IconLayoutList, IconLink, IconX, IconFile, IconEye, IconDownload } from "@tabler/icons-react";
import { Badge } from "./Badge";
import type { Subject } from "./SubjectCard";

interface SubjectDetailProps {
  subject: Subject;
  onClose: () => void;
}

export function SubjectDetail({ subject, onClose }: SubjectDetailProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 40 }}
      />
      <Paper
        withBorder
        style={{
          position: "fixed",
          inset: "0 0 0 auto",
          width: 320,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          borderRadius: 0,
          borderTop: "none",
          borderBottom: "none",
          borderRight: "none",
        }}
      >
        {/* Header */}
        <Group
          justify="space-between"
          p="md"
          style={{ borderBottom: "1px solid var(--epi-border)", flexShrink: 0 }}
        >
          <Group gap="xs">
            <IconLayoutList size={16} color="var(--epi-accent)" />
            <Text size="sm" fw={700}>{subject.title}</Text>
          </Group>
          <Group gap="xs">
            <Button variant="subtle" size="xs" color="gray" leftSection={<IconLink size={12} />}>
              Lien
            </Button>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClose}>
              <IconX size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {/* Body */}
        <ScrollArea flex={1} p="md">
          <Stack gap="md">
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
              {subject.description}
            </Text>

            <Group justify="space-between">
              <Text size="xs" ff="monospace" c="dimmed"
                style={{ background: "var(--epi-surface2)", padding: "2px 8px", borderRadius: 4 }}
              >
                {subject.tag}
              </Text>
              <Badge level={subject.level} />
            </Group>

            <Stack gap="xs">
              <Group gap="xs">
                <IconDownload size={16} color="var(--epi-accent)" />
                <Text size="sm" fw={600}>Ressources</Text>
              </Group>

              {subject.resources.map((r, i) => (
                <Paper key={i} withBorder p="xs">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                      <IconFile size={14} color="var(--epi-accent)" style={{ flexShrink: 0 }} />
                      <Text size="xs" c="dimmed" truncate>{r.name}</Text>
                    </Group>
                    <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                      <Button
                        component="a"
                        href={r.url}
                        target="_blank"
                        variant="outline"
                        color="epitech"
                        size="xs"
                        leftSection={<IconEye size={12} />}
                      >
                        Voir
                      </Button>
                      <Button
                        component="a"
                        href={r.url}
                        download
                        variant="filled"
                        color="epitech"
                        size="xs"
                        leftSection={<IconDownload size={12} />}
                      >
                        Télécharger
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </ScrollArea>
      </Paper>
    </>
  );
}
