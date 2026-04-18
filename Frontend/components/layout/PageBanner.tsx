"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";
import type { ReactNode } from "react";

// ── SVG Icons ─────────────────────────────────────────────────────────────────

// /comps — crossed swords (battle formation)
const IconComps = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 9.5 3 21" />
    <path d="m21 3-6.75 6.75" />
    <path d="m3 3 6.75 6.75" />
    <path d="m9 9 1.5 1.5" />
    <path d="M10.5 13.5 3 21" />
    <path d="M21 21 9.5 9.5" />
    <path d="M18 3h3v3" />
    <path d="M3 6V3h3" />
  </svg>
);

// /augments — sparkle / magic star
const IconAugments = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v2" />
    <path d="M12 19v2" />
    <path d="m4.22 4.22 1.42 1.42" />
    <path d="m18.36 18.36 1.42 1.42" />
    <path d="M3 12h2" />
    <path d="M19 12h2" />
    <path d="m4.22 19.78 1.42-1.42" />
    <path d="m18.36 5.64 1.42-1.42" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 8v1" />
    <path d="M12 15v1" />
    <path d="m9.17 9.17.71.71" />
    <path d="m14.12 14.12.71.71" />
  </svg>
);

// /champions — crown
const IconChampions = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20h20" />
    <path d="m4 16 4-8 4 4 4-8 4 8" />
    <circle cx="4" cy="8" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="20" cy="8" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

// /items — shield with bolt
const IconItems = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9.5 12h1.5l1-3 1.5 6 1-3H16" />
  </svg>
);

// /traits — hexagon network
const IconTraits = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 19.2 6 19.2 14 12 18 4.8 14 4.8 6" />
    <circle cx="12" cy="10" r="2" />
    <path d="M12 12v6" />
    <path d="m7 6.5-2.2-2.5" />
    <path d="m17 6.5 2.2-2.5" />
  </svg>
);

// /tierlist — bar chart rising
const IconTierlist = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="14" width="4" height="7" rx="1" />
    <rect x="9.5" y="9" width="4" height="12" rx="1" />
    <rect x="16" y="4" width="4" height="17" rx="1" />
    <path d="M3 5l5-3 5 4 5-4" />
  </svg>
);

// /players — person with trophy
const IconPlayers = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="7" r="4" />
    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3h5v5" />
    <path d="M21 3l-5 5" />
    <path d="M19 11v2a2 2 0 0 1-2 2h-1" />
  </svg>
);

// default — lightning bolt
const IconDefault = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ── Banner config theo từng route ──────────────────────────────────────────────

interface BannerConfig {
  title: string;
  subtitle: string;
  icon: ReactNode;
  accentHex: string;
  gradientFrom: string;
  gradientMid: string;
  gradientTo: string;
  stats: { label: string; value: string; highlight?: boolean }[];
  breadcrumb: { label: string; href?: string }[];
}

