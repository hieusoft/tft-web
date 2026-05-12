"use client";

import Link from "next/link";
import type { ApiItem } from "@/lib/api-client";
import { TFT, TFT_FONT } from "@/lib/tft-theme";
import ItemIcon from "@/components/tft/ItemIcon";
import SectionTitle from "@/components/tft/SectionTitle";
import TFTPanel from "@/components/tft/TFTPanel";
import TierBadge from "@/components/tft/TierBadge";
import CategoryTag from "@/components/tft/CategoryTag";

/* ─────────────────────────────────────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────────────────────────────────────── */
function parseStatKey(key: string): { label: string } {
  let s = key.replace(/^scale/i, "").trim();
  s = s
    .replace(/:\s*[+-]?\d+%?$/, "")
    .replace(/Bonus/i, "")
    .replace(/manaregen/i, "Hồi Mana")
    .replace(/CritChance/i, "Tỉ Lệ Chí Mạng")
    .replace(/Armor/i, "Giáp")
    .replace(/AD\b/, "Sát Thương")
    .replace(/AP\b/, "Sức Mạnh Phép")
    .replace(/AS\b/, "Tốc Đánh")
    .replace(/HP\b/, "Máu")
    .replace(/MR\b/, "Kháng Phép")
    .trim();
  return { label: s };
}

