import type { Subject } from "../../config";

type Level = Subject["difficulty"];

const colors: Record<Level, string> = {
  Débutant:      "var(--epi-beginner)",
  Intermédiaire: "var(--epi-intermediate)",
  Avancé:        "var(--epi-advanced)",
};

export function Badge({ level }: { level: Level }) {
  const color = colors[level];
  return (
    <span style={{
      color,
      borderColor: color,
      border: "1px solid",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      padding: "3px 8px",
      flexShrink: 0,
    }}>
      {level}
    </span>
  );
}
