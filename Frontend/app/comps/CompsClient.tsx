"use client";

import Link from "next/link";
import { useState } from "react";
import { MOCK_COMPS } from "@/lib/mock-data";

const TIERS = ["Tất Cả", "S", "A", "B", "C"];
const DIFFICULTY = ["Tất Cả", "Dễ", "Trung Bình", "Khó"];

const TIER_BG: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-yellow-500",
  B: "bg-blue-500",
  C: "bg-purple-500",
};

const COST_COLORS: Record<number, string> = {
  1: "ring-gray-400",
  2: "ring-green-400",
  3: "ring-blue-400",
  4: "ring-purple-400",
  5: "ring-yellow-400",
};

const COST_BG: Record<number, string> = {
  1: "bg-gray-700",
  2: "bg-green-900",
  3: "bg-blue-900",
  4: "bg-purple-900",
  5: "bg-yellow-900",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  "Dễ": "text-green-400 bg-green-400/10",
  "Trung Bình": "text-yellow-400 bg-yellow-400/10",
  "Khó": "text-red-400 bg-red-400/10",
};

export default function CompsClient() {
  const [selectedTier, setSelectedTier] = useState("Tất Cả");
  const [selectedDiff, setSelectedDiff] = useState("Tất Cả");
  const [sortBy, setSortBy] = useState<"avgPlacement" | "winRate" | "top4Rate" | "pickRate">("avgPlacement");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_COMPS.filter((c) => {
    const tierMatch = selectedTier === "Tất Cả" || c.tier === selectedTier;
    const diffMatch = selectedDiff === "Tất Cả" || c.difficulty === selectedDiff;
    return tierMatch && diffMatch;
  }).sort((a, b) => {
    if (sortBy === "avgPlacement") return a.avgPlacement - b.avgPlacement;
    return b[sortBy] - a[sortBy];
  });

  return (
    <>
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-[#2a2a2a]">
        {/* Tier filter */}
        <div className="flex items-center gap-1 rounded border border-[#3a3a3a] bg-[#111] p-1">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                selectedTier === tier
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-1 rounded border border-[#3a3a3a] bg-[#111] p-1">
          {DIFFICULTY.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDiff(d)}
              className={`rounded px-3 py-1 text-xs font-medium transition-all ${
                selectedDiff === d
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-600">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded border border-[#3a3a3a] bg-[#111] px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-yellow-500"
          >
            <option value="avgPlacement">Vị Trí Trung Bình</option>
            <option value="winRate">Tỷ Lệ Thắng</option>
            <option value="top4Rate">Top 4</option>
            <option value="pickRate">Tỷ Lệ Pick</option>
          </select>
        </div>
      </div>

      {/* Stats info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-600">
          Hiển thị <span className="text-gray-400">{filtered.length}</span> đội hình
        </p>
        <div className="text-xs text-gray-600">
          Phân tích: <span className="text-white font-semibold">127,246</span> đội hình
        </div>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-[48px_1fr_300px_90px_80px_80px_90px_40px] gap-2 items-center px-3 py-2 text-[11px] text-gray-600 uppercase tracking-wide border-b border-[#2a2a2a] mb-1">
        <div>Tier</div>
        <div>Tên Đội Hình</div>
        <div>Tướng</div>
        <div className="text-right">T.Bình</div>
        <div className="text-right">Pick%</div>
        <div className="text-right">Thắng%</div>
        <div className="text-right">Top 4%</div>
        <div />
      </div>

      {/* Comp rows */}
      <div className="flex flex-col divide-y divide-[#222] rounded-lg border border-[#2a2a2a] overflow-hidden">
        {filtered.map((comp) => (
          <div key={comp.id}>
            <div
              className="group grid grid-cols-[48px_1fr] sm:grid-cols-[48px_1fr_300px_90px_80px_80px_90px_40px] gap-2 items-center px-3 py-3 bg-[#1e1e1e] hover:bg-[#252525] transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === comp.id ? null : comp.id)}
            >
              {/* Tier */}
              <div className="flex justify-center">
                <span className={`flex h-8 w-8 items-center justify-center rounded text-sm font-bold text-white ${TIER_BG[comp.tier] || "bg-gray-600"}`}>
                  {comp.tier}
                </span>
              </div>

              {/* Name + traits + difficulty */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">
                    {comp.name}
                  </span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLOR[comp.difficulty] || ""}`}>
                    {comp.difficulty}
                  </span>
                  <span className="text-[10px] text-gray-600 border border-gray-700 px-1.5 py-0.5 rounded">
                    Cap {comp.level}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-0.5 flex-wrap">
                  {comp.traits.slice(0, 3).map((t) => (
                    <span key={t} className="text-[10px] text-gray-500">{t}</span>
                  ))}
                </div>
              </div>

              {/* Champions */}
              <div className="hidden sm:flex flex-wrap gap-1">
                {comp.champions.slice(0, 8).map((c) => (
                  <div
                    key={c.name}
                    title={`${c.name} ★${c.stars}`}
                    className={`relative h-8 w-8 flex items-center justify-center rounded text-[9px] font-bold text-white ring-1 ${COST_COLORS[c.cost] || "ring-gray-400"} ${COST_BG[c.cost] || "bg-gray-800"}`}
                  >
                    {c.name.substring(0, 2).toUpperCase()}
                    <span className="absolute -bottom-0.5 -right-0.5 text-yellow-400 text-[8px] font-bold leading-none">
                      {"★".repeat(c.stars)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="hidden sm:block text-right">
                <span className="text-sm font-semibold text-white">{comp.avgPlacement.toFixed(2)}</span>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-sm text-gray-400">{(comp.pickRate * 100).toFixed(1)}%</span>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-sm font-semibold text-yellow-400">{comp.winRate.toFixed(1)}%</span>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-sm font-semibold text-green-400">{comp.top4Rate.toFixed(1)}%</span>
              </div>

              {/* Expand arrow */}
              <div className="hidden sm:flex justify-center">
                <svg
                  className={`h-4 w-4 text-gray-600 transition-transform ${expanded === comp.id ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === comp.id && (
              <div className="bg-[#161616] border-t border-[#2a2a2a] px-6 py-4">
                <p className="text-xs text-gray-500 mb-3">Tất cả tướng trong đội hình</p>
                <div className="flex flex-wrap gap-3">
                  {comp.champions.map((c) => (
                    <div key={c.name} className="flex flex-col items-center gap-1">
                      <div className={`h-12 w-12 flex items-center justify-center rounded text-xs font-bold text-white ring-2 ${COST_COLORS[c.cost] || "ring-gray-400"} ${COST_BG[c.cost] || "bg-gray-800"}`}>
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-[10px] text-gray-400">{c.name}</span>
                      <span className="text-[10px] text-yellow-400">{"★".repeat(c.stars)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    href={`/comps/${comp.id}`}
                    className="inline-flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    Xem chi tiết đầy đủ →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-[#1e1e1e]">
            <span className="text-3xl mb-3">🔍</span>
            <p className="text-gray-500 text-sm">Không tìm thấy đội hình nào</p>
          </div>
        )}
      </div>
    </>
  );
}
