"use client";

import Link from "next/link";
import { useState } from "react";
import type { ApiChampionDetail } from "@/lib/types/champion";

import { TIER_HEX } from "@/lib/constants";
import { TFT, TFT_FONT } from "@/lib/tft-theme";
import ChampionFrame, { COST_COLOR } from "@/components/tft/ChampionFrame";
import ItemIcon from "@/components/tft/ItemIcon";
import TFTPanel from "@/components/tft/TFTPanel";
import SectionTitle from "@/components/tft/SectionTitle";
import TierBadge from "@/components/tft/TierBadge";

/* ─────────────────────────────────────────────────────────────────────────────
   Skill description formatter — TFT tooltip style (gold numbers, blue keywords)
   ───────────────────────────────────────────────────────────────────────────── */
function formatSkillDescription(desc: string): string {
  if (!desc) return "";

  let f = desc;
  f = f.replace(/\\n/g, "\n");
  f = f.replace(/@[a-zA-Z0-9_]+@/g, "");
  f = f.replace(/\s*\(\s*\)/g, "");
  f = f.replace(/[ \t]+/g, " ").trim();
  f = f.replace(/\n/g, "<br/>");

  // numbers placeholder
  f = f.replace(/(\d+(?:\.\d+)?%?(?:\/\d+(?:\.\d+)?%?)*)/g, "[[NUM:$1]]");
  f = f.replace(/(\[\[NUM:[^\]]+\]\])\s+\1/g, "$1");

  // sentence breaks
  f = f.replace(/([.!?])\s+(?=\p{Lu})/gu, "$1<br/><br/>");

  // Vietnamese stat labels → hextech blue
  f = f.replace(
    /(?:Sát Thương|Giảm|Hồi|Tốc|Thời|Sát thương|Năng lượng|Máu|Tỉ Lệ|Số)(?:\s+[\p{L}\s.]+?)?:/gu,
    (m) => `<br/><span style="color:${TFT.blueBright};font-weight:700;">${m}</span>`
  );

  f = f.replace(/(<br\/>\s*){3,}/g, "<br/><br/>");

  // Keyword tints — đổi sang palette TFT (vàng/teal/đỏ thay vì rainbow)
  const terms: { regex: RegExp; color: string }[] = [
    { regex: /(sát thương vật lý)/gi, color: "#f97316" },
    { regex: /(sát thương phép thuật|sát thương phép)/gi, color: TFT.blueBright },
    { regex: /(sát thương chuẩn)/gi, color: TFT.text },
    { regex: /(hồi máu|hồi phục)/gi, color: TFT.good },
    { regex: /(giáp)/gi, color: TFT.gold },
    { regex: /(kháng phép)/gi, color: TFT.blueBright },
    { regex: /(lá chắn|khiên)/gi, color: TFT.gold },
    { regex: /(tốc độ đánh|tốc đánh)/gi, color: "#fb923c" },
    { regex: /(năng lượng)/gi, color: "#60a5fa" },
    { regex: /(máu)/gi, color: TFT.bad },
    { regex: /(sức mạnh phép thuật|smpt)/gi, color: "#a78bfa" },
    { regex: /(làm choáng|hất tung|hoảng sợ)/gi, color: TFT.textDim },
  ];
  terms.forEach(({ regex, color }) => {
    f = f.replace(regex, `<span style="color:${color};font-weight:600;">$1</span>`);
  });

  // Restore numbers — màu vàng đậm
  f = f.replace(
    /\[\[NUM:(.*?)\]\]/g,
    `<span style="color:${TFT.gold};font-weight:800;">$1</span>`
  );
  f = f.replace(/^(<br\/>\s*)+/, "");
  return f;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */
function num(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return isNaN(v) ? null : v;
  const n = parseFloat(String(v));
  return isNaN(n) ? null : n;
}
const fPlace = (v: unknown) => {
  const n = num(v);
  return n != null ? n.toFixed(2) : "—";
};
const placeColor = (v: unknown) => {
  const n = num(v);
  if (n == null) return TFT.text;
  return n <= 3.5 ? TFT.good : n <= 4.2 ? TFT.gold : TFT.bad;
};

