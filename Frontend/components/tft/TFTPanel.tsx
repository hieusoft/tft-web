"use client";

import type { CSSProperties, ReactNode } from "react";
import { TFT, tftHeroPanelStyle, tftPanelStyle } from "@/lib/tft-theme";

/** 4 góc trang trí kim loại vàng (gold corner ornaments) như khung UI in-game. */
export function CornerOrnaments({ size = 14, color = TFT.gold }: { size?: number; color?: string }) {
  const corners: CSSProperties[] = [
    { top: -1, left: -1, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    { top: -1, right: -1, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
    { bottom: -1, left: -1, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    { bottom: -1, right: -1, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
  ];
  return (
    <>
      {corners.map((style, i) => (
        <span
          key={i}
          aria-hidden
          style={{ position: "absolute", width: size, height: size, pointerEvents: "none", ...style }}
        />
      ))}
    </>
  );
}

/**
 * TFT panel — slate fill + bronze hairline border. Set `hero` để có viền vàng đậm + 4 góc.
 */
export default function TFTPanel({
  children,
  hero = false,
  className,
  style,
  withCorners = false,
}: {
  children: ReactNode;
  hero?: boolean;
  className?: string;
  style?: CSSProperties;
  withCorners?: boolean;
}) {
  const base = hero ? tftHeroPanelStyle : tftPanelStyle;
  return (
    <div className={className} style={{ position: "relative", ...base, ...style }}>
      {withCorners && <CornerOrnaments />}
      {children}
    </div>
  );
}
