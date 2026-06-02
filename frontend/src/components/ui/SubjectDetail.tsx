import { useState } from "react";
import { Stack, Group, Text, ScrollArea } from "@mantine/core";
import { IconBook, IconLink, IconCheck, IconX, IconDownload, IconFile, IconEye } from "@tabler/icons-react";
import { Badge } from "./Badge";
import type { Subject } from "../../config";

const API = "http://localhost:8080";

interface SubjectDetailProps {
  subject: Subject;
  onClose: () => void;
}

export function SubjectDetail({ subject, onClose }: SubjectDetailProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?sujet=${encodeURIComponent(subject.name)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        zIndex: 100,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* Panel — stopPropagation so clicks inside don't close */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 420,
          height: "100%",
          background: "var(--epi-panel)",
          borderLeft: "1px solid var(--epi-border)",
          display: "flex",
          flexDirection: "column",
          animation: "slideIn 0.25s ease",
        }}
      >
        {/* Header */}
        <Group
          justify="space-between"
          p="md"
          style={{ borderBottom: "1px solid var(--epi-border)", flexShrink: 0 }}
        >
          <Group gap="xs">
            <IconBook size={18} color="var(--epi-accent)" />
            <Text fw={700} size="md">{subject.name}</Text>
          </Group>
          <Group gap="xs">
            <button
              onClick={copyLink}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "none", border: "1px solid var(--epi-border)",
                color: copied ? "var(--epi-accent)" : "var(--epi-muted)",
                borderColor: copied ? "var(--epi-accent)" : "var(--epi-border)",
                fontSize: 12, fontWeight: 600, padding: "5px 10px",
                borderRadius: 6, cursor: "pointer", transition: "0.2s",
                fontFamily: "inherit",
              }}
            >
              {copied ? <IconCheck size={12} /> : <IconLink size={12} />}
              {copied ? "Copié !" : "Lien"}
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none",
                color: "var(--epi-muted)", fontSize: 18,
                cursor: "pointer", transition: "color 0.2s",
                display: "flex",
              }}
            >
              <IconX size={18} />
            </button>
          </Group>
        </Group>

        {/* Body */}
        <ScrollArea flex={1} p="md">
          <Stack gap="md">
            <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
              {subject.description}
            </Text>

            <Group gap="xs" wrap="wrap">
              {subject.tags.map(tag => (
                <span key={tag} style={{
                  background: "var(--epi-surface)",
                  color: "var(--epi-accent)",
                  fontSize: 11, fontWeight: 600,
                  padding: "3px 8px", borderRadius: 4,
                  border: "1px solid var(--epi-border)",
                }}>
                  {tag}
                </span>
              ))}
              <Badge level={subject.difficulty} />
            </Group>

            <div style={{ height: 1, background: "var(--epi-border)" }} />

            <Stack gap="xs">
              <Group gap="xs">
                <IconDownload size={14} color="var(--epi-accent)" />
                <Text size="sm" fw={700}>Ressources</Text>
              </Group>

              {subject.files.map(file => (
                <div
                  key={file}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "var(--epi-surface)",
                    border: "1px solid var(--epi-border)",
                    borderRadius: 8, padding: "12px 14px", gap: 10,
                  }}
                >
                  <Group gap="xs" style={{ minWidth: 0, flex: 1 }}>
                    <IconFile size={16} color="var(--epi-accent)" style={{ flexShrink: 0 }} />
                    <Text size="sm" truncate>{file}</Text>
                  </Group>
                  <Group gap="xs" style={{ flexShrink: 0 }}>
                    <a
                      href={`${API}/uploads/${file}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        color: "var(--epi-accent)", border: "1px solid var(--epi-accent)",
                        background: "transparent", borderRadius: 6,
                        fontSize: 12, fontWeight: 700,
                        padding: "6px 12px", textDecoration: "none", transition: "0.2s",
                      }}
                    >
                      <IconEye size={12} />
                      Voir
                    </a>
                  </Group>
                </div>
              ))}
            </Stack>
          </Stack>
        </ScrollArea>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
