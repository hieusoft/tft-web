// v10 - Enhanced tooltip with recipe & color-coded stats
"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import type { ApiItem } from "@/lib/api-client";
import type { ItemComponent } from "@/lib/types/item";
import ReactDOM from "react-dom";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  S: "rgb(255,107,107)",
  A: "rgb(255,168,76)",
  B: "rgb(255,220,80)",
  C: "rgb(140,220,120)",
  D: "rgb(140,140,140)",
};
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
const TIP_W = 300;
const MOBILE_BP = 640;
const TABLET_BP = 860;

// ── Stat color mapping ────────────────────────────────────────────────────────

const STAT_COLORS: Record<string, string> = {
  AD: "#ff6b6b",
  AP: "#a855f7",
  AS: "#facc15",
  HP: "#4ade80",
  Armor: "#f97316",
  MR: "#60a5fa",
  Mana: "#3b82f6",
  Crit: "#ef4444",
  DA: "#ff6b6b",
  scaleDA: "#ff6b6b",
  default: "#d1d5db",
};

const STAT_ICONS: Record<string, string> = {
  AD: "⚔️",
  AP: "🔮",
  AS: "⚡",
  HP: "❤️",
  Armor: "🛡️",
  MR: "✨",
  Mana: "💧",
  Crit: "💥",
  DA: "⚔️",
  scaleDA: "⚔️",
};

function parseStatKey(key: string): { label: string; color: string; icon: string } {
  // Remove "scale" prefix
  const cleaned = key.replace(/^scale/i, "");
  // Extract stat type from beginning (e.g., "AD Bonus: +15%" -> "AD")
  const match = cleaned.match(/^([A-Za-z]+)/);
  const statType = match?.[1] ?? "";
  // Clean label: remove the value part after colon if present
  const label = key
    .replace(/^scale/i, "")
    .replace(/:\s*[+-]?\d+%?$/, "")
    .trim();

  return {
    label,
    color: STAT_COLORS[statType] ?? STAT_COLORS.default,
    icon: STAT_ICONS[statType] ?? "📊",
  };
}

