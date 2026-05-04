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
const TIP_W = 340;
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

function StatIcon({ type, color }: { type: string; color: string }) {
  const svgProps = { width: 15, height: 15, fill: color, viewBox: "0 0 24 24", style: { flexShrink: 0 } };

  switch (type) {
    case "AD":
      return <svg {...svgProps}><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-1.25 0-2.68.38-4.32 2.06L12 6.4l5.6 5.6 1.34-1.34C20.62 9.02 21 7.59 21 6.34 21 4.35 19.65 3 17.66 3M5.16 11l-2 2 4.84 4.84L3 22h3l4.16-4.16L15 22.68l2-2-11.84-11.84z" /></svg>;
    case "AP":
      return <svg {...svgProps}><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" /></svg>;
    case "AS":
      return <svg {...svgProps}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
    case "HP":
      return <svg {...svgProps}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
    case "Armor":
      return <svg {...svgProps}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>;
    case "MR":
      return <svg {...svgProps}><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.31l7 3.89v7.6l-7 3.89-7-3.89V8.2l7-3.89z" /></svg>;
    case "Mana":
      return <svg {...svgProps}><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" /></svg>;
    case "Crit":
      return <svg {...svgProps}><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" /></svg>;
    default:
      return <svg {...svgProps}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>;
  }
}

// ── Category Badge ─────────────────────────────────────────────────────────────
function CategoryBadge({ category, size = "sm" }: { category: string; size?: "sm" | "md" }) {
  let bg = "#1f2937", text = "#9ca3af", border = "#374151";

  if (category.includes("Ánh Sáng")) { 
    bg = "rgba(250, 204, 21, 0.15)"; text = "#fde047"; border = "rgba(250, 204, 21, 0.3)"; 
  } else if (category.includes("Tạo Tác")) { 
    bg = "rgba(248, 113, 113, 0.15)"; text = "#f87171"; border = "rgba(248, 113, 113, 0.3)"; 
  } else if (category.includes("Tộc/Hệ") || category.includes("Ấn")) { 
    bg = "rgba(45, 212, 191, 0.15)"; text = "#2dd4bf"; border = "rgba(45, 212, 191, 0.3)"; 
  } else if (category.includes("Hỗ Trợ")) { 
    bg = "rgba(192, 132, 252, 0.15)"; text = "#c084fc"; border = "rgba(192, 132, 252, 0.3)"; 
  } else if (category.includes("Thường")) { 
    bg = "#1f2937"; text = "#d1d5db"; border = "#374151"; 
  }

  const isMd = size === "md";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: isMd ? "3px 8px" : "2px 6px",
      borderRadius: 6,
      fontSize: isMd ? 11 : 9,
      fontWeight: 700,
      background: bg,
      color: text,
      border: `1px solid ${border}`,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: "0.05em"
    }}>
      {category}
    </span>
  );
}

