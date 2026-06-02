import { createTheme, type MantineColorsTuple } from "@mantine/core";

/*
 * Accent: #809dfd (from reference CSS)
 * Built as a full 10-step scale centered on that value.
 */
const epitechAccent: MantineColorsTuple = [
  "#eef0ff",
  "#dde1ff",
  "#bbc3ff",
  "#99a3fe",
  "#809dfd", // [4] ← primary shade
  "#6b8afc",
  "#5477fb",
  "#4264e0",
  "#3255c5",
  "#2246aa",
];

/*
 * Dark scale mapped to the reference colors:
 *   dark[7] → #1f1f1f  body / main content bg
 *   dark[6] → #242424  header, sidebar, detail panel bg  ← Paper default
 *   dark[5] → #2a2a2a  cards, inputs, banners
 *   dark[4] → #3a3a3a  borders
 *   dark[3] → #aaaaaa  dimmed / muted text
 *   dark[2] → #777777  very muted
 */
const epitechDark: MantineColorsTuple = [
  "#ffffff",
  "#e0e0e0",
  "#777777",
  "#aaaaaa",
  "#3a3a3a",
  "#2a2a2a",
  "#242424",
  "#1f1f1f",
  "#191919",
  "#111111",
];

export const theme = createTheme({
  primaryColor: "epitech",
  primaryShade: { dark: 4, light: 4 },

  colors: {
    epitech: epitechAccent,
    dark: epitechDark,
  },

  fontFamily: '"IBM Plex Sans", sans-serif',
  fontFamilyMonospace: '"Ubuntu Mono", monospace',
  headings: { fontFamily: '"Anton", sans-serif' },

  defaultRadius: "md",

  components: {
    NavLink: {
      styles: {
        root: { borderRadius: 6 },
      },
    },
    Paper: {
      defaultProps: { bg: "dark.6" },
    },
  },
});
