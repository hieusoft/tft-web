"use client";

import { TIER_HEX } from "@/lib/constants";
import { TFT_FONT } from "@/lib/tft-theme";

/** Square tier badge (S/A/B/C/D) với màu cố định từ canonical palette. */
export default function TierBadge({
  tier,
  size = 28,
}: {
  tier: string;
  size?: number;
}) {
  const color = TIER_HEX[tier] ?? "#9ca3af";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size * 0.5,
        fontWeight: 900,
        background: color,
        color: "#000",
        letterSpacing: "0.02em",
        fontFamily: TFT_FONT.heading,
        flexShrink: 0,
      }}
    >
      {tier}
    </span>
  );
}
