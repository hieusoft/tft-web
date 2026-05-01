"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo, useRef } from "react";
import type { ApiTrait } from "@/lib/api-client";
import { toSlug } from "@/lib/slug";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePct(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

function parseNum(val: string | null): number {
  if (!val) return 0;
  // Backend dùng dấu chấm làm thousand sep (EU): "1.304.549"
  // Strip cả chấm lẫn phẩy trước khi parse
  const cleaned = val.replace(/[.,]/g, "").trim();
  return parseInt(cleaned, 10) || 0;
}

/** Avg placement color: green < 4.0, yellow 4.0–4.4, red > 4.4 */
function placementColor(v: number | null): string {
  if (v === null) return "#9ca3af";
  if (v < 4.0)   return "#4ade80";
  if (v < 4.5)   return "#facc15";
  return "#f87171";
}

// ── Tier config (using inline style, never dynamic classname) ─────────────────

const TIER_COLOR: Record<string, string> = {
  S: "rgb(255, 126, 131)",
  A: "rgb(255, 191, 127)",
  B: "rgb(255, 223, 128)",
  C: "rgb(254, 255, 127)",
};

// ── Grid column template ──────────────────────────────────────────────────────

const COLS = "minmax(0,1fr) 72px minmax(100px,120px) minmax(100px,120px) minmax(120px,160px)";
const MIN_WIDTH = 650;

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "tier" | "placement" | "win_rate" | "frequency";
type SortDir = "asc" | "desc";
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

// ── Main Component ────────────────────────────────────────────────────────────

export default function TraitsClient({ traits }: { traits: ApiTrait[] }) {
  const [search, setSearch]         = useState("");
  const [sortKey, setSortKey]       = useState<SortKey>("placement");
  const [sortDir, setSortDir]       = useState<SortDir>("asc");
  const [tierFilter, setTierFilter] = useState<"All" | "S" | "A" | "B" | "C">("All");

  const totalGames = useMemo(
    () => traits.reduce((sum, t) => sum + parseNum(t.pick_count), 0),
    [traits]
  );

  const sorted = useMemo(() => {
    let list = [...traits];
    if (tierFilter !== "All") list = list.filter((t) => t.tier === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === "tier") {
        diff = (TIER_ORDER[a.tier ?? "C"] ?? 3) - (TIER_ORDER[b.tier ?? "C"] ?? 3);
      } else if (sortKey === "placement") {
        diff = (a.placement ?? 9) - (b.placement ?? 9);
      } else if (sortKey === "win_rate") {
        diff = parsePct(b.top4) - parsePct(a.top4);
      } else if (sortKey === "frequency") {
        diff = parseNum(b.pick_count) - parseNum(a.pick_count);
      }
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [traits, tierFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "placement" ? "asc" : "desc"); }
  }

  function SortArrow({ k }: { k: SortKey }) {
    const active = sortKey === k;
    return (
      <span style={{ color: active ? "#facc15" : "#4b5563", marginLeft: 4, fontSize: 10 }}>
        {active ? (sortDir === "asc" ? "▲" : "▼") : "▼"}
      </span>
    );
  }

  // Column header button style
  const thStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#6b7280",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
  };

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>


        {/* ── Filter bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {(["All", "S", "A", "B", "C"] as const).map((t) => {
            const active = tierFilter === t;
            const color  = t === "All" ? "#6b7280" : TIER_COLOR[t];
            return (
              <button
                key={t}
                suppressHydrationWarning
                onClick={() => setTierFilter(t)}
                style={{
                  height: 28,
                  padding: "0 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  background: active ? color : "#1e1e1e",
                  color: active ? "#ffffff" : "#9ca3af",
                  border: `1px solid ${active ? color : "#2a2a2a"}`,
                }}
              >
                {t === "All" ? "All" : `${t}-Tier`}
              </button>
            );
          })}

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: "relative" }}>
            <input
              value={search}
              suppressHydrationWarning
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trait..."
              style={{
                height: 32,
                width: 180,
                borderRadius: 6,
                background: "#1e1e1e",
                border: "1px solid #2a2a2a",
                paddingLeft: 12,
                paddingRight: 32,
                fontSize: 12,
                color: "#d1d5db",
                outline: "none",
              }}
            />
            <svg
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#6b7280", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ borderRadius: 12, overflowX: "auto", WebkitOverflowScrolling: "touch", border: "1px solid #222222" }}>

          {/* Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              background: "#161616",
              minWidth: MIN_WIDTH,
              borderBottom: "1px solid #222222",
              padding: "12px 16px",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280" }}>
              Trait
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", background: "none", border: "none", cursor: "pointer", borderLeft: "1px solid #222", paddingLeft: 12 }} suppressHydrationWarning onClick={() => toggleSort("tier")}>
              Tier<SortArrow k="tier" />
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", background: "none", border: "none", cursor: "pointer", borderLeft: "1px solid #222", paddingLeft: 12 }} suppressHydrationWarning onClick={() => toggleSort("placement")}>
              Avg Place<SortArrow k="placement" />
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", background: "none", border: "none", cursor: "pointer", borderLeft: "1px solid #222", paddingLeft: 12 }} suppressHydrationWarning onClick={() => toggleSort("win_rate")}>
              Top 4 Rate<SortArrow k="win_rate" />
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "#6b7280", background: "none", border: "none", cursor: "pointer", justifyContent: "flex-end", borderLeft: "1px solid #222", paddingLeft: 12 }} suppressHydrationWarning onClick={() => toggleSort("frequency")}>
              Frequency<SortArrow k="frequency" />
            </button>
          </div>

          {/* Rows */}
          {sorted.length === 0 ? (
            <div style={{ padding: "64px 0", textAlign: "center", color: "#4b5563", fontSize: 14, background: "#111111" }}>
              Không tìm thấy trait nào
            </div>
          ) : (
            sorted.map((trait, idx) => (
              <TraitRow
                key={trait.id}
                trait={trait}
                idx={idx}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hex Icon with Tooltip ────────────────────────────────────────────────────

function TraitHex({ trait }: { trait: ApiTrait }) {
  const hex = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)"
  const [hovered, setHovered] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Milestone: try common keys from the backend JSON
  const milestones = (trait.milestones ?? []) as Record<string, unknown>[];

  return (
    <div
      ref={wrapRef}
      style={{ position: "relative", width: 40, height: 40, flexShrink: 0, zIndex: hovered ? 50 : "auto" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hexagon */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#2a2a2a",
        clipPath: hex,
        cursor: "pointer",
        transition: "filter 0.15s",
        filter: hovered ? "brightness(1.3)" : "brightness(1)",
      }} />
      {trait.image ? (
        <Image
          src={trait.image}
          alt={trait.name}
          fill
          sizes="40px"
          className="object-contain p-1"
          style={{ clipPath: hex }}
        />
      ) : (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          clipPath: hex,
          fontSize: 11, fontWeight: 700, color: "#9ca3af",
        }}>
          {trait.name.substring(0, 2).toUpperCase()}
        </div>
      )}

      {/* Tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "calc(100% + 10px)",
            transform: "translateY(-50%)",
            zIndex: 9999,
            minWidth: 240,
            maxWidth: 300,
            background: "#1a1c22",
            border: "1px solid #2d3040",
            borderRadius: 10,
            boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
            padding: "12px 14px",
            pointerEvents: "none",
          }}
        >
          {/* Trait name */}
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#ffffff",
            marginBottom: trait.description ? 6 : 0,
          }}>
            {trait.name}
          </div>

          {/* Description */}
          {trait.description && (
            <div style={{
              fontSize: 12,
              color: "#9ca3af",
              lineHeight: 1.5,
              marginBottom: milestones.length > 0 ? 10 : 0,
            }}>
              {trait.description}
            </div>
          )}

          {/* Milestones */}
          {milestones.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
                Breakpoints
              </div>
              {milestones.map((m, i) => {
                const count = m.count ?? m.num ?? m.units ?? m.n ?? m.level;
                const desc  = m.desc ?? m.description ?? m.effect ?? m.bonus ?? m.text;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    {count !== undefined && (
                      <span style={{
                        flexShrink: 0,
                        minWidth: 22,
                        height: 22,
                        borderRadius: 4,
                        background: "#c8972a",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#ffffff",
                      }}>
                        {String(count)}
                      </span>
                    )}
                    {desc !== undefined && (
                      <span style={{ fontSize: 11, color: "#d1d5db", lineHeight: 1.5 }}>
                        {String(desc)}
                      </span>
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

// ── Table Row ─────────────────────────────────────────────────────────────────

function TraitRow({
  trait,
  idx,
}: {
  trait: ApiTrait;
  idx: number;
}) {
  const isOdd    = idx % 2 === 1;
  const tierColor = TIER_COLOR[trait.tier ?? ""] ?? "#6b7280";
  const count    = parseNum(trait.pick_count);
  const freqPct  = trait.pick_percent ?? null;

  return (
    <Link
      href={`/traits/${toSlug(trait.name)}`}
      style={{
        display: "grid",
        gridTemplateColumns: COLS,
        minWidth: MIN_WIDTH, 
        alignItems: "center",
        padding: "12px 16px",
        gap: 8,
        borderBottom: "1px solid #1a1a1a",
        background: isOdd ? "#131313" : "#111111",
        textDecoration: "none",
        transition: "background 0.12s",
      }}
      className="group hover:bg-[#1c1c1c]"
    >
      {/* Trait name + icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <TraitHex trait={trait} />
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#e5e7eb",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {trait.name}
          </div>
        </div>
      </div>

      {/* Tier badge */}
      <div style={{ borderLeft: "1px solid #1e1e1e", paddingLeft: 12 }}>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 28,
          height: 28,
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 800,
          background: tierColor,
          color: "#000000",
        }}>
          {trait.tier ?? "—"}
        </span>
      </div>

      {/* Avg placement */}
      <div style={{ fontSize: 14, fontWeight: 700, color: placementColor(trait.placement), borderLeft: "1px solid #1e1e1e", paddingLeft: 12 }}>
        {trait.placement != null ? trait.placement.toFixed(2) : "—"}
      </div>

      {/* Top 4 rate */}
      <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb", borderLeft: "1px solid #1e1e1e", paddingLeft: 12 }}>
        {trait.top4 ?? "—"}
      </div>

      {/* Frequency */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 6, borderLeft: "1px solid #1e1e1e", paddingLeft: 12 }}>
        {count > 0 ? (
          <>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>
              {count.toLocaleString()}
            </span>
            {freqPct && (
              <span style={{ fontSize: 11, color: "#6b7280" }}>{freqPct}</span>
            )}
          </>
        ) : (
          <span style={{ fontSize: 14, color: "#4b5563" }}>—</span>
        )}
      </div>
    </Link>
  );
}
