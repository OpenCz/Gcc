import { useEffect, useState } from "react";
import { Group, Text } from "@mantine/core";
import { IconUser } from "@tabler/icons-react";
import epitechLogo from "../../assets/img/epitech_logo.png";
import { API } from "../../lib/api";

export function Navbar() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatted = time.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <Group
      justify="space-between"
      align="center"
      px="md"
      style={{
        height: 48,
        borderBottom: "1px solid var(--epi-border)",
        background: "var(--epi-panel)",
        flexShrink: 0,
      }}
    >
      <a href="/" style={{ display: "flex" }}>
        <img src={epitechLogo} alt="Epitech" style={{ height: 24, width: "auto", cursor: "pointer" }} />
      </a>

      <Text size="sm" fw={700} style={{ letterSpacing: "0.25em" }}>
        CODING{" "}
        <Text component="span" c="epitech">CLUB</Text>
        {" "}EPITECH
      </Text>

      <Group gap="md" align="center">
        <Text size="sm" ff="monospace" c="dimmed" style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Text component="span" c="epitech" size="xs">●</Text>
          {formatted}
        </Text>

        <a
          href={`${API}/auth/login`}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none",
            border: "1px solid var(--epi-border)",
            color: "var(--epi-muted)",
            fontSize: 12, fontWeight: 600,
            padding: "5px 12px", borderRadius: 6,
            cursor: "pointer", textDecoration: "none",
            transition: "border-color 0.2s, color 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--epi-accent)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--epi-accent)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--epi-border)";
            (e.currentTarget as HTMLAnchorElement).style.color = "var(--epi-muted)";
          }}
        >
          <IconUser size={13} />
          Se connecter
        </a>
      </Group>
    </Group>
  );
}
