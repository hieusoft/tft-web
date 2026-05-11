"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { ApiItem } from "@/lib/api-client";

// ── 1. Constants & Helpers ───────────────────────────────────────────────────
const TIER_COLOR: Record<string, string> = {
  S: "#f87171", A: "#fb923c", B: "#facc15", C: "#4ade80", D: "#9ca3af",
};

const STAT_COLORS: Record<string, string> = {
  AD: "#ff6b6b", AP: "#a855f7", AS: "#facc15", HP: "#4ade80",
  Armor: "#f97316", MR: "#60a5fa", Mana: "#3b82f6", Crit: "#ef4444", default: "#d1d5db",
};

function parseStatKey(key: string): { label: string; color: string; type: string } {
  let cleanedKey = key.replace(/^scale/i, "").trim();
  let statType = "default";

  if (/AD|DA|Damage|Vật lý/i.test(cleanedKey)) statType = "AD";
  else if (/AP|Ability/i.test(cleanedKey)) statType = "AP";
  else if (/AS|Speed|Tốc/i.test(cleanedKey)) statType = "AS";
  else if (/HP|Health|Máu/i.test(cleanedKey)) statType = "HP";
  else if (/Armor|Giáp/i.test(cleanedKey)) statType = "Armor";
  else if (/MR|Resist|Kháng/i.test(cleanedKey)) statType = "MR";
  else if (/Mana|Năng lượng/i.test(cleanedKey)) statType = "Mana";
  else if (/Crit|Chí mạng/i.test(cleanedKey)) statType = "Crit";

  let label = cleanedKey
    .replace(/:\s*[+-]?\d+%?$/, "")
    .replace(/Bonus/i, "")
    .replace(/manaregen/i, "Hồi Mana")
    .replace(/CritChance/i, "Tỉ Lệ Chí Mạng")
    .replace(/Armor/i, "Giáp")
    .trim();

  return { label, color: STAT_COLORS[statType] ?? STAT_COLORS.default, type: statType };
}

// Hàm kiểm tra an toàn xem Component có đúng format không (giống ItemsClient)
function isComponentObj(v: unknown): v is { name: string; image: string } {
  return typeof v === "object" && v !== null && "image" in v && "name" in v;
}

// ── 2. SVG Icons & Badges ────────────────────────────────────────────────────
function StatIcon({ type, color }: { type: string; color: string }) {
  const svgProps = { width: 16, height: 16, fill: color, viewBox: "0 0 24 24", style: { flexShrink: 0 } };
  switch (type) {
    case "AD": return <svg {...svgProps}><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-1.25 0-2.68.38-4.32 2.06L12 6.4l5.6 5.6 1.34-1.34C20.62 9.02 21 7.59 21 6.34 21 4.35 19.65 3 17.66 3M5.16 11l-2 2 4.84 4.84L3 22h3l4.16-4.16L15 22.68l2-2-11.84-11.84z" /></svg>;
    case "AP": return <svg {...svgProps}><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" /></svg>;
    case "AS": return <svg {...svgProps}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>;
    case "HP": return <svg {...svgProps}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>;
    case "Armor": return <svg {...svgProps}><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" /></svg>;
    case "MR": return <svg {...svgProps}><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.31l7 3.89v7.6l-7 3.89-7-3.89V8.2l7-3.89z" /></svg>;
    case "Mana": return <svg {...svgProps}><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" /></svg>;
    case "Crit": return <svg {...svgProps}><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" /></svg>;
    default: return <svg {...svgProps}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg>;
  }
}

function CategoryBadge({ category }: { category: string }) {
  let bg = "#1f2937", text = "#9ca3af", border = "#374151";
  if (category.includes("Ánh Sáng")) { bg = "rgba(250, 204, 21, 0.15)"; text = "#fde047"; border = "rgba(250, 204, 21, 0.3)"; }
  else if (category.includes("Tạo Tác")) { bg = "rgba(248, 113, 113, 0.15)"; text = "#f87171"; border = "rgba(248, 113, 113, 0.3)"; }
  else if (category.includes("Tộc/Hệ") || category.includes("Ấn")) { bg = "rgba(45, 212, 191, 0.15)"; text = "#2dd4bf"; border = "rgba(45, 212, 191, 0.3)"; }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 700,
      background: bg, color: text, border: `1px solid ${border}`,
      textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap"
    }}>{category}</span>
  );
}