const BANNER_MAP: Record<string, BannerConfig> = {
  "/comps": {
    title: "Đội Hình TFT Tốt Nhất",
    subtitle: "Đội hình meta được phân tích từ hàng triệu trận đấu. Cập nhật theo thời gian thực.",
    icon: <IconComps />,
    accentHex: "#ef4444",
    gradientFrom: "#220808",
    gradientMid: "#180505",
    gradientTo: "#111111",
    stats: [
      { label: "Đội Hình", value: "127" },
      { label: "Trận Phân Tích", value: "2.1M" },
      { label: "Tỷ Lệ Thắng Cao Nhất", value: "17.3%", highlight: true },
      { label: "Cập Nhật", value: `Patch ${SITE_CONFIG.patch}` },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Đội Hình" }],
  },

  "/augments": {
    title: "Tier List Tăng Cường TFT",
    subtitle: "Tất cả tăng cường Bạc, Vàng và Huyền Thoại xếp hạng theo hiệu suất thực tế.",
    icon: <IconAugments />,
    accentHex: "#a855f7",
    gradientFrom: "#160820",
    gradientMid: "#110518",
    gradientTo: "#111111",
    stats: [
      { label: "Tăng Cường", value: "87" },
      { label: "Tốt Nhất", value: "Đoàn Kết", highlight: true },
      { label: "Vị Trí T.Bình Tốt Nhất", value: "3.10" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Thống Kê", href: "/tierlist" }, { label: "Tăng Cường" }],
  },

  "/champions": {
    title: "Thống Kê Tướng TFT",
    subtitle: "Hiệu suất từng tướng theo cost, vị trí trung bình và tỷ lệ top 4.",
    icon: <IconChampions />,
    accentHex: "#eab308",
    gradientFrom: "#201600",
    gradientMid: "#181000",
    gradientTo: "#111111",
    stats: [
      { label: "Tướng", value: "60" },
      { label: "Top Tướng", value: "Caitlyn", highlight: true },
      { label: "Win Rate Cao Nhất", value: "17.0%" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Thống Kê", href: "/tierlist" }, { label: "Tướng" }],
  },

  "/items": {
    title: "Thống Kê Trang Bị TFT",
    subtitle: "Trang bị tốt nhất theo vị trí trung bình và tỷ lệ top 4 từ dữ liệu thực tế.",
    icon: <IconItems />,
    accentHex: "#3b82f6",
    gradientFrom: "#040f20",
    gradientMid: "#020b17",
    gradientTo: "#111111",
    stats: [
      { label: "Trang Bị", value: "58" },
      { label: "Tốt Nhất", value: "Lưỡi Hút Máu", highlight: true },
      { label: "Top 4 Cao Nhất", value: "66.2%" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Thống Kê", href: "/tierlist" }, { label: "Trang Bị" }],
  },

  "/traits": {
    title: "Tộc & Hệ TFT",
    subtitle: "Thống kê hiệu suất tất cả tộc và hệ trong meta hiện tại.",
    icon: <IconTraits />,
    accentHex: "#14b8a6",
    gradientFrom: "#031a17",
    gradientMid: "#021410",
    gradientTo: "#111111",
    stats: [
      { label: "Tộc & Hệ", value: "17" },
      { label: "Mạnh Nhất", value: "Phù Thủy", highlight: true },
      { label: "Top 4 Cao Nhất", value: "66.2%" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Thống Kê", href: "/tierlist" }, { label: "Tộc & Hệ" }],
  },

  "/tierlist": {
    title: "Bảng Xếp Hạng TFT",
    subtitle: "Tier list tổng hợp tướng, trang bị và đội hình cập nhật hàng giờ.",
    icon: <IconTierlist />,
    accentHex: "#f97316",
    gradientFrom: "#1f0c00",
    gradientMid: "#180900",
    gradientTo: "#111111",
    stats: [
      { label: "Tướng S-Tier", value: "8" },
      { label: "Tộc Hot", value: "Phản Loạn", highlight: true },
      { label: "Trận Hôm Nay", value: "48K" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Thống Kê" }],
  },

  "/players": {
    title: "Bảng Xếp Hạng Người Chơi",
    subtitle: "Thứ hạng và lịch sử trận đấu của các người chơi hàng đầu.",
    icon: <IconPlayers />,
    accentHex: "#eab308",
    gradientFrom: "#1a1400",
    gradientMid: "#130f00",
    gradientTo: "#111111",
    stats: [
      { label: "Người Chơi", value: "12.4K" },
      { label: "Challenger", value: "200" },
      { label: "LP Cao Nhất", value: "2,140", highlight: true },
      { label: "Server", value: "VN" },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Người Chơi" }],
  },
};

// Fallback
const DEFAULT_BANNER: BannerConfig = {
  title: "MetaTFT VN",
  subtitle: "Khám phá meta TFT với thống kê và dữ liệu cập nhật.",
  icon: <IconDefault />,
  accentHex: "#eab308",
  gradientFrom: "#1a1400",
  gradientMid: "#130f00",
  gradientTo: "#111111",
  stats: [
    { label: "Patch", value: SITE_CONFIG.patch, highlight: true },
    { label: "Trận Hôm Nay", value: "48K" },
  ],
  breadcrumb: [{ label: "Trang Chủ", href: "/" }],
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function PageBanner() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  let config = BANNER_MAP[pathname];
  if (!config) {
    const prefix = Object.keys(BANNER_MAP).find((k) => pathname.startsWith(k));
    config = prefix ? BANNER_MAP[prefix] : DEFAULT_BANNER;
  }

  const accent = config.accentHex;

  return (
    <div className="w-full px-4 py-4">
      <div
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-2xl"
        style={{
          background: `linear-gradient(145deg, ${config.gradientFrom} 0%, ${config.gradientMid} 45%, ${config.gradientTo} 100%)`,
          minHeight: "180px",
          border: `1px solid ${accent}22`,
          boxShadow: `0 0 0 1px #ffffff08, 0 4px 40px 0 ${accent}18, inset 0 1px 0 #ffffff0a`,
        }}
      >
        {/* Primary glow blob */}
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.12 }}
        />
        {/* Secondary glow blob */}
        <div
          className="pointer-events-none absolute -bottom-12 right-8 h-48 w-80 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.07 }}
        />
        {/* Center glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: accent, opacity: 0.04 }}
        />

        {/* Dot grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Diagonal shine */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(110deg, transparent 30%, ${accent}08 50%, transparent 70%)`,
          }}
        />

        {/* Top accent line */}
        <div
          className="absolute left-0 right-0 top-0 h-[1px]"
          style={{
            background: `linear-gradient(90deg, transparent, ${accent}60 40%, ${accent}90 50%, ${accent}60 60%, transparent)`,
          }}
        />

        {/* Content */}
        <div className="relative px-6 py-5">
          {/* Breadcrumb */}
          <nav className="mb-3 flex items-center gap-1.5 text-[11px]">
            {config.breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg className="h-2.5 w-2.5 text-gray-600" fill="none" viewBox="0 0 6 10">
                    <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-gray-500 transition-colors hover:text-gray-300">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-medium" style={{ color: accent }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Main row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT — icon + text */}
            <div className="flex items-center gap-4">
              {/* Icon box */}
              <div
                className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${accent}25, ${accent}0e)`,
                  border: `1px solid ${accent}45`,
                  boxShadow: `0 0 20px ${accent}28, inset 0 1px 0 ${accent}20`,
                  color: accent,
                }}
              >
                {config.icon}
                {/* inner shine */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${accent}15 0%, transparent 60%)` }}
                />
              </div>

              <div>
                <h1
                  className="bg-clip-text text-transparent text-[1.35rem] font-extrabold leading-tight tracking-tight"
                  style={{
                    backgroundImage: `linear-gradient(90deg, #ffffff 0%, ${accent} 60%, rgba(255,255,255,0.53) 100%)`,
                  }}
                >
                  {config.title}
                </h1>
                <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-gray-500">
                  {config.subtitle}
                </p>
              </div>
            </div>

            {/* RIGHT — stats */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {config.stats.map((stat, i) =>
                stat.highlight ? (
                  <div
                    key={i}
                    className="relative flex flex-col items-center overflow-hidden rounded-xl px-4 py-2"
                    style={{
                      background: `linear-gradient(135deg, ${accent}22, ${accent}0a)`,
                      border: `1px solid ${accent}50`,
                      boxShadow: `0 0 12px ${accent}20`,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute left-0 right-0 top-0 h-px"
                      style={{ background: `linear-gradient(90deg, transparent, ${accent}80, transparent)` }}
                    />
                    <span className="text-sm font-bold leading-tight" style={{ color: accent }}>
                      {stat.value}
                    </span>
                    <span className="mt-0.5 text-[10px] leading-tight" style={{ color: `${accent}99` }}>
                      {stat.label}
                    </span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded-xl px-4 py-2"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <span className="text-sm font-bold leading-tight text-white">{stat.value}</span>
                    <span className="mt-0.5 text-[10px] leading-tight text-gray-500">{stat.label}</span>
                  </div>
                )
              )}

              {/* Live pill */}
              <div
                className="flex items-center gap-1.5 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(34,197,94,0.07)",
                  border: "1px solid rgba(34,197,94,0.22)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full bg-green-400"
                  style={{ boxShadow: "0 0 6px #4ade80", animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite" }}
                />
                <span className="text-[10px] font-semibold text-green-400">LIVE</span>
              </div>
            </div>
          </div>

          {/* Bottom divider */}
          <div
            className="mt-4 h-px w-full"
            style={{
              background: `linear-gradient(90deg, ${accent}40 0%, rgba(255,255,255,0.06) 40%, transparent 100%)`,
            }}
          />

          {/* Patch badge row */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                background: `${accent}18`,
                color: accent,
                border: `1px solid ${accent}30`,
              }}
            >
              <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Patch {SITE_CONFIG.patch}
            </span>
            <span className="text-[10px] text-gray-600">Dữ liệu cập nhật theo thời gian thực</span>
          </div>
        </div>
      </div>
    </div>
  );
}
