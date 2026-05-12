"use client";

import Image from "next/image";
import { useState } from "react";
import { TFT, tftBevel } from "@/lib/tft-theme";

/**
 * TFT-style item icon — square với khung viền vàng đồng kép, không bo tròn.
 * Match phong cách tooltip in-game.
 */
export default function ItemIcon({
  src,
  alt,
  size = 64,
  borderColor = TFT.gold,
  glow = true,
  title,
}: {
  src: string | null | undefined;
  alt: string;
  size?: number;
  borderColor?: string;
  glow?: boolean;
  title?: string;
}) {
  const [err, setErr] = useState(false);
  return (
    <div
      title={title}
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
        background: "#000",
        boxShadow: tftBevel(borderColor, glow),
      }}
    >
      {src && !err ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          style={{ objectFit: "cover", imageRendering: "pixelated" }}
          unoptimized
          onError={() => setErr(true)}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.4,
            color: TFT.textMute,
            fontFamily: "serif",
          }}
        >
          ?
        </div>
      )}
    </div>
  );
}
