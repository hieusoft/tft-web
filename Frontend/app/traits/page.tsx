"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { MOCK_TRAITS, MockTrait, TraitType } from "@/lib/mock-data";

// ── Helpers ──────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  S: { bg: "bg-red-500",    text: "text-red-400",    border: "border-red-500/30" },
  A: { bg: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500/30" },
  B: { bg: "bg-blue-500",   text: "text-blue-400",   border: "border-blue-500/30" },
  C: { bg: "bg-gray-500",   text: "text-gray-400",   border: "border-gray-500/30" },
};

function placementColor(avg: number) {
  if (avg <= 3.7) return "text-green-400";
  if (avg <= 4.2) return "text-yellow-400";
  return "text-red-400";
}

function top4Color(rate: number) {
  if (rate >= 60) return "text-green-400";
  if (rate >= 50) return "text-yellow-400";
  return "text-red-400";
}

function MiniBar({ value, max = 70, color = "#f0b90b" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-[#2a2a2a] overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "tier" | "top4Rate" | "winRate" | "avgPlacement" | "pickRate";
type SortDir = "asc" | "desc";
const TIER_ORDER = { S: 0, A: 1, B: 2, C: 3 };

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TraitsPage() {
  const [typeFilter, setTypeFilter] = useState<"All" | TraitType>("All");
  const [tierFilter, setTierFilter] = useState<"All" | "S" | "A" | "B" | "C">("All");
  const [search,     setSearch]     = useState("");
  const [sortKey,    setSortKey]    = useState<SortKey>("tier");
  const [sortDir,    setSortDir]    = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    let list = [...MOCK_TRAITS];
    if (typeFilter !== "All") list = list.filter((t) => t.type === typeFilter);
    if (tierFilter !== "All") list = list.filter((t) => t.tier === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === "tier") diff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
      else if (sortKey === "avgPlacement") diff = a.avgPlacement - b.avgPlacement;
      else diff = (b[sortKey] as number) - (a[sortKey] as number);
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [typeFilter, tierFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "avgPlacement" ? "asc" : "desc"); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-700 text-xs">↕</span>;
    return <span className="text-yellow-400 text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div className="bg-[#1a1a1a] min-h-screen">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 py-4 sm:py-6">

        {/* ── Filters ── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {/* Type tabs */}
          <div className="flex rounded-lg border border-[#2a2a2a] overflow-hidden">
            {(["All", "Origin", "Class"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 sm:px-4 py-2 text-xs font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-yellow-500 text-black"
                    : "bg-[#1e1e1e] text-gray-400 hover:text-white"
                }`}
              >
                {t === "All" ? "Tất Cả" : t === "Origin" ? "Tộc" : "Hệ"}
              </button>
            ))}
          </div>

          {/* Tier pills */}
          <div className="flex gap-1.5">
            {(["All", "S", "A", "B", "C"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setTierFilter(tier)}
                className={`h-7 w-7 rounded text-xs font-bold transition-all ${
                  tier === "All"
                    ? tierFilter === "All"
                      ? "bg-gray-500 text-white"
                      : "bg-[#2a2a2a] text-gray-500 hover:text-white"
                    : tierFilter === tier
                    ? `${TIER_CONFIG[tier].bg} text-white`
                    : `bg-[#2a2a2a] ${TIER_CONFIG[tier].text} hover:opacity-80`
                }`}
              >
                {tier === "All" ? "★" : tier}
              </button>
            ))}
          </div>

          {/* Search — full width on mobile */}
          <div className="w-full sm:w-auto sm:ml-auto relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tộc / hệ..."
              className="w-full rounded border border-[#2a2a2a] bg-[#1e1e1e] pl-8 pr-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 sm:w-44"
            />
          </div>
        </div>

        {/* ── Desktop Table (md+) ── */}
        <div className="hidden md:block rounded-xl border border-[#2a2a2a] overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] bg-[#151515] border-b border-[#2a2a2a] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            <div>Tộc / Hệ</div>
            <button className="flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort("tier")}>
              Tier <SortIcon k="tier" />
            </button>
            <button className="flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort("avgPlacement")}>
              Trung Bình <SortIcon k="avgPlacement" />
            </button>
            <button className="flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort("top4Rate")}>
              Top 4 <SortIcon k="top4Rate" />
            </button>
            <button className="flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort("winRate")}>
              Win Rate <SortIcon k="winRate" />
            </button>
            <button className="flex items-center gap-1 hover:text-gray-400 transition-colors" onClick={() => toggleSort("pickRate")}>
              Pick Rate <SortIcon k="pickRate" />
            </button>
          </div>

          {/* Rows */}
          {sorted.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm">Không tìm thấy tộc / hệ nào</div>
          ) : (
            sorted.map((trait, idx) => <DesktopRow key={trait.id} trait={trait} idx={idx} />)
          )}
        </div>

        {/* ── Mobile Cards (< md) ── */}
        <div className="md:hidden flex flex-col gap-2">
          {/* Mobile sort bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["tier", "top4Rate", "winRate", "avgPlacement", "pickRate"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => toggleSort(k)}
                className={`shrink-0 flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium transition-colors ${
                  sortKey === k
                    ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                    : "border-[#2a2a2a] bg-[#1e1e1e] text-gray-500"
                }`}
              >
                {{ tier: "Tier", top4Rate: "Top 4", winRate: "Win", avgPlacement: "T.Bình", pickRate: "Pick" }[k]}
                {sortKey === k && <span className="text-yellow-400">{sortDir === "asc" ? "↑" : "↓"}</span>}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <div className="py-12 text-center text-gray-600 text-sm">Không tìm thấy tộc / hệ nào</div>
          ) : (
            sorted.map((trait) => <MobileCard key={trait.id} trait={trait} />)
          )}
        </div>

        <p className="mt-4 text-xs text-gray-700 text-center">
          Dữ liệu dựa trên {(2_100_000).toLocaleString("vi-VN")} trận · Cập nhật mỗi 30 phút
        </p>
      </div>
    </div>
  );
}

// ── Desktop Row ───────────────────────────────────────────────────────────────

function DesktopRow({ trait, idx }: { trait: MockTrait; idx: number }) {
  const tier = TIER_CONFIG[trait.tier];
  const isOdd = idx % 2 === 1;

  return (
    <Link
      href={`/traits/${trait.id}`}
      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] items-center px-4 py-3.5 border-b border-[#1e1e1e] transition-colors hover:bg-[#252525] group ${
        isOdd ? "bg-[#171717]" : "bg-[#1a1a1a]"
      }`}
    >
      {/* Name */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg text-xl shrink-0 border"
          style={{ borderColor: trait.color + "44", backgroundColor: trait.color + "18" }}
        >
          {trait.icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">{trait.name}</span>
            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              trait.type === "Origin"
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                : "bg-purple-500/15 text-purple-400 border border-purple-500/25"
            }`}>
              {trait.type === "Origin" ? "Tộc" : "Hệ"}
            </span>
          </div>
          <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1 max-w-xs">{trait.description}</p>
        </div>
      </div>

      {/* Tier */}
      <div>
        <span className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white ${tier.bg}`}>
          {trait.tier}
        </span>
      </div>

      {/* Avg placement */}
      <div className={`text-sm font-bold ${placementColor(trait.avgPlacement)}`}>{trait.avgPlacement.toFixed(2)}</div>

      {/* Top 4 */}
      <div className="flex flex-col gap-1">
        <span className={`text-sm font-bold ${top4Color(trait.top4Rate)}`}>{trait.top4Rate.toFixed(1)}%</span>
        <MiniBar value={trait.top4Rate} max={70} color={trait.top4Rate >= 60 ? "#4ade80" : trait.top4Rate >= 50 ? "#facc15" : "#f87171"} />
      </div>

      {/* Win rate */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-300">{trait.winRate.toFixed(1)}%</span>
        <MiniBar value={trait.winRate} max={20} color="#a78bfa" />
      </div>

      {/* Pick rate */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-400">{trait.pickRate.toFixed(1)}%</span>
        <MiniBar value={trait.pickRate} max={50} color="#60a5fa" />
      </div>
    </Link>
  );
}

// ── Mobile Card ───────────────────────────────────────────────────────────────

function MobileCard({ trait }: { trait: MockTrait }) {
  const tier = TIER_CONFIG[trait.tier];

  return (
    <Link
      href={`/traits/${trait.id}`}
      className="flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] px-3 py-3 hover:border-yellow-500/30 hover:bg-[#252525] transition-all group"
    >
      {/* Icon */}
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl border"
        style={{ borderColor: trait.color + "44", backgroundColor: trait.color + "18" }}
      >
        {trait.icon}
      </div>

      {/* Name + desc */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">{trait.name}</span>
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
            trait.type === "Origin"
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
              : "bg-purple-500/15 text-purple-400 border border-purple-500/25"
          }`}>
            {trait.type === "Origin" ? "Tộc" : "Hệ"}
          </span>
        </div>

        {/* Stats row */}
        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
          <span className={`font-bold ${top4Color(trait.top4Rate)}`}>Top4 {trait.top4Rate.toFixed(1)}%</span>
          <span className={`font-bold ${placementColor(trait.avgPlacement)}`}>#{trait.avgPlacement.toFixed(2)}</span>
          <span className="text-gray-500">Win {trait.winRate.toFixed(1)}%</span>
        </div>

        {/* Mini bar */}
        <div className="mt-1.5">
          <MiniBar
            value={trait.top4Rate}
            max={70}
            color={trait.top4Rate >= 60 ? "#4ade80" : trait.top4Rate >= 50 ? "#facc15" : "#f87171"}
          />
        </div>
      </div>

      {/* Tier badge — right */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white ${tier.bg}`}>
          {trait.tier}
        </span>
        <span className="text-[9px] text-gray-600">Pick {trait.pickRate.toFixed(0)}%</span>
      </div>
    </Link>
  );
}
