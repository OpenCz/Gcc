import { Badge as MantineBadge } from "@mantine/core";

export type Level = "Débutant" | "Intermédiaire" | "Avancé";

const colors: Record<Level, string> = {
  Débutant:      "green",
  Intermédiaire: "yellow",
  Avancé:        "red",
};

export function Badge({ level }: { level: Level }) {
  return (
    <MantineBadge variant="outline" color={colors[level]} size="sm">
      {level}
    </MantineBadge>
  );
}
