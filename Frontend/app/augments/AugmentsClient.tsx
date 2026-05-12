"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useCallback } from "react";
import type { ApiAugment } from "@/lib/api-client";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT, tftBevel } from "@/lib/tft-theme";
import TierBadge from "@/components/tft/TierBadge";

const RANK_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

/** Augment tier (Bạc / Vàng / Huyền Thoại) — màu accent kiểu in-game. */
const TIER_META: Record<number, { label: string; color: string }> = {
  1: { label: "Bạc", color: "#c0c8cc" }, // silver
  2: { label: "Vàng", color: "#c8aa6e" }, // gold (TFT.gold)
  3: { label: "Huyền Thoại", color: "#c084fc" }, // prismatic
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main list page
   ───────────────────────────────────────────────────────────────────────────── */
export default function AugmentsClient({ augments }: { augments: ApiAugment[] }) {
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<"All" | "S" | "A" | "B" | "C" | "D">("All");
  const [tierFilter, setTierFilter] = useState<"All" | 1 | 2 | 3>("All");

  const filtered = useMemo(() => {
    let list = [...augments];
    if (rankFilter !== "All") list = list.filter((a) => a.rank === rankFilter);
    if (tierFilter !== "All") list = list.filter((a) => a.tier === tierFilter);
    if (search.trim())
      list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const ro = (RANK_ORDER[a.rank ?? ""] ?? 9) - (RANK_ORDER[b.rank ?? ""] ?? 9);
      if (ro !== 0) return ro;
      return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
    });
    return list;
  }, [augments, rankFilter, tierFilter, search]);

  const groups = useMemo(() => {
    return (["S", "A", "B", "C", "D"] as const)
      .map((rank) => ({ rank, items: filtered.filter((a) => a.rank === rank) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="tft-page" style={{ fontFamily: TFT_FONT.body }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        .aug-skeleton {
          background: linear-gradient(90deg, ${TFT.panelSoft} 25%, ${TFT.panelAlt} 50%, ${TFT.panelSoft} 75%);
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
        }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 18px" }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
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
            Bảng Phân Hạng Lõi Công Nghệ
          </h1>
          <p style={{ fontSize: 12, color: TFT.textMute, margin: 0, letterSpacing: "0.04em" }}>
            Tất cả Lõi (Augment) phân loại theo bậc Bạc / Vàng / Huyền Thoại và tier meta.
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {/* Rank filter */}
          <div
            style={{
              display: "flex",
              gap: 3,
              background: TFT.panel,
              border: `1px solid ${TFT.line}`,
              padding: 3,
            }}
          >
            {(["All", "S", "A", "B", "C", "D"] as const).map((r) => {
              const active = rankFilter === r;
              const color = r === "All" ? TFT.gold : TIER_HEX[r];
              return (
                <button
                  key={r}
                  suppressHydrationWarning
                  onClick={() => setRankFilter(r)}
                  className="tft-heading"
                  style={{
                    height: 28,
                    minWidth: r === "All" ? 56 : 32,
                    padding: "0 10px",
                    fontSize: 12,
                    fontWeight: active ? 800 : 600,
                    border: active ? `1px solid ${color}` : "1px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: active ? `${color}22` : "transparent",
                    color: active ? color : TFT.textDim,
                    letterSpacing: "0.08em",
                  }}
                >
                  {r === "All" ? "Tất Cả" : r}
                </button>
              );
            })}
          </div>

          {/* Tier filter */}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span
              style={{
                fontSize: 10,
                color: TFT.textMute,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              Cấp
            </span>
            {(["All", 1, 2, 3] as const).map((t) => {
              const active = tierFilter === t;
              const meta = t !== "All" ? TIER_META[t] : null;
              const color = meta?.color ?? TFT.gold;
              const label = t === "All" ? "Tất Cả" : meta?.label ?? "";
              return (
                <button
                  key={String(t)}
                  suppressHydrationWarning
                  onClick={() => setTierFilter(t)}
                  style={{
                    height: 28,
                    padding: "0 11px",
                    fontSize: 11,
                    fontWeight: active ? 800 : 600,
                    border: active ? `1px solid ${color}` : `1px solid ${TFT.line}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: active ? `${color}22` : TFT.panel,
                    color: active ? color : TFT.textDim,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ position: "relative", marginLeft: "auto" }}>
            <input
              type="text"
              value={search}
              suppressHydrationWarning
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm Lõi..."
              style={{
                height: 32,
                width: 240,
                background: TFT.panel,
                border: `1px solid ${TFT.line}`,
                paddingLeft: 12,
                paddingRight: 32,
                fontSize: 12,
                color: TFT.text,
                outline: "none",
                fontFamily: TFT_FONT.body,
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = TFT.goldDim)}
              onBlur={(e) => (e.currentTarget.style.borderColor = TFT.line)}
            />
            <svg
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                transform: "translateY(-50%)",
                width: 14,
                height: 14,
                color: TFT.textMute,
                pointerEvents: "none",
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <span
            style={{
              fontSize: 11,
              color: TFT.textMute,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            {filtered.length} lõi
          </span>
        </div>

        {/* Rank Groups */}
        {groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: TFT.textMute, fontSize: 14 }}>
            Không tìm thấy lõi nào
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {groups.map(({ rank, items }) => (
              <RankRow key={rank} rank={rank} items={items} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Rank section row — left rail with tier badge + grid of augments
   ───────────────────────────────────────────────────────────────────────────── */
function RankRow({ rank, items }: { rank: string; items: ApiAugment[] }) {
  const color = TIER_HEX[rank] ?? TFT.gold;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: TFT.panel,
        border: `1px solid ${TFT.line}`,
        borderLeft: `3px solid ${color}`,
      }}
    >
      <div
        style={{
          width: 64,
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
        <TierBadge tier={rank} size={36} />
        <span
          style={{
            fontSize: 9,
            color: TFT.textMute,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          {items.length}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          padding: "14px 14px 10px",
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignContent: "flex-start",
        }}
      >
        {items.map((aug) => (
          <AugmentIcon key={aug.id} aug={aug} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Single augment icon + tooltip on hover
   ───────────────────────────────────────────────────────────────────────────── */
function AugmentIcon({ aug }: { aug: ApiAugment }) {
  const [imgErr, setImgErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const tierMeta = TIER_META[aug.tier ?? 0];
  const tierColor = tierMeta?.color ?? TFT.goldDim;

  // Cached images don't fire onLoad — check on mount
  const handleImgRef = useCallback((el: HTMLImageElement | null) => {
    if (el && el.complete && el.naturalWidth > 0) setLoaded(true);
  }, []);

  const handleMouseEnter = () => {
    if (!ref.current) {
      setShowTip(true);
      return;
    }
    const rect = ref.current.getBoundingClientRect();
    const TIP_W = 260;
    const TIP_H = aug.description ? 130 : 72;
    const above = rect.top - TIP_H - 8 >= 0;
    let left = rect.left + rect.width / 2 - TIP_W / 2;
    const top = above ? rect.top - TIP_H - 8 : rect.bottom + 8;
    if (left + TIP_W > window.innerWidth - 8) left = window.innerWidth - TIP_W - 8;
    if (left < 8) left = 8;
    setTipPos({ top, left });
    setShowTip(true);
  };

  return (
    <Link
      href={`/augments/${aug.slug}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      <div
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTip(false)}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          width: 64,
          cursor: "pointer",
        }}
      >
        {/* Icon box with TFT bevel */}
        <div
          style={{
            width: 52,
            height: 52,
            position: "relative",
            background: "#000",
            flexShrink: 0,
            transition: "transform 0.12s",
            transform: showTip ? "scale(1.1)" : "scale(1)",
            boxShadow: tftBevel(tierColor, showTip),
          }}
        >
          {!loaded && !imgErr && aug.image && (
            <div className="aug-skeleton" style={{ position: "absolute", inset: 0 }} />
          )}

          {aug.image && !imgErr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={handleImgRef}
              src={aug.image}
              alt={aug.name}
              loading="lazy"
              decoding="async"
              width={52}
              height={52}
              onLoad={() => setLoaded(true)}
              onError={() => {
                setImgErr(true);
                setLoaded(true);
              }}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                imageRendering: "pixelated",
                opacity: loaded ? 1 : 0,
                transition: "opacity 0.18s ease",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                color: TFT.textMute,
              }}
            >
              ?
            </div>
          )}
        </div>

        {/* Name */}
        <span
          style={{
            fontSize: 9,
            color: TFT.textDim,
            textAlign: "center",
            width: "100%",
            lineHeight: 1.3,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            fontWeight: 600,
            letterSpacing: "0.02em",
          }}
        >
          {aug.name}
        </span>

        {/* Tooltip */}
        {showTip && (
          <div
            style={{
              position: "fixed",
              top: tipPos.top,
              left: tipPos.left,
              width: 260,
              zIndex: 9999,
              background: `linear-gradient(180deg, ${TFT.panelAlt} 0%, ${TFT.panelSoft} 100%)`,
              border: `1px solid ${TFT.goldDim}`,
              padding: "12px 14px",
              boxShadow: "0 18px 40px rgba(0,0,0,0.85)",
              pointerEvents: "none",
              fontFamily: TFT_FONT.body,
              color: TFT.text,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  background: "#000",
                  position: "relative",
                  boxShadow: tftBevel(tierColor, false),
                }}
              >
                {aug.image && !imgErr && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={aug.image}
                    alt={aug.name}
                    decoding="async"
                    width={36}
                    height={36}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div
                  className="tft-heading"
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: TFT.goldBright,
                    lineHeight: 1.3,
                  }}
                >
                  {aug.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                  }}
                >
                  {aug.rank && <TierBadge tier={aug.rank} size={18} />}
                  {tierMeta && (
                    <span
                      style={{
                        fontSize: 9,
                        color: tierMeta.color,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {tierMeta.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {aug.description && (
              <p
                style={{
                  fontSize: 11,
                  color: TFT.textDim,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {aug.description
                  .replace(/TFT_Augment_Template_Blank/g, "")
                  .replace(/tft10_headliner_default/g, "")
                  .replace(/ĐTCL Vegas Open, 2023/g, "")
                  .trim()}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
