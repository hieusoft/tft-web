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
  B: "#10b981",
  C: "#6b7280",
};

// --- HELPER FUNCTIONS ---
const formatSkillDescription = (desc: string) => {
  if (!desc) return null;

  // Highlight labels (Passive, Active, etc.)
  let html = desc.replace(/([A-ZÀ-ỸĐ][^:\.\n]{1,45}):/g, (match, p1) => {
    const lower = p1.toLowerCase().trim();
    if (lower === 'nội tại') {
      return `<br/><span style="color: #eab308; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">${match}</span>`;
    }
    if (lower === 'kích hoạt' || lower === 'chủ động' || lower === 'bị động') {
      return `<br/><br/><span style="color: #3b82f6; font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 0.5px;">${match}</span>`;
    }
    return `<br/><span style="color: #e8e8e8; font-weight: 700;">${match}</span>`;
  });
  
  // Clean up extra line breaks
  html = html.replace(/^(<br\/>)+/, '').replace(/^(<br>)+/, '');
  
  // Highlight numeric values
  html = html.replace(/(\d+(?:\.\d+)?%?(?:\/\d+(?:\.\d+)?%?)+)/g, '<span style="color:rgb(255, 42, 0); font-weight: 800; letter-spacing: 0.5px;">$1</span>');
  
  // Remove empty parentheses
  html = html.replace(/\s*\(\s*\)/g, '');

  return (
    <div 
      style={{ fontSize: 14, color: "#a1a1aa", lineHeight: 1.8 }} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

// --- MAIN COMPONENT ---
export default function ChampionDetailClient({ champion }: { champion: ApiChampionDetail }) {
  // STATE & VARIABLES
  const [activeTab, setActiveTab] = useState<"skill" | "stats">("skill");
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
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        
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

        {/* MAIN 3-COLUMN GRID LAYOUT */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
            alignItems: "start"
          }}
        >
          {/* COLUMN 1: CHAMPION INFO & SKILLS */}
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
                  {champion.traits.map((trait) => (
                    <div key={trait.slug} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 14, height: 14, backgroundColor: "#333", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#ccc", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{trait.name}</span>
                    </div>
                  ))}
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
                  
                  <div style={{ backgroundColor: "#18181c", padding: "16px", borderRadius: 8, border: "1px solid #2a2a2e", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.2)" }}>
                    {formatSkillDescription(champion.skill.description)}
                  </div>
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

          {/* COLUMN 2: BEST BUILDS */}
          <div style={{ flex: "1.5", display: "flex", flexDirection: "column", gap: 20 }}>
            
            {/* Recommended Build Summary */}
            <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, padding: "20px", border: "1px solid #2a2a2e" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 12px 0" }}>Lối Chơi Đề Xuất</h2>
              <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, marginBottom: 20 }}>
                Chúng tôi đề xuất <strong style={{ color: "#e8e8e8" }}>{topItemsText}</strong> là lối chơi tốt nhất cho {champion.name} trong meta hiện tại.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 700, paddingBottom: 8, borderBottom: "1px solid #2a2a2e" }}>
                  <div style={{ flex: 1 }}>Combo Trang Bị</div>
                  <div style={{ width: 80, textAlign: "center" }}>Hạng TB</div>
                  <div style={{ width: 80, textAlign: "center" }}>Win Rate</div>
                </div>
                
                {champion.best_builds?.slice(0, 5).map((build, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", paddingBottom: 8 }}>
                    <div style={{ flex: 1, display: "flex", gap: 4 }}>
                      {[build.item_1, build.item_2, build.item_3].map((itm, i) => (
                        <div key={i} title={itm.name} style={{ position: "relative", width: 28, height: 28, borderRadius: 4, overflow: "hidden", border: "1px solid #444" }}>
                          <Image src={itm.image} alt={itm.name} fill style={{ objectFit: "cover" }} unoptimized />
                        </div>
                      ))}
                    </div>
                    <div style={{ width: 80, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#10b981" }}>
                      {build.avg_placement}
                    </div>
                    <div style={{ width: 80, textAlign: "center", fontSize: 13, fontWeight: 600, color: "#ccc" }}>
                      {build.win_rate}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Build Table */}
            <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, border: "1px solid #2a2a2e", overflow: "hidden" }}>
               <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a2e", backgroundColor: "#25252b" }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f0b90b", margin: 0, textTransform: "uppercase" }}>Chi Tiết Build</h3>
               </div>
               <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                    <thead style={{ backgroundColor: "#1c1c21" }}>
                      <tr>
                        <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "#666", fontWeight: 700 }}>BUILD</th>
                        <th style={{ padding: "12px 20px", textAlign: "center", fontSize: 11, color: "#666", fontWeight: 700 }}>HẠNG TB</th>
                        <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 11, color: "#666", fontWeight: 700 }}>TỶ LỆ THẮNG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {champion.best_builds?.map((build, idx) => (
                        <tr key={idx} style={{ borderTop: "1px solid #2a2a2e", backgroundColor: idx % 2 === 0 ? "transparent" : "#1a1a1f" }}>
                          <td style={{ padding: "12px 20px", display: "flex", gap: 6 }}>
                            {[build.item_1, build.item_2, build.item_3].map((itm, i) => (
                              <div key={i} title={itm.name} style={{ position: "relative", width: 36, height: 36, borderRadius: 4, overflow: "hidden", border: "1px solid #444" }}>
                                <Image src={itm.image} alt={itm.name} fill style={{ objectFit: "cover" }} unoptimized />
                              </div>
                            ))}
                          </td>
                          <td style={{ padding: "12px 20px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>
                            {build.avg_placement}
                          </td>
                          <td style={{ padding: "12px 20px", textAlign: "right", fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>
                            {build.win_rate}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>

          {/* COLUMN 3: BEST INDIVIDUAL ITEMS */}
          <div style={{ backgroundColor: "#1e1e24", borderRadius: 8, padding: "20px", border: "1px solid #2a2a2e" }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "0 0 12px 0" }}>Trang Bị Hàng Đầu</h2>
            <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, marginBottom: 20 }}>
              Các trang bị đơn lẻ hoạt động hiệu quả nhất trên {champion.name}.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", fontSize: 11, color: "#666", textTransform: "uppercase", fontWeight: 700, paddingBottom: 8, borderBottom: "1px solid #2a2a2e" }}>
                <div style={{ flex: 1 }}>Trang bị</div>
                <div style={{ width: 60, textAlign: "center" }}>Hạng TB</div>
                <div style={{ width: 60, textAlign: "right" }}>Tần suất</div>
              </div>
              
              {champion.best_items?.map((b_item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", paddingBottom: 8 }}>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ position: "relative", width: 32, height: 32, borderRadius: 4, overflow: "hidden", border: "1px solid #444" }}>
                      <Image src={b_item.item.image} alt={b_item.item.name} fill style={{ objectFit: "cover" }} unoptimized />
                    </div>
                  </div>
                  <div style={{ width: 60, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#10b981" }}>
                    {b_item.avg_placement}
                  </div>
                  <div style={{ width: 60, textAlign: "right", fontSize: 12, fontWeight: 600, color: "#ccc" }}>
                    {b_item.pick_percent}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}