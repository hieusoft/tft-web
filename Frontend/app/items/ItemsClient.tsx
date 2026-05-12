// v11 — TFT in-game theme refactor (slate + bronze + Cinzel headings)
"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import type { ApiItem } from "@/lib/api-client";
import type { ItemComponent } from "@/lib/types/item";
import ReactDOM from "react-dom";
import Link from "next/link";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT, tftBevel, tftTooltipStyle } from "@/lib/tft-theme";
import ItemIcon from "@/components/tft/ItemIcon";
import TierBadge from "@/components/tft/TierBadge";
import CategoryTag from "@/components/tft/CategoryTag";

// ── Constants ─────────────────────────────────────────────────────────────────
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };
const TIP_W = 340;
const MOBILE_BP = 640;
const TABLET_BP = 860;

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseStatLabel(key: string): string {
  return key
    .replace(/^scale/i, "")
    .replace(/:\s*[+-]?\d+%?$/, "")
    .replace(/Bonus/i, "")
    .replace(/manaregen/i, "Hồi Mana")
    .replace(/CritChance/i, "Tỉ Lệ Chí Mạng")
    .replace(/Armor/i, "Giáp")
    .replace(/AD\b/, "Sát Thương")
    .replace(/AP\b/, "Sức Mạnh Phép")
    .replace(/AS\b/, "Tốc Đánh")
    .replace(/HP\b/, "Máu")
    .replace(/MR\b/, "Kháng Phép")
    .trim();
}

function isComponentObj(v: unknown): v is ItemComponent {
  return typeof v === "object" && v !== null && "image" in v && "name" in v;
}

const f = (v: string | null | undefined) => v ?? "—";
const fPlace = (v: number | string | null | undefined): string =>
  v == null ? "—" : Number(v).toFixed(2);
const placeColor = (v: number | null | undefined): string =>
  v == null ? TFT.textMute : v <= 3.5 ? TFT.good : v <= 4.2 ? TFT.gold : TFT.bad;

