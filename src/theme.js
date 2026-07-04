/* FitLife tasarım sistemi — profesyonel fitness paleti + tasarım jetonları
   Renkler: enerjik yeşil (birincil) + turuncu (vurgu), derin slate koyu mod.
   Not: eski jeton adları korunur (geriye dönük uyumluluk), yenileri eklenir. */

export const palettes = {
  /* iOS sistem renk mantığı: gruplu arka plan + yükseltilmiş yüzeyler */
  light: {
    bg: "#F2F2F7",          // systemGroupedBackground
    surface: "#FFFFFF",      // secondarySystemGroupedBackground (kartlar)
    surface2: "#EFEFF4",     // tertiary / input dolgusu
    surface3: "#E5E5EA",
    border: "#D5D5DB",       // separator
    borderStrong: "#C6C6CC",
    text: "#1C1C1E",         // label
    muted: "#8A8A8E",        // secondaryLabel
    faint: "#B8B8BE",        // tertiaryLabel

    primary: "#059669",
    primarySoft: "#D9F5EA",
    accent: "#F97316",
    accentSoft: "#FFEAD6",
    success: "#34C759",      // iOS systemGreen
    successSoft: "#DCF7E3",
    warning: "#C77800",
    warningSoft: "#FDEFCF",
    danger: "#FF3B30",       // iOS systemRed
    dangerSoft: "#FFE1DE",

    onPrimary: "#FFFFFF",
    onAccent: "#FFFFFF",
    shadow: "#1C1C2E",
    shadowOpacity: 0.06,
    scrim: "rgba(0,0,0,0.32)",
    trackHi: "#E3E3E8",
    blurTint: "light",
    navBg: "rgba(249,249,251,0.82)",
  },
  dark: {
    bg: "#000000",           // iOS dark grouped background (true black)
    surface: "#1C1C1E",      // secondarySystemGroupedBackground
    surface2: "#2C2C2E",     // tertiary / input
    surface3: "#3A3A3C",
    border: "#38383A",       // separator (dark)
    borderStrong: "#48484A",
    text: "#FFFFFF",         // label
    muted: "#98989E",        // secondaryLabel
    faint: "#68686E",        // tertiaryLabel

    primary: "#30D158",      // iOS systemGreen (dark)
    primarySoft: "#0E2E1C",
    accent: "#FF9F0A",       // iOS systemOrange (dark)
    accentSoft: "#3A2610",
    success: "#30D158",
    successSoft: "#0E2E1C",
    warning: "#FFD60A",
    warningSoft: "#38300A",
    danger: "#FF453A",       // iOS systemRed (dark)
    dangerSoft: "#3A1A18",

    onPrimary: "#04160B",
    onAccent: "#1A0F00",
    shadow: "#000000",
    shadowOpacity: 0.5,
    scrim: "rgba(0,0,0,0.55)",
    trackHi: "#2C2C2E",
    blurTint: "dark",
    navBg: "rgba(20,20,22,0.80)",
  },
};

/* Seçilebilir vurgu (accent) renkleri — birincil rengi değiştirir */
export const ACCENTS = {
  green: { name: "Yeşil", swatch: "#22C55E",
    light: { primary: "#059669", primarySoft: "#D9F5EA", onPrimary: "#FFFFFF" },
    dark: { primary: "#30D158", primarySoft: "#0E2E1C", onPrimary: "#04160B" } },
  blue: { name: "Mavi", swatch: "#3B82F6",
    light: { primary: "#2563EB", primarySoft: "#DBE7FF", onPrimary: "#FFFFFF" },
    dark: { primary: "#0A84FF", primarySoft: "#0A2540", onPrimary: "#00121F" } },
  purple: { name: "Mor", swatch: "#A855F7",
    light: { primary: "#7C3AED", primarySoft: "#EDE4FF", onPrimary: "#FFFFFF" },
    dark: { primary: "#BF5AF2", primarySoft: "#2A163B", onPrimary: "#14071F" } },
  pink: { name: "Pembe", swatch: "#EC4899",
    light: { primary: "#DB2777", primarySoft: "#FCE1EF", onPrimary: "#FFFFFF" },
    dark: { primary: "#FF375F", primarySoft: "#3A1622", onPrimary: "#1F0710" } },
};

/* Makro renkleri her iki temada ortak anlam taşır */
export const macroColors = (c) => ({
  protein: c.primary,
  carb: c.warning,
  fat: c.accent,
});

/* Yarıçap ölçeği (4/8 ritmi) */
export const radius = { xs: 8, sm: 10, md: 14, lg: 18, xl: 24, pill: 999 };

/* Boşluk ölçeği (4pt tabanlı) */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

/* Tipografi ölçeği — sistem fontu, ağırlık + boşlukla hiyerarşi */
export const type = {
  display: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  heading: { fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "500" },
  label: { fontSize: 13, fontWeight: "600" },
  caption: { fontSize: 11, fontWeight: "600", letterSpacing: 0.4 },
};

/* Rakamlar için hizalı (tabular) figürler — veri kaymasını önler */
export const tnum = { fontVariant: ["tabular-nums"] };

/* Yükselti/gölge ön ayarları — kart, sayfa, modal için tutarlı ölçek */
export function elevation(c, level = 1) {
  if (level === 0) return {};
  const map = {
    1: { radius: 6, y: 2, mul: 1 },
    2: { radius: 12, y: 4, mul: 1.4 },
    3: { radius: 24, y: 10, mul: 1.9 },
  };
  const e = map[level] || map[1];
  return {
    shadowColor: c.shadow,
    shadowOpacity: c.shadowOpacity * e.mul,
    shadowRadius: e.radius,
    shadowOffset: { width: 0, height: e.y },
    elevation: level * 3,
  };
}
