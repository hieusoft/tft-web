"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ApiAugment } from "@/lib/api-client";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT, tftBevel } from "@/lib/tft-theme";
import TierBadge from "@/components/tft/TierBadge";
import TFTPanel from "@/components/tft/TFTPanel";
import SectionTitle from "@/components/tft/SectionTitle";

const TIER_META: Record<number, { label: string; color: string }> = {
  1: { label: "Bạc", color: "#c0c8cc" },
  2: { label: "Vàng", color: "#c8aa6e" },
  3: { label: "Huyền Thoại", color: "#c084fc" },
};

export default function AugmentDetailClient({ augment }: { augment: ApiAugment }) {
  const [imgErr, setImgErr] = useState(false);

  const rank = augment.rank ?? "D";
  const rankColor = TIER_HEX[rank] ?? "#9ca3af";
  const tierInfo = augment.tier ? TIER_META[augment.tier] : null;
  const tierColor = tierInfo?.color ?? TFT.gold;

  const cleanedDesc = augment.description
    ? augment.description
        .replace(/TFT_Augment_Template_Blank/g, "")
        .replace(/tft10_headliner_default/g, "")
        .replace(/ĐTCL Vegas Open, 2023/g, "")
        .trim()
    : null;

  return (
    <div
      className="tft-page"
      style={{
        padding: "24px 16px 60px",
        fontFamily: TFT_FONT.body,
      }}
    >
      <div
        style={{
          maxWidth: 920,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {/* Breadcrumbs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: TFT.textMute,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          <Link href="/" style={{ color: TFT.textMute, textDecoration: "none" }}>
            Trang Chủ
          </Link>
          <span>/</span>
          <Link href="/augments" style={{ color: TFT.textMute, textDecoration: "none" }}>
            Lõi Công Nghệ
          </Link>
          <span>/</span>
          <span style={{ color: TFT.gold }}>{augment.name}</span>
        </div>

        {/* HERO */}
        <TFTPanel
          hero
          withCorners
          style={{
            padding: "28px 32px",
            display: "flex",
            gap: 28,
            alignItems: "flex-start",
            flexWrap: "wrap",
            background: `linear-gradient(180deg, ${TFT.panelAlt} 0%, ${TFT.panel} 70%)`,
            // tier-themed glow at top
            boxShadow: `inset 0 1px 0 ${tierColor}33, 0 12px 30px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 120,
              height: 120,
              position: "relative",
              flexShrink: 0,
              background: "#000",
              boxShadow: tftBevel(tierColor, true),
            }}
          >
            {augment.image && !imgErr ? (
              <Image
                src={augment.image}
                alt={augment.name}
                fill
                sizes="120px"
                style={{ objectFit: "cover", imageRendering: "pixelated" }}
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
                  fontSize: 36,
                  color: TFT.textMute,
                  fontFamily: "serif",
                }}
              >
                ?
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            {/* Badges row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
                flexWrap: "wrap",
              }}
            >
              {augment.rank && <TierBadge tier={rank} size={28} />}
              {tierInfo && (
                <span
                  style={{
                    padding: "4px 12px",
                    fontSize: 11,
                    fontWeight: 700,
                    background: `${tierInfo.color}15`,
                    color: tierInfo.color,
                    border: `1px solid ${tierInfo.color}55`,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                  }}
                >
                  {tierInfo.label}
                </span>
              )}
            </div>

            {/* Name */}
            <h1
              className="tft-heading"
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: TFT.goldBright,
                margin: "0 0 18px 0",
                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                letterSpacing: "0.02em",
              }}
            >
              {augment.name}
            </h1>

            {/* Description block — TFT tooltip style */}
            {cleanedDesc && (
              <div
                style={{
                  fontSize: 14,
                  color: TFT.text,
                  lineHeight: 1.7,
                  padding: "14px 18px",
                  background: "rgba(0,0,0,0.35)",
                  borderLeft: `3px solid ${tierColor}`,
                  border: `1px solid ${TFT.line}`,
                }}
                dangerouslySetInnerHTML={{
                  __html: cleanedDesc
                    .replace(
                      /(\d+(?:\.\d+)?%)/g,
                      `<span style="color:${TFT.gold};font-weight:700;">$1</span>`
                    )
                    .replace(
                      /(\d+\s*giây)/gi,
                      `<span style="color:${TFT.gold};font-weight:700;">$1</span>`
                    )
                    .replace(
                      /^([^:]{2,30}):/g,
                      `<span style="color:${TFT.blueBright};font-weight:700;">$1:</span>`
                    ),
                }}
              />
            )}
          </div>
        </TFTPanel>

        {/* INFO PANEL */}
        <TFTPanel>
          <SectionTitle>Thông Tin Lõi</SectionTitle>
          <div style={{ padding: "18px" }}>
            {[
              {
                label: "Hạng Meta",
                value: augment.rank ?? "—",
                color: rankColor,
              },
              {
                label: "Cấp Độ",
                value: tierInfo?.label ?? "—",
                color: tierInfo?.color ?? TFT.textDim,
              },
              {
                label: "Tier",
                value: augment.tier ? `Tier ${augment.tier}` : "—",
                color: TFT.text,
              },
            ].map((stat, i, arr) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  padding: "12px 4px",
                  borderBottom: i < arr.length - 1 ? `1px solid ${TFT.lineSoft}` : "none",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: TFT.textMute,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {stat.label}
                </span>
                <span
                  className="tft-heading"
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: stat.color,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </TFTPanel>
      </div>
    </div>
  );
}