function useWidth(): number {
  const [width, setWidth] = useState(1280);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return width;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Tooltip portal — TFT in-game style
   ───────────────────────────────────────────────────────────────────────────── */
function ItemTooltip({ item, anchorEl }: { item: ApiItem; anchorEl: HTMLDivElement }) {
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
  const tc = TIER_HEX[rank] ?? TFT.gold;
  const imgSrc = item.icon_path ?? item.image ?? null;

  // Stats
  const statEntries: { label: string; value: string }[] = [];
  if (item.stats) {
    if (Array.isArray(item.stats)) {
      (item.stats as { key: string; label: string; value: string }[]).forEach((s) => {
        statEntries.push({ label: parseStatLabel(s.label ?? s.key), value: s.value });
      });
    } else {
      Object.entries(item.stats as Record<string, string>).forEach(([k, v]) => {
        statEntries.push({ label: parseStatLabel(k), value: String(v) });
      });
    }
  }

  // Description cleanup
  let desc = item.description ? String(item.description).replace(/\[.*?\]/g, "") : null;
  let isUncraftable = false;
  if (desc) {
    const escapedName = item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    desc = desc.replace(new RegExp("^" + escapedName, "i"), "").trim();
    desc = desc.replace(/^\+?\s*\d+%?\s*/, "").trim();
    const uncraftableRegex = /không thể ghép\.?/i;
    if (uncraftableRegex.test(desc)) {
      isUncraftable = true;
      desc = desc.replace(uncraftableRegex, "").trim();
    }
    desc = desc.replace(/^[^a-zA-ZÀ-ỹ0-9]*/, "").replace(/\s+/g, " ").trim();
  }

  const comp1 = isComponentObj(item.component_1) ? item.component_1 : null;
  const comp2 = isComponentObj(item.component_2) ? item.component_2 : null;
  const hasRecipe = comp1 !== null || comp2 !== null;

  const node = (
    <div
      ref={tipRef}
      style={{
        ...tftTooltipStyle,
        position: "fixed",
        top: pos ? pos.top : 0,
        left: pos ? pos.left : 0,
        width: TIP_W,
        visibility: pos ? "visible" : "hidden",
        zIndex: 9999,
        padding: 16,
        pointerEvents: "none",
        fontFamily: TFT_FONT.body,
        color: TFT.text,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <ItemIcon src={imgSrc} alt={item.name} size={48} borderColor={tc} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="tft-heading"
            style={{ fontSize: 16, fontWeight: 700, color: TFT.goldBright, lineHeight: 1.2 }}
          >
            {item.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <TierBadge tier={rank} size={20} />
            {item.category && <CategoryTag category={item.category} size="sm" />}
          </div>
        </div>
      </div>

      {/* Stats inline (+10 Sát Thương) */}
      {statEntries.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 16px",
            marginBottom: 10,
            paddingBottom: 10,
            borderBottom: `1px solid ${TFT.line}`,
          }}
        >
          {statEntries.map(({ label, value }, i) => (
            <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span
                className="tft-heading"
                style={{ fontSize: 13, fontWeight: 800, color: TFT.gold, fontVariantNumeric: "tabular-nums" }}
              >
                {value.startsWith("+") || value.startsWith("-") ? value : `+${value}`}
              </span>
              <span style={{ fontSize: 11, color: TFT.textDim }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recipe */}
      {hasRecipe && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
            padding: "8px 10px",
            background: "rgba(0,0,0,0.3)",
            border: `1px solid ${TFT.line}`,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: TFT.gold,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 700,
              marginRight: 2,
            }}
          >
            Ghép
          </span>
          {comp1 && <RecipeMini name={comp1.name} image={comp1.image} />}
          {comp1 && comp2 && (
            <span style={{ fontSize: 14, color: TFT.goldDim, fontWeight: 700 }}>+</span>
          )}
          {comp2 && <RecipeMini name={comp2.name} image={comp2.image} />}
        </div>
      )}
      {!hasRecipe && isUncraftable && (
        <div
          style={{
            fontSize: 11,
            color: TFT.bad,
            fontStyle: "italic",
            marginBottom: 10,
            paddingBottom: 10,
            borderBottom: desc ? `1px solid ${TFT.line}` : "none",
          }}
        >
          Không thể ghép từ đồ cơ bản
        </div>
      )}

      {/* Description */}
      {desc && (
        <div style={{ fontSize: 12, color: TFT.text, lineHeight: 1.55, marginBottom: 10 }}>
          {desc
            .replace(/\.\s+/g, ".\n")
            .split("\n")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .map((sentence, i) => {
              const finalSentence = /[.!?…"']$/.test(sentence) ? sentence : sentence + ".";
              const html = finalSentence
                .replace(
                  /^([^:]{2,30}):/g,
                  `<span style="color:${TFT.blueBright};font-weight:700;">$1:</span>`
                )
                .replace(/(\d+(?:\.\d+)?%)/g, `<span style="color:${TFT.gold};font-weight:700;">$1</span>`)
                .replace(/(\d+\s*giây)/gi, `<span style="color:${TFT.gold};font-weight:700;">$1</span>`);
              return <span key={i} style={{ display: "block", marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: html }} />;
            })}
        </div>
      )}

      {/* Bottom stats */}
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 4 }}>
        {[
          { label: "Hạng TB", value: fPlace(item.avg_placement), color: placeColor(item.avg_placement) },
          { label: "Tỷ Lệ Thắng", value: f(item.win_rate), color: TFT.text },
          { label: "Tần Suất", value: f(item.pick_rate ?? item.frequency ?? item.top_4_rate), color: TFT.blueBright },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: "center", flex: 1 }}>
            <div
              className="tft-heading"
              style={{ fontSize: 14, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}
            >
              {value}
            </div>
            <div
              style={{
                fontSize: 9,
                color: TFT.textMute,
                marginTop: 2,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return ReactDOM.createPortal(node, document.body);
}

function RecipeMini({ name, image }: { name: string; image: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <ItemIcon src={image} alt={name} size={22} borderColor={TFT.goldDim} glow={false} />
      <span style={{ fontSize: 10, color: TFT.textDim, fontWeight: 600 }}>{name}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────────────────────────── */
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
    <div className="tft-page" style={{ fontFamily: TFT_FONT.body }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "20px 12px" : "28px 18px" }}>
        {/* Header */}
        <div style={{ marginBottom: isMobile ? 16 : 22 }}>
          <h1
            className="tft-heading"
            style={{
              fontSize: isMobile ? 22 : 30,
              fontWeight: 700,
              color: TFT.goldBright,
              margin: "0 0 6px",
              textShadow: "0 2px 6px rgba(0,0,0,0.6)",
              letterSpacing: "0.04em",
            }}
          >
            Bảng Phân Hạng Trang Bị
          </h1>
          {!isMobile && (
            <p style={{ fontSize: 12, color: TFT.textMute, margin: 0, letterSpacing: "0.04em" }}>
              Trang bị TFT tốt nhất xếp hạng theo vị trí trung bình và tỷ lệ thắng. Cập nhật liên tục.
            </p>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "stretch" : "center",
            gap: isMobile ? 10 : 10,
            marginBottom: 18,
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
                    flex: isMobile ? 1 : "none",
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

          {/* Category filter */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: TFT.textMute, whiteSpace: "nowrap", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>
              Loại
            </span>
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  suppressHydrationWarning
                  onClick={() => setCategoryFilter(cat)}
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
                  }}
                >
                  {cat === "All" ? "Tất Cả" : cat}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginLeft: isMobile ? 0 : "auto" }}>
            <input
              type="text"
              value={search}
              suppressHydrationWarning
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm trang bị..."
              style={{
                height: 32,
                width: isMobile ? "100%" : 240,
                background: TFT.panel,
                border: `1px solid ${TFT.line}`,
                paddingLeft: 34,
                paddingRight: 12,
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
                left: 10,
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

          {!isMobile && (
            <span style={{ fontSize: 11, color: TFT.textMute, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
              {filtered.length} trang bị
            </span>
          )}
        </div>

        {/* Desktop / Tablet Table */}
        {!isMobile && (
          <div style={{ background: TFT.panel, border: `1px solid ${TFT.line}` }}>
            <div
              className="tft-heading"
              style={{
                display: "grid",
                gridTemplateColumns: isTablet
                  ? "2fr 60px 110px 110px 110px"
                  : "2fr 60px 110px 110px 110px",
                padding: "10px 16px",
                background: `linear-gradient(180deg, #1a2129 0%, ${TFT.panel} 100%)`,
                borderBottom: `1px solid ${TFT.goldDim}`,
              }}
            >
              {[
                { label: "Trang Bị", align: "left" as const },
                { label: "Bậc", align: "center" as const },
                { label: "Hạng TB", align: "center" as const },
                { label: "Tỷ Lệ Thắng", align: "center" as const },
                { label: "Tần Suất", align: "center" as const },
              ].map(({ label, align }) => (
                <div
                  key={label}
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: TFT.gold,
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    textAlign: align,
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0", color: TFT.textMute, fontSize: 14 }}>
                Không tìm thấy trang bị nào
              </div>
            ) : (
              filtered.map((item, idx) => <DesktopRow key={item.id} item={item} idx={idx} isTablet={isTablet} />)
            )}
          </div>
        )}

        {/* Mobile Cards */}
        {isMobile && (
          <div style={{ background: TFT.panel, border: `1px solid ${TFT.line}` }}>
            <div
              style={{
                padding: "8px 14px",
                background: `linear-gradient(180deg, #1a2129 0%, ${TFT.panel} 100%)`,
                borderBottom: `1px solid ${TFT.goldDim}`,
                fontSize: 10,
                fontWeight: 700,
                color: TFT.gold,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              {filtered.length} trang bị
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: TFT.textMute, fontSize: 14 }}>
                Không tìm thấy trang bị nào
              </div>
            ) : (
              filtered.map((item, idx) => <MobileCard key={item.id} item={item} idx={idx} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Desktop Row
   ───────────────────────────────────────────────────────────────────────────── */
function DesktopRow({ item, idx, isTablet }: { item: ApiItem; idx: number; isTablet: boolean }) {
  const [hoveredEl, setHoveredEl] = useState<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const rank = item.rank ?? "D";
  const tc = TIER_HEX[rank] ?? TFT.gold;
  const imgSrc = item.icon_path ?? null;
  const hovered = hoveredEl !== null;

  const cols = isTablet ? "2fr 60px 110px 110px 110px" : "2fr 60px 110px 110px 110px";
  const rowBg = idx % 2 === 0 ? TFT.panel : TFT.panelSoft;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cols,
        padding: "10px 16px",
        alignItems: "center",
        background: rowBg,
        borderBottom: `1px solid ${TFT.lineSoft}`,
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = TFT.panelAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = rowBg)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Link href={`/items/${item.slug || item.id}`} style={{ display: "block" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              ref={iconRef}
              onMouseEnter={() => setHoveredEl(iconRef.current)}
              onMouseLeave={() => setHoveredEl(null)}
              style={{
                width: 42,
                height: 42,
                position: "relative",
                background: "#000",
                cursor: "pointer",
                transition: "transform 0.12s",
                transform: hovered ? "scale(1.08)" : "scale(1)",
                boxShadow: tftBevel(hovered ? tc : TFT.goldDim, hovered),
              }}
            >
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={item.name}
                  fill
                  sizes="42px"
                  style={{ objectFit: "cover", imageRendering: "pixelated" }}
                  unoptimized
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: TFT.textMute,
                  }}
                >
                  ?
                </div>
              )}
            </div>
            {hovered && hoveredEl && <ItemTooltip item={item} anchorEl={hoveredEl} />}
          </div>
        </Link>

        <div style={{ minWidth: 0 }}>
          <div
            className="tft-heading"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: TFT.goldBright,
              lineHeight: 1.3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {item.name}
          </div>
          {item.category && (
            <div style={{ marginTop: 3 }}>
              <CategoryTag category={item.category} size="sm" />
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <TierBadge tier={rank} size={26} />
      </div>

      <div
        className="tft-heading"
        style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: placeColor(item.avg_placement), fontVariantNumeric: "tabular-nums" }}
      >
        {fPlace(item.avg_placement)}
      </div>
      <div
        className="tft-heading"
        style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: TFT.text, fontVariantNumeric: "tabular-nums" }}
      >
        {f(item.win_rate)}
      </div>
      <div
        className="tft-heading"
        style={{ textAlign: "center", fontSize: 13, color: TFT.blueBright, fontVariantNumeric: "tabular-nums" }}
      >
        {f(item.pick_rate ?? item.frequency)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Mobile Card
   ───────────────────────────────────────────────────────────────────────────── */
function MobileCard({ item, idx }: { item: ApiItem; idx: number }) {
  const rank = item.rank ?? "D";
  const imgSrc = item.icon_path ?? null;
  const rowBg = idx % 2 === 0 ? TFT.panel : TFT.panelSoft;

  return (
    <Link href={`/items/${item.slug || item.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 14px",
          background: rowBg,
          borderBottom: `1px solid ${TFT.lineSoft}`,
        }}
      >
        <ItemIcon src={imgSrc} alt={item.name} size={46} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <TierBadge tier={rank} size={22} />
            <span
              className="tft-heading"
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: TFT.goldBright,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </span>
          </div>
          {item.category && <div style={{ marginBottom: 6 }}><CategoryTag category={item.category} size="sm" /></div>}
          <div style={{ display: "flex", gap: 18 }}>
            <MiniStat label="Hạng TB" value={fPlace(item.avg_placement)} color={placeColor(item.avg_placement)} />
            <MiniStat label="Tỷ Lệ Thắng" value={f(item.win_rate)} color={TFT.text} />
            <MiniStat label="Tần Suất" value={f(item.pick_rate ?? item.frequency)} color={TFT.blueBright} />
          </div>
        </div>
      </div>
    </Link>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
      <span
        className="tft-heading"
        style={{ fontSize: 13, fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 9,
          color: TFT.textMute,
          marginTop: 1,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
        }}
      >
        {label}
      </span>
    </div>
  );
}
