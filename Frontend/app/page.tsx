import type { Metadata } from "next";
import Image from "next/image";
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

const PATCH_VER = "15.8.1";

const FEATURES = [
  {
    imgUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH_VER}/img/champion/Lux.png`,
    imgAlt: "Lux",
    accentColor: "#a855f7",
    title: "Chính Xác & Khách Quan",
    desc: "Chúng tôi dùng machine learning để khám phá đội hình TFT tốt nhất, phân tích hơn 2 triệu ván mỗi ngày.",
  },
  {
    imgUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH_VER}/img/champion/Jinx.png`,
    imgAlt: "Jinx",
    accentColor: "#f97316",
    title: "Luôn Cập Nhật",
    desc: "Dữ liệu được làm mới mỗi vài phút và cập nhật cho mọi bản vá nhỏ.",
  },
  {
    imgUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH_VER}/img/champion/Ahri.png`,
    imgAlt: "Ahri",
    accentColor: "#14b8a6",
    title: "Có Lợi Thế",
    desc: "Hàng nghìn người chơi dùng MetaTFT VN để thích nghi với meta, học chiến thuật mới và leo hạng.",
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  "Dễ": "text-gray-300 bg-white/5",
  "Trung Bình": "text-gray-400 bg-white/5",
  "Khó": "text-gray-400 bg-white/5",
};

const TIER_BG: Record<string, string> = {
  S: "bg-[#3a3a3a]",
  A: "bg-[#333333]",
  B: "bg-[#2e2e2e]",
  C: "bg-[#2a2a2a]",
};

const COST_COLORS: Record<number, string> = {
  1: "ring-[#3a3a3a]",
  2: "ring-[#3a3a3a]",
  3: "ring-[#3a3a3a]",
  4: "ring-[#3a3a3a]",
  5: "ring-[#f0b90b]/60",
};

const COST_BG: Record<number, string> = {
  1: "bg-[#252525]",
  2: "bg-[#252525]",
  3: "bg-[#252525]",
  4: "bg-[#252525]",
  5: "bg-[#2a2520]",
};

export default function HomePage() {
  const topComps = MOCK_COMPS.slice(0, 6);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />

      {/* === HERO BANNER === */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-4 py-2">
          <div className="relative rounded-xl overflow-hidden" style={{ minHeight: "320px" }}>

            {/* Background image — Riot official splash art */}
            <Image
              src="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg"
              alt="TFT Banner"
              fill
              priority
              quality={90}
              sizes="(max-width: 1400px) 100vw, 1400px"
              className="object-cover object-top"
            />

            {/* Overlay tối bên trái, trong suốt bên phải */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(100deg, rgba(8,8,12,0.95) 0%, rgba(8,8,12,0.85) 30%, rgba(8,8,12,0.50) 55%, rgba(8,8,12,0.08) 80%, transparent 100%)",
              }}
            />

            {/* Bottom fade vào nền trang */}
            <div
              className="absolute inset-x-0 bottom-0 h-20"
              style={{ background: "linear-gradient(to top, #1a1a1a 0%, transparent 100%)" }}
            />

            {/* Content */}
            <div className="relative z-10 px-10 py-14 max-w-xl">
              {/* Live badge */}
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-green-400 uppercase tracking-widest">
                  Live · Patch {SITE_CONFIG.patch}
                </span>
              </div>

              <h1 className="text-3xl lg:text-[2.6rem] font-extrabold text-white leading-tight mb-3 tracking-tight">
                Nơi tốt nhất cho{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(90deg, #eab308, #f97316)" }}
                >
                  thống kê & dữ liệu
                </span>{" "}
                TFT
              </h1>
              <p className="text-gray-400 text-sm mb-8 max-w-sm leading-relaxed">
                Phân tích hơn 2 triệu ván đấu mỗi ngày. Đội hình, tướng, trang bị vàlõi — tất cả trong một nơi.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/comps"
                  className="rounded-lg px-6 py-2.5 text-sm font-bold text-black transition-all hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, #eab308, #ca8a04)",
                    boxShadow: "0 0 24px rgba(234,179,8,0.40)",
                  }}
                >
                  Xem Đội Hình
                </Link>
                <Link
                  href="/tierlist"
                  className="rounded-lg border border-white/25 bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
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
              <div
                key={f.title}
                className="flex items-start gap-4 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] p-5 hover:border-[#3a3a3a] transition-colors"
              >
                {/* Champion portrait */}
                <div
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl"
                  style={{
                    border: `2px solid ${f.accentColor}55`,
                    boxShadow: `0 0 18px ${f.accentColor}30`,
                  }}
                >
                  <Image
                    src={f.imgUrl}
                    alt={f.imgAlt}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                  {/* Accent tint overlay */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: `linear-gradient(135deg, ${f.accentColor}18 0%, transparent 60%)`,
                    }}
                  />
                </div>

                <div>
                  <h3
                    className="text-sm font-bold text-white mb-1"
                    style={{ color: f.accentColor }}
                  >
                    {f.title}
                  </h3>
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
                    <span className="text-sm font-semibold text-white group-hover:text-[#f0b90b] transition-colors truncate">
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
                  <span className="text-sm font-semibold text-[#f0b90b]">{comp.winRate.toFixed(1)}%</span>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-sm font-semibold text-gray-300">{comp.top4Rate.toFixed(1)}%</span>
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
