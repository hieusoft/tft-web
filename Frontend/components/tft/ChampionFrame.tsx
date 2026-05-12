"use client";

import Image from "next/image";
import { useState, type ReactNode, type CSSProperties } from "react";
import { TFT, TFT_FONT } from "@/lib/tft-theme";

/**
 * TFT champion portrait frame — match style in-game / metatft.gg:
 *   ┌─ gold chevron / pediment ornament ─┐
 *   │  gold trim ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
 *   │ ┃              SPLASH            ┃│  ← side borders cost-color
 *   │ ┃  (champion portrait crop)      ┃│
 *   │ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛│
 *   │  cost-color bottom bar — NAME      │
 *   └────────────────────────────────────┘
 */

/** Canonical TFT cost colors (bright). */
export const COST_COLOR: Record<number, string> = {
  1: "#7d8590", // gray
  2: "#1ab050", // green
  3: "#127ed4", // blue
  4: "#cd34d4", // purple
  5: "#feb939", // gold
  6: "#ff5e5e", // prismatic / rare (set 14+)
};

/** Darker shade used for inner shadows & gradients. */
export const COST_COLOR_DIM: Record<number, string> = {
  1: "#3d434b",
  2: "#0c5128",
  3: "#0a3a6b",
  4: "#5b1d75",
  5: "#7a5410",
  6: "#7a2828",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Top ornament — small gold pediment with chevron
   ───────────────────────────────────────────────────────────────────────────── */
function TopOrnament({ width = 38 }: { width?: number }) {
  const w = width;
  const h = 9;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: "absolute",
        top: -h + 1,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 3,
        display: "block",
        pointerEvents: "none",
      }}
      aria-hidden
    >
      <defs>
        <linearGradient id="tft-ornament-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TFT.goldBright} />
          <stop offset="55%" stopColor={TFT.gold} />
          <stop offset="100%" stopColor={TFT.goldDim} />
        </linearGradient>
      </defs>
      {/* Pediment: gentle peak */}
      <path
        d={`M0 ${h} L${w * 0.18} 4 L${w * 0.5} 0 L${w * 0.82} 4 L${w} ${h} Z`}
        fill="url(#tft-ornament-grad)"
        stroke={TFT.goldDeep}
        strokeWidth="0.6"
      />
      {/* Inner notch line */}
      <path
        d={`M${w * 0.3} ${h - 2} L${w * 0.5} 4 L${w * 0.7} ${h - 2}`}
        fill="none"
        stroke={TFT.goldDeep}
        strokeWidth="0.5"
        opacity="0.65"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ChampionFrame
   ───────────────────────────────────────────────────────────────────────────── */
export interface ChampionFrameProps {
  cost: number;
  name: string;
  /** Splash art (preferred) or icon path. */
  image?: string | null;
  /** Aspect ratio of the frame. Default 3:4 (portrait). Pass `undefined` to use absolute size. */
  aspectRatio?: string;
  /** Fixed width — if not set, frame stretches to container. */
  width?: number | string;
  /** Object-position for the cropped splash. Default `center 35%` (focuses face/chest of TFT splash). */
  imagePosition?: string;
  /** Children rendered on top of the splash (overlay layer). */
  children?: ReactNode;
  /** Render extra UI in the bottom name bar (e.g. cost coin). Default = cost coin. */
  bottomRight?: ReactNode;
  /** Hover lift effect. Default true. */
  interactive?: boolean;
  /** Visual variant. "default" = compact card; "banner" = wide landscape with gold bracket ornament + thick gold bar. */
  variant?: "default" | "banner";
  className?: string;
  style?: CSSProperties;
}

