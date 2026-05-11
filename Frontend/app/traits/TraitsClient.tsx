"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef } from "react";
import type { ApiTrait } from "@/lib/api-client";
import { toSlug } from "@/lib/slug";

// ── Global CSS ────────────────────────────────────────────────────────────────
const CSS = `
  /* ── Filter bar ── */
  .tr-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }
  .tr-tiers { display: flex; flex-wrap: wrap; gap: 6px; }
  .tr-spacer { flex: 1; min-width: 8px; }
  .tr-search-wrap { position: relative; width: 200px; }
  .tr-search {
    height: 34px;
    width: 100%;
    border-radius: 8px;
    background: #1c1c1c;
    border: 1px solid #2a2a2a;
    padding: 0 32px 0 12px;
    font-size: 12px;
    color: #d1d5db;
    outline: none;
    transition: border-color 0.15s;
  }
  .tr-search:focus { border-color: #404040; }

  /* ── Desktop table ── */
  .tr-table { border-radius: 12px; overflow: hidden; border: 1px solid #222; }
  .tr-thead {
    display: grid;
    grid-template-columns: 1fr 72px 120px 110px 150px;
    background: #161616;
    border-bottom: 1px solid #222;
    padding: 10px 16px;
    gap: 8px;
  }
  .tr-row {
    display: grid;
    grid-template-columns: 1fr 72px 120px 110px 150px;
    align-items: center;
    padding: 10px 16px;
    gap: 8px;
    border-bottom: 1px solid #1a1a1a;
    text-decoration: none;
    transition: background 0.12s;
    color: inherit;
  }
  .tr-row:hover { background: #1c1c1c !important; }
  .tr-th {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: #6b7280; background: none; border: none; cursor: pointer;
    border-left: 1px solid #252525; padding-left: 10px;
  }
  .tr-th:first-child { border-left: none; padding-left: 0; }
  .tr-cell { border-left: 1px solid #1e1e1e; padding-left: 10px; }
  .tr-cell:first-child { border-left: none; padding-left: 0; }

  /* ── Mobile cards (hidden on desktop) ── */
  .tr-cards { display: none; flex-direction: column; gap: 1px; border-radius: 12px; overflow: hidden; border: 1px solid #222; }
  .tr-card {
    display: flex;
    align-items: center;
    padding: 12px 14px;
    gap: 12px;
    background: #111;
    border-bottom: 1px solid #1a1a1a;
    text-decoration: none;
    transition: background 0.12s;
  }
  .tr-card:last-child { border-bottom: none; }
  .tr-card:hover { background: #1a1a1a !important; }
  .tr-card-odd { background: #131313 !important; }
  .tr-card-info { flex: 1; min-width: 0; margin-left: 4px; }
  .tr-card-name {
    font-size: 14px; font-weight: 600; color: #e5e7eb;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .tr-card-stats {
    display: flex; gap: 10px; margin-top: 4px; flex-wrap: wrap;
  }
  .tr-card-stat { display: flex; flex-direction: column; align-items: center; }
  .tr-card-stat-label { font-size: 9px; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 1px; }
  .tr-card-stat-val { font-size: 12px; font-weight: 700; color: #d1d5db; }
  .tr-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
  .tr-card-tier {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 6px;
    font-size: 12px; font-weight: 800; color: #000;
  }
  .tr-card-place { font-size: 13px; font-weight: 700; }

  /* ── Tooltip ── */
  .tr-tooltip {
    position: absolute;
    top: 50%; left: calc(100% + 10px);
    transform: translateY(-50%);
    z-index: 9999;
    min-width: 230px; max-width: 290px;
    background: #1a1c22; border: 1px solid #2d3040;
    border-radius: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7);
    padding: 12px 14px;
    pointer-events: none;
  }

  /* ── Responsive ── */
  @media (max-width: 860px) {
    .tr-thead { grid-template-columns: 1fr 64px 100px 100px; }
    .tr-row   { grid-template-columns: 1fr 64px 100px 100px; }
    .tr-col-freq, .tr-th-freq { display: none; }
  }

  @media (max-width: 600px) {
    /* Switch to cards */
    .tr-table  { display: none; }
    .tr-cards  { display: flex; }

    /* Filter bar stacks */
    .tr-bar { flex-direction: column; align-items: stretch; gap: 10px; }
    .tr-spacer { display: none; }
    .tr-search-wrap { width: 100%; }

    /* Tooltip fixed bottom on tiny screen */
    .tr-tooltip {
      position: fixed !important;
      left: 50% !important; right: auto !important;
      top: auto !important; bottom: 20px !important;
      transform: translateX(-50%) !important;
      width: calc(100vw - 32px); max-width: 360px;
    }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePct(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function parseNum(val: string | null): number {
  if (!val) return 0;
  return parseInt(val.replace(/[.,]/g, "").trim(), 10) || 0;
}

function placementColor(v: number | null): string {
  if (v === null) return "#9ca3af";
  if (v < 4.0) return "#4ade80";
  if (v < 4.5) return "#facc15";
  return "#f87171";
}

const TIER_COLOR: Record<string, string> = {
  S: "rgb(255, 126, 131)",
  A: "rgb(255, 191, 127)",
  B: "rgb(255, 223, 128)",
  C: "rgb(254, 255, 127)",
};

type SortKey = "tier" | "placement" | "win_rate" | "frequency";
type SortDir = "asc" | "desc";
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

// ── Main Component ────────────────────────────────────────────────────────────

export default function TraitsClient({ traits }: { traits: ApiTrait[] }) {
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState<SortKey>("placement");
  const [sortDir, setSortDir]       = useState<SortDir>("asc");
  const [tierFilter, setTierFilter] = useState<"All" | "S" | "A" | "B" | "C">("All");

  const sorted = useMemo(() => {
    let list = [...traits];
    if (tierFilter !== "All") list = list.filter((t) => t.tier === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === "tier")      diff = (TIER_ORDER[a.tier ?? "C"] ?? 3) - (TIER_ORDER[b.tier ?? "C"] ?? 3);
      else if (sortKey === "placement") diff = (a.placement ?? 9) - (b.placement ?? 9);
      else if (sortKey === "win_rate")  diff = parsePct(b.top4) - parsePct(a.top4);
      else if (sortKey === "frequency") diff = parseNum(b.pick_count) - parseNum(a.pick_count);
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [traits, tierFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "placement" ? "asc" : "desc"); }
  }

  function Arrow({ k }: { k: SortKey }) {
    const active = sortKey === k;
    return (
      <span style={{ color: active ? "#facc15" : "#374151", fontSize: 9, marginLeft: 2 }}>
        {active ? (sortDir === "asc" ? "▲" : "▼") : "▼"}
      </span>
    );
  }

  const empty = (
    <div style={{ padding: "64px 0", textAlign: "center", color: "#4b5563", fontSize: 14, background: "#111" }}>
      Không tìm thấy trait nào
    </div>
  );

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>

        {/* ── Filter bar ── */}
        <div className="tr-bar">
          <div className="tr-tiers">
            {(["All", "S", "A", "B", "C"] as const).map((t) => {
              const active = tierFilter === t;
              const color  = t === "All" ? "#6b7280" : TIER_COLOR[t];
              return (
                <button
                  key={t}
                  suppressHydrationWarning
                  onClick={() => setTierFilter(t)}
                  style={{
                    height: 30,
                    padding: "0 14px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    background: active ? color : "#1c1c1c",
                    color: active ? "#000" : "#6b7280",
                    border: `1px solid ${active ? color : "#2a2a2a"}`,
                  }}
                >
                  {t === "All" ? "All" : `${t}`}
                </button>
              );
            })}
          </div>
          <div className="tr-spacer" />
          <div className="tr-search-wrap">
            <input
              value={search}
              suppressHydrationWarning
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trait..."
              className="tr-search"
            />
            <svg
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#6b7280", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* ── Desktop Table ── */}
        <div className="tr-table">
          {/* Header */}
          <div className="tr-thead">
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>
              Trait
            </div>
            <button className="tr-th" suppressHydrationWarning onClick={() => toggleSort("tier")}>
              Tier<Arrow k="tier" />
            </button>
            <button className="tr-th" suppressHydrationWarning onClick={() => toggleSort("placement")}>
              Avg Place<Arrow k="placement" />
            </button>
            <button className="tr-th" suppressHydrationWarning onClick={() => toggleSort("win_rate")}>
              Top 4<Arrow k="win_rate" />
            </button>
            <button className="tr-th tr-th-freq" style={{ justifyContent: "flex-end" }} suppressHydrationWarning onClick={() => toggleSort("frequency")}>
              Frequency<Arrow k="frequency" />
            </button>
          </div>

          {/* Rows */}
          {sorted.length === 0 ? empty : sorted.map((trait, idx) => (
            <DesktopRow key={trait.id} trait={trait} idx={idx} />
          ))}
        </div>

        {/* ── Mobile Cards ── */}
        <div className="tr-cards">
          {sorted.length === 0 ? empty : sorted.map((trait, idx) => (
            <MobileCard key={trait.id} trait={trait} idx={idx} />
          ))}
        </div>

      </div>
    </div>
  );
}

// ── Hex Icon ─────────────────────────────────────────────────────────────────

function TraitHex({ trait, size = 40 }: { trait: ApiTrait; size?: number }) {
  const hex = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";
  const [hovered, setHovered] = useState(false);
  const milestones = (trait.milestones ?? []) as Record<string, unknown>[];

  return (
    <div
      style={{ position: "relative", width: size, height: size, flexShrink: 0, zIndex: hovered ? 50 : "auto" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        position: "absolute", inset: 0,
        background: "#2a2a2a", clipPath: hex,
        transition: "filter 0.15s",
        filter: hovered ? "brightness(1.4)" : "brightness(1)",
      }} />
      {trait.image ? (
        <Image src={trait.image} alt={trait.name} fill sizes={`${size}px`} className="object-contain p-1" style={{ clipPath: hex }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", clipPath: hex, fontSize: 11, fontWeight: 700, color: "#9ca3af" }}>
          {trait.name.substring(0, 2).toUpperCase()}
        </div>
      )}

      {/* Tooltip */}
      {hovered && (
        <div className="tr-tooltip">
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: trait.description ? 6 : 0 }}>
            {trait.name}
          </div>
          {trait.description && (
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.5, marginBottom: milestones.length > 0 ? 10 : 0 }}>
              {trait.description}
            </div>
          )}
          {milestones.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>Breakpoints</div>
              {milestones.map((m, i) => {
                const count = m.count ?? m.num ?? m.units ?? m.n ?? m.level;
                const desc  = m.desc ?? m.description ?? m.effect ?? m.bonus ?? m.text;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    {count !== undefined && (
                      <span style={{ flexShrink: 0, minWidth: 22, height: 22, borderRadius: 4, background: "#c8972a", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                        {String(count)}
                      </span>
                    )}
                    {desc !== undefined && (
                      <span style={{ fontSize: 11, color: "#d1d5db", lineHeight: 1.5 }}>{String(desc)}</span>
                    )}
                    {count === undefined && desc === undefined && (
                      <span style={{ fontSize: 11, color: "#6b7280" }}>
                        {Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Desktop Row ───────────────────────────────────────────────────────────────

function DesktopRow({ trait, idx }: { trait: ApiTrait; idx: number }) {
  const tierColor = TIER_COLOR[trait.tier ?? ""] ?? "#6b7280";
  const count     = parseNum(trait.pick_count);
  const freqPct   = trait.pick_percent ?? null;

  return (
    <Link
      href={`/traits/${toSlug(trait.name)}`}
      className="tr-row"
      style={{ background: idx % 2 === 1 ? "#131313" : "#111" }}
    >
      {/* Name + icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <TraitHex trait={trait} />
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {trait.name}
        </span>
      </div>

      {/* Tier */}
      <div className="tr-cell">
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, fontSize: 12, fontWeight: 800, background: tierColor, color: "#000" }}>
          {trait.tier ?? "—"}
        </span>
      </div>

      {/* Avg place */}
      <div className="tr-cell" style={{ fontSize: 14, fontWeight: 700, color: placementColor(trait.placement) }}>
        {trait.placement != null ? Number(trait.placement).toFixed(2) : "—"}
      </div>

      {/* Top 4 */}
      <div className="tr-cell" style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>
        {trait.top4 ?? "—"}
      </div>

      {/* Frequency */}
      <div className="tr-cell tr-col-freq" style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 6 }}>
        {count > 0 ? (
          <>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>{count.toLocaleString()}</span>
            {freqPct && <span style={{ fontSize: 11, color: "#6b7280" }}>{freqPct}</span>}
          </>
        ) : (
          <span style={{ fontSize: 14, color: "#4b5563" }}>—</span>
        )}
      </div>
    </Link>
  );
}

// ── Mobile Card ───────────────────────────────────────────────────────────────

function MobileCard({ trait, idx }: { trait: ApiTrait; idx: number }) {
  const tierColor = TIER_COLOR[trait.tier ?? ""] ?? "#6b7280";
  const count     = parseNum(trait.pick_count);
  const freqPct   = trait.pick_percent ?? null;

  return (
    <Link
      href={`/traits/${toSlug(trait.name)}`}
      className={`tr-card${idx % 2 === 1 ? " tr-card-odd" : ""}`}
    >
      <TraitHex trait={trait} size={44} />

      {/* Info */}
      <div className="tr-card-info">
        <div className="tr-card-name">{trait.name}</div>
        <div className="tr-card-stats">
          {/* Avg place */}
          <div className="tr-card-stat">
            <span className="tr-card-stat-label">Avg Place</span>
            <span className="tr-card-stat-val" style={{ color: placementColor(trait.placement) }}>
        {trait.placement != null ? Number(trait.placement).toFixed(2) : "—"}
            </span>
          </div>
          {/* Top 4 */}
          {trait.top4 && (
            <div className="tr-card-stat">
              <span className="tr-card-stat-label">Top 4</span>
              <span className="tr-card-stat-val">{trait.top4}</span>
            </div>
          )}
          {/* Frequency */}
          {count > 0 && (
            <div className="tr-card-stat">
              <span className="tr-card-stat-label">Picks</span>
              <span className="tr-card-stat-val">
                {freqPct ?? count.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tier badge */}
      <div className="tr-card-right">
        <span className="tr-card-tier" style={{ background: tierColor }}>
          {trait.tier ?? "—"}
        </span>
      </div>
    </Link>
  );
}
