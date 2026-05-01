"use client";

import Image from "next/image";
import { useState, useMemo, useRef, useEffect } from "react";
import type { ApiAugment } from "@/lib/api-client";

const RANK_COLOR: Record<string, string> = {
  S: "rgb(255, 126, 131)",
  A: "rgb(255, 191, 127)",
  B: "rgb(255, 223, 128)",
  C: "rgb(254, 255, 127)",
  D: "rgb(200, 200, 200)",
};

const RANK_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3, D: 4 };

const TIER_META: Record<number, { label: string; color: string }> = {
  1: { label: "Bạc", color: "#9ca3af" },
  2: { label: "Vàng", color: "#eab308" },
  3: { label: "Huyền Thoại", color: "#a855f7" },
};

export default function AugmentsClient({ augments }: { augments: ApiAugment[] }) {
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<"All" | "S" | "A" | "B" | "C" | "D">("All");

  const filtered = useMemo(() => {
    let list = [...augments];
    if (rankFilter !== "All") list = list.filter((a) => a.rank === rankFilter);
    if (search.trim())
      list = list.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()));
    list.sort((a, b) => {
      const ro = (RANK_ORDER[a.rank ?? ""] ?? 9) - (RANK_ORDER[b.rank ?? ""] ?? 9);
      return ro !== 0 ? ro : a.name.localeCompare(b.name);
    });
    return list;
  }, [augments, rankFilter, search]);

  const groups = useMemo(() => {
    return (["S", "A", "B", "C", "D"] as const)
      .map((rank) => ({ rank, color: RANK_COLOR[rank], items: filtered.filter((a) => a.rank === rank) }))
      .filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div style={{ background: "#111111", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px" }}>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 3, background: "#181818", border: "1px solid #222", borderRadius: 7, padding: 3 }}>
            {(["All", "S", "A", "B", "C", "D"] as const).map((r) => {
              const active = rankFilter === r;
              const color = r === "All" ? "#6b7280" : RANK_COLOR[r];
              return (
                <button key={r} suppressHydrationWarning onClick={() => setRankFilter(r)}
                  style={{
                    height: 26, minWidth: r === "All" ? 52 : 32, padding: "0 8px",
                    borderRadius: 5, fontSize: 11, fontWeight: active ? 700 : 500,
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                    background: active ? color + "22" : "transparent",
                    color: active ? color : "#6b7280",
                    outline: active ? `1px solid ${color}44` : "none",
                  }}>
                  {r}
                </button>
              );
            })}
          </div>

          <div style={{ position: "relative", marginLeft: "auto" }}>
            <input type="text" value={search} suppressHydrationWarning
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìmlõi..."
              style={{
                height: 32, width: 200, borderRadius: 6,
                background: "#1e1e1e", border: "1px solid #2a2a2a",
                paddingLeft: 12, paddingRight: 32,
                fontSize: 12, color: "#d1d5db", outline: "none",
              }}
            />
            <svg style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#6b7280", pointerEvents: "none" }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <span style={{ fontSize: 11, color: "#4b5563" }}>{filtered.length} augments</span>
        </div>

        {/* Rank Groups */}
        {groups.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#4b5563", fontSize: 14 }}>
            Không tìm thấylõi nào
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {groups.map(({ rank, color, items }) => (
              <RankRow key={rank} rank={rank} color={color} items={items} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RankRow({ rank, color, items }: { rank: string; color: string; items: ApiAugment[] }) {
  return (
    <div style={{
      display: "flex", alignItems: "stretch",
      background: "#181818", border: "1px solid #1e1e1e",
      borderRadius: 10, overflow: "hidden", marginBottom: 6,
    }}>
      <div style={{
        width: 48, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: color, borderRight: `2px solid ${color}`,
      }}>
        <span style={{ fontSize: 20, fontWeight: 900, color: "#000", letterSpacing: "-0.02em" }}>
          {rank}
        </span>
      </div>
      <div style={{ flex: 1, padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 6, alignContent: "flex-start" }}>
        {items.map((aug) => (
          <AugmentIcon key={aug.id} aug={aug} rankColor={color} />
        ))}
      </div>
    </div>
  );
}

function AugmentIcon({ aug, rankColor }: { aug: ApiAugment; rankColor: string }) {
  const [imgErr, setImgErr] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [tipPos, setTipPos] = useState({ top: 0, left: 0, above: true });
  const ref = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tierMeta = TIER_META[aug.tier ?? 0];

  useEffect(() => {
    if (!showTip || !ref.current || !tipRef.current) return;
    const rect = ref.current.getBoundingClientRect();
    const TIP_W = 240;
    const TIP_H = tipRef.current.offsetHeight;
    const above = rect.top - TIP_H - 8 >= 0;

    let left = rect.left + rect.width / 2 - TIP_W / 2;
    let top = above ? rect.top - TIP_H - 8 : rect.bottom + 8;

    if (left + TIP_W > window.innerWidth - 8) left = window.innerWidth - TIP_W - 8;
    if (left < 8) left = 8;

    setTipPos({ top, left, above });
  });

  return (
    <div
      ref={ref}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 60, cursor: "default" }}
    >
      {/* Icon box */}
      <div style={{
        width: 52, height: 52, borderRadius: 8, overflow: "hidden",
        background: "#111", position: "relative",
        border: `1px solid ${tierMeta?.color ?? "#333"}50`,
        flexShrink: 0,
        transition: "transform 0.12s, box-shadow 0.12s",
        boxShadow: showTip ? `0 0 12px ${rankColor}55` : "none",
        transform: showTip ? "scale(1.08)" : "scale(1)",
      }}>
        {aug.image && !imgErr ? (
          <Image src={aug.image} alt={aug.name} fill sizes="52px"
            className="object-contain p-0.5"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✨</div>
        )}
        {tierMeta && (
          <div style={{
            position: "absolute", bottom: 2, right: 2,
            width: 8, height: 8, borderRadius: "50%",
            background: tierMeta.color, boxShadow: `0 0 4px ${tierMeta.color}`,
          }} />
        )}
      </div>

      {/* Name */}
      <span style={{
        fontSize: 9, color: "#6b7280", textAlign: "center",
        width: "100%", lineHeight: 1.3,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
      }}>
        {aug.name}
      </span>

      {/* Tooltip — dùng fixed để không bị overflow: hidden cắt mất */}
      {showTip && (
        <div ref={tipRef} style={{
          position: "fixed",
          top: tipPos.top,
          left: tipPos.left,
          width: 240, zIndex: 9999,
          background: "#1a1a1a", border: "1px solid #333",
          borderRadius: 10, padding: "12px 14px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          pointerEvents: "none",
          opacity: tipPos.top === 0 ? 0 : 1,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, overflow: "hidden", position: "relative", flexShrink: 0, background: "#111" }}>
              {aug.image && !imgErr ? (
                <Image src={aug.image} alt={aug.name} fill sizes="32px" className="object-contain" />
              ) : <span style={{ fontSize: 16 }}>✨</span>}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f3f4f6", lineHeight: 1.3 }}>{aug.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                {aug.rank && (
                  <span style={{ width: 18, height: 18, borderRadius: 4, background: rankColor, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#fff" }}>
                    {aug.rank}
                  </span>
                )}
                {tierMeta && (
                  <span style={{ fontSize: 9, color: tierMeta.color, fontWeight: 600 }}>{tierMeta.label}</span>
                )}
              </div>
            </div>
          </div>
          {aug.description && (
            <p style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.55, margin: 0 }}>
              {aug.description.replace(/TFT_Augment_Template_Blank/g, "").trim()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
