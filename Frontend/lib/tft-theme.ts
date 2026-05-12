/**
 * TFT in-game design tokens.
 * Dùng để giữ visual nhất quán giữa các trang (item detail, item list, champion, comp...).
 * Palette mô phỏng tooltip/UI trong game Riot Teamfight Tactics:
 *   - Slate background (very dark navy/teal)
 *   - Bronze / gold accents (`#c8aa6e`, `#785a28`, `#f0e6d2`)
 *   - Hextech blue (`#0ac8b9`)
 */

export const TFT = {
  // Backgrounds
  bg: "#070a0e",
  bgGradient: "radial-gradient(ellipse at top, #101820 0%, #070a0e 60%)",
  panel: "#0f1418",
  panelAlt: "#131920",
  panelSoft: "#0c1116",

  // Lines / borders
  line: "#1e2933",
  lineSoft: "#16202a",

  // Gold tones (bronze beveled feel)
  gold: "#c8aa6e",
  goldBright: "#f0e6d2",
  goldDim: "#785a28",
  goldDeep: "#463714",

  // Hextech blues
  blue: "#0596aa",
  blueBright: "#0ac8b9",

  // Text scale
  text: "#e9e2cf",
  textDim: "#a09b8c",
  textMute: "#5b5a48",

  // Semantic (kept aligned with global tier palette)
  good: "#4ade80",
  warn: "#facc15",
  bad: "#f87171",
} as const;

/** Font stack: heading & body dùng Geist để hỗ trợ tiếng Việt. */
export const TFT_FONT = {
  heading:
    'var(--font-geist), "Segoe UI", Roboto, system-ui, -apple-system, sans-serif',
  body:
    'var(--font-geist), "Segoe UI", Roboto, system-ui, -apple-system, sans-serif',
} as const;

/** Box-shadow giả viền vàng đồng kép (gold outer + bronze inner) như khung item TFT. */
export function tftBevel(borderColor: string = TFT.gold, glow: boolean = true) {
  if (glow) {
    return `0 0 0 1px ${TFT.bg}, 0 0 0 2px ${borderColor}, 0 0 0 3px ${TFT.goldDeep}, 0 4px 18px rgba(0,0,0,0.6)`;
  }
  return `0 0 0 1px ${TFT.bg}, 0 0 0 2px ${borderColor}`;
}

/** Standard panel style (slate fill + bronze hairline). */
export const tftPanelStyle: React.CSSProperties = {
  background: TFT.panel,
  border: `1px solid ${TFT.line}`,
};

/** Highlight panel có viền vàng đậm (dùng cho hero card). */
export const tftHeroPanelStyle: React.CSSProperties = {
  background: `linear-gradient(180deg, ${TFT.panelAlt} 0%, ${TFT.panel} 100%)`,
  border: `1px solid ${TFT.goldDim}`,
};

/** Tooltip panel style (cho ItemTooltip portal). */
export const tftTooltipStyle: React.CSSProperties = {
  background: `linear-gradient(180deg, ${TFT.panelAlt} 0%, ${TFT.panelSoft} 100%)`,
  border: `1px solid ${TFT.goldDim}`,
  boxShadow: `0 18px 40px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(0,0,0,0.6)`,
};

/** Section header bar (gold accent line + uppercase title). */
export const tftSectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 16px",
  background: `linear-gradient(180deg, #1a2129 0%, ${TFT.panel} 100%)`,
  borderTop: `1px solid ${TFT.goldDim}`,
  borderBottom: `1px solid ${TFT.goldDim}`,
};
