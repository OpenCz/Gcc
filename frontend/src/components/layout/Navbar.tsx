import { useEffect, useState } from "react";
import { Group, Text } from "@mantine/core";
import epitechLogo from "../../assets/img/epitech_logo.png";

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
        background: "var(--epi-bg)",
        flexShrink: 0,
      }}
    >
      <img src={epitechLogo} alt="Epitech" style={{ height: 24, width: "auto" }} />

      <Text size="sm" fw={700} style={{ letterSpacing: "0.25em" }}>
        CODING{" "}
        <Text component="span" c="epitech">CLUB</Text>
        {" "}EPITECH
      </Text>

      <Text size="sm" ff="monospace" c="dimmed" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Text component="span" c="epitech" size="xs">●</Text>
        {formatted}
      </Text>
    </Group>
  );
}
