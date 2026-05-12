"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT } from "@/lib/tft-theme";
import ChampionFrame, { COST_COLOR } from "@/components/tft/ChampionFrame";
import TierBadge from "@/components/tft/TierBadge";

export interface ApiChampionOverview {
  id: number;
  name: string;
  slug: string;
  cost: number;
  rank: string;
  icon_path: string;
  splash_path?: string;
  avg_placement: number;
  win_rate: string;
  pick_rate: string;
  games_played: string | number;
  traits?: { name: string; slug: string }[];
}

type SortKey = "rank" | "cost" | "avg_placement" | "win_rate" | "pick_rate";
type SortDirection = "asc" | "desc";
const RANK_ORDER: Record<string, number> = { S: 4, A: 3, B: 2, C: 1, D: 0 };
const SORT_LABELS: Record<SortKey, string> = {
  rank: "Hạng",
  cost: "Giá",
  avg_placement: "Hạng TB",
  win_rate: "Tỷ Lệ Thắng",
  pick_rate: "Tỷ Lệ Chọn",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */
function parseNumeric(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  const parsed = parseFloat(String(value).replace(/[^0-9.\-]+/g, ""));
  return isNaN(parsed) ? null : parsed;
}
const fPlace = (v: number | string | null | undefined) => {
  const n = parseNumeric(v);
  return n != null ? n.toFixed(2) : "—";
};
const fPercent = (v: number | string | null | undefined) => {
  const n = parseNumeric(v);
  return n != null ? `${n.toFixed(1)}%` : "—";
};

/* ─────────────────────────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────────────────────────── */
export default function ChampionsClient({
  champions,
  traitImages = {},
}: {
  champions: ApiChampionOverview[];
  traitImages?: Record<string, string>;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDirection } | null>(null);
  const [costFilter, setCostFilter] = useState<"All" | 1 | 2 | 3 | 4 | 5>("All");

  const filtered = useMemo(() => {
    let list = [...champions];
    if (searchTerm.trim())
      list = list.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (costFilter !== "All") list = list.filter((c) => c.cost === costFilter);

    if (sort) {
      list.sort((a, b) => {
        let av: any = a[sort.key as keyof ApiChampionOverview];
        let bv: any = b[sort.key as keyof ApiChampionOverview];
        if (sort.key === "rank") {
          av = RANK_ORDER[a.rank] ?? -1;
          bv = RANK_ORDER[b.rank] ?? -1;
        } else {
          av = parseNumeric(av) ?? -Infinity;
          bv = parseNumeric(bv) ?? -Infinity;
        }
        if (av < bv) return sort.dir === "asc" ? -1 : 1;
        if (av > bv) return sort.dir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [champions, searchTerm, sort, costFilter]);

  const requestSort = (key: SortKey) => {
    if (sort?.key === key) {
      setSort({ key, dir: sort.dir === "desc" ? "asc" : "desc" });
    } else {
      setSort({ key, dir: "desc" });
    }
  };

  return (
    <div className="tft-page" style={{ fontFamily: TFT_FONT.body, padding: "28px 18px 80px" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* SEO h1 */}
        <h1 className="sr-only" style={{ display: "none" }}>Danh Sách Tướng TFT</h1>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <h2
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
            Danh Sách Tướng
          </h2>
          <p style={{ fontSize: 12, color: TFT.textMute, margin: 0, letterSpacing: "0.04em" }}>
            Toàn bộ tướng meta hiện tại — phân loại theo giá vàng và tier.
          </p>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 22,
            flexWrap: "wrap",
          }}
        >
          {/* Cost filter */}
          <div
            style={{
              display: "flex",
              gap: 3,
              background: TFT.panel,
              border: `1px solid ${TFT.line}`,
              padding: 3,
            }}
          >
            {(["All", 1, 2, 3, 4, 5] as const).map((cv) => {
              const active = costFilter === cv;
              const color = cv === "All" ? TFT.gold : COST_COLOR[cv];
              return (
                <button
                  key={String(cv)}
                  suppressHydrationWarning
                  onClick={() => setCostFilter(cv)}
                  className="tft-heading"
                  style={{
                    height: 28,
                    minWidth: cv === "All" ? 56 : 36,
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
                  {cv === "All" ? "Tất Cả" : `${cv}🪙`}
                </button>
              );
            })}
          </div>

          {/* Sort buttons */}
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => {
              const active = sort?.key === k;
              return (
                <button
                  key={k}
                  suppressHydrationWarning
                  onClick={() => requestSort(k)}
                  style={{
                    height: 28,
                    padding: "0 11px",
                    fontSize: 11,
                    fontWeight: active ? 800 : 600,
                    border: active ? `1px solid ${TFT.gold}` : `1px solid ${TFT.line}`,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: active ? `${TFT.gold}22` : TFT.panel,
                    color: active ? TFT.gold : TFT.textDim,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.04em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  {SORT_LABELS[k]}
                  {active && (
                    <span style={{ fontSize: 9 }}>
                      {sort!.dir === "desc" ? "▼" : "▲"}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginLeft: "auto" }}>
            <input
              type="text"
              value={searchTerm}
              suppressHydrationWarning
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm tướng..."
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            {filtered.length} tướng
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: TFT.textMute, fontSize: 13 }}>
            Không tìm thấy tướng nào
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "20px 14px",
              paddingTop: 18, // room for top ornament
            }}
          >
            {filtered.map((c) => (
              <Link
                key={c.id}
                href={`/champions/${c.slug}`}
                style={{ textDecoration: "none", color: "inherit", display: "block" }}
              >
                <ChampionFrame
                  cost={c.cost}
                  name={c.name}
                  image={c.splash_path || c.icon_path}
                  aspectRatio="4 / 3"
                  imagePosition="center 30%"
                >
                  {/* Tier badge top-left (overlay inside the frame) */}
                  {c.rank && (
                    <div style={{ position: "absolute", top: 6, left: 6, zIndex: 2 }}>
                      <span
                        className="tft-heading"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: 22,
                          height: 22,
                          padding: "0 6px",
                          fontSize: 11,
                          fontWeight: 900,
                          background: TIER_HEX[c.rank] ?? "#9ca3af",
                          color: "#000",
                          letterSpacing: "0.03em",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.55)",
                        }}
                      >
                        {c.rank}
                      </span>
                    </div>
                  )}

                  {/* Traits bottom-left (above name bar) */}
                  {c.traits && c.traits.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 6,
                        bottom: 6,
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        zIndex: 2,
                      }}
                    >
                      {c.traits.slice(0, 2).map((t, i) => {
                        const tImg = traitImages[t.slug];
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            {tImg && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={tImg}
                                alt=""
                                style={{
                                  width: 14,
                                  height: 14,
                                  objectFit: "contain",
                                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,1))",
                                }}
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            )}
                            <span
                              style={{
                                color: "#fff",
                                fontSize: 9,
                                fontWeight: 700,
                                textShadow: "0 1px 3px rgba(0,0,0,0.95)",
                                letterSpacing: "0.02em",
                              }}
                            >
                              {t.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Stats stacked bottom-right (above name bar) */}
                  <div
                    style={{
                      position: "absolute",
                      right: 6,
                      bottom: 6,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      alignItems: "flex-end",
                      zIndex: 2,
                    }}
                  >
                    <ChampStat label="TB" value={fPlace(c.avg_placement)} color="#fff" />
                    <ChampStat label="Win" value={fPercent(c.win_rate)} color={TFT.gold} />
                    <ChampStat label="Pick" value={fPercent(c.pick_rate)} color={TFT.blueBright} />
                  </div>
                </ChampionFrame>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChampStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 4,
        padding: "1px 6px",
        background: "rgba(0,0,0,0.65)",
        border: `1px solid rgba(255,255,255,0.06)`,
        backdropFilter: "blur(2px)",
        textShadow: "0 1px 2px rgba(0,0,0,0.9)",
      }}
    >
      <span
        style={{
          fontSize: 8,
          fontWeight: 700,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        className="tft-heading"
        style={{ fontSize: 11, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
    </div>
  );
}

// Re-export so existing imports don't break
export { TierBadge };
