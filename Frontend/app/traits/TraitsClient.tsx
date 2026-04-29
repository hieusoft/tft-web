"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import type { ApiTrait } from "@/lib/api-client";

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "52.1%" → 52.1, or return 0 */
function parsePct(val: string | null): number {
  if (!val) return 0;
  return parseFloat(val.replace("%", "")) || 0;
}

const TIER_CONFIG: Record<string, { bg: string; text: string }> = {
  S: { bg: "bg-[#3a3a3a]", text: "text-gray-300" },
  A: { bg: "bg-[#333333]", text: "text-gray-400" },
  B: { bg: "bg-[#2e2e2e]", text: "text-gray-400" },
  C: { bg: "bg-[#2a2a2a]", text: "text-gray-500" },
};

function MiniBar({
  value,
  max = 70,
  color = "#f0b90b",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-[#2a2a2a] overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

type SortKey = "tier" | "top4" | "placement" | "pick_percent";
type SortDir = "asc" | "desc";
const TIER_ORDER: Record<string, number> = { S: 0, A: 1, B: 2, C: 3 };

// ── Main Client Component ─────────────────────────────────────────────────────

export default function TraitsClient({ traits }: { traits: ApiTrait[] }) {
  const [tierFilter, setTierFilter] = useState<"All" | "S" | "A" | "B" | "C">("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("tier");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => {
    let list = [...traits];
    if (tierFilter !== "All") list = list.filter((t) => t.tier === tierFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      let diff = 0;
      if (sortKey === "tier") {
        diff =
          (TIER_ORDER[a.tier ?? "C"] ?? 3) -
          (TIER_ORDER[b.tier ?? "C"] ?? 3);
      } else if (sortKey === "placement") {
        diff = (a.placement ?? 9) - (b.placement ?? 9);
      } else if (sortKey === "top4") {
        diff = parsePct(b.top4) - parsePct(a.top4);
      } else if (sortKey === "pick_percent") {
        diff = parsePct(b.pick_percent) - parsePct(a.pick_percent);
      }
      return sortDir === "asc" ? diff : -diff;
    });
    return list;
  }, [traits, tierFilter, search, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "placement" ? "asc" : "desc");
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-700 text-xs">↕</span>;
    return (
      <span className="text-yellow-400 text-xs">
        {sortDir === "asc" ? "↑" : "↓"}
      </span>
    );
  }

  return (
    <div className="bg-[#1a1a1a] min-h-screen">
      <div className="mx-auto max-w-[1400px] px-3 sm:px-4 py-4 sm:py-6">

        {/* ── Filters ── */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
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
                    ? `${TIER_CONFIG[tier]?.bg ?? "bg-[#2a2a2a]"} text-white`
                    : `bg-[#2a2a2a] ${TIER_CONFIG[tier]?.text ?? "text-gray-400"} hover:opacity-80`
                }`}
              >
                {tier === "All" ? "★" : tier}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="w-full sm:w-auto sm:ml-auto relative">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
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
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] bg-[#151515] border-b border-[#2a2a2a] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
            <div>Tộc / Hệ</div>
            <button
              className="flex items-center gap-1 hover:text-gray-400 transition-colors"
              onClick={() => toggleSort("tier")}
            >
              Tier <SortIcon k="tier" />
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-400 transition-colors"
              onClick={() => toggleSort("placement")}
            >
              Trung Bình <SortIcon k="placement" />
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-400 transition-colors"
              onClick={() => toggleSort("top4")}
            >
              Top 4 <SortIcon k="top4" />
            </button>
            <button
              className="flex items-center gap-1 hover:text-gray-400 transition-colors"
              onClick={() => toggleSort("pick_percent")}
            >
              Pick Rate <SortIcon k="pick_percent" />
            </button>
          </div>

          {/* Rows */}
          {sorted.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm">
              Không tìm thấy tộc / hệ nào
            </div>
          ) : (
            sorted.map((trait, idx) => (
              <DesktopRow key={trait.id} trait={trait} idx={idx} />
            ))
          )}
        </div>

        {/* ── Mobile Cards (< md) ── */}
        <div className="md:hidden flex flex-col gap-2">
          {/* Mobile sort bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(["tier", "top4", "placement", "pick_percent"] as SortKey[]).map(
              (k) => (
                <button
                  key={k}
                  onClick={() => toggleSort(k)}
                  className={`shrink-0 flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-medium transition-colors ${
                    sortKey === k
                      ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                      : "border-[#2a2a2a] bg-[#1e1e1e] text-gray-500"
                  }`}
                >
                  {
                    {
                      tier: "Tier",
                      top4: "Top 4",
                      placement: "T.Bình",
                      pick_percent: "Pick",
                    }[k]
                  }
                  {sortKey === k && (
                    <span className="text-yellow-400">
                      {sortDir === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </button>
              )
            )}
          </div>

          {sorted.length === 0 ? (
            <div className="py-12 text-center text-gray-600 text-sm">
              Không tìm thấy tộc / hệ nào
            </div>
          ) : (
            sorted.map((trait) => <MobileCard key={trait.id} trait={trait} />)
          )}
        </div>

        <p className="mt-4 text-xs text-gray-700 text-center">
          Dữ liệu được cập nhật liên tục · Cập nhật mỗi 30 phút
        </p>
      </div>
    </div>
  );
}

// ── Desktop Row ───────────────────────────────────────────────────────────────

function TraitIcon({ trait }: { trait: ApiTrait }) {
  if (trait.image) {
    return (
      <div className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-white/10">
        <Image
          src={trait.image}
          alt={trait.name}
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>
    );
  }
  // Fallback: initials
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white shrink-0 border border-white/10 bg-[#2a2a2a]">
      {trait.name.substring(0, 2).toUpperCase()}
    </div>
  );
}

function DesktopRow({ trait, idx }: { trait: ApiTrait; idx: number }) {
  const tierCfg = TIER_CONFIG[trait.tier ?? ""] ?? TIER_CONFIG["C"];
  const isOdd = idx % 2 === 1;
  const top4Num = parsePct(trait.top4);
  const pickNum = parsePct(trait.pick_percent);

  return (
    <Link
      href={`/traits/${trait.id}`}
      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center px-4 py-3.5 border-b border-[#1e1e1e] transition-colors hover:bg-[#252525] group ${
        isOdd ? "bg-[#171717]" : "bg-[#1a1a1a]"
      }`}
    >
      {/* Name */}
      <div className="flex items-center gap-3">
        <TraitIcon trait={trait} />
        <div>
          <span className="text-sm font-semibold text-white group-hover:text-[#f0b90b] transition-colors">
            {trait.name}
          </span>
          {trait.description && (
            <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-1 max-w-xs">
              {trait.description}
            </p>
          )}
        </div>
      </div>

      {/* Tier */}
      <div>
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs font-bold text-white ${
            tierCfg.bg
          }`}
        >
          {trait.tier ?? "—"}
        </span>
      </div>

      {/* Avg placement */}
      <div className="text-sm font-bold text-gray-300">
        {trait.placement != null ? trait.placement.toFixed(2) : "—"}
      </div>

      {/* Top 4 */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-300">
          {trait.top4 ?? "—"}
        </span>
        {top4Num > 0 && <MiniBar value={top4Num} max={70} color="#6b6b6b" />}
      </div>

      {/* Pick rate */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-400">
          {trait.pick_percent ?? "—"}
        </span>
        {pickNum > 0 && (
          <MiniBar value={pickNum} max={50} color="#4a4a4a" />
        )}
      </div>
    </Link>
  );
}

// ── Mobile Card ───────────────────────────────────────────────────────────────

function MobileCard({ trait }: { trait: ApiTrait }) {
  const tierCfg = TIER_CONFIG[trait.tier ?? ""] ?? TIER_CONFIG["C"];
  const top4Num = parsePct(trait.top4);

  return (
    <Link
      href={`/traits/${trait.id}`}
      className="flex items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] px-3 py-3 hover:border-yellow-500/30 hover:bg-[#252525] transition-all group"
    >
      {/* Icon */}
      {trait.image ? (
        <div className="relative h-11 w-11 shrink-0 rounded-lg overflow-hidden border border-white/10">
          <Image
            src={trait.image}
            alt={trait.name}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white border border-white/10 bg-[#2a2a2a]">
          {trait.name.substring(0, 2).toUpperCase()}
        </div>
      )}

      {/* Name + desc */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-white group-hover:text-[#f0b90b] transition-colors">
          {trait.name}
        </span>

        {/* Stats row */}
        <div className="mt-1.5 flex items-center gap-3 text-[11px]">
          {trait.top4 && (
            <span className="font-bold text-gray-300">Top4 {trait.top4}</span>
          )}
          {trait.placement != null && (
            <span className="font-bold text-gray-400">
              #{trait.placement.toFixed(2)}
            </span>
          )}
          {trait.pick_percent && (
            <span className="text-gray-500">Pick {trait.pick_percent}</span>
          )}
        </div>

        {top4Num > 0 && (
          <div className="mt-1.5">
            <MiniBar value={top4Num} max={70} color="#6b6b6b" />
          </div>
        )}
      </div>

      {/* Tier badge */}
      <div className="shrink-0 flex flex-col items-center gap-1">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white ${tierCfg.bg}`}
        >
          {trait.tier ?? "—"}
        </span>
        {trait.pick_count && (
          <span className="text-[9px] text-gray-600">{trait.pick_count}</span>
        )}
      </div>
    </Link>
  );
}
