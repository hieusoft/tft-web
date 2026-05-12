"use client";

// --- IMPORTS ---
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ApiChampionDetail } from "@/lib/types/champion";

// --- CONSTANTS ---
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
  B: "#f0b90b",
  C: "#10b981",
  D: "#6b7280",
};

const RANK_BG: Record<string, string> = {
  S: "rgba(239,68,68,0.15)",
  A: "rgba(249,115,22,0.15)",
  B: "rgba(240,185,11,0.15)",
  C: "rgba(16,185,129,0.15)",
  D: "rgba(107,114,128,0.15)",
};

function placementToTier(avg: number): string {
  if (avg <= 3.5) return "S";
  if (avg <= 4.0) return "A";
  if (avg <= 4.5) return "B";
  return "C";
}

function TierBadge({ avg }: { avg: number }) {
  const tier = placementToTier(avg);
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px', borderRadius: 4,
      fontSize: 12, fontWeight: 800,
      color: RANK_COLORS[tier],
      background: RANK_BG[tier],
      border: `1px solid ${RANK_COLORS[tier]}44`,
      minWidth: 24, textAlign: 'center',
    }}>{tier}</span>
  );
}

// --- HELPER FUNCTIONS ---
function formatSkillDescription(desc: string): string {
  if (!desc) return '';

  // 0. Pre-clean raw data
  let formatted = desc;
  // Convert literal \n strings to actual newlines then to <br/>
  formatted = formatted.replace(/\\n/g, '\n');
  // Remove @variable@ template tokens
  formatted = formatted.replace(/@[a-zA-Z0-9_]+@/g, '');
  // Remove empty parentheses
  formatted = formatted.replace(/\s*\(\s*\)/g, '');
  // Collapse extra whitespace
  formatted = formatted.replace(/[ \t]+/g, ' ').trim();

  // 1. Convert real newlines to <br/>
  formatted = formatted.replace(/\n/g, '<br/>');

  // 2. Placeholder numbers (no trailing space inside placeholder)
  formatted = formatted.replace(/(\d+(?:\.\d+)?%?(?:\/\d+(?:\.\d+)?%?)*)/g, '[[NUM:$1]]');

  // 3. Remove duplicate [[NUM:x]] [[NUM:x]] patterns that appear side by side
  formatted = formatted.replace(/(\[\[NUM:[^\]]+\]\])\s+\1/g, '$1');

  // 4. Sentence breaks (after . ! ? followed by uppercase)
  formatted = formatted.replace(/([.!?])\s+(?=\p{Lu})/gu, '$1<br/><br/>');

  // 5. Key-value pairs (Vietnamese stat labels) → gold label + new line
  formatted = formatted.replace(/(?:Sát Thương|Giảm|Hồi|Tốc|Thời|Sát thương|Năng lượng|Máu|Tỉ Lệ|Số)(?:\s+[\p{L}\s.]+?)?:/gu,
    match => `<br/><span style="color: #f0b90b; font-weight: 600;">${match}</span>`);

  // Fix triple+ line breaks
  formatted = formatted.replace(/(<br\/>\s*){3,}/g, '<br/><br/>');

  // 6. Keyword coloring
  const terms = [
    { regex: /(sát thương vật lý)/gi, color: '#f97316' },
    { regex: /(sát thương phép thuật|sát thương phép)/gi, color: '#3b82f6' },
    { regex: /(sát thương chuẩn)/gi, color: '#e2e8f0' },
    { regex: /(hồi máu|hồi phục)/gi, color: '#22c55e' },
    { regex: /(giáp)/gi, color: '#eab308' },
    { regex: /(kháng phép)/gi, color: '#06b6d4' },
    { regex: /(lá chắn|khiên)/gi, color: '#fbbf24' },
    { regex: /(tốc độ đánh|tốc đánh)/gi, color: '#fb923c' },
    { regex: /(năng lượng)/gi, color: '#60a5fa' },
    { regex: /(máu)/gi, color: '#ef4444' },
    { regex: /(sức mạnh phép thuật|smpt)/gi, color: '#8b5cf6' },
    { regex: /(làm choáng|hất tung|hoảng sợ)/gi, color: '#a8a29e' },
  ];
  terms.forEach(({ regex, color }) => {
    formatted = formatted.replace(regex, `<span style="color: ${color}; font-weight: 600;">$1</span>`);
  });

  // 7. Restore numbers with white bold styling
  formatted = formatted.replace(/\[\[NUM:(.*?)\]\]/g, '<span style="color: #fff; font-weight: 700;">$1</span>');

  // Remove leading breaks
  formatted = formatted.replace(/^(<br\/>\s*)+/, '');

  return formatted;
}

