"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ApiAugment } from "@/lib/api-client";

const RANK_COLOR: Record<string, string> = {
  S: "rgb(255, 126, 131)",
  A: "rgb(255, 191, 127)",
  B: "rgb(255, 223, 128)",
  C: "rgb(254, 255, 127)",
  D: "rgb(200, 200, 200)",
};

const TIER_META: Record<number, { label: string; color: string; gradient: string }> = {
  1: { label: "Bạc", color: "#9ca3af", gradient: "linear-gradient(135deg, #374151 0%, #1f2937 100%)" },
  2: { label: "Vàng", color: "#eab308", gradient: "linear-gradient(135deg, #422006 0%, #1c1a00 100%)" },
  3: { label: "Huyền Thoại", color: "#a855f7", gradient: "linear-gradient(135deg, #2e1065 0%, #1a0533 100%)" },
};

export default function AugmentDetailClient({ augment }: { augment: ApiAugment }) {
  const [imgErr, setImgErr] = useState(false);

  const rankColor = RANK_COLOR[augment.rank ?? "D"] ?? "#9ca3af";
  const tierInfo = augment.tier ? TIER_META[augment.tier] : null;
  const glowColor = rankColor + "40";

  const cleanedDesc = augment.description
    ? augment.description.replace(/TFT_Augment_Template_Blank/g, "").trim()
    : null;

  return (
    <div style={{ background: "#0a0a0c", minHeight: "100vh", color: "#e5e7eb", padding: "30px 20px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Breadcrumbs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
            <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Trang Chủ</Link>
            <span style={{ fontSize: 10 }}>❯</span>
            <Link href="/augments" style={{ color: "#6b7280", textDecoration: "none" }}>Lõi Công Nghệ</Link>
            <span style={{ fontSize: 10 }}>❯</span>
            <span style={{ color: rankColor }}>{augment.name}</span>
          </div>

          <Link href="/augments" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", background: "#181a20",
            border: "1px solid #2a2d35", borderRadius: 8,
            fontSize: 13, color: "#d1d5db", fontWeight: 600, textDecoration: "none",
          }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </Link>
        </div>

        {/* Header card */}
        <div style={{
          background: tierInfo?.gradient ?? "linear-gradient(145deg, #181a20 0%, #111216 100%)",
          border: `1px solid ${rankColor}30`,
          borderRadius: 20, padding: "32px",
          display: "flex", gap: 32, alignItems: "flex-start", flexWrap: "wrap",
          boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 60px ${glowColor}`,
        }}>
          {/* Icon */}
          <div style={{
            width: 110, height: 110, borderRadius: 20, overflow: "hidden",
            background: "#000", position: "relative", flexShrink: 0,
            border: `2px solid ${rankColor}`,
            boxShadow: `0 0 40px ${glowColor}`,
          }}>
            {augment.image && !imgErr ? (
              <Image
                src={augment.image} alt={augment.name} fill sizes="110px"
                style={{ objectFit: "contain", padding: 6 }}
                onError={() => setImgErr(true)}
              />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>✨</div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 260 }}>
            {/* Badges */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
              {augment.rank && (
                <span style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 32, height: 32, borderRadius: 8, fontSize: 15, fontWeight: 900,
                  background: rankColor, color: "#000", boxShadow: `0 0 15px ${rankColor}80`,
                }}>
                  {augment.rank}
                </span>
              )}
              {tierInfo && (
                <span style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                  background: tierInfo.color + "22", color: tierInfo.color,
                  border: `1px solid ${tierInfo.color}44`,
                }}>
                  {tierInfo.label}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: "0 0 16px 0", letterSpacing: "-0.02em" }}>
              {augment.name}
            </h1>

            {cleanedDesc && (
              <p style={{
                fontSize: 15, color: "#d1d5db", lineHeight: 1.7, margin: 0,
                padding: "16px 20px",
                background: "rgba(0,0,0,0.3)",
                borderRadius: 12,
                borderLeft: `3px solid ${rankColor}`,
              }}>
                {cleanedDesc}
              </p>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {[
            { label: "Hạng Meta", value: augment.rank ?? "—", color: rankColor },
            { label: "Cấp Độ", value: tierInfo?.label ?? "—", color: tierInfo?.color ?? "#9ca3af" },
            { label: "Tier", value: augment.tier ? `Tier ${augment.tier}` : "—", color: "#60a5fa" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "#181a20", border: "1px solid #2a2d35",
              borderRadius: 16, padding: "24px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: stat.color, marginBottom: 6 }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