function isComponentObj(v: unknown): v is { name: string; image: string } {
  return typeof v === "object" && v !== null && "image" in v && "name" in v;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Recipe piece — vertical icon + name caption
   ───────────────────────────────────────────────────────────────────────────── */
function RecipePiece({ name, image, size = 56 }: { name: string; image: string; size?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: size }}>
      <ItemIcon src={image} alt={name} size={size} borderColor={TFT.goldDim} glow={false} />
      <span
        style={{
          fontSize: 11,
          color: TFT.textDim,
          fontWeight: 600,
          textAlign: "center",
          maxWidth: size + 24,
          lineHeight: 1.2,
          letterSpacing: "0.02em",
        }}
      >
        {name}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Champion row — TFT statline style
   ───────────────────────────────────────────────────────────────────────────── */
function ChampionRow({ user, idx }: { user: any; idx: number }) {
  const placement = Number(user.avg_placement);
  const placementColor = placement <= 4 ? TFT.good : placement <= 4.5 ? TFT.gold : TFT.textDim;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 18px",
        borderBottom: `1px solid ${TFT.lineSoft}`,
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = TFT.panelAlt)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{ width: 26, fontSize: 12, color: TFT.textMute, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
        #{idx + 1}
      </div>

      <ItemIcon src={user.champion.icon_path} alt={user.champion.name} size={40} borderColor={TFT.goldDim} glow={false} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: TFT.text, marginBottom: 2, letterSpacing: "0.01em" }}>
          {user.champion.name}
        </div>
        <div style={{ fontSize: 11, color: TFT.textMute, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Hạng TB <span style={{ color: placementColor, fontWeight: 800 }}>{placement.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: TFT.gold, fontVariantNumeric: "tabular-nums", fontFamily: TFT_FONT.heading }}>
          {user.pick_percent}
        </div>
        <div style={{ fontSize: 9, color: TFT.textMute, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.08em" }}>
          Tần suất
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main
   ───────────────────────────────────────────────────────────────────────────── */
export default function ItemDetailClient({
  item,
  buildsInto = [],
}: {
  item: ApiItem;
  buildsInto?: { id: number; name: string; slug: string; image: string }[];
}) {
  const rank = item.rank ?? "D";
  const imgSrc = item.icon_path ?? item.image ?? null;
  const category = item.category || "Khác";

  const isRadiant = category.includes("Ánh Sáng");
  const isArtifact = category.includes("Tạo Tác");
  const isSupport = category.includes("Hỗ Trợ");

  const statEntries: { label: string; value: string }[] = [];
  if (item.stats) {
    if (Array.isArray(item.stats)) {
      (item.stats as { key: string; label: string; value: string }[]).forEach((s) => {
        const parsed = parseStatKey(s.label ?? s.key);
        statEntries.push({ label: parsed.label, value: s.value });
      });
    } else {
      Object.entries(item.stats as Record<string, string>).forEach(([k, v]) => {
        const parsed = parseStatKey(k);
        statEntries.push({ label: parsed.label, value: String(v) });
      });
    }
  }

  let desc = item.description ? String(item.description) : null;
  let isUncraftable = isRadiant || isArtifact || isSupport;

  if (desc) {
    desc = desc.replace(/<br\s*\/?>/gi, "\n");
    desc = desc.replace(/\[.*?\]/g, "");
    const escapedName = item.name.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    desc = desc.replace(new RegExp("^" + escapedName, "i"), "").trim();
    desc = desc.replace(/^\+?\s*\d+%?\s*/, "").trim();
    const uncraftableRegex = /không thể ghép\.?/i;
    if (uncraftableRegex.test(desc)) {
      isUncraftable = true;
      desc = desc.replace(uncraftableRegex, "").trim();
    }
    desc = desc.replace(/^[^a-zA-ZÀ-ỹ0-9]*/, "");
    desc = desc.replace(/tft_[a-zA-Z0-9_]+/gi, "");
    desc = desc.replace(/[ \t]+/g, " ").trim();
  }

  const comp1 = isComponentObj(item.component_1) ? item.component_1 : null;
  const comp2 = isComponentObj(item.component_2) ? item.component_2 : null;
  const hasRecipe = comp1 || comp2;
  const isBaseComponent = !hasRecipe && !isUncraftable && category.includes("Thường");

  return (
    <div
      className="tft-page"
      style={{
        padding: "24px 16px 60px",
        fontFamily: TFT_FONT.body,
      }}
    >
      <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
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
          }}
        >
          <Link href="/" style={{ color: TFT.textMute, textDecoration: "none" }}>Trang Chủ</Link>
          <span>/</span>
          <Link href="/items" style={{ color: TFT.textMute, textDecoration: "none" }}>Trang Bị</Link>
          <span>/</span>
          <span style={{ color: TFT.gold }}>{item.name}</span>
        </div>

        {/* HERO */}
        <TFTPanel hero withCorners style={{ padding: "24px 28px", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <ItemIcon src={imgSrc} alt={item.name} size={120} />

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <TierBadge tier={rank} size={28} />
              <h1
                className="tft-heading"
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: TFT.goldBright,
                  margin: 0,
                  textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                }}
              >
                {item.name}
              </h1>
            </div>

            <div style={{ marginBottom: 16 }}>
              <CategoryTag category={category} />
            </div>

            {statEntries.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px 24px",
                  marginBottom: 14,
                  paddingBottom: 14,
                  borderBottom: `1px solid ${TFT.line}`,
                }}
              >
                {statEntries.map(({ label, value }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      className="tft-heading"
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: TFT.gold,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {value.startsWith("+") || value.startsWith("-") ? value : `+${value}`}
                    </span>
                    <span style={{ fontSize: 13, color: TFT.textDim, fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            {desc && (
              <div style={{ fontSize: 14, color: TFT.text, lineHeight: 1.65 }}>
                {desc
                  .replace(/\.\s+/g, ".\n")
                  .split("\n")
                  .map((s) => s.trim())
                  .filter((s) => s.length > 0)
                  .map((sentence, i) => {
                    const finalSentence = /[.!?…"']$/.test(sentence) ? sentence : sentence + ".";
                    const html = finalSentence
                      .replace(/^([^:]{2,30}):/g, `<span style="color:${TFT.blueBright};font-weight:700;">$1:</span>`)
                      .replace(/(\d+(?:\.\d+)?%)/g, `<span style="color:${TFT.gold};font-weight:700;">$1</span>`)
                      .replace(/(\d+\s*giây)/gi, `<span style="color:${TFT.gold};font-weight:700;">$1</span>`);
                    return <p key={i} style={{ margin: "0 0 6px 0" }} dangerouslySetInnerHTML={{ __html: html }} />;
                  })}
              </div>
            )}
          </div>
        </TFTPanel>

        {/* RECIPE */}
        {hasRecipe && (
          <TFTPanel>
            <SectionTitle>Công Thức Ghép</SectionTitle>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 18,
                padding: "24px 12px 20px",
                flexWrap: "wrap",
              }}
            >
              {comp1 && <RecipePiece name={comp1.name} image={comp1.image} />}
              {comp1 && comp2 && (
                <span style={{ fontSize: 22, color: TFT.goldDim, fontWeight: 300, marginTop: -22 }}>＋</span>
              )}
              {comp2 && <RecipePiece name={comp2.name} image={comp2.image} />}
              <span style={{ fontSize: 22, color: TFT.goldDim, fontWeight: 300, marginTop: -22 }}>＝</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <ItemIcon src={imgSrc} alt={item.name} size={64} />
                <span style={{ fontSize: 11, color: TFT.gold, fontWeight: 700, textAlign: "center", maxWidth: 88, lineHeight: 1.2 }}>
                  {item.name}
                </span>
              </div>
            </div>
          </TFTPanel>
        )}

        {isUncraftable && !hasRecipe && (
          <TFTPanel
            style={{
              padding: "14px 20px",
              fontSize: 13,
              color: isRadiant ? "#fde047" : TFT.textDim,
              fontStyle: "italic",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            {isRadiant
              ? "Đồ Ánh Sáng — chỉ nhận được từ Lõi hoặc nâng cấp đặc biệt."
              : isArtifact
              ? "Đồ Tạo Tác — không thể ghép từ đồ cơ bản."
              : "Đồ đặc biệt — không thể ghép từ đồ cơ bản."}
          </TFTPanel>
        )}

        {isBaseComponent && buildsInto.length > 0 && (
          <TFTPanel>
            <SectionTitle right={`${buildsInto.length} đồ`}>Có Thể Ghép Thành</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
                gap: 14,
                padding: "20px 18px",
              }}
            >
              {buildsInto.map((bItem) => (
                <Link
                  key={bItem.id}
                  href={`/items/${bItem.slug || bItem.id}`}
                  title={bItem.name}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "transform 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    <ItemIcon src={bItem.image} alt={bItem.name} size={48} borderColor={TFT.goldDim} glow={false} />
                    <span style={{ fontSize: 10, color: TFT.textDim, textAlign: "center", lineHeight: 1.2, fontWeight: 600 }}>
                      {bItem.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </TFTPanel>
        )}

        {/* Two-col below: stats + champions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 1fr) minmax(320px, 1.2fr)",
            gap: 18,
          }}
        >
          <TFTPanel style={{ alignSelf: "start" }}>
            <SectionTitle>Hiệu Suất</SectionTitle>
            <div style={{ padding: "18px" }}>
              {[
                {
                  label: "Hạng Trung Bình",
                  value: item.avg_placement ? Number(item.avg_placement).toFixed(2) : "—",
                  color:
                    item.avg_placement && Number(item.avg_placement) <= 4 ? TFT.good : TFT.gold,
                },
                { label: "Tỷ Lệ Thắng", value: item.win_rate || "—", color: TFT.text },
                { label: "Tần Suất", value: item.pick_rate || item.frequency || "—", color: TFT.blueBright },
                { label: "Top 4", value: (item as any).top_4_rate || "—", color: TFT.text },
              ].map((stat, i, arr) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    padding: "12px 4px",
                    borderBottom: i < arr.length - 1 ? `1px solid ${TFT.lineSoft}` : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: TFT.textMute,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    className="tft-heading"
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: stat.color,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </TFTPanel>

          <TFTPanel style={{ alignSelf: "start" }}>
            <SectionTitle>Tướng Khuyên Dùng</SectionTitle>
            {item.best_users && item.best_users.length > 0 ? (
              <div>
                {item.best_users.slice(0, 10).map((user, idx) => (
                  <ChampionRow key={idx} user={user} idx={idx} />
                ))}
              </div>
            ) : (
              <div style={{ padding: "32px", textAlign: "center", color: TFT.textMute, fontSize: 13 }}>
                Chưa có dữ liệu tướng
              </div>
            )}
          </TFTPanel>
        </div>
      </div>
    </div>
  );
}
