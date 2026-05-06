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
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  
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

  const thStyle = {
    padding: "20px 24px",
    fontSize: 12,
    fontWeight: 800,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    cursor: "pointer",
    userSelect: "none" as const,
    transition: "color 0.2s",
  };

  return (
    <div
      style={{
        backgroundColor: "#111111",
        color: "#e8e8e8",
        minHeight: "100vh",
        padding: "40px 16px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 8px 0" }}>
            Danh Sách Tướng
          </h1>
          <p style={{ color: "#9a9a9a", fontSize: 14, margin: 0 }}>
            Thống kê chi tiết tỷ lệ thắng, tần suất chọn, hạng trung bình và số trận của các vị tướng. Nhấn vào tiêu đề cột để sắp xếp.
          </p>
        </div>

        <div
          style={{
            backgroundColor: "#1e1e1e",
            border: "1px solid #2a2a2a",
            borderRadius: 16,
            overflowX: "auto",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Tăng minWidth lên 1000 để các cột rộng rãi, không bị dính vào nhau */}
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
            <thead style={{ backgroundColor: "#181818", borderBottom: "2px solid #2a2a2a" }}>
              <tr>
                <th
                  style={{ ...thStyle, textAlign: "left" }}
                  onClick={() => requestSort("name")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Tướng {getSortIndicator("name")}
                </th>
                
                {/* ── CỘT TIER MỚI THÊM ── */}
                <th
                  style={{ ...thStyle, textAlign: "center" }}
                  onClick={() => requestSort("rank")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Tier {getSortIndicator("rank")}
                </th>

                <th
                  style={{ ...thStyle, textAlign: "center" }}
                  onClick={() => requestSort("cost")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Bậc (Vàng) {getSortIndicator("cost")}
                </th>
                <th
                  style={{ ...thStyle, textAlign: "center" }}
                  onClick={() => requestSort("avg_placement")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Hạng TB {getSortIndicator("avg_placement")}
                </th>
                <th
                  style={{ ...thStyle, textAlign: "center" }}
                  onClick={() => requestSort("win_rate")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Tỷ Lệ Thắng {getSortIndicator("win_rate")}
                </th>
                <th
                  style={{ ...thStyle, textAlign: "center" }}
                  onClick={() => requestSort("pick_rate")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Tần Suất {getSortIndicator("pick_rate")}
                </th>
                <th
                  style={{ ...thStyle, textAlign: "center" }}
                  onClick={() => requestSort("games_played")}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#fff")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#666")}
                >
                  Số Trận {getSortIndicator("games_played")}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedChampions.map((champ) => {
                const isHovered = hoveredRow === champ.id;
                const costColor = COST_COLORS[champ.cost] || "#6b7280";

                return (
                  <tr
                    key={champ.id}
                    onMouseEnter={() => setHoveredRow(champ.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      backgroundColor: isHovered ? "#242424" : "transparent",
                      borderBottom: "1px solid #2a2a2a",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    {/* Cột Tướng */}
                    <td style={{ padding: "16px 24px" }}>
                      <Link
                        href={`/champions/${champ.slug}`}
                        style={{ display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}
                      >
                        <div
                          style={{
                            position: "relative",
                            width: 48,
                            height: 48,
                            borderRadius: 8,
                            overflow: "hidden",
                            border: `2px solid ${costColor}`,
                            boxShadow: isHovered ? `0 0 12px ${costColor}80` : "none",
                            transition: "box-shadow 0.2s",
                            flexShrink: 0,
                          }}
                        >
                          <Image src={champ.icon_path} alt={champ.name} fill style={{ objectFit: "cover" }} />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: isHovered ? "#fff" : "#e8e8e8", transition: "color 0.2s" }}>
                          {champ.name}
                        </span>
                      </Link>
                    </td>

                    {/* ── CỘT TIER MỚI THÊM ── */}
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      {champ.rank ? (
                        <span
                          style={{
                            display: "inline-block",
                            backgroundColor: RANK_COLORS[champ.rank] || "#6b7280",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 900,
                            padding: "6px 14px",
                            borderRadius: 8,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
                          }}
                        >
                          {champ.rank}
                        </span>
                      ) : (
                        <span style={{ color: "#666" }}>—</span>
                      )}
                    </td>

                    {/* Cột Bậc (Cost) */}
                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 28,
                          height: 28,
                          lineHeight: "28px",
                          borderRadius: "50%",
                          backgroundColor: costColor,
                          color: "#111",
                          fontSize: 14,
                          fontWeight: 900,
                          boxShadow: "0 2px 4px rgba(0,0,0,0.5)",
                        }}
                      >
                        {champ.cost}
                      </span>
                    </td>

                    <td style={{ padding: "16px 24px", textAlign: "center" }}>
                      <span
                        style={{
                          fontSize: 16,
                          fontWeight: 800,
                          color: champ.avg_placement < 4.5 ? "#10b981" : champ.avg_placement > 5 ? "#ef4444" : "#fbbf24",
                        }}
                      >
                        {champ.avg_placement}
                      </span>
                    </td>

                    <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 15, fontWeight: 600, color: "#ccc" }}>
                      {champ.win_rate}
                    </td>

                    <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 15, fontWeight: 600, color: "#3b82f6" }}>
                      {champ.pick_rate}
                    </td>

                    <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 15, fontWeight: 600, color: "#9ca3af" }}>
                      {typeof champ.games_played === 'number' ? champ.games_played.toLocaleString() : champ.games_played}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}