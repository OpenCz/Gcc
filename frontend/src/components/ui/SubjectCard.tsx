import { Group, Stack, Text } from "@mantine/core";
import { IconBook, IconFile, IconLink, IconStar } from "@tabler/icons-react";
import { Badge } from "./Badge";
import type { Subject } from "../../config";

interface SubjectCardProps {
  subject: Subject;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent, name: string) => void;
  onClick: () => void;
}

export function SubjectCard({ subject, isFavorite, onToggleFavorite, onClick }: SubjectCardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--epi-surface)",
        border: "1px solid var(--epi-border)",
        borderRadius: 10,
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.2s, background 0.2s, transform 0.2s",
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
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
          <IconBook size={18} color="var(--epi-accent)" style={{ flexShrink: 0 }} />
          <Text fw={700} size="sm" truncate>{subject.name}</Text>
        </Group>
        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Badge level={subject.difficulty} />
          <button
            onClick={e => onToggleFavorite(e, subject.name)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: isFavorite ? "var(--epi-intermediate)" : "var(--epi-border)",
              fontSize: 14,
              padding: 0,
              transition: "color 0.2s, transform 0.2s",
              display: "flex",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--epi-intermediate)")}
            onMouseLeave={e => (e.currentTarget.style.color = isFavorite ? "var(--epi-intermediate)" : "var(--epi-border)")}
          >
            <IconStar size={14} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </Group>
      </Group>

      {subject.description && (
        <Text size="xs" c="dimmed" style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          lineHeight: 1.55,
        }}>
          {subject.description}
        </Text>
      )}

      <Stack gap={6}>
        <Group gap={6} wrap="wrap">
          {subject.tags.map(tag => (
            <span key={tag} style={{
              background: "var(--epi-bg)",
              color: "var(--epi-accent)",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              borderRadius: 15,
              border: "1px solid var(--epi-border)",
            }}>
              {tag}
            </span>
          ))}
        </Group>
      </Stack>

      <Group justify="space-between">
        <Group gap={8}>
          {subject.files.length > 0 && (
            <Group gap={5}>
              <IconFile size={12} color="var(--epi-ghost)" />
              <Text size="xs" c="dimmed">
                {subject.files.length} fichier{subject.files.length > 1 ? "s" : ""}
              </Text>
            </Group>
          )}
          {subject.url && (
            <Group gap={5}>
              <IconLink size={12} color="var(--epi-ghost)" />
              <Text size="xs" c="dimmed">Lien</Text>
            </Group>
          )}
        </Group>
        <Text size="xs" style={{ color: "var(--epi-ghost)", fontStyle: "italic" }}>
          Voir les détails →
        </Text>
      </Group>
    </div>
  );
}
