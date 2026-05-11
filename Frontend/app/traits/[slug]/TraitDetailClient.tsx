"use client";
import Image from "next/image";
import Link from "next/link";
import type { ApiTrait } from "@/lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePct(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace(/[^0-9.]/g, "")) || 0;
}

const TIER_COLOR: Record<string, string> = {
  S: "#ef4444", 
  A: "#f97316",
  B: "#10b981",
  C: "#6b7280", 
};

const COST_COLORS: Record<number, string> = {
  1: "#6b7280",
  2: "#10b981",
  3: "#3b82f6",
  4: "#d946ef",
  5: "#eab308",
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function TraitDetailClient({ trait }: { trait: ApiTrait }) {
  const top4Num = parsePct(trait.top4);
  const pickNum = parsePct(trait.pick_percent);

  const champions = trait.champions ?? [];

  // --- MILESTONE PARSING ---
  const rawMilestones = (trait.milestones ?? []) as Record<string, any>[];
  let cleanDesc = (trait.description || "").replace(/&nbsp;/g, " ");
  const extractedDesc = new Map<number, string>();
  const regex = /(?:^|\s|<br>)\((\d+)\)\s*(.*?)(?=(?:\s|<br>)*\(\d+\)|$)/gi;
  
  cleanDesc = cleanDesc.replace(regex, (fullMatch, minStr, text) => {
    extractedDesc.set(parseInt(minStr, 10), text.trim());
    return "";
  }).trim();

  const displayMilestones = rawMilestones.map(m => {
    const count = m.min ?? m.count ?? m.num ?? m.units ?? m.n ?? m.level;
    let desc = m.desc ?? m.description ?? m.effect ?? m.bonus ?? m.text;
    if (count !== undefined && extractedDesc.has(Number(count))) {
      desc = extractedDesc.get(Number(count));
    }
    return { ...m, displayCount: count, displayDesc: desc, style: m.style as number | undefined };
  }).filter(m => {
     if (rawMilestones.length === 1 && !m.displayDesc && cleanDesc) return false;
     return true;
  });

  function getMilestoneBg(style?: number): string {
    switch (style) {
      case 1: return "linear-gradient(180deg, #b46b41, #703816)"; // Bronze
      case 2: return "linear-gradient(180deg, #a4adb5, #626c75)"; // Silver
      case 3: return "linear-gradient(180deg, #ffd769, #bf8120)"; // Gold
      case 4: return "linear-gradient(180deg, #fdba74, #c2410c)"; // Unique
      case 5: return "linear-gradient(135deg, #81e2b6, #6bade2, #b76deb, #ee76ad)"; // Prismatic
      case 6: return "linear-gradient(135deg, #fef08a, #fb923c, #ec4899, #a855f7)"; // Ultimate
      default: return "#4b5563";
    }
  }
  // -------------------------

  const getPlacementColor = (val: number | null) => {
    if (val === null) return "#9ca3af";
    if (val < 4.0) return "#34d399";
    if (val < 4.5) return "#fbbf24";
    return "#f87171";
  };

  const stats = [
    {
      label: "Avg Placement",
      value: trait.placement != null ? Number(trait.placement).toFixed(2) : "—",
      color: getPlacementColor(trait.placement),
    },
    { label: "Top 4 Rate", value: trait.top4 ?? "—", color: "#e5e7eb" },
    { label: "Pick Rate", value: trait.pick_percent ?? "—", color: "#e5e7eb" },
    { label: "Games Played", value: trait.pick_count ?? "—", color: "#e5e7eb" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#0a0a0c",
      backgroundImage: `
        radial-gradient(circle at 50% 0%, rgba(200, 151, 42, 0.08) 0%, transparent 60%),
        linear-gradient(to bottom, #0a0a0c 0%, #111216 100%)
      `,
      color: "#f8fafc",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "0 0 100px 0",
      position: "relative",
    }}>
      
      {/* Background ambient glow based on tier */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "60vh",
        background: `radial-gradient(circle at 50% 15%, ${TIER_COLOR[trait.tier ?? ""] ? TIER_COLOR[trait.tier ?? ""] + "15" : "rgba(255,255,255,0.02)"} 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0
      }} />

      {/* Main Container */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "40px 24px", position: "relative", zIndex: 1 }}>
        
        {/* Breadcrumb / Back Link */}
        <Link
          href="/traits"
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            fontSize: 14, fontWeight: 500, color: "#94a3b8",
            textDecoration: "none", marginBottom: 32,
            transition: "all 0.2s",
            padding: "8px 16px", borderRadius: 8,
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#c8972a";
            e.currentTarget.style.backgroundColor = "rgba(200,151,42,0.1)";
            e.currentTarget.style.borderColor = "rgba(200,151,42,0.2)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Danh sách Tộc/Hệ
        </Link>

        {/* ── Header Card ── */}
        <div style={{
          display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
          padding: "40px", borderRadius: 24,
          background: "rgba(24, 26, 32, 0.6)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
          marginBottom: 40
        }}>
          {/* Hexagon Icon */}
          <div style={{
            position: "relative", width: 100, height: 100, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "linear-gradient(135deg, #2a2d36 0%, #1a1c23 100%)",
            clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
            boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.1)"
          }}>
            {trait.image ? (
              <Image src={trait.image} alt={trait.name} fill sizes="100px" style={{ objectFit: "contain", padding: "16px", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))" }} unoptimized />
            ) : (
              <span style={{ fontSize: 28, fontWeight: 900, color: "#64748b" }}>
                {trait.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
              <h1 style={{ 
                fontSize: 40, fontWeight: 900, margin: 0, 
                background: "linear-gradient(to right, #ffffff, #a1a1aa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                letterSpacing: "-0.03em"
              }}>
                {trait.name}
              </h1>
              {trait.tier && (
                <div style={{
                  padding: "6px 14px", borderRadius: 8,
                  fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
                  background: `linear-gradient(135deg, ${TIER_COLOR[trait.tier] || "#64748b"}, ${TIER_COLOR[trait.tier] || "#64748b"}dd)`,
                  color: "#fff",
                  boxShadow: `0 4px 12px ${(TIER_COLOR[trait.tier] || "#000")}40`,
                  border: "1px solid rgba(255,255,255,0.2)"
                }}>
                  Tier {trait.tier}
                </div>
              )}
            </div>
            {cleanDesc && (
              <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.6, margin: 0, maxWidth: 700, textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>
                {cleanDesc}
              </p>
            )}
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 32 }}>
          
          {/* Cột trái: Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Stat Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {stats.map((s, i) => (
                <div key={s.label} style={{
                  background: "rgba(30, 32, 40, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: 16, padding: "24px 20px",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
                }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: s.color, marginBottom: 8, textShadow: `0 0 20px ${s.color}40` }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bars */}
            <div style={{
              background: "rgba(30, 32, 40, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              borderRadius: 16, padding: "28px",
              display: "flex", flexDirection: "column", gap: 24,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
            }}>
              <BarRow label="Top 4 Rate" value={top4Num} max={70} color="#10b981" />
              <BarRow label="Pick Rate" value={pickNum} max={50} color="#3b82f6" />
            </div>
          </div>

          {/* Cột phải: Champions & Breakpoints */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Tướng */}
            {champions.length > 0 && (
              <div style={{
                background: "rgba(30, 32, 40, 0.4)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 20, padding: "28px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 4, height: 16, background: "#c8972a", borderRadius: 4 }} />
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Tướng Thuộc Hệ
                  </h2>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {champions.map((champ: any) => (
                    <Link href={`/champions/${champ.slug || champ.id}`} key={champ.id} style={{ textDecoration: "none" }}>
                      <div
                        className="champ-card"
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 68,
                          transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-6px) scale(1.05)"}
                        onMouseOut={(e) => e.currentTarget.style.transform = "none"}
                      >
                        <div style={{
                          position: "relative", width: 68, height: 68, borderRadius: 12, overflow: "hidden",
                          border: `2px solid ${COST_COLORS[champ.cost] || "#444"}`,
                          boxShadow: `0 6px 12px ${COST_COLORS[champ.cost] || "#000"}30`
                        }}>
                          <Image src={champ.icon_path} alt={champ.name} fill sizes="68px" style={{ objectFit: "cover" }} unoptimized />
                          <div style={{
                            position: "absolute", bottom: 0, left: 0, right: 0, height: 24,
                            background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                          }} />
                          <div style={{
                            position: "absolute", bottom: 2, right: 4,
                            fontSize: 11, fontWeight: 900, color: COST_COLORS[champ.cost] || "#fff",
                            textShadow: "0 1px 2px #000"
                          }}>
                            ${champ.cost}
                          </div>
                        </div>
                        <span style={{ 
                          fontSize: 12, fontWeight: 600, color: "#cbd5e1", textAlign: "center", 
                          textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "100%" 
                        }}>
                          {champ.name}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mốc Kích Hoạt */}
            {displayMilestones.length > 0 && (
              <div style={{
                background: "rgba(30, 32, 40, 0.4)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: 20, padding: "28px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.2)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 4, height: 16, background: "#3b82f6", borderRadius: 4 }} />
                  <h2 style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Mốc Kích Hoạt
                  </h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {displayMilestones.map((m: any, i: number) => {
                    const count = m.displayCount;
                    const desc = m.displayDesc;
                    const raw = count === undefined && desc === undefined ? Object.entries(m).filter(([k]) => !['displayCount', 'displayDesc', 'style'].includes(k)).map(([k, v]) => `${k}: ${v}`).join(" · ") : null;

                    return (
                      <div key={i} style={{
                        display: "flex", alignItems: "flex-start", gap: 16, padding: "16px",
                        background: "rgba(15, 17, 21, 0.6)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.03)",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseOut={(e) => e.currentTarget.style.background = "rgba(15, 17, 21, 0.6)"}
                      >
                        {count !== undefined && (
                          <div style={{
                            flexShrink: 0, width: 36, height: 36, borderRadius: 8,
                            background: getMilestoneBg(m.style as number | undefined),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 15, fontWeight: 900, color: "#fff",
                            textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2)"
                          }}>
                            {String(count)}
                          </div>
                        )}
                        <div style={{ flex: 1, alignSelf: "center" }}>
                          {desc !== undefined ? (
                            <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6, fontWeight: 500 }}>
                              <FormatDesc text={String(desc)} />
                            </div>
                          ) : raw ? (
                            <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, fontWeight: 500 }}>
                              {raw}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UI Helpers ────────────────────────────────────────────────────────────────

function BarRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <span style={{ fontSize: 15, fontWeight: 900, color: "#fff" }}>
          {value > 0 ? `${Number(value).toFixed(1)}%` : "—"}
        </span>
      </div>
      <div style={{ height: 10, width: "100%", background: "rgba(0,0,0,0.5)", borderRadius: 99, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)", boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}40, ${color})`,
          borderRadius: 99, boxShadow: `0 0 12px ${color}80`,
          transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
        }} />
      </div>
    </div>
  );
}

function FormatDesc({ text }: { text: string }) {
  if (!text) return null;
  // Tách câu nếu thấy cấu trúc " TênTướng:" (vd: " Aatrox:", " Ấn:")
  const parts = text.split(/(?=\s+\p{Lu}\p{Ll}+:)/gu);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {parts.map((part, index) => {
        const trimmed = part.trim();
        const match = trimmed.match(/^(\p{Lu}\p{Ll}+:)(.*)/u);
        if (match) {
          return (
            <div key={index} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
              <strong style={{ color: "#fbbf24", whiteSpace: "nowrap" }}>{match[1]}</strong>
              <span>{match[2]}</span>
            </div>
          );
        }
        return <div key={index}>{trimmed}</div>;
      })}
    </div>
  );
}