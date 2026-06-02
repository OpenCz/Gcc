export type Level = "Débutant" | "Intermédiaire" | "Avancé";

const styles: Record<Level, string> = {
  Débutant:      "border border-epi-success text-epi-success",
  Intermédiaire: "border border-epi-warning text-epi-warning",
  Avancé:        "border border-epi-danger  text-epi-danger",
};

export function Badge({ level }: { level: Level }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${styles[level]}`}>
      {level}
    </span>
  );
}
