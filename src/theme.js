/* Renk paletleri — açık ve koyu tema */
export const palettes = {
  light: {
    bg: "#f4f6fa",
    surface: "#ffffff",
    surface2: "#eef1f6",
    border: "#e2e7ef",
    text: "#1a2233",
    muted: "#64708a",
    primary: "#4f6df5",
    primarySoft: "#e8ecfe",
    success: "#22a06b",
    successSoft: "#e3f5ec",
    warning: "#e8930c",
    warningSoft: "#fdf1dc",
    danger: "#d94f4f",
    dangerSoft: "#fbe9e9",
  },
  dark: {
    bg: "#12151c",
    surface: "#1b1f2a",
    surface2: "#232837",
    border: "#2c3347",
    text: "#e8ecf4",
    muted: "#8b95ab",
    primary: "#6d87ff",
    primarySoft: "#232c4d",
    success: "#35c284",
    successSoft: "#16352a",
    warning: "#f0a836",
    warningSoft: "#3a2e14",
    danger: "#e86868",
    dangerSoft: "#3c2020",
  },
};

/* Makro renkleri her iki temada ortak anlam taşır */
export const macroColors = (c) => ({
  protein: c.primary,
  carb: c.warning,
  fat: c.danger,
});
