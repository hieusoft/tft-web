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

  const milestones = trait.milestones ?? [];
  const champions = trait.champions ?? [];

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
    <div
      style={{
        backgroundColor: "#111111", /* Đen nhám chuẩn meta TFT */
        color: "#e8e8e8",
        minHeight: "100vh",
        padding: "32px 16px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        
        {/* ── Back link ── */}
        <Link
          href="/traits"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#9a9a9a",
            textDecoration: "none",
            marginBottom: 24,
            transition: "color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#f0b90b")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#9a9a9a")}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>

        {/* ── Header Card ── */}
        <div
          style={{
            backgroundColor: "#1e1e1e",
            border: "1px solid #2a2a2a",
            borderRadius: 16,
            padding: "32px",
            marginBottom: 32,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 24,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div
            style={{
              position: "relative",
              width: 80,
              height: 80,
              flexShrink: 0,
              backgroundColor: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              clipPath: "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)",
              border: "2px solid #333",
            }}
          >
            {trait.image ? (
              <Image
                src={trait.image}
                alt={trait.name}
                fill
                sizes="80px"
                style={{ objectFit: "contain", padding: "12px", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }}
              />
            ) : (
              <span style={{ fontSize: 24, fontWeight: 900, color: "#666" }}>
                {trait.name.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.02em" }}>
                {trait.name}
              </h1>
              {trait.tier && (
                <span
                  style={{
                    backgroundColor: TIER_COLOR[trait.tier] || "#555",
                    color: "#fff",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  Tier {trait.tier}
                </span>
              )}
            </div>
            {trait.description && (
              <p style={{ fontSize: 14, color: "#9a9a9a", lineHeight: 1.6, margin: 0, maxWidth: 800 }}>
                {trait.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Main Content Grid ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
          
          {/* Cột trái (Stats) */}
          <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #2a2a2a",
                    borderRadius: 12,
                    padding: "24px 16px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 900, color: s.color, marginBottom: 6 }}>
                    {s.value}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center" }}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                backgroundColor: "#1e1e1e",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              <BarRow label="Top 4 Rate" value={top4Num} max={70} color="#10b981" />
              <BarRow label="Pick Rate" value={pickNum} max={50} color="#3b82f6" />
            </div>
          </div>

          {/* Cột phải (Tướng & Mốc) */}
          <div style={{ flex: "2 1 500px", display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Tướng */}
            {champions.length > 0 && (
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                  borderRadius: 12,
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <h2 style={{ fontSize: 13, fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px 0" }}>
                  Các Tướng Thuộc Hệ
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                  {champions.map((champ: any) => (
                    <div key={champ.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 64 }}>
                      <div
                        style={{
                          position: "relative",
                          width: 64,
                          height: 64,
                          borderRadius: 8,
                          overflow: "hidden",
                          border: `2px solid ${COST_COLORS[champ.cost] || "#444"}`,
                          boxShadow: `0 4px 10px ${COST_COLORS[champ.cost]}40`,
                        }}
                      >
                        <Image
                          src={champ.icon_path}
                          alt={champ.name}
                          fill
                          sizes="64px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#bbb", textAlign: "center", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "100%" }}>
                        {champ.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mốc Kích Hoạt */}
            {milestones.length > 0 && (
              <div
                style={{
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #2a2a2a",
                  borderRadius: 12,
                  padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                <h2 style={{ fontSize: 13, fontWeight: 800, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 20px 0" }}>
                  Mốc Kích Hoạt
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {milestones.map((m: any, i: number) => {
                    const count = m.unit ?? m.count ?? m.num ?? m.units ?? m.n ?? m.level;
                    const desc = m.effect ?? m.desc ?? m.description ?? m.bonus ?? m.text;
                    const raw = count === undefined && desc === undefined ? Object.entries(m).map(([k, v]) => `${k}: ${v}`).join(" · ") : null;

                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 16,
                          padding: "16px",
                          backgroundColor: "#242424",
                          borderRadius: 10,
                          border: "1px solid #333",
                        }}
                      >
                        {count !== undefined && (
                          <div
                            style={{
                              flexShrink: 0,
                              width: 32,
                              height: 32,
                              borderRadius: 6,
                              background: "linear-gradient(135deg, #f0b90b 0%, #d4a000 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                              fontWeight: 900,
                              color: "#111",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.5)",
                              marginTop: 2,
                            }}
                          >
                            {String(count)}
                          </div>
                        )}
                        <div style={{ fontSize: 14, color: "#ccc", lineHeight: 1.6, fontWeight: 500 }}>
                          {desc !== undefined ? String(desc) : raw}
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
          {value > 0 ? `${Number(value).toFixed(1)}%` : "—"}
        </span>
      </div>
      <div style={{ height: 8, width: "100%", backgroundColor: "#111", borderRadius: 99, overflow: "hidden", border: "1px solid #222" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            backgroundColor: color,
            borderRadius: 99,
            transition: "width 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </div>
    </div>
  );
}