export default function ChampionFrame({
  cost,
  name,
  image,
  aspectRatio = "3 / 4",
  width,
  imagePosition = "center 35%",
  children,
  bottomRight,
  interactive = true,
  variant = "default",
  className,
  style,
}: ChampionFrameProps) {
  const [hover, setHover] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const c = COST_COLOR[cost] ?? COST_COLOR[1];
  const cDim = COST_COLOR_DIM[cost] ?? COST_COLOR_DIM[1];
  const isBanner = variant === "banner";

  return (
    <div
      className={className}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        position: "relative",
        width: width ?? "100%",
        aspectRatio,
        background: "#000",
        // Outer frame: banner uses pure gold border, default uses cost-color
        boxShadow: isBanner
          ? `
            inset 0 0 0 1px ${TFT.goldDeep},
            inset 0 0 0 4px ${TFT.gold},
            inset 0 0 0 5px ${TFT.goldDeep},
            0 4px 18px rgba(0,0,0,0.7)
          `
          : `
            inset 0 0 0 1px ${TFT.goldDeep},
            inset 0 0 0 2px ${cDim},
            inset 0 0 0 4px ${c},
            inset 0 0 0 5px ${TFT.goldDeep},
            0 4px 14px rgba(0,0,0,0.65)
          `,
        transform: hover ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.18s ease, filter 0.18s ease",
        filter: hover ? `drop-shadow(0 8px 18px ${isBanner ? TFT.gold : c}55)` : "none",
        ...style,
      }}
    >
      {/* Top ornament: banner = wide bracket + cube, default = small pediment */}
      {isBanner ? <BannerOrnament /> : <TopOrnament />}

      {/* Top gold trim strip (under ornament, full width) — hidden in banner */}
      {!isBanner && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 5,
            left: 5,
            right: 5,
            height: 2,
            background: `linear-gradient(180deg, ${TFT.goldBright} 0%, ${TFT.gold} 50%, ${TFT.goldDim} 100%)`,
            boxShadow: `0 1px 0 ${TFT.goldDeep}`,
            zIndex: 2,
          }}
        />
      )}

      {/* Top corner gold flourishes — only default */}
      {!isBanner && <CornerFlourish position="tl" />}
      {!isBanner && <CornerFlourish position="tr" />}

      {/* Splash image */}
      <div
        style={{
          position: "absolute",
          inset: 5,
          paddingTop: isBanner ? 0 : 4,
          paddingBottom: isBanner ? 44 : 26, // larger bottom bar in banner
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            background: `linear-gradient(180deg, #1a1a1a 0%, #050505 100%)`,
          }}
        >
          {image && !imgErr ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 280px"
              style={{
                objectFit: "cover",
                objectPosition: imagePosition,
                transform: hover ? "scale(1.04)" : "scale(1)",
                transition: "transform 0.4s ease",
              }}
              unoptimized
              onError={() => setImgErr(true)}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                color: TFT.textMute,
                fontFamily: "serif",
              }}
            >
              ?
            </div>
          )}

          {/* Bottom darken gradient for legibility of overlay UI */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.05) 35%, transparent 60%)",
            }}
          />

          {/* Overlay slot (tier badge, traits, stats…) */}
          {children}
        </div>
      </div>

      {/* Bottom name bar */}
      <div
        style={{
          position: "absolute",
          left: 5,
          right: 5,
          bottom: 5,
          height: isBanner ? 42 : 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isBanner ? "0 16px" : "0 10px",
          background: isBanner
            ? `linear-gradient(180deg, ${TFT.goldBright} 0%, ${TFT.gold} 50%, ${TFT.goldDeep} 100%)`
            : `linear-gradient(180deg, ${c} 0%, ${cDim} 100%)`,
          boxShadow: isBanner
            ? `inset 0 1px 0 rgba(255,236,180,0.6), inset 0 -1px 0 ${TFT.goldDeep}`
            : `inset 0 1px 0 ${TFT.goldDim}, inset 0 -1px 0 ${TFT.goldDeep}`,
          zIndex: 2,
        }}
      >
        <span
          className="tft-heading"
          style={{
            color: isBanner ? "#1a0f00" : "#fff",
            fontSize: isBanner ? 18 : 12,
            fontWeight: isBanner ? 900 : 800,
            letterSpacing: isBanner ? "0.02em" : "0.05em",
            textTransform: isBanner ? "none" : "uppercase",
            textShadow: isBanner ? "0 1px 0 rgba(255,236,180,0.4)" : "0 1px 2px rgba(0,0,0,0.85)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            fontFamily: TFT_FONT.heading,
          }}
        >
          {name}
        </span>
        {bottomRight !== undefined ? (
          bottomRight
        ) : (
          <CostCoin cost={cost} large={isBanner} />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Cost coin — small gold disc with cost number, like in-game shop
   ───────────────────────────────────────────────────────────────────────────── */
function CostCoin({ cost, large = false }: { cost: number; large?: boolean }) {
  const size = large ? 20 : 11;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: large ? 6 : 3,
        flexShrink: 0,
        textShadow: large ? "none" : "0 1px 2px rgba(0,0,0,0.85)",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="#fcd34d" aria-hidden>
        <circle cx="12" cy="12" r="10" stroke="#7a5410" strokeWidth="1.2" />
        <text
          x="12"
          y="16"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="#5a3e0a"
          fontFamily="Georgia, serif"
        >
          ¢
        </text>
      </svg>
      <span
        style={{
          color: large ? "#1a0f00" : "#fcd34d",
          fontSize: large ? 18 : 12,
          fontWeight: large ? 900 : 800,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {cost}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Banner ornament — wide gold bracket with 3D cost gem in the center
   ───────────────────────────────────────────────────────────────────────────── */
function BannerOrnament() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: -8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="120" height="28" viewBox="0 0 120 28" style={{ display: "block" }}>
        <defs>
          <linearGradient id="tft-banner-bracket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={TFT.goldBright} />
            <stop offset="55%" stopColor={TFT.gold} />
            <stop offset="100%" stopColor={TFT.goldDeep} />
          </linearGradient>
          <linearGradient id="tft-banner-gem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff6cf" />
            <stop offset="45%" stopColor={TFT.goldBright} />
            <stop offset="100%" stopColor={TFT.goldDeep} />
          </linearGradient>
        </defs>
        {/* Left bracket */}
        <path
          d="M0 22 L12 14 L40 14 L46 22 Z"
          fill="url(#tft-banner-bracket)"
          stroke={TFT.goldDeep}
          strokeWidth="0.8"
        />
        {/* Right bracket */}
        <path
          d="M74 22 L80 14 L108 14 L120 22 Z"
          fill="url(#tft-banner-bracket)"
          stroke={TFT.goldDeep}
          strokeWidth="0.8"
        />
        {/* Center gem (diamond/cube) */}
        <g transform="translate(60 14)">
          {/* Outer diamond */}
          <path
            d="M0 -12 L12 0 L0 12 L-12 0 Z"
            fill="url(#tft-banner-gem)"
            stroke={TFT.goldDeep}
            strokeWidth="1"
          />
          {/* Facet lines */}
          <path d="M0 -12 L0 12" stroke={TFT.goldDeep} strokeWidth="0.7" opacity="0.7" />
          <path d="M-12 0 L12 0" stroke={TFT.goldDeep} strokeWidth="0.7" opacity="0.7" />
          {/* Highlight */}
          <path d="M-6 -6 L0 -12 L6 -6 L0 0 Z" fill="#fff7d4" opacity="0.55" />
        </g>
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Corner gold flourish — small triangle accent at top-left / top-right
   ───────────────────────────────────────────────────────────────────────────── */
function CornerFlourish({ position }: { position: "tl" | "tr" }) {
  const isLeft = position === "tl";
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: 5,
        [isLeft ? "left" : "right"]: 5,
        width: 0,
        height: 0,
        zIndex: 2,
        borderTop: `6px solid ${TFT.gold}`,
        [isLeft ? "borderRight" : "borderLeft"]: "6px solid transparent",
      }}
    />
  );
}
