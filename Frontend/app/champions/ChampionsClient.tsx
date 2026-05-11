"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

export interface ApiChampionOverview {
  id: number;
  name: string;
  slug: string;
  cost: number;
  rank: string;
  icon_path: string;
  avg_placement: number;
  win_rate: string;
  pick_rate: string;
  games_played: string | number;
}

const COST_COLORS: Record<number, string> = {
  1: "#6b7280",
  2: "#10b981",
  3: "#3b82f6",
  4: "#d946ef",
  5: "#eab308",
};

const RANK_COLORS: Record<string, string> = {
  S: "#ef4444",
  A: "#f97316",
  B: "#10b981",
  C: "#6b7280",
};

type SortDirection = "asc" | "desc";
interface SortConfig {
  key: keyof ApiChampionOverview;
  direction: SortDirection;
}

// Gán điểm ngầm để sort cho chuẩn Meta (S xịn nhất)
const rankValue: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };

export default function ChampionsClient({ champions }: { champions: ApiChampionOverview[] }) {


  // Mặc định sắp xếp theo Tier (Rank) giảm dần (S lên đầu)
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: "rank", direction: "desc" });

  const requestSort = (key: keyof ApiChampionOverview) => {
    let direction: SortDirection = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedChampions = useMemo(() => {
    let sortableItems = [...champions];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];

        // ── Xử lý Sort đặc biệt cho cột Rank (Tier) ──
        if (sortConfig.key === "rank") {
          const rA = rankValue[aVal] || 0;
          const rB = rankValue[bVal] || 0;
          if (rA < rB) return sortConfig.direction === "asc" ? -1 : 1;
          if (rA > rB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

        // ── Xử lý các cột còn lại (số, phần trăm, chữ) ──
        if (typeof aVal === "string") {
          const parsed = parseFloat(aVal.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(parsed)) aVal = parsed;
        }
        if (typeof bVal === "string") {
          const parsed = parseFloat(bVal.replace(/[^0-9.-]+/g, ""));
          if (!isNaN(parsed)) bVal = parsed;
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [champions, sortConfig]);

  const getSortIndicator = (key: keyof ApiChampionOverview) => {
    if (!sortConfig || sortConfig.key !== key) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return sortConfig.direction === "asc" ? <span style={{ color: "#f0b90b", marginLeft: 4 }}>▲</span> : <span style={{ color: "#f0b90b", marginLeft: 4 }}>▼</span>;
  };



  return (
    <div
      style={{
        backgroundColor: "#0a0a0c",
        color: "#e8e8e8",
        minHeight: "100vh",
        padding: "40px 16px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fff", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
            Danh Sách Tướng TFT
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 15, margin: 0, maxWidth: 600, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Khám phá sức mạnh của các vị tướng trong meta hiện tại. Dữ liệu được tổng hợp từ hàng triệu trận đấu, cập nhật liên tục.
          </p>
        </div>

        {/* Sort Controls */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          {(['rank', 'cost', 'avg_placement', 'win_rate', 'pick_rate'] as const).map(key => {
            const labels: any = { rank: 'Tier', cost: 'Giá Vàng', avg_placement: 'Hạng TB', win_rate: 'Tỉ Lệ Thắng', pick_rate: 'Tỉ Lệ Chọn' };
            const isActive = sortConfig?.key === key;
            return (
              <button
                key={key}
                onClick={() => requestSort(key)}
                style={{
                  padding: '8px 16px', borderRadius: 99, fontSize: 13, fontWeight: 700, border: '1px solid',
                  backgroundColor: isActive ? 'rgba(234, 179, 8, 0.15)' : '#181a20',
                  borderColor: isActive ? 'rgba(234, 179, 8, 0.5)' : '#2a2d35',
                  color: isActive ? '#fde047' : '#9ca3af',
                  display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? '0 0 12px rgba(234, 179, 8, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#22252e';
                    e.currentTarget.style.color = '#d1d5db';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#181a20';
                    e.currentTarget.style.color = '#9ca3af';
                  }
                }}
              >
                {labels[key]} {getSortIndicator(key)}
              </button>
            )
          })}
        </div>

        {/* Grid of Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20
        }}>
          {sortedChampions.map((champ) => {
            const costColor = COST_COLORS[champ.cost] || "#6b7280";
            const rankColor = champ.rank ? RANK_COLORS[champ.rank] : "#374151";
            
            return (
              <Link
                key={champ.id}
                href={`/champions/${champ.slug}`}
                style={{
                  display: "flex", flexDirection: "column",
                  background: "linear-gradient(145deg, #181a20 0%, #111216 100%)",
                  border: "1px solid #2a2d35",
                  borderRadius: 16,
                  textDecoration: "none",
                  overflow: "hidden",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = costColor;
                  e.currentTarget.style.boxShadow = `0 12px 20px -8px ${costColor}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "#2a2d35";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                }}
              >
                {/* Header Section */}
                <div style={{ display: "flex", gap: 16, padding: "20px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ 
                    width: 64, height: 64, borderRadius: 12, overflow: "hidden", 
                    border: `2px solid ${costColor}`, position: "relative", flexShrink: 0,
                    boxShadow: `0 0 12px ${costColor}40`
                  }}>
                    <Image src={champ.icon_path} alt={champ.name} fill sizes="64px" style={{ objectFit: "cover", transform: "scale(1.15)" }} />
                  </div>
                  
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 800, color: "#f3f4f6", letterSpacing: "-0.01em" }}>
                      {champ.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 800, color: "#111", backgroundColor: costColor,
                        padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em"
                      }}>
                        {champ.cost} Vàng
                      </span>
                      {champ.rank && (
                         <span style={{
                           fontSize: 11, fontWeight: 800, color: "#fff", backgroundColor: rankColor,
                           padding: "2px 8px", borderRadius: 4, boxShadow: `0 0 8px ${rankColor}40`
                         }}>
                           Tier {champ.rank}
                         </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ 
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, 
                  backgroundColor: "rgba(255,255,255,0.02)", padding: "16px 20px" 
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingRight: 8 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Hạng TB</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: champ.avg_placement < 4.5 ? "#4ade80" : champ.avg_placement > 5 ? "#f87171" : "#fbbf24" }}>
                      {Number(champ.avg_placement).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tỷ lệ thắng</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#e5e7eb" }}>{champ.win_rate}</span>
                  </div>
                </div>

                <div style={{ 
                  display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, 
                  backgroundColor: "rgba(255,255,255,0.02)", padding: "0 20px 20px" 
                }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingRight: 8 }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Tần suất</span>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "#60a5fa" }}>{champ.pick_rate}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Số trận</span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#d1d5db" }}>
                      {typeof champ.games_played === 'number' ? champ.games_played.toLocaleString("vi-VN") : champ.games_played}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}