function placementToTier(avg: unknown): string {
  const n = num(avg) ?? 99;
  if (n <= 3.5) return "S";
  if (n <= 4.0) return "A";
  if (n <= 4.5) return "B";
  return "C";
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────────────────────────── */
export default function ChampionDetailClient({
  champion,
  traitImages = {},
}: {
  champion: ApiChampionDetail;
  traitImages?: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState<"skill" | "stats">("skill");
  const [activeItemTab, setActiveItemTab] = useState<"combo" | "priority">("combo");

  const costC = COST_COLOR[champion.cost] ?? COST_COLOR[1];
  const rankC = TIER_HEX[champion.rank] ?? TFT.gold;

  const topBuild = champion.best_builds?.[0];
  const topItemsText = topBuild
    ? `${topBuild.item_1.name}, ${topBuild.item_2.name}, ${topBuild.item_3.name}`
    : "các trang bị phù hợp";

  return (
    <div
      className="tft-page"
      style={{ fontFamily: TFT_FONT.body, padding: "24px 16px 80px" }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Breadcrumbs */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11,
            color: TFT.textMute,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 18,
          }}
        >
          <Link href="/" style={{ color: TFT.textMute, textDecoration: "none" }}>
            Trang Chủ
          </Link>
          <span>/</span>
          <Link href="/champions" style={{ color: TFT.textMute, textDecoration: "none" }}>
            Tướng
          </Link>
          <span>/</span>
          <span style={{ color: TFT.gold }}>{champion.name}</span>
        </div>

        {/* Responsive grid */}
        <style>{`
          .champ-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            align-items: start;
          }
          .items-top-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
          }
          @media (min-width: 1024px) {
            .champ-grid { grid-template-columns: 280px 1fr; }
            .items-top-grid { grid-template-columns: 1fr 1fr; }
          }
        `}</style>

        <div className="champ-grid">
          {/* ───────────── LEFT COLUMN ───────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Champion portrait */}
            <div style={{ paddingTop: 12 /* room for top ornament */ }}>
              <ChampionFrame
                cost={champion.cost}
                name={champion.name}
                image={champion.splash_path || champion.icon_path}
                imagePosition="75% 25%"
                interactive={false}
              >
                {champion.rank && (
                  <div style={{ position: "absolute", top: 6, left: 6, zIndex: 2 }}>
                    <span
                      className="tft-heading"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: 24,
                        height: 24,
                        padding: "0 7px",
                        fontSize: 12,
                        fontWeight: 900,
                        background: rankC,
                        color: "#000",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.55)",
                      }}
                    >
                      {champion.rank}
                    </span>
                  </div>
                )}
              </ChampionFrame>
            </div>

            {/* Stats summary panel */}
            <TFTPanel>
              <SectionTitle>Hiệu Suất</SectionTitle>
              <div style={{ padding: "16px" }}>
                {[
                  {
                    label: "Hạng Trung Bình",
                    value: fPlace(champion.avg_placement),
                    color: placeColor(champion.avg_placement),
                  },
                  { label: "Tỷ Lệ Thắng", value: champion.win_rate ?? "—", color: TFT.gold },
                  { label: "Tỷ Lệ Chọn", value: champion.pick_rate ?? "—", color: TFT.blueBright },
                  {
                    label: "Số Trận",
                    value:
                      typeof champion.games_played === "string"
                        ? parseInt(champion.games_played).toLocaleString("vi-VN")
                        : String(champion.games_played ?? "—"),
                    color: TFT.text,
                  },
                ].map((s, i, arr) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      padding: "11px 4px",
                      borderBottom: i < arr.length - 1 ? `1px solid ${TFT.lineSoft}` : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: TFT.textMute,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="tft-heading"
                      style={{
                        fontSize: 16,
                        fontWeight: 800,
                        color: s.color,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </TFTPanel>

            {/* Traits panel */}
            {champion.traits.length > 0 && (
              <TFTPanel>
                <SectionTitle>Tộc / Hệ</SectionTitle>
                <div
                  style={{
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  {champion.traits.map((trait) => {
                    const tImage = traitImages[trait.slug];
                    return (
                      <Link
                        key={trait.slug}
                        href={`/traits/${trait.slug}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          textDecoration: "none",
                          color: TFT.text,
                        }}
                      >
                        {tImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={tImage}
                            alt=""
                            style={{
                              width: 22,
                              height: 22,
                              objectFit: "contain",
                              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 22,
                              height: 22,
                              backgroundColor: TFT.lineSoft,
                              clipPath:
                                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                            }}
                          />
                        )}
                        <span
                          className="tft-heading"
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: TFT.text,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {trait.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </TFTPanel>
            )}
          </div>

          {/* ───────────── RIGHT COLUMN ───────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* HERO header (name + cost) */}
            <TFTPanel hero withCorners style={{ padding: "20px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                <h1
                  className="tft-heading"
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: TFT.goldBright,
                    margin: 0,
                    letterSpacing: "0.02em",
                    textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                  }}
                >
                  {champion.name}
                </h1>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 10px",
                    background: `linear-gradient(180deg, ${costC} 0%, ${costC}cc 100%)`,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    boxShadow: `inset 0 1px 0 ${TFT.goldDim}`,
                  }}
                >
                  {champion.cost} Vàng
                </span>
                {champion.rank && <TierBadge tier={champion.rank} size={28} />}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: TFT.textMute,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {champion.traits.map((t) => t.name).join(" • ")}
              </div>
            </TFTPanel>

            {/* Skill / Stats tab panel */}
            <TFTPanel>
              <div
                style={{
                  display: "flex",
                  borderBottom: `1px solid ${TFT.goldDim}`,
                  background: `linear-gradient(180deg, #1a2129 0%, ${TFT.panel} 100%)`,
                }}
              >
                {([
                  { key: "skill", label: "Kỹ Năng" },
                  { key: "stats", label: "Số Liệu" },
                ] as const).map((t) => {
                  const active = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className="tft-heading"
                      suppressHydrationWarning
                      style={{
                        flex: 1,
                        padding: "12px 0",
                        background: "none",
                        border: "none",
                        borderBottom: active
                          ? `2px solid ${TFT.gold}`
                          : "2px solid transparent",
                        color: active ? TFT.goldBright : TFT.textDim,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ padding: "20px" }}>
                {activeTab === "skill" && champion.skill && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                      <ItemIcon
                        src={champion.skill.icon_path}
                        alt={champion.skill.name}
                        size={56}
                        borderColor={costC}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3
                          className="tft-heading"
                          style={{
                            margin: "0 0 6px 0",
                            fontSize: 18,
                            fontWeight: 700,
                            color: TFT.goldBright,
                            letterSpacing: "0.02em",
                          }}
                        >
                          {champion.skill.name}
                        </h3>
                        {/* Mana bar — hextech style */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div
                            style={{
                              flex: 1,
                              maxWidth: 140,
                              height: 8,
                              background: TFT.panelSoft,
                              border: `1px solid ${TFT.lineSoft}`,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                inset: 0,
                                width: `${
                                  champion.skill.mana_max
                                    ? Math.min(
                                        100,
                                        (champion.skill.mana_start /
                                          champion.skill.mana_max) *
                                          100
                                      )
                                    : 0
                                }%`,
                                background: `linear-gradient(90deg, ${TFT.blue} 0%, ${TFT.blueBright} 100%)`,
                              }}
                            />
                          </div>
                          <span
                            className="tft-heading"
                            style={{
                              fontSize: 12,
                              color: TFT.blueBright,
                              fontWeight: 800,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {champion.skill.mana_start} / {champion.skill.mana_max}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        background: TFT.panelSoft,
                        border: `1px solid ${TFT.lineSoft}`,
                        padding: "14px 16px",
                        fontSize: 13,
                        color: TFT.text,
                        lineHeight: 1.7,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formatSkillDescription(champion.skill.description),
                      }}
                    />
                  </div>
                )}

                {activeTab === "stats" && champion.base_stats && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 0 }}>
                    {Object.entries(champion.base_stats).map(([key, val], i, arr) => (
                      <div
                        key={key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "10px 4px",
                          borderBottom:
                            i < arr.length - 1 ? `1px solid ${TFT.lineSoft}` : "none",
                        }}
                      >
                        <span
                          style={{
                            color: TFT.textMute,
                            fontSize: 11,
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {key}
                        </span>
                        <span
                          className="tft-heading"
                          style={{
                            color: TFT.gold,
                            fontSize: 14,
                            fontWeight: 800,
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TFTPanel>

            {/* Top 5 builds + items */}
            <div className="items-top-grid">
              {/* Lối Chơi Đề Xuất */}
              <TFTPanel>
                <SectionTitle>Lối Chơi Đề Xuất</SectionTitle>
                <div style={{ padding: "16px" }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: TFT.textDim,
                      lineHeight: 1.6,
                      margin: "0 0 14px 0",
                    }}
                  >
                    Đề xuất combo{" "}
                    <strong style={{ color: TFT.gold, fontWeight: 700 }}>{topItemsText}</strong>{" "}
                    là lối chơi tốt nhất cho {champion.name}.
                  </p>

                  <BuildHeader />
                  {champion.best_builds?.slice(0, 5).map((build, idx) => (
                    <BuildRow key={idx} build={build} />
                  ))}
                </div>
              </TFTPanel>

              {/* Trang Bị Hàng Đầu */}
              <TFTPanel>
                <SectionTitle>Trang Bị Hàng Đầu</SectionTitle>
                <div style={{ padding: "16px" }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: TFT.textDim,
                      lineHeight: 1.6,
                      margin: "0 0 14px 0",
                    }}
                  >
                    Các trang bị đơn lẻ hoạt động hiệu quả nhất trên {champion.name}.
                  </p>
                  <ItemHeader />
                  {champion.best_items?.slice(0, 5).map((b, idx) => (
                    <ItemRow key={idx} bestItem={b} />
                  ))}
                </div>
              </TFTPanel>
            </div>

            {/* Bottom — Detailed tables */}
            <TFTPanel>
              <div
                style={{
                  display: "flex",
                  borderBottom: `1px solid ${TFT.goldDim}`,
                  background: `linear-gradient(180deg, #1a2129 0%, ${TFT.panel} 100%)`,
                }}
              >
                {([
                  { key: "combo", label: "Chi Tiết Lối Chơi" },
                  { key: "priority", label: "Chi Tiết Trang Bị" },
                ] as const).map((t) => {
                  const active = activeItemTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveItemTab(t.key)}
                      className="tft-heading"
                      suppressHydrationWarning
                      style={{
                        padding: "14px 22px",
                        background: "none",
                        border: "none",
                        borderBottom: active
                          ? `2px solid ${TFT.gold}`
                          : "2px solid transparent",
                        color: active ? TFT.goldBright : TFT.textDim,
                        fontSize: 12,
                        fontWeight: 800,
                        cursor: "pointer",
                        textTransform: "uppercase",
                        letterSpacing: "0.14em",
                      }}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ overflowX: "auto" }}>
                {activeItemTab === "combo" && (
                  <DetailTable
                    rows={(champion.best_builds ?? []).map((b, i) => ({
                      key: i,
                      first: (
                        <div style={{ display: "flex", gap: 8 }}>
                          {[b.item_1, b.item_2, b.item_3].map((it, k) => (
                            <ItemIcon
                              key={k}
                              src={it.image}
                              alt={it.name}
                              size={36}
                              borderColor={TFT.goldDim}
                              glow={false}
                              title={it.name}
                            />
                          ))}
                        </div>
                      ),
                      tier: placementToTier(b.avg_placement),
                      avg: b.avg_placement,
                      right: b.win_rate,
                      rightLabel: "Tỷ Lệ Thắng",
                    }))}
                    firstLabel="Combo Trang Bị"
                    rightLabel="Tỷ Lệ Thắng"
                  />
                )}

                {activeItemTab === "priority" && (
                  <DetailTable
                    rows={(champion.best_items ?? []).map((b, i) => ({
                      key: i,
                      first: (
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <ItemIcon
                            src={b.item.image}
                            alt={b.item.name}
                            size={36}
                            borderColor={TFT.goldDim}
                            glow={false}
                          />
                          <span
                            className="tft-heading"
                            style={{ fontSize: 13, fontWeight: 700, color: TFT.text }}
                          >
                            {b.item.name}
                          </span>
                        </div>
                      ),
                      tier: placementToTier(b.avg_placement),
                      avg: b.avg_placement,
                      right: b.pick_percent,
                      rightLabel: "Tần Suất",
                    }))}
                    firstLabel="Trang Bị"
                    rightLabel="Tần Suất"
                  />
                )}
              </div>
            </TFTPanel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Build / Item summary rows
   ───────────────────────────────────────────────────────────────────────────── */
function BuildHeader() {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 9,
        color: TFT.textMute,
        textTransform: "uppercase",
        fontWeight: 700,
        letterSpacing: "0.1em",
        paddingBottom: 8,
        borderBottom: `1px solid ${TFT.lineSoft}`,
        marginBottom: 6,
      }}
    >
      <div style={{ flex: 1 }}>Combo</div>
      <div style={{ width: 38, textAlign: "center" }}>Tier</div>
      <div style={{ width: 56, textAlign: "center" }}>Hạng TB</div>
      <div style={{ width: 60, textAlign: "right" }}>Win</div>
    </div>
  );
}

function BuildRow({
  build,
}: {
  build: {
    item_1: { image: string; name: string };
    item_2: { image: string; name: string };
    item_3: { image: string; name: string };
    avg_placement: number;
    win_rate: string;
  };
}) {
  const tier = placementToTier(build.avg_placement);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${TFT.lineSoft}`,
      }}
    >
      <div style={{ flex: 1, display: "flex", gap: 5 }}>
        {[build.item_1, build.item_2, build.item_3].map((it, i) => (
          <ItemIcon
            key={i}
            src={it.image}
            alt={it.name}
            size={28}
            borderColor={TFT.goldDim}
            glow={false}
            title={it.name}
          />
        ))}
      </div>
      <div style={{ width: 38, textAlign: "center" }}>
        <TierBadge tier={tier} size={22} />
      </div>
      <div
        className="tft-heading"
        style={{
          width: 56,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 800,
          color: placeColor(build.avg_placement),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fPlace(build.avg_placement)}
      </div>
      <div
        className="tft-heading"
        style={{
          width: 60,
          textAlign: "right",
          fontSize: 13,
          fontWeight: 700,
          color: TFT.gold,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {build.win_rate}
      </div>
    </div>
  );
}

function ItemHeader() {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 9,
        color: TFT.textMute,
        textTransform: "uppercase",
        fontWeight: 700,
        letterSpacing: "0.1em",
        paddingBottom: 8,
        borderBottom: `1px solid ${TFT.lineSoft}`,
        marginBottom: 6,
      }}
    >
      <div style={{ flex: 1 }}>Trang Bị</div>
      <div style={{ width: 38, textAlign: "center" }}>Tier</div>
      <div style={{ width: 56, textAlign: "center" }}>Hạng TB</div>
      <div style={{ width: 60, textAlign: "right" }}>Tần Suất</div>
    </div>
  );
}

function ItemRow({
  bestItem,
}: {
  bestItem: {
    item: { image: string; name: string };
    avg_placement: number;
    pick_percent: string;
  };
}) {
  const tier = placementToTier(bestItem.avg_placement);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid ${TFT.lineSoft}`,
      }}
    >
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <ItemIcon
          src={bestItem.item.image}
          alt={bestItem.item.name}
          size={28}
          borderColor={TFT.goldDim}
          glow={false}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: TFT.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            letterSpacing: "0.02em",
          }}
        >
          {bestItem.item.name}
        </span>
      </div>
      <div style={{ width: 38, textAlign: "center" }}>
        <TierBadge tier={tier} size={22} />
      </div>
      <div
        className="tft-heading"
        style={{
          width: 56,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 800,
          color: placeColor(bestItem.avg_placement),
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {fPlace(bestItem.avg_placement)}
      </div>
      <div
        className="tft-heading"
        style={{
          width: 60,
          textAlign: "right",
          fontSize: 13,
          fontWeight: 700,
          color: TFT.blueBright,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {bestItem.pick_percent}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Detail table (large)
   ───────────────────────────────────────────────────────────────────────────── */
function DetailTable({
  rows,
  firstLabel,
  rightLabel,
}: {
  rows: {
    key: number;
    first: React.ReactNode;
    tier: string;
    avg: number | string;
    right: string;
    rightLabel: string;
  }[];
  firstLabel: string;
  rightLabel: string;
}) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
      <thead>
        <tr style={{ background: TFT.panelSoft }}>
          {[firstLabel, "Tier", "Hạng TB", rightLabel].map((h, i) => (
            <th
              key={i}
              style={{
                padding: "12px 18px",
                textAlign: i === 0 ? "left" : i === 3 ? "right" : "center",
                fontSize: 10,
                color: TFT.gold,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                borderBottom: `1px solid ${TFT.line}`,
                fontFamily: TFT_FONT.heading,
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, idx) => (
          <tr
            key={r.key}
            style={{
              background: idx % 2 === 0 ? "transparent" : TFT.panelSoft,
              borderBottom: `1px solid ${TFT.lineSoft}`,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = TFT.panelAlt)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : TFT.panelSoft)
            }
          >
            <td style={{ padding: "12px 18px" }}>{r.first}</td>
            <td style={{ padding: "12px 18px", textAlign: "center" }}>
              <TierBadge tier={r.tier} size={24} />
            </td>
            <td
              className="tft-heading"
              style={{
                padding: "12px 18px",
                textAlign: "center",
                fontSize: 16,
                fontWeight: 800,
                color: placeColor(r.avg),
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fPlace(r.avg)}
            </td>
            <td
              className="tft-heading"
              style={{
                padding: "12px 18px",
                textAlign: "right",
                fontSize: 14,
                fontWeight: 700,
                color: TFT.text,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {r.right}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