// --- MAIN COMPONENT ---
export default function ChampionDetailClient({ 
  champion,
  traitImages = {}
}: { 
  champion: ApiChampionDetail;
  traitImages?: Record<string, string>;
}) {
  // STATE & VARIABLES
  const [activeTab, setActiveTab] = useState<"skill" | "stats">("skill");
  const [activeItemTab, setActiveItemTab] = useState<"combo" | "priority">("combo");
  const costColor = COST_COLORS[champion.cost] || "#6b7280";

  const topBuild = champion.best_builds?.[0];
  const topItemsText = topBuild 
    ? `${topBuild.item_1.name}, ${topBuild.item_2.name}, ${topBuild.item_3.name}`
    : "các trang bị phù hợp";

  return (
    <div
      style={{
        backgroundColor: "#111111",
        color: "#e8e8e8",
        minHeight: "100vh",
        padding: "24px 16px 80px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        
        {/* NAVIGATION BREADCRUMB */}
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/champions"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9ca3af", textDecoration: "none" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#f0b90b")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay Lại Danh Sách
          </Link>
        </div>

        {/* RESPONSIVE GRID STYLE */}
        <style>{`
          .champ-main-layout {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
            align-items: start;
          }
          .items-top-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 24px;
          }
          @media (min-width: 1024px) {
            .champ-main-layout {
              grid-template-columns: 360px 1fr;
            }
            .items-top-grid {
              grid-template-columns: 1fr 1fr;
            }
          }
        `}</style>

        {/* MAIN LAYOUT */}
        <div className="champ-main-layout">
          {/* LEFT COLUMN: CHAMPION INFO & SKILLS */}
          <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, overflow: "hidden", border: "1px solid #2a2a2e" }}>
            
            {/* Champion Splash & Header */}
            <div style={{ position: "relative", height: 200, width: "100%" }}>
              {champion.splash_path && (
                <Image 
                  src={champion.splash_path} 
                  alt={champion.name} 
                  fill 
                  style={{ objectFit: "cover", objectPosition: "center top" }} 
                  priority 
                  unoptimized
                />
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #1e1e24 0%, transparent 80%)" }} />
              
              <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 8px 0", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                  {champion.name}
                </h1>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {champion.traits.map((trait) => {
                    const tImage = traitImages[trait.slug];
                    return (
                      <div key={trait.slug} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {tImage ? (
                          <div style={{ width: 14, height: 14, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                             <img src={tImage} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,1))' }} />
                          </div>
                        ) : (
                          <div style={{ width: 14, height: 14, backgroundColor: "#333", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
                        )}
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#ccc", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{trait.name}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ position: "absolute", bottom: 0, right: 0, display: "flex", gap: 8 }}>
                   <span style={{ backgroundColor: costColor, color: "#111", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 800 }}>
                    {champion.cost} Vàng
                  </span>
                  {champion.rank && (
                    <span style={{ backgroundColor: RANK_COLORS[champion.rank] || "#666", color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 800 }}>
                      Tier {champion.rank}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Skill / Stats Tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #2a2a2e", backgroundColor: "#18181c" }}>
              <button
                onClick={() => setActiveTab("skill")}
                style={{ flex: 1, padding: "14px 0", background: "none", border: "none", borderBottom: activeTab === "skill" ? "2px solid #f0b90b" : "2px solid transparent", color: activeTab === "skill" ? "#f0b90b" : "#9ca3af", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}
              >
                Kỹ Năng
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                style={{ flex: 1, padding: "14px 0", background: "none", border: "none", borderBottom: activeTab === "stats" ? "2px solid #f0b90b" : "2px solid transparent", color: activeTab === "stats" ? "#f0b90b" : "#9ca3af", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}
              >
                Số Liệu
              </button>
            </div>

            {/* Tab Content */}
            <div style={{ padding: "20px" }}>
              {activeTab === "skill" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    <div style={{ position: "relative", width: 56, height: 56, borderRadius: 10, border: "2px solid #333", overflow: "hidden", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}>
                      <Image src={champion.skill.icon_path} alt={champion.skill.name} fill style={{ objectFit: "cover" }} unoptimized />
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 6px 0", fontSize: 18, fontWeight: 800, color: "#fff" }}>{champion.skill.name}</h3>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#3b82f6", boxShadow: "0 0 8px #3b82f680" }} />
                        {champion.skill.mana_start} / {champion.skill.mana_max} Mana
                      </div>
                    </div>
                  </div>
                  
                  <div
                    style={{ backgroundColor: "#18181c", padding: "16px", borderRadius: 8, border: "1px solid #2a2a2e", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)", fontSize: 13, color: "#aaa", lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: formatSkillDescription(champion.skill.description) }}
                  />
                </div>
              )}

              {activeTab === "stats" && champion.base_stats && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "10px" }}>
                  {Object.entries(champion.base_stats).map(([key, val]) => (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, borderBottom: "1px dashed #2a2a2e" }}>
                      <span style={{ color: "#9ca3af", fontSize: 13, fontWeight: 500 }}>{key}</span>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Bottom Stats */}
            <div style={{ backgroundColor: "#18181c", padding: "16px 20px", borderTop: "1px solid #2a2a2e", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
               <div>
                 <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Hạng TB</div>
                 <div style={{ fontSize: 18, color: "#10b981", fontWeight: 800 }}>{champion.avg_placement}</div>
               </div>
               <div>
                 <div style={{ fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Số Trận</div>
                 <div style={{ fontSize: 18, color: "#fff", fontWeight: 800 }}>
                   {typeof champion.games_played === 'string' ? parseInt(champion.games_played).toLocaleString() : champion.games_played}
                 </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ITEMS CONTENT */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* TOP SECTION: SUMMARIES */}
            <div className="items-top-grid">
              
              {/* LỐI CHƠI ĐỀ XUẤT (Top 5) */}
          <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, padding: "20px", border: "1px solid #2a2a2e", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 8px 0" }}>Lối Chơi Đề Xuất</h2>
            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, marginBottom: 20 }}>
              Chúng tôi đề xuất <strong style={{ color: "#f0b90b" }}>{topItemsText}</strong> là lối chơi tốt nhất cho {champion.name}.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div style={{ display: "flex", fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 800, paddingBottom: 8, borderBottom: "1px solid #2a2a2e", letterSpacing: "0.05em" }}>
                <div style={{ flex: 1 }}>Combo</div>
                <div style={{ width: 44, textAlign: "center" }}>Tier</div>
                <div style={{ width: 60, textAlign: "center" }}>Hạng TB</div>
                <div style={{ width: 60, textAlign: "right" }}>Win Rate</div>
              </div>
              
              {champion.best_builds?.slice(0, 5).map((build, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", paddingBottom: 8 }}>
                  <div style={{ flex: 1, display: "flex", gap: 4 }}>
                    {[build.item_1, build.item_2, build.item_3].map((itm, i) => (
                      <div key={i} title={itm.name} style={{ position: "relative", width: 32, height: 32, borderRadius: 6, overflow: "hidden", border: "1px solid #3a3d45" }}>
                        <Image src={itm.image} alt={itm.name} fill style={{ objectFit: "cover" }} unoptimized />
                      </div>
                    ))}
                  </div>
                  <div style={{ width: 44, textAlign: "center" }}>
                    <TierBadge avg={build.avg_placement} />
                  </div>
                  <div style={{ width: 60, textAlign: "center", fontSize: 15, fontWeight: 800, color: "#10b981" }}>
                    {build.avg_placement}
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#e8e8e8" }}>
                    {build.win_rate}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLUMN 3: TRANG BỊ HÀNG ĐẦU (Top 5) */}
          <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, padding: "20px", border: "1px solid #2a2a2e", display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 8px 0" }}>Trang Bị Hàng Đầu</h2>
            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, marginBottom: 20 }}>
              Các trang bị đơn lẻ hoạt động hiệu quả nhất trên {champion.name}.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div style={{ display: "flex", fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 800, paddingBottom: 8, borderBottom: "1px solid #2a2a2e", letterSpacing: "0.05em" }}>
                <div style={{ flex: 1 }}>Trang Bị</div>
                <div style={{ width: 44, textAlign: "center" }}>Tier</div>
                <div style={{ width: 60, textAlign: "center" }}>Hạng TB</div>
                <div style={{ width: 60, textAlign: "right" }}>Tần Suất</div>
              </div>
              
              {champion.best_items?.slice(0, 5).map((b_item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", paddingBottom: 8 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative", width: 32, height: 32, borderRadius: 6, overflow: "hidden", border: "1px solid #3a3d45" }}>
                      <Image src={b_item.item.image} alt={b_item.item.name} fill style={{ objectFit: "cover" }} unoptimized />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#e8e8e8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 90 }}>
                      {b_item.item.name}
                    </span>
                  </div>
                  <div style={{ width: 44, textAlign: "center" }}>
                    <TierBadge avg={b_item.avg_placement} />
                  </div>
                  <div style={{ width: 60, textAlign: "center", fontSize: 15, fontWeight: 800, color: b_item.avg_placement < 4.5 ? "#10b981" : "#fbbf24" }}>
                    {b_item.avg_placement}
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontSize: 14, fontWeight: 700, color: "#9ca3af" }}>
                    {b_item.pick_percent}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: DETAILED TABS */}
        <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, border: "1px solid #2a2a2e", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #2a2a2e", backgroundColor: "#18181c" }}>
            <button
              onClick={() => setActiveItemTab("combo")}
              style={{
                padding: "16px 24px", background: activeItemTab === "combo" ? "#1e1e24" : "transparent",
                border: "none", borderBottom: activeItemTab === "combo" ? "2px solid #f0b90b" : "2px solid transparent",
                color: activeItemTab === "combo" ? "#f0b90b" : "#9ca3af",
                fontSize: 14, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
                transition: "all 0.2s"
              }}
            >
              Chi Tiết Lối Chơi
            </button>
            <button
              onClick={() => setActiveItemTab("priority")}
              style={{
                padding: "16px 24px", background: activeItemTab === "priority" ? "#1e1e24" : "transparent",
                border: "none", borderBottom: activeItemTab === "priority" ? "2px solid #f0b90b" : "2px solid transparent",
                color: activeItemTab === "priority" ? "#f0b90b" : "#9ca3af",
                fontSize: 14, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em",
                transition: "all 0.2s"
              }}
            >
              Chi Tiết Trang Bị
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            {activeItemTab === "combo" && (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead style={{ backgroundColor: "#1c1c21", borderBottom: "1px solid #2a2a2e" }}>
                  <tr>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Combo Trang Bị</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Tier</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Hạng TB</th>
                    <th style={{ padding: "16px 24px", textAlign: "right", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Tỷ Lệ Thắng</th>
                  </tr>
                </thead>
                <tbody>
                  {champion.best_builds?.map((build, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #2a2a2e", backgroundColor: idx % 2 === 0 ? "transparent" : "#1a1a1f", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#24242a"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "transparent" : "#1a1a1f"}>
                      <td style={{ padding: "16px 24px", display: "flex", gap: 8 }}>
                        {[build.item_1, build.item_2, build.item_3].map((itm, i) => (
                          <div key={i} title={itm.name} style={{ position: "relative", width: 40, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid #3a3d45" }}>
                            <Image src={itm.image} alt={itm.name} fill style={{ objectFit: "cover" }} unoptimized />
                          </div>
                        ))}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        <TierBadge avg={build.avg_placement} />
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                        {build.avg_placement}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 15, fontWeight: 700, color: "#9ca3af" }}>
                        {build.win_rate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeItemTab === "priority" && (
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead style={{ backgroundColor: "#1c1c21", borderBottom: "1px solid #2a2a2e" }}>
                  <tr>
                    <th style={{ padding: "16px 24px", textAlign: "left", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Trang Bị</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Tier</th>
                    <th style={{ padding: "16px 24px", textAlign: "center", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Hạng TB</th>
                    <th style={{ padding: "16px 24px", textAlign: "right", fontSize: 12, color: "#666", fontWeight: 800, textTransform: "uppercase" }}>Tần Suất</th>
                  </tr>
                </thead>
                <tbody>
                  {champion.best_items?.map((b_item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #2a2a2e", backgroundColor: idx % 2 === 0 ? "transparent" : "#1a1a1f", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#24242a"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "transparent" : "#1a1a1f"}>
                      <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ position: "relative", width: 40, height: 40, borderRadius: 6, overflow: "hidden", border: "1px solid #3a3d45" }}>
                          <Image src={b_item.item.image} alt={b_item.item.name} fill style={{ objectFit: "cover" }} unoptimized />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: "#e8e8e8" }}>{b_item.item.name}</span>
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>
                        <TierBadge avg={b_item.avg_placement} />
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "center", fontSize: 16, fontWeight: 800, color: "#fff" }}>
                        {b_item.avg_placement}
                      </td>
                      <td style={{ padding: "16px 24px", textAlign: "right", fontSize: 15, fontWeight: 700, color: "#9ca3af" }}>
                        {b_item.pick_percent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}