// ── 3. COMPONENTS MỚI (Xử lý ảnh chuẩn như ItemsClient) ───────────────

function RecipePiece({ name, image }: { name: string; image: string }) {
  const [err, setErr] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 6, overflow: "hidden",
        background: "#111", position: "relative", flexShrink: 0,
        border: "1px solid #3a3d45",
      }}>
        {!err ? (
          <Image src={image} alt={name} fill sizes="30px" style={{ objectFit: "contain", padding: 1, imageRendering: "pixelated" }} unoptimized onError={() => setErr(true)} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6b7280" }}>?</div>
        )}
      </div>
      {/* Hiện luôn tên đồ ghép cho trực quan */}
      <span style={{ fontSize: 13, color: "#d1d5db", fontWeight: 600 }}>{name}</span>
    </div>
  );
}

function ChampionRow({ user, idx }: { user: any, idx: number }) {
  const [err, setErr] = useState(false);

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, padding: "16px 24px",
      borderBottom: "1px solid #222", background: idx % 2 === 0 ? "transparent" : "#131418",
      transition: "background 0.2s", cursor: "pointer"
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#1f222b")}
      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : "#131418")}
    >
      <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", border: "2px solid #374151", position: "relative", flexShrink: 0, background: "#111" }}>
        {!err ? (
          <Image src={user.champion.icon_path} alt={user.champion.name} fill sizes="44px" style={{ objectFit: "cover", imageRendering: "pixelated" }} unoptimized onError={() => setErr(true)} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#6b7280", fontWeight: 800 }}>?</div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#e5e7eb", marginBottom: 4 }}>{user.champion.name}</div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          Hạng TB: <strong style={{ color: user.avg_placement <= 4 ? "#4ade80" : "#facc15" }}>{Number(user.avg_placement).toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: "#60a5fa" }}>{user.pick_percent}</div>
        <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", fontWeight: 700 }}>Tỷ lệ chọn</div>
      </div>
    </div>
  );
}

