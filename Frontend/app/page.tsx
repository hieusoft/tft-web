import type { Metadata } from "next";
import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";
import { MOCK_COMPS } from "@/lib/mock-data";
import JsonLd from "@/components/seo/JsonLd";

// Trang chủ dùng absolute title (không qua template "| MetaTFT VN")
export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`,
  description: SITE_CONFIG.description,
  alternates: {
    canonical: "/",
    languages: { "vi-VN": "/", "x-default": "/" },
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
  ],
};

const FEATURES = [
  {
    icon: "🐧",
    color: "from-purple-600 to-purple-800",
    title: "Chính Xác & Khách Quan",
    desc: "Chúng tôi dùng machine learning để khám phá đội hình TFT tốt nhất, phân tích hơn 2 triệu ván mỗi ngày.",
  },
  {
    icon: "⚡",
    color: "from-yellow-500 to-orange-600",
    title: "Luôn Cập Nhật",
    desc: "Dữ liệu được làm mới mỗi vài phút và cập nhật cho mọi bản vá nhỏ.",
  },
  {
    icon: "🏆",
    color: "from-green-600 to-teal-700",
    title: "Có Lợi Thế",
    desc: "Hàng nghìn người chơi dùng MetaTFT VN để thích nghi với meta, học chiến thuật mới và leo hạng.",
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  "Dễ": "text-green-400 bg-green-400/10",
  "Trung Bình": "text-yellow-400 bg-yellow-400/10",
  "Khó": "text-red-400 bg-red-400/10",
};

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

export default function HomePage() {
  const topComps = MOCK_COMPS.slice(0, 6);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      {/* === HERO BANNER === */}
      <section className="relative overflow-hidden bg-[#1a1a1a]">
        <div className="mx-auto max-w-[1400px] px-4 py-2">
          <div
            className="relative rounded-lg overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0d1b2a 0%, #1a0a2e 40%, #2a1a0a 70%, #1a2a0a 100%)",
              minHeight: "300px",
            }}
          >
            {/* Light overlay using CSS gradient — không dùng blur vì tốn GPU paint */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(168,85,247,0.08) 0%, transparent 50%)",
              }}
            />

            {/* Decorative character silhouettes */}
            <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-40">
              <div className="absolute right-10 top-5 text-8xl select-none">🐉</div>
              <div className="absolute right-40 bottom-10 text-6xl select-none">⚔️</div>
              <div className="absolute right-60 top-10 text-5xl select-none">🌟</div>
            </div>

            <div className="relative z-10 px-10 py-14 max-w-lg">
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-3">
                Nơi tốt nhất cho thống kê và dữ liệu TFT
              </h1>
              <p className="text-gray-400 text-sm mb-6">
                Cập nhật cho Patch {SITE_CONFIG.patch}
              </p>
              <div className="flex gap-3">
                <Link
                  href="/comps"
                  className="rounded bg-[#3a3a3a] hover:bg-[#4a4a4a] px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Xem Đội Hình
                </Link>
                <Link
                  href="/tierlist"
                  className="rounded bg-red-600 hover:bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                >
                  Bảng Xếp Hạng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section className="bg-[#1a1a1a] py-4">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex items-start gap-4 rounded-lg bg-[#222] border border-[#2a2a2a] p-5">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${f.color} text-2xl shadow-lg`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === TOP COMPS (MetaTFT style list) === */}
      <section className="bg-[#1a1a1a] py-6">
        <div className="mx-auto max-w-[1400px] px-4">
          {/* Section header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Đội Hình TFT Tốt Nhất</h2>
              <p className="text-xs text-gray-500 mt-1">
                Danh sách đội hình meta tốt nhất dựa trên dữ liệu. Click vào đội hình để xem vị trí, level và hơn thế nữa.
              </p>
            </div>
            <div className="text-right text-xs text-gray-600 hidden sm:block">
              <div>Cập nhật lần cuối: <span className="text-gray-400">2 phút trước</span></div>
              <div>Đội hình phân tích: <span className="text-white font-semibold">127,246</span></div>
            </div>
          </div>

          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[48px_1fr_320px_80px_80px_80px_90px] gap-2 items-center px-3 py-2 text-[11px] text-gray-600 uppercase tracking-wide border-b border-[#2a2a2a]">
            <div>Tier</div>
            <div>Tên Đội Hình</div>
            <div>Tướng</div>
            <div className="text-right">Trung Bình</div>
            <div className="text-right">Tỷ Lệ Pick</div>
            <div className="text-right">Tỷ Lệ Thắng</div>
            <div className="text-right">Top 4</div>
          </div>

          {/* Comp rows */}
          <div className="flex flex-col divide-y divide-[#222]">
            {topComps.map((comp) => (
              <Link
                key={comp.id}
                href={`/comps/${comp.id}`}
                className="group grid grid-cols-[48px_1fr] sm:grid-cols-[48px_1fr_320px_80px_80px_80px_90px] gap-2 items-center px-3 py-3 hover:bg-[#222] transition-colors"
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
                    <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">
                      {comp.name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${DIFFICULTY_COLOR[comp.difficulty] || "text-gray-400 bg-gray-400/10"}`}>
                      {comp.difficulty}
                    </span>
                  </div>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
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
                      className={`h-8 w-8 flex items-center justify-center rounded text-[9px] font-bold text-white ring-1 ${COST_COLORS[c.cost] || "ring-gray-400"} ${COST_BG[c.cost] || "bg-gray-800"}`}
                    >
                      {c.name.substring(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div className="hidden sm:block text-right">
                  <span className="text-sm font-semibold text-white">{comp.avgPlacement.toFixed(2)}</span>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-sm text-gray-400">{comp.pickRate.toFixed(2)}</span>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-sm font-semibold text-yellow-400">{comp.winRate.toFixed(1)}%</span>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-sm font-semibold text-green-400">{comp.top4Rate.toFixed(1)}%</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/comps"
              className="inline-flex items-center gap-2 rounded border border-[#3a3a3a] bg-[#222] px-5 py-2 text-sm text-gray-300 hover:text-white hover:border-yellow-500/50 transition-all"
            >
              Xem tất cả đội hình
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
