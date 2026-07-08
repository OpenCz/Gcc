import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme("dark");

  return (
    <button
      onClick={() => setColorScheme(computed === "dark" ? "light" : "dark")}
      title={computed === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "none", border: "1px solid var(--epi-border)",
        color: "var(--epi-muted)", padding: 6, borderRadius: 6,
        cursor: "pointer", transition: "border-color 0.2s, color 0.2s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--epi-accent)";
        e.currentTarget.style.color = "var(--epi-accent)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--epi-border)";
        e.currentTarget.style.color = "var(--epi-muted)";
      }}
    >
      {computed === "dark" ? <IconSun size={14} /> : <IconMoon size={14} />}
    </button>
  );
}
