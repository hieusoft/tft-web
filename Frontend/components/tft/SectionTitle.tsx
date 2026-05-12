"use client";

import type { ReactNode } from "react";
import { TFT, TFT_FONT, tftSectionHeaderStyle } from "@/lib/tft-theme";

/** Section header bar với gạch vàng + uppercase title kiểu UI in-game. */
export default function SectionTitle({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div style={{ ...tftSectionHeaderStyle, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 4, height: 14, background: TFT.gold }} />
        <h3
          style={{
            fontSize: 12,
            color: TFT.goldBright,
            fontWeight: 700,
            margin: 0,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontFamily: TFT_FONT.heading,
          }}
        >
          {children}
        </h3>
      </div>
      {right && (
        <div style={{ fontSize: 11, color: TFT.textMute, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {right}
        </div>
      )}
    </div>
  );
}