function isComponentObj(v: unknown): v is ItemComponent {
  return typeof v === "object" && v !== null && "image" in v && "name" in v;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const f = (v: string | null | undefined) => v ?? "—";
const fGames = (v: number | string | undefined): string => {
  if (!v) return "—";
  const n = typeof v === "string" ? parseInt(v, 10) : v;
  return isNaN(n) || n === 0 ? "—" : n.toLocaleString("vi-VN");
};
const fPlace = (v: number | null | undefined): string => v == null ? "—" : v.toFixed(2);
const placeColor = (v: number | null | undefined): string =>
  v == null ? "#6b7280" : v <= 3.5 ? "#4ade80" : v <= 4.2 ? "#facc15" : "#f87171";

// ── Hook: window width ────────────────────────────────────────────────────────

function useWidth(): number {
  const [width, setWidth] = useState(1280); // SSR-safe default
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

// ── Portal Tooltip ────────────────────────────────────────────────────────────

function ItemTooltip({ item, anchorEl, imgErr }: {
  item: ApiItem; anchorEl: HTMLDivElement; imgErr: boolean;
}) {
  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const tip = tipRef.current;
    if (!tip) return;
    const r = anchorEl.getBoundingClientRect();
    const h = tip.offsetHeight;
    const above = r.top - h - 10 >= 8;
    let top = above ? r.top - h - 10 : r.bottom + 10;
    let left = r.left + r.width / 2 - TIP_W / 2;
    if (left + TIP_W > window.innerWidth - 8) left = window.innerWidth - TIP_W - 8;
    if (left < 8) left = 8;
    setPos({ top, left });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rank = item.rank ?? "D";
  const tc = TIER_COLOR[rank] ?? "#9ca3af";
  const imgSrc = item.icon_path ?? item.image ?? null;

  // Parse stats
  const statEntries: { label: string; value: string; color: string }[] = [];
  if (item.stats) {
    if (Array.isArray(item.stats)) {
      (item.stats as { key: string; label: string; value: string }[]).forEach(s => {
        const parsed = parseStatKey(s.label ?? s.key);
        statEntries.push({ label: parsed.label, value: s.value, color: parsed.color });
      });
    } else {
      Object.entries(item.stats as Record<string, string>).forEach(([k, v]) => {
        const parsed = parseStatKey(k);
        statEntries.push({ label: parsed.label, value: String(v), color: parsed.color });
      });
    }
  }

  // Clean description
  const desc = item.description
    ? String(item.description)
        .replace(/\[.*?\]/g, "")
        .replace(/^[^a-zA-ZÀ-ỹ]*/, "")
        .replace(/\s+/g, " ")
        .trim()
    : null;

  // Components
  const comp1 = isComponentObj(item.component_1) ? item.component_1 : null;
  const comp2 = isComponentObj(item.component_2) ? item.component_2 : null;
  const hasRecipe = comp1 !== null || comp2 !== null;

  const node = (
    <div ref={tipRef} style={{
      position: "fixed",
      top: pos ? pos.top : 0,
      left: pos ? pos.left : 0,
      width: TIP_W,
      visibility: pos ? "visible" : "hidden",
      zIndex: 9999,
      background: "#1a1c20",
      border: "1px solid #2a2d35",
      borderRadius: 10,
      padding: "14px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.8)",
      pointerEvents: "none",
    }}>
      {/* ── Header: icon + name + rank + category ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 8, overflow: "hidden", flexShrink: 0,
          background: "#111", position: "relative",
          border: `1px solid ${tc}55`,
        }}>
          {imgSrc && !imgErr ? (
            <Image src={imgSrc} alt={item.name} fill sizes="44px" style={{ objectFit: "contain", padding: 2 }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#6b7280" }}>⚔</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f3f4f6", lineHeight: 1.2 }}>{item.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, borderRadius: 4, fontSize: 10, fontWeight: 800,
              background: tc, color: "#000",
            }}>{rank}</span>
            {item.category && <span style={{ fontSize: 10, color: "#6b7280" }}>{item.category}</span>}
          </div>
        </div>
      </div>

      {/* ── Stats inline ── */}
      {statEntries.length > 0 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #242730" }}>
          {statEntries.map(({ label, value, color }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
              <span style={{ fontSize: 9, color: "#555" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Description ── */}
      {desc && (
        <div style={{ fontSize: 11, color: "#8b8f99", lineHeight: 1.55, marginBottom: 10 }}>
          {desc}
        </div>
      )}

      {/* ── Recipe ── */}
      {hasRecipe && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          marginBottom: 10, padding: "8px 0",
          borderTop: "1px solid #242730",
        }}>
          <span style={{ fontSize: 9, color: "#555", marginRight: 2 }}>Ghép:</span>
          {comp1 && <RecipePiece name={comp1.name} image={comp1.image} />}
          {comp1 && comp2 && <span style={{ fontSize: 12, color: "#3a3d45", fontWeight: 600 }}>+</span>}
          {comp2 && <RecipePiece name={comp2.name} image={comp2.image} />}
        </div>
      )}

      {/* ── Bottom stats ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        paddingTop: 8, borderTop: "1px solid #242730",
      }}>
        {[
          { label: "Hạng TB", value: fPlace(item.avg_placement), color: placeColor(item.avg_placement) },
          { label: "Tỷ Lệ Thắng", value: f(item.win_rate), color: "#d1d5db" },
          { label: "Tần Suất", value: f(item.pick_rate ?? item.top_4_rate), color: "#9ca3af" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 8, color: "#4b5563", marginTop: 1, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
}

// ── Recipe Piece ──────────────────────────────────────────────────────────────

function RecipePiece({ name, image }: { name: string; image: string }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 4, overflow: "hidden",
        background: "#111", position: "relative", flexShrink: 0,
        border: "1px solid #333",
      }}>
        {!err ? (
          <Image src={image} alt={name} fill sizes="24px" style={{ objectFit: "contain", padding: 1 }} onError={() => setErr(true)} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#6b7280" }}>?</div>
        )}
      </div>
      <span style={{ fontSize: 10, color: "#8b8f99" }}>{name}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ItemsClient({ items }: { items: ApiItem[] }) {
  const width = useWidth();
  const isMobile = width < MOBILE_BP;
  const isTablet = width >= MOBILE_BP && width < TABLET_BP;

  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<"All" | "S" | "A" | "B" | "C" | "D">("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set(items.map((i) => i.category ?? "Khác"));
    return ["All", ...Array.from(cats).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    let list = [...items];
    if (rankFilter !== "All") list = list.filter((i) => i.rank === rankFilter);
    if (categoryFilter !== "All") list = list.filter((i) => i.category === categoryFilter);
    if (search.trim()) list = list.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const ta = TIER_ORDER[a.rank ?? "D"] ?? 9;
      const tb = TIER_ORDER[b.rank ?? "D"] ?? 9;
      if (ta !== tb) return ta - tb;
      return (a.avg_placement ?? 99) - (b.avg_placement ?? 99);
    });
    return list;
  }, [items, rankFilter, categoryFilter, search]);

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "16px 12px" : "20px 16px" }}>

        {/* Header */}
        <div style={{ marginBottom: isMobile ? 14 : 20 }}>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#f3f4f6", margin: "0 0 4px" }}>
            Bảng Phân Hạng Trang Bị TFT
          </h1>
          {!isMobile && (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              Trang bị TFT tốt nhất xếp hạng theo vị trí trung bình và tỷ lệ thắng. Cập nhật liên tục.
            </p>
          )}
        </div>

        {/* Controls */}
        <div style={{
          display: "flex", flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: isMobile ? 10 : 8, marginBottom: 16, flexWrap: "wrap",
        }}>
          {/* Rank filter */}
          <div style={{ display: "flex", gap: 3, background: "#181818", border: "1px solid #222", borderRadius: 7, padding: 3 }}>
            {(["All", "S", "A", "B", "C", "D"] as const).map((r) => {
              const active = rankFilter === r;
              const color = r === "All" ? "#6b7280" : TIER_COLOR[r];
              return (
                <button key={r} suppressHydrationWarning onClick={() => setRankFilter(r)}
                  style={{
                    flex: isMobile ? 1 : "none",
                    height: 28, minWidth: r === "All" ? 48 : 30, padding: "0 8px",
                    borderRadius: 5, fontSize: 12, fontWeight: active ? 700 : 500,
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                    background: active ? color + "22" : "transparent",
                    color: active ? color : "#6b7280",
                    outline: active ? `1px solid ${color}44` : "none",
                  }}>
                  {r === "All" ? "Tất Cả" : r}
                </button>
              );
            })}
          </div>

          {/* Category filter */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "#4b5563", whiteSpace: "nowrap" }}>Loại:</span>
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button key={cat} suppressHydrationWarning onClick={() => setCategoryFilter(cat)}
                  style={{
                    height: 28, padding: "0 10px", borderRadius: 6,
                    fontSize: 11, fontWeight: active ? 700 : 400,
                    border: active ? "1px solid #f0b90b66" : "1px solid #2a2a2a",
                    cursor: "pointer", transition: "all 0.15s",
                    background: active ? "#f0b90b18" : "#1a1a1a",
                    color: active ? "#f0b90b" : "#6b7280",
                    whiteSpace: "nowrap",
                  }}>
                  {cat === "All" ? "Tất Cả" : cat}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginLeft: isMobile ? 0 : "auto" }}>
            <input type="text" value={search} suppressHydrationWarning
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm trang bị..."
              style={{
                height: 32, width: isMobile ? "100%" : 220, borderRadius: 6,
                background: "#1a1a1a", border: "1px solid #2a2a2a",
                paddingLeft: 34, paddingRight: 12,
                fontSize: 12, color: "#d1d5db", outline: "none",
              }}
            />
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#6b7280", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {!isMobile && <span style={{ fontSize: 11, color: "#4b5563" }}>{filtered.length} trang bị</span>}
        </div>

        {/* ── Desktop / Tablet Table ──────────────────── */}
        {!isMobile && (
          <div style={{ background: "#161616", border: "1px solid #1e1e1e", borderRadius: 10, overflow: "hidden" }}>
            {/* Header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isTablet
                ? "2fr 60px 110px 110px 110px"
                : "2fr 60px 110px 110px 110px 110px",
              padding: "10px 16px", background: "#1a1a1a", borderBottom: "1px solid #222",
            }}>
              {[
                { label: "Trang Bị", align: "left" as const },
                { label: "Bậc", align: "center" as const },
                { label: "Hạng TB", align: "center" as const },
                { label: "Tỷ Lệ Thắng", align: "center" as const },
                { label: "Tần Suất", align: "center" as const },
                ...(!isTablet ? [{ label: "Số Ván", align: "center" as const }] : []),
              ].map(({ label, align }) => (
                <div key={label} style={{
                  fontSize: 10, fontWeight: 700, color: "#4b5563",
                  textTransform: "uppercase", letterSpacing: "0.06em", textAlign: align,
                }}>{label}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: "#4b5563", fontSize: 14 }}>Không tìm thấy trang bị nào</div>
            ) : (
              filtered.map((item, idx) => (
                <DesktopRow key={item.id} item={item} idx={idx} isTablet={isTablet} />
              ))
            )}
          </div>
        )}

        {/* ── Mobile Cards ───────────────────────────── */}
        {isMobile && (
          <div style={{ background: "#161616", border: "1px solid #1e1e1e", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ padding: "8px 14px", background: "#1a1a1a", borderBottom: "1px solid #222", fontSize: 10, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {filtered.length} trang bị
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#4b5563", fontSize: 14 }}>Không tìm thấy trang bị nào</div>
            ) : (
              filtered.map((item, idx) => (
                <MobileCard key={item.id} item={item} idx={idx} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Desktop Row ───────────────────────────────────────────────────────────────

function DesktopRow({ item, idx, isTablet }: { item: ApiItem; idx: number; isTablet: boolean }) {
  const [imgErr, setImgErr] = useState(false);
  const [hoveredEl, setHoveredEl] = useState<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const rank = item.rank ?? "D";
  const tc = TIER_COLOR[rank] ?? "#9ca3af";
  const imgSrc = item.icon_path ?? null;
  const hovered = hoveredEl !== null;
  const evenBg = "#161616", oddBg = "#181818";

  const cols = isTablet
    ? "2fr 60px 110px 110px 110px"
    : "2fr 60px 110px 110px 110px 110px";

  return (
    <div
      style={{
        display: "grid", gridTemplateColumns: cols,
        padding: "9px 16px", alignItems: "center",
        background: idx % 2 === 0 ? evenBg : oddBg,
        borderBottom: "1px solid #1e1e1e", transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1f1f1f")}
      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? evenBg : oddBg)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            ref={iconRef}
            onMouseEnter={() => setHoveredEl(iconRef.current)}
            onMouseLeave={() => setHoveredEl(null)}
            style={{
              width: 42, height: 42, borderRadius: 8, overflow: "hidden",
              background: "#111", position: "relative",
              border: `1px solid ${tc}${hovered ? "80" : "30"}`,
              cursor: "pointer",
              transition: "border-color 0.15s, transform 0.12s, box-shadow 0.12s",
              transform: hovered ? "scale(1.1)" : "scale(1)",
              boxShadow: hovered ? `0 0 16px ${tc}55` : "none",
            }}
          >
            {imgSrc && !imgErr ? (
              <Image src={imgSrc} alt={item.name} fill sizes="42px"
                style={{ objectFit: "contain", padding: 2 }}
                onError={() => setImgErr(true)} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚔️</div>
            )}
          </div>
          {hovered && hoveredEl && <ItemTooltip item={item} anchorEl={hoveredEl} imgErr={imgErr} />}
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb", lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
          {item.category && <div style={{ fontSize: 10, color: "#4b5563", marginTop: 1 }}>{item.category}</div>}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 800,
          background: tc, color: "#000",
        }}>{rank}</span>
      </div>

      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: placeColor(item.avg_placement) }}>
        {fPlace(item.avg_placement)}
      </div>
      <div style={{ textAlign: "center", fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>
        {f(item.win_rate)}
      </div>
      <div style={{ textAlign: "center", fontSize: 13, color: "#9ca3af" }}>
        {f(item.top_4_rate)}
      </div>
      {!isTablet && (
        <div style={{ textAlign: "center", fontSize: 12, color: "#6b7280" }}>
          {fGames(item.games_played)}
        </div>
      )}
    </div>
  );
}

// ── Mobile Card ───────────────────────────────────────────────────────────────

function MobileCard({ item, idx }: { item: ApiItem; idx: number }) {
  const [imgErr, setImgErr] = useState(false);
  const rank = item.rank ?? "D";
  const tc = TIER_COLOR[rank] ?? "#9ca3af";
  const imgSrc = item.icon_path ?? null;

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: idx % 2 === 0 ? "#161616" : "#131313",
      borderBottom: "1px solid #1a1a1a",
    }}>
      {/* Icon */}
      <div style={{
        width: 46, height: 46, borderRadius: 9, overflow: "hidden",
        background: "#111", position: "relative", flexShrink: 0,
        border: `1px solid ${tc}50`,
      }}>
        {imgSrc && !imgErr ? (
          <Image src={imgSrc} alt={item.name} fill sizes="46px"
            style={{ objectFit: "contain", padding: 2 }}
            onError={() => setImgErr(true)} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚔️</div>
        )}
      </div>

      {/* Main info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 22, height: 22, borderRadius: 5, fontSize: 10, fontWeight: 800,
            background: tc, color: "#000", flexShrink: 0,
          }}>{rank}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.name}
          </span>
        </div>
        {item.category && <div style={{ fontSize: 10, color: "#4b5563", marginBottom: 5 }}>{item.category}</div>}
        <div style={{ display: "flex", gap: 16 }}>
          <MiniStat label="Hạng TB" value={fPlace(item.avg_placement)} color={placeColor(item.avg_placement)} />
          <MiniStat label="Tỷ Lệ Thắng" value={f(item.win_rate)} color="#d1d5db" />
          <MiniStat label="Tần Suất" value={f(item.top_4_rate)} color="#9ca3af" />
        </div>
      </div>

      {/* Games */}
      {item.games_played ? (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>{fGames(item.games_played)}</div>
          <div style={{ fontSize: 9, color: "#374151", marginTop: 2 }}>ván</div>
        </div>
      ) : null}
    </div>
  );
}




function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
      <span style={{ fontSize: 9, color: "#4b5563", marginTop: 1 }}>{label}</span>
    </div>
  );
}
