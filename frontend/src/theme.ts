import { createTheme, type MantineColorsTuple } from "@mantine/core";

const epitechAccent: MantineColorsTuple = [
  "#eeeeff",
  "#d8d9ff",
  "#adadff",
  "#7f7ffe",
  "#5856fd",
  "#413cfc",
  "#6366f1", // [6] — primary shade
  "#4f52d4",
  "#3d40b8",
  "#2c2e9a",
];

/*
 * Override Mantine's dark scale to match Epitech's palette.
 * Mantine maps these indices to specific roles in dark mode:
 *   dark[7] → body background      → #111111
 *   dark[6] → Paper/Card/Input bg  → #1a1a1a
 *   dark[5] → hover / surface-2    → #222222
 *   dark[4] → border               → #2a2a2a
 *   dark[3] → dimmed text          → #9ca3af
 */
const epitechDark: MantineColorsTuple = [
  "#ffffff",
  "#e0e0e0",
  "#c0c0c0",
  "#9ca3af",
  "#2a2a2a",
  "#222222",
  "#1a1a1a",
  "#111111",
  "#0d0d0d",
  "#090909",
];

export const theme = createTheme({
  primaryColor: "epitech",
  primaryShade: { dark: 6, light: 6 },

  colors: {
    epitech: epitechAccent,
    dark: epitechDark,
  },

  fontFamily: '"IBM Plex Sans", sans-serif',
  fontFamilyMonospace: '"Ubuntu Mono", monospace',
  headings: { fontFamily: '"IBM Plex Sans", sans-serif' },

  defaultRadius: "md",

  components: {
    NavLink: {
      styles: {
        root: { borderRadius: "6px" },
      },
    },
  },
});
