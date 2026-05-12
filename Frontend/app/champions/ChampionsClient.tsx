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
  splash_path?: string;
  avg_placement: number;
  win_rate: string;
  pick_rate: string;
  games_played: string | number;
  traits?: { name: string; slug: string }[];
}

const COST_BG_COLORS: Record<number, string> = {
  1: "#3a3556",
  2: "#22584b",
  3: "#274e7d",
  4: "#5e2d79",
  5: "#9f6e24",
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

const rankValue: Record<string, number> = { S: 4, A: 3, B: 2, C: 1 };

export default function ChampionsClient({ 
  champions,
  traitImages = {}
}: { 
  champions: ApiChampionOverview[],
  traitImages?: Record<string, string>
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const requestSort = (key: keyof ApiChampionOverview) => {
    let direction: SortDirection = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedChampions = useMemo(() => {
    let result = [...champions];

    if (searchTerm.trim() !== "") {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(lowerTerm));
    }

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];

        if (sortConfig.key === "rank") {
          const rA = rankValue[aVal] || 0;
          const rB = rankValue[bVal] || 0;
          if (rA < rB) return sortConfig.direction === "asc" ? -1 : 1;
          if (rA > rB) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }

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

    return result;
  }, [champions, searchTerm, sortConfig]);

  const getSortIndicator = (key: keyof ApiChampionOverview) => {
    if (!sortConfig || sortConfig.key !== key) return <span style={{ opacity: 0.3, marginLeft: 4 }}>↕</span>;
    return sortConfig.direction === "asc" ? <span style={{ color: "#eab308", marginLeft: 4 }}>▲</span> : <span style={{ color: "#eab308", marginLeft: 4 }}>▼</span>;
  };

  return (
    <div
      style={{
        backgroundColor: "#0d0d14",
        color: "#e8e8e8",
        minHeight: "100vh",
        padding: "32px 24px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        
        {/* Hidden SEO H1 */}
        <h1 className="sr-only" style={{ display: 'none' }}>Danh Sách Tướng TFT</h1>

        {/* Top Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200, maxWidth: 320 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </span>
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px 10px 40px', borderRadius: 8, 
                backgroundColor: '#181824', border: '1px solid #2a2a3c', 
                color: '#fff', outline: 'none', fontSize: 14 
              }} 
            />
          </div>
          <div style={{ flex: 1 }} />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', 
              color: '#eab308', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '8px 12px'
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 12h6"/></svg>
            Filters
          </button>
        </div>

        {/* Sort Controls (Visible when Filters toggled) */}
        {showFilters && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, padding: '16px', backgroundColor: '#181824', borderRadius: 8, border: '1px solid #2a2a3c' }}>
            {(['rank', 'cost', 'avg_placement', 'win_rate', 'pick_rate'] as const).map(key => {
              const labels: any = { rank: 'Tier', cost: 'Giá Vàng', avg_placement: 'Hạng TB', win_rate: 'Tỉ Lệ Thắng', pick_rate: 'Tỉ Lệ Chọn' };
              const isActive = sortConfig?.key === key;
              return (
                <button
                  key={key}
                  onClick={() => requestSort(key)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600, border: '1px solid',
                    backgroundColor: isActive ? 'rgba(234, 179, 8, 0.15)' : '#222232',
                    borderColor: isActive ? 'rgba(234, 179, 8, 0.5)' : '#31314e',
                    color: isActive ? '#fde047' : '#9ca3af',
                    display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {labels[key]} {getSortIndicator(key)}
                </button>
              )
            })}
          </div>
        )}

        {/* Grid of Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: 16
        }}>
          {filteredAndSortedChampions.map((champ) => {
            const costColor = COST_BG_COLORS[champ.cost] || "#3a3556";
            const bgImg = champ.splash_path || champ.icon_path || "";
            
            return (
              <Link
                key={champ.id}
                href={`/champions/${champ.slug}`}
                style={{
                  display: "flex", flexDirection: "column",
                  borderRadius: 6,
                  overflow: "hidden",
                  textDecoration: "none",
                  transition: "transform 0.2s",
                  backgroundColor: '#111118',
                  border: '1px solid #2a2a3c',
                  height: 200,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = costColor;
                  e.currentTarget.style.boxShadow = `0 8px 16px -4px ${costColor}60`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "#2a2a3c";
                  e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.2)";
                }}
              >
                {/* Image Area */}
                <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                  {bgImg && (
                    <Image src={bgImg} alt={champ.name} fill sizes="(max-width: 768px) 50vw, 300px" style={{ objectFit: 'cover', objectPosition: 'center 20%' }} />
                  )}
                  
                  {/* Bottom Gradient for traits readability */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 60%)'
                  }} />

                  {/* Tier Badge — Top Left */}
                  {champ.rank && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8, zIndex: 2,
                      minWidth: 24, height: 24, padding: '0 6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 5,
                      backgroundColor: RANK_COLORS[champ.rank] ?? '#6b7280',
                      color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '0.04em',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
                      textShadow: '0 1px 2px rgba(0,0,0,0.7)',
                    }}>
                      {champ.rank}
                    </div>
                  )}

                  {/* Traits Bottom-Left Aligned */}
                  <div style={{
                    position: 'absolute', bottom: 8, left: 12,
                    display: 'flex', flexDirection: 'column', gap: 6, zIndex: 2
                  }}>
                    {champ.traits?.map((trait, idx) => {
                      const tImage = traitImages[trait.slug];
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                           {tImage && (
                             <div style={{ width: 16, height: 16, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                               <img src={tImage} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,1))' }} 
                                 onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                               />
                             </div>
                           )}
                           <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.9)', letterSpacing: '0.02em' }}>
                             {trait.name}
                           </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stats Bottom-Right Aligned */}
                  <div style={{
                    position: 'absolute', bottom: 8, right: 12,
                    display: 'flex', flexDirection: 'column', gap: 4, zIndex: 2,
                    alignItems: 'flex-end',
                  }}>
                    <ChampStat label="TB" value={formatChampPlacement(champ.avg_placement)} color="#e8e8e8" />
                    <ChampStat label="Win" value={formatChampPercent(champ.win_rate)} color="#f0b90b" />
                    <ChampStat label="Pick" value={formatChampPercent(champ.pick_rate)} color="#60a5fa" />
                  </div>
                </div>

                {/* Bottom Bar Area */}
                <div style={{
                  height: 36, backgroundColor: costColor, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0 12px'
                }}>
                  <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{champ.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fcd34d" style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))' }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                      <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                    </svg>
                    <span style={{ color: '#fcd34d', fontSize: 14, fontWeight: 800 }}>{champ.cost}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {filteredAndSortedChampions.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
            Không tìm thấy tướng nào phù hợp với tìm kiếm.
          </div>
        )}

      </div>
    </div>
  );
}

function parseNumeric(value: number | string | null | undefined): number | null {
  if (value == null) return null;
  if (typeof value === "number") return isNaN(value) ? null : value;
  const parsed = parseFloat(String(value).replace(/[^0-9.\-]+/g, ""));
  return isNaN(parsed) ? null : parsed;
}

function formatChampPlacement(value: number | string | null | undefined) {
  const n = parseNumeric(value);
  return n != null ? n.toFixed(2) : "—";
}

function formatChampPercent(value: number | string | null | undefined) {
  const n = parseNumeric(value);
  return n != null ? `${n.toFixed(1)}%` : "—";
}

function ChampStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: 4,
      padding: '2px 6px', borderRadius: 4,
      background: 'rgba(0,0,0,0.55)',
      backdropFilter: 'blur(2px)',
      textShadow: '0 1px 2px rgba(0,0,0,0.9)',
    }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}
