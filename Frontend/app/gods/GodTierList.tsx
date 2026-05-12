"use client";

import { useState, useMemo } from "react";
import GodDetailModal from "./GodDetailModal";
import type { ApiGodListItem } from "@/lib/api-client";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT, tftBevel } from "@/lib/tft-theme";
import TierBadge from "@/components/tft/TierBadge";

const TIERS = ["S", "A", "B", "C", "D"] as const;

/* ─────────────────────────────────────────────────────────────────────────────
   Single God avatar — square TFT bevel (matches item/champion style)
   ───────────────────────────────────────────────────────────────────────────── */
function GodCard({
  god,
  onClick,
}: {
  god: ApiGodListItem;
  onClick: (slug: string) => void;
}) {
  const [hover, setHover] = useState(false);
  const tierColor = TIER_HEX[god.rank] ?? TFT.gold;

  return (
    <div
      onClick={() => onClick(god.slug ?? String(god.id))}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 78,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          position: "relative",
          background: "#000",
          flexShrink: 0,
          transition: "transform 0.15s",
          transform: hover ? "translateY(-2px) scale(1.05)" : "translateY(0) scale(1)",
          boxShadow: tftBevel(hover ? TFT.gold : tierColor, hover),
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          src={god.image}
          alt={god.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
          }}
        />
      </div>
      <span
        className="tft-heading"
        style={{
          fontSize: 11,
          color: hover ? TFT.goldBright : TFT.text,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.2,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {god.name}
      </span>
      <span
        style={{
          fontSize: 9,
          color: TFT.textMute,
          textAlign: "center",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          fontWeight: 600,
        }}
      >
        {god.trait}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tier row — left rail with TierBadge + grid of gods
   ───────────────────────────────────────────────────────────────────────────── */
function TierRow({
  tier,
  gods,
  onSelect,
}: {
  tier: string;
  gods: ApiGodListItem[];
  onSelect: (slug: string) => void;
}) {
  const color = TIER_HEX[tier] ?? TFT.gold;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: TFT.panel,
        border: `1px solid ${TFT.line}`,
        borderLeft: `3px solid ${color}`,
        minHeight: 110,
      }}
    >
      <div
        style={{
          width: 72,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          background: `linear-gradient(180deg, ${color}15 0%, transparent 100%)`,
          borderRight: `1px solid ${TFT.line}`,
        }}
      >
        <TierBadge tier={tier} size={40} />
        <span
          style={{
            fontSize: 9,
            color: TFT.textMute,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {gods.length}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          padding: "16px 18px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px 22px",
          alignContent: "flex-start",
          alignItems: "flex-start",
        }}
      >
        {gods.length > 0 ? (
          gods.map((god) => <GodCard key={god.id} god={god} onClick={onSelect} />)
        ) : (
          <span
            style={{
              fontSize: 12,
              color: TFT.textMute,
              fontStyle: "italic",
              alignSelf: "center",
              letterSpacing: "0.04em",
            }}
          >
            Chưa có dữ liệu
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────────────────────────── */
export default function GodTierList({
  initialGods,
}: {
  initialGods: ApiGodListItem[];
}) {
  const [selectedGodSlug, setSelectedGodSlug] = useState<string | null>(null);

  const grouped = useMemo(
    () =>
      TIERS.map((tier) => ({
        tier,
        gods: initialGods.filter((g) => g.rank === tier),
      })),
    [initialGods]
  );

  return (
    <div className="tft-page" style={{ fontFamily: TFT_FONT.body }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 18px" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 22,
            paddingBottom: 14,
            borderBottom: `1px solid ${TFT.line}`,
          }}
        >
          <h1
            className="tft-heading"
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: TFT.goldBright,
              margin: "0 0 6px",
              textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              letterSpacing: "0.04em",
            }}
          >
            Bảng Phân Hạng Thần Thoại
          </h1>
          <p style={{ fontSize: 12, color: TFT.textMute, margin: 0, letterSpacing: "0.04em", lineHeight: 1.6 }}>
            Các Thần cung cấp Ân Huệ độc đáo cùng phần thưởng theo từng giai đoạn. Nhấp vào một vị thần để xem chi tiết.
          </p>
        </div>

        {/* Tier list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {grouped.map(({ tier, gods }) => (
            <TierRow key={tier} tier={tier} gods={gods} onSelect={setSelectedGodSlug} />
          ))}
        </div>
      </div>

      {selectedGodSlug && (
        <GodDetailModal
          godSlug={selectedGodSlug}
          onClose={() => setSelectedGodSlug(null)}
        />
      )}
    </div>
  );
}
