// Board palette — matches the site's emerald/teal/navy 2026-27 theme.
export const boardTheme = {
  light: "#e2e8f0",
  dark: "#115e59",
  coordOnLight: "#115e59",
  coordOnDark: "#e2e8f0",
} as const;

export type Color = "w" | "b";

export const opposite = (c: Color): Color => (c === "w" ? "b" : "w");