// ── 4. MAIN COMPONENT ────────────────────────────────────────────────────────
export default function ItemDetailClient({ item }: { item: ApiItem }) {
  const [imgErr, setImgErr] = useState(false);

  const rank = item.rank ?? "D";
  const tc = TIER_COLOR[rank] ?? "#9ca3af";
  const imgSrc = item.icon_path ?? item.image ?? null;
  const category = item.category || "Khác";

  const isRadiant = category.includes("Ánh Sáng");
  const isArtifact = category.includes("Tạo Tác");
  const isSupport = category.includes("Hỗ Trợ");

  let glowColor = `${tc}40`;
  let borderHighlight = `1px solid #2a2d35`;
  if (isRadiant) { glowColor = "rgba(250, 204, 21, 0.3)"; borderHighlight = "1px solid rgba(250, 204, 21, 0.4)"; }
  else if (isArtifact) { glowColor = "rgba(248, 113, 113, 0.3)"; borderHighlight = "1px solid rgba(248, 113, 113, 0.4)"; }

  // Stats
  const statEntries: { label: string; value: string; color: string; type: string }[] = [];
  if (item.stats) {
    if (Array.isArray(item.stats)) {
      (item.stats as { key: string; label: string; value: string }[]).forEach(s => {
        const parsed = parseStatKey(s.label ?? s.key);
        statEntries.push({ label: parsed.label, value: s.value, color: parsed.color, type: parsed.type });
      });
    } else {
      Object.entries(item.stats as Record<string, string>).forEach(([k, v]) => {
        const parsed = parseStatKey(k);
        statEntries.push({ label: parsed.label, value: String(v), color: parsed.color, type: parsed.type });
      });
    }
  }

  // Des
  let desc = item.description ? String(item.description).replace(/\[.*?\]/g, "") : null;
  let isUncraftable = isRadiant || isArtifact || isSupport;

  if (desc) {
    const escapedName = item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    desc = desc.replace(new RegExp('^' + escapedName, 'i'), "").trim();
    desc = desc.replace(/^\+?\s*\d+%?\s*/, "").trim();
    const uncraftableRegex = /không thể ghép\.?/i;
    if (uncraftableRegex.test(desc)) {
      isUncraftable = true;
      desc = desc.replace(uncraftableRegex, "").trim();
    }
    desc = desc.replace(/^[^a-zA-ZÀ-ỹ0-9]*/, "").replace(/\s+/g, " ").trim();
  }

  // Parse components chuẩn chỉ theo ItemsClient
  const comp1 = isComponentObj(item.component_1) ? item.component_1 : null;
  const comp2 = isComponentObj(item.component_2) ? item.component_2 : null;
  const hasRecipe = comp1 || comp2;
  const isBaseComponent = !hasRecipe && !isUncraftable && category.includes("Thường");

  return (
    <div style={{ background: "#0a0a0c", minHeight: "100vh", color: "#e5e7eb", padding: "30px 20px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── BREADCRUMBS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: -4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
            <Link href="/" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#d1d5db"} onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}>Trang Chủ</Link>
            <span style={{ fontSize: 10 }}>❯</span>
            <Link href="/items" style={{ color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.color = "#d1d5db"} onMouseLeave={(e) => e.currentTarget.style.color = "#6b7280"}>Trang Bị</Link>
            <span style={{ fontSize: 10 }}>❯</span>
            <span style={{ color: "#fbbf24" }}>{item.name}</span>
          </div>

          <Link href="/items" style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", background: "#181a20",
            border: "1px solid #2a2d35", borderRadius: 8,
            fontSize: 13, color: "#d1d5db", fontWeight: 600, textDecoration: "none",
            transition: "all 0.2s", cursor: "pointer"
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#22252e"; e.currentTarget.style.borderColor = "#3a3d45"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#181a20"; e.currentTarget.style.borderColor = "#2a2d35"; }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </Link>
        </div>

        {/* ── HEADER BANNERS ── */}
        <div style={{
          background: "linear-gradient(145deg, #181a20 0%, #111216 100%)",
          border: borderHighlight, borderRadius: 20, padding: "28px 32px",
          display: "flex", gap: 32, flexWrap: "wrap", alignItems: "flex-start",
          boxShadow: `0 20px 50px rgba(0,0,0,0.5), inset 0 0 60px ${glowColor.replace('0.3', '0.05')}`
        }}>
          {/* Main Avatar (Đã chuẩn hoá) */}
          <div style={{
            width: 100, height: 100, borderRadius: 20, overflow: "hidden", flexShrink: 0,
            background: "#000", position: "relative",
            border: `2px solid ${tc}`, boxShadow: `0 0 30px ${glowColor}`
          }}>
            {imgSrc && !imgErr ? (
              <Image
                src={imgSrc} alt={item.name} fill sizes="100px"
                style={{ objectFit: "contain", padding: 4, imageRendering: "pixelated" }}
                unoptimized onError={() => setImgErr(true)}
              />
            ) : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>⚔️</div>}
          </div>

          <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 32, height: 32, borderRadius: 8, fontSize: 18, fontWeight: 900,
                background: tc, color: "#000", boxShadow: `0 0 15px ${tc}80`
              }}>{rank}</span>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>{item.name}</h1>
            </div>

            <div style={{ marginBottom: 16 }}><CategoryBadge category={category} /></div>

            {/* Stats Row */}
            {statEntries.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px 28px", marginBottom: 16 }}>
                {statEntries.map(({ label, value, color, type }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <StatIcon type={type} color={color} />
                    <span style={{ fontSize: 20, fontWeight: 800, color }}>{value}</span>
                    <span style={{ fontSize: 12, color: "#8b8f99", fontWeight: 600, textTransform: "uppercase" }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Description ở Header */}
            {desc && (
              <div style={{
                fontSize: 15, color: "#d1d5db", lineHeight: 1.6,
                marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #2a2d35"
              }}>
                {desc.replace(/\.\s+/g, ".\n").split("\n").map((sentence) => sentence.trim()).filter(s => s.length > 0).map((sentence, i) => {
                  const finalSentence = /[.!?…"']$/.test(sentence) ? sentence : sentence + ".";
                  const formattedHTML = finalSentence
                    .replace(/^([^:]{2,30}):/g, '<strong style="color: #60a5fa; text-transform: capitalize;">$1:</strong>')
                    .replace(/(\d+(?:\.\d+)?%)/g, '<strong style="color: #fbbf24;">$1</strong>')
                    .replace(/(\d+\s*giây)/gi, '<strong style="color: #fbbf24;">$1</strong>');
                  return <span key={i} style={{ display: "block", marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: formattedHTML }} />;
                })}
              </div>
            )}

            {/* Recipe Rendering (Dùng Component RecipePiece mới) */}
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              {hasRecipe && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", background: "#1a1d24", borderRadius: 10, border: "1px solid #333740" }}>
                  <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ghép Từ:</span>
                  {comp1 && <RecipePiece name={comp1.name} image={comp1.image} />}
                  {comp1 && comp2 && <span style={{ fontSize: 18, color: "#6b7280", fontWeight: 800 }}>+</span>}
                  {comp2 && <RecipePiece name={comp2.name} image={comp2.image} />}
                </div>
              )}
              {isUncraftable && (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: isRadiant ? "#fde047" : "#f87171", fontStyle: "italic", fontWeight: 600, padding: "10px 16px", background: isRadiant ? "rgba(250, 204, 21, 0.1)" : "rgba(248, 113, 113, 0.1)", borderRadius: 10 }}>
                  {isRadiant ? "✨ Đặc biệt: Nhận từ Lõi hoặc Nâng cấp" : "🚫 Không thể ghép từ đồ cơ bản"}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, alignItems: "start" }}>

          {/* Left*/}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Base item builds into... */}
            {isBaseComponent && (
              <div style={{ background: "#181a20", border: "1px solid #2a2d35", borderRadius: 16, padding: "24px" }}>
                <h3 style={{ fontSize: 14, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, margin: "0 0 16px 0" }}>Có thể ghép thành</h3>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Đang cập nhật...</div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Hạng Trung Bình", value: item.avg_placement ? Number(item.avg_placement).toFixed(2) : "—", color: item.avg_placement && item.avg_placement <= 4 ? "#4ade80" : "#facc15" },
                { label: "Tỷ Lệ Thắng", value: item.win_rate || "—", color: "#f3f4f6" },
                { label: "Tần Suất", value: item.pick_rate || "—", color: "#60a5fa" },
                { label: "Số Ván Chơi", value: item.games_played ? Number(item.games_played).toLocaleString("vi-VN") : "—", color: "#9ca3af" }
              ].map((stat, i) => (
                <div key={i} style={{ background: "#181a20", border: "1px solid #2a2d35", borderRadius: 16, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Champ commend */}
          <div style={{ background: "#181a20", border: "1px solid #2a2d35", borderRadius: 16, overflow: "hidden", position: "sticky", top: 24 }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #2a2d35", background: "linear-gradient(to right, #181a20, #1a1d24)" }}>
              <h3 style={{ fontSize: 16, color: "#fff", fontWeight: 800, margin: "0 0 4px 0" }}>Tướng Khuyên Dùng</h3>
              <div style={{ fontSize: 12, color: "#8b8f99" }}>Những vị tướng phát huy tối đa sức mạnh</div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {item.best_users && item.best_users.length > 0 ? (
                item.best_users.slice(0, 10).map((user, idx) => (
                  <ChampionRow key={idx} user={user} idx={idx} />
                ))
              ) : (
                <div style={{ padding: "32px", textAlign: "center", color: "#6b7280", fontSize: 14 }}>Chưa có dữ liệu tướng</div>
              )}
            </div>

            {item.best_users && item.best_users.length > 10 && (
              <div style={{ padding: "12px", textAlign: "center", background: "#111216" }}>
                <button style={{ background: "transparent", border: "none", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Xem thêm {item.best_users.length - 10} tướng...
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}