function parseStatKey(key: string): { label: string; color: string; type: string } {
  // Remove "scale" prefix
  let cleanedKey = key.replace(/^scale/i, "").trim();

  let statType = "default";
  if (/AD|DA|Damage|Vật lý/i.test(cleanedKey)) statType = "AD";
  else if (/AP|Ability/i.test(cleanedKey)) statType = "AP";
  else if (/AS|Speed|Tốc/i.test(cleanedKey)) statType = "AS";
  else if (/HP|Health|Máu/i.test(cleanedKey)) statType = "HP";
  else if (/Armor|Giáp/i.test(cleanedKey)) statType = "Armor";
  else if (/MR|Resist|Kháng/i.test(cleanedKey)) statType = "MR";
  else if (/Mana|Năng lượng/i.test(cleanedKey)) statType = "Mana";
  else if (/Crit|Chí mạng/i.test(cleanedKey)) statType = "Crit";
  // Extract stat type from beginning (e.g., "AD Bonus: +15%" -> "AD")
  let label = cleanedKey
    .replace(/:\s*[+-]?\d+%?$/, "") // Xóa value ở cuối nếu bị dính
    .replace(/Bonus/i, "") // Xóa chữ Bonus vô nghĩa
    .replace(/manaregen/i, "Hồi Mana") // Sửa tên manaregen
    .replace(/Armor/i, "Giáp")
    .trim();

  return {
    label,
    color: STAT_COLORS[statType] ?? STAT_COLORS.default,
    type: statType,
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
  const statEntries: { label: string; value: string; color: string; type: string }[] = [];
  if (item.stats) {
    if (Array.isArray(item.stats)) {
      (item.stats as { key: string; label: string; value: string }[]).forEach(s => {
        const parsed = parseStatKey(s.label ?? s.key);
        statEntries.push({ label: parsed.label, value: s.value, color: parsed.color, type: parsed.type });
      });
    } else {
      Object.entries(item.stats as Record<string, string>).forEach(([k, v]) => {
        const parsed = parseStatKey(k);
        statEntries.push({ label: parsed.label, value: String(v), color: parsed.color, type: parsed.type });
      });
    }
  }

  // Clean description
  let desc = item.description ? String(item.description).replace(/\[.*?\]/g, "") : null;
  let isUncraftable = false;

  if (desc) {
    const escapedName = item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const nameRegex = new RegExp('^' + escapedName, 'i');
    desc = desc.replace(nameRegex, "").trim();
    desc = desc.replace(/^\+?\s*\d+%?\s*/, "").trim();
    const uncraftableRegex = /không thể ghép\.?/i;
    if (uncraftableRegex.test(desc)) {
      isUncraftable = true;
      desc = desc.replace(uncraftableRegex, "").trim();
    }
    desc = desc.replace(/^[^a-zA-ZÀ-ỹ0-9]*/, "").replace(/\s+/g, " ").trim();
  }

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
      background: "linear-gradient(180deg, #1e2128 0%, #111317 100%)",
      border: `1px solid ${tc}40`,
      borderRadius: 12,
      padding: "18px",
      boxShadow: `0 20px 40px rgba(0,0,0,0.8), 0 0 20px ${tc}15`,
      pointerEvents: "none",
    }}>
      {/* ── Header: icon + name + rank + category ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 10, overflow: "hidden", flexShrink: 0,
          background: "#000", position: "relative",
          border: `2px solid ${tc}80`, // Đậm hơn để nổi bật ảnh
          boxShadow: `0 4px 10px rgba(0,0,0,0.5)`
        }}>
          {imgSrc && !imgErr ? (
            <Image src={imgSrc} alt={item.name} fill sizes="54px" style={{ objectFit: "contain", padding: 2 }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#6b7280" }}>⚔</div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", lineHeight: 1.2, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>{item.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 22, height: 22, borderRadius: 4, fontSize: 12, fontWeight: 900,
              background: tc, color: "#000",
            }}>{rank}</span>
            {item.category && <CategoryBadge category={item.category} size="sm" />}
          </div>
        </div>
      </div>

      {/* ── Stats inline ── */}
      {statEntries.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #2a2d35" }}>
          {statEntries.map(({ label, value, color, type }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <StatIcon type={type} color={color} />
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
              <span style={{ fontSize: 11, color: "#8b8f99", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {hasRecipe ? (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          marginBottom: 12, padding: "8px 12px",
          background: "rgba(0, 0, 0, 0.25)",
          borderRadius: 8,
          border: "1px solid #242730",
          boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)"
        }}>
          <span style={{ fontSize: 10, color: "#facc15", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 800, marginRight: 2 }}>Ghép:</span>
          {comp1 && <RecipePiece name={comp1.name} image={comp1.image} />}
          {comp1 && comp2 && <span style={{ fontSize: 16, color: "#facc15", fontWeight: 800 }}>+</span>}
          {comp2 && <RecipePiece name={comp2.name} image={comp2.image} />}
        </div>
      ) : isUncraftable ? (
        <div style={{
          fontSize: 13, color: "#f87171", fontStyle: "italic", fontWeight: 600,
          marginBottom: 12, paddingBottom: 12,
          borderBottom: desc ? "1px solid #2a2d35" : "none",
          display: "flex", alignItems: "center", gap: 6
        }}>
          🚫 Không Thể Ghép
        </div>
      ) : null}

      {/* ── Description ── */}
      {desc && (
        <div style={{ 
          fontSize: 13, 
          color: "#d1d5db", // Đổi màu sáng hơn giúp dễ đọc
          lineHeight: 1.55, 
          marginBottom: 14,
          letterSpacing: "0.01em"
        }}>
          {desc
            .replace(/\.\s+/g, ".\n")
            .split("\n")
            .map((sentence) => sentence.trim())
            .filter((sentence) => sentence.length > 0)
            .map((sentence, i) => {
              const finalSentence = /[.!?…"']$/.test(sentence) ? sentence : sentence + ".";
              const formattedHTML = finalSentence
                .replace(/^([^:]{2,30}):/g, '<strong style="color: #60a5fa; text-transform: capitalize;">$1:</strong>')
                .replace(/(\d+(?:\.\d+)?%)/g, '<strong style="color: #fbbf24;">$1</strong>')
                .replace(/(\d+\s*giây)/gi, '<strong style="color: #fbbf24;">$1</strong>');
              return (
                <span 
                  key={i} 
                  style={{ display: "block", marginBottom: 6 }} 
                  dangerouslySetInnerHTML={{ __html: formattedHTML }} 
                />
              );
            })}
        </div>
      )}

      {/* ── Bottom stats ── */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        paddingTop: 4,
      }}>
        {[
          { label: "Hạng TB", value: fPlace(item.avg_placement), color: placeColor(item.avg_placement) },
          { label: "Tỷ Lệ Thắng", value: f(item.win_rate), color: "#f3f4f6" },
          { label: "Tần Suất", value: f(item.pick_rate ?? item.top_4_rate), color: "#9ca3af" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{label}</div>
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
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, overflow: "hidden", // Tăng size
        background: "#111", position: "relative", flexShrink: 0,
        border: "1px solid #3a3d45",
      }}>
        {!err ? (
          <Image src={image} alt={name} fill sizes="28px" style={{ objectFit: "contain", padding: 1 }} onError={() => setErr(true)} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6b7280" }}>?</div>
        )}
      </div>
      <span style={{ fontSize: 11, color: "#d1d5db", fontWeight: 500 }}>{name}</span>
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
          {item.category && <CategoryBadge category={item.category} size="sm" />}
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
