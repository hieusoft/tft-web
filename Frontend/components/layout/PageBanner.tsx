"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";

// ── Banner config theo từng route ──────────────────────────────────────────────
// Splash art: ddragon.leagueoflegends.com/cdn/img/champion/splash/<Name>_0.jpg
// Tile (icon nhỏ vuông): ddragon.leagueoflegends.com/cdn/<ver>/img/champion/<Name>.png

const PATCH = "15.8.1"; // ddragon patch

interface BannerConfig {
  title: string;
  subtitle: string;
  accentHex: string;
  // Ảnh splash hero (wide), dùng làm bg
  splashUrl: string;
  // Ảnh tile icon nhỏ bên trái
  iconUrl: string;
  iconAlt: string;
  stats: { label: string; value: string; highlight?: boolean }[];
  breadcrumb: { label: string; href?: string }[];
}

const BANNER_MAP: Record<string, BannerConfig> = {
  "/comps": {
    title: "Đội Hình TFT Tốt Nhất",
    subtitle:
      "Đội hình meta được phân tích từ hàng triệu trận đấu. Cập nhật theo thời gian thực.",
    accentHex: "#ef4444",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jinx_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Jinx.png`,
    iconAlt: "Jinx",
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
    subtitle:
      "Tất cả tăng cường Bạc, Vàng và Huyền Thoại xếp hạng theo hiệu suất thực tế.",
    accentHex: "#a855f7",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Lux.png`,
    iconAlt: "Lux",
    stats: [
      { label: "Tăng Cường", value: "87" },
      { label: "Tốt Nhất", value: "Đoàn Kết", highlight: true },
      { label: "Vị Trí T.Bình Tốt Nhất", value: "3.10" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [
      { label: "Trang Chủ", href: "/" },
      { label: "Thống Kê", href: "/tierlist" },
      { label: "Tăng Cường" },
    ],
  },

  "/champions": {
    title: "Thống Kê Tướng TFT",
    subtitle:
      "Hiệu suất từng tướng theo cost, vị trí trung bình và tỷ lệ top 4.",
    accentHex: "#eab308",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Caitlyn_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Caitlyn.png`,
    iconAlt: "Caitlyn",
    stats: [
      { label: "Tướng", value: "60" },
      { label: "Top Tướng", value: "Caitlyn", highlight: true },
      { label: "Win Rate Cao Nhất", value: "17.0%" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [
      { label: "Trang Chủ", href: "/" },
      { label: "Thống Kê", href: "/tierlist" },
      { label: "Tướng" },
    ],
  },

  "/items": {
    title: "Thống Kê Trang Bị TFT",
    subtitle:
      "Trang bị tốt nhất theo vị trí trung bình và tỷ lệ top 4 từ dữ liệu thực tế.",
    accentHex: "#3b82f6",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Jayce_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Jayce.png`,
    iconAlt: "Jayce",
    stats: [
      { label: "Trang Bị", value: "58" },
      { label: "Tốt Nhất", value: "Lưỡi Hút Máu", highlight: true },
      { label: "Top 4 Cao Nhất", value: "66.2%" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [
      { label: "Trang Chủ", href: "/" },
      { label: "Thống Kê", href: "/tierlist" },
      { label: "Trang Bị" },
    ],
  },

  "/traits": {
    title: "Tộc & Hệ TFT",
    subtitle: "Thống kê hiệu suất tất cả tộc và hệ trong meta hiện tại.",
    accentHex: "#14b8a6",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Nami_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Nami.png`,
    iconAlt: "Nami",
    stats: [
      { label: "Tộc & Hệ", value: "17" },
      { label: "Mạnh Nhất", value: "Phù Thủy", highlight: true },
      { label: "Top 4 Cao Nhất", value: "66.2%" },
      { label: "Patch", value: SITE_CONFIG.patch },
    ],
    breadcrumb: [
      { label: "Trang Chủ", href: "/" },
      { label: "Thống Kê", href: "/tierlist" },
      { label: "Tộc & Hệ" },
    ],
  },

  "/tierlist": {
    title: "Bảng Xếp Hạng TFT",
    subtitle:
      "Tier list tổng hợp tướng, trang bị và đội hình cập nhật hàng giờ.",
    accentHex: "#f97316",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Ahri.png`,
    iconAlt: "Ahri",
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
    accentHex: "#eab308",
    splashUrl:
      "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ezreal_0.jpg",
    iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Ezreal.png`,
    iconAlt: "Ezreal",
    stats: [
      { label: "Người Chơi", value: "12.4K" },
      { label: "Challenger", value: "200" },
      { label: "LP Cao Nhất", value: "2,140", highlight: true },
      { label: "Server", value: "VN" },
    ],
    breadcrumb: [
      { label: "Trang Chủ", href: "/" },
      { label: "Người Chơi" },
    ],
  },
};

const DEFAULT_BANNER: BannerConfig = {
  title: "MetaTFT VN",
  subtitle: "Khám phá meta TFT với thống kê và dữ liệu cập nhật.",
  accentHex: "#eab308",
  splashUrl:
    "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Lux_0.jpg",
  iconUrl: `https://ddragon.leagueoflegends.com/cdn/${PATCH}/img/champion/Lux.png`,
  iconAlt: "Lux",
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
          minHeight: "200px",
          border: `1px solid ${accent}30`,
          boxShadow: `0 0 0 1px #ffffff08, 0 8px 60px 0 ${accent}25, inset 0 1px 0 #ffffff10`,
        }}
      >
        {/* ── Splash art background ── */}
        <div className="absolute inset-0">
          <Image
            src={config.splashUrl}
            alt={config.iconAlt}
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover object-top"
            priority
            quality={85}
          />
        </div>

        {/* Dark overlay gradient: left heavy để text đọc rõ */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              105deg,
              rgba(8,8,12,0.97) 0%,
              rgba(8,8,12,0.90) 35%,
              rgba(8,8,12,0.72) 55%,
              rgba(8,8,12,0.40) 75%,
              rgba(8,8,12,0.15) 100%
            )`,
          }}
        />

        {/* Accent color tint overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(105deg, ${accent}18 0%, transparent 50%)`,
          }}
        />

        {/* Top accent line */}
        <div
          className="absolute left-0 right-0 top-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${accent}90 0%, ${accent}ff 30%, ${accent}60 60%, transparent 100%)`,
          }}
        />

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, ${accent}40 0%, rgba(255,255,255,0.06) 40%, transparent 100%)`,
          }}
        />

        {/* Dot grid texture — subtle */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content */}
        <div className="relative px-6 py-5">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-[11px]">
            {config.breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg
                    className="h-2.5 w-2.5 text-gray-600"
                    fill="none"
                    viewBox="0 0 6 10"
                  >
                    <path
                      d="M1 1l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-gray-500 transition-colors hover:text-gray-300"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold" style={{ color: accent }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Main row */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* LEFT — champion icon + text */}
            <div className="flex items-center gap-5">
              {/* Champion icon với ring glow */}
              <div
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl"
                style={{
                  border: `2px solid ${accent}60`,
                  boxShadow: `0 0 0 4px ${accent}18, 0 0 30px ${accent}40`,
                }}
              >
                <Image
                  src={config.iconUrl}
                  alt={config.iconAlt}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
                {/* Icon inner shine */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${accent}20 0%, transparent 50%)`,
                  }}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  {/* Live pill compact */}
                  <div
                    className="flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                      background: "rgba(34,197,94,0.10)",
                      border: "1px solid rgba(34,197,94,0.28)",
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-green-400"
                      style={{
                        boxShadow: "0 0 5px #4ade80",
                        animation:
                          "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
                      }}
                    />
                    <span className="text-[9px] font-bold tracking-widest text-green-400">
                      LIVE
                    </span>
                  </div>
                  {/* Patch badge compact */}
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                    style={{
                      background: `${accent}18`,
                      color: accent,
                      border: `1px solid ${accent}35`,
                    }}
                  >
                    <svg
                      className="h-2 w-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Patch {SITE_CONFIG.patch}
                  </span>
                </div>

                <h1
                  className="bg-clip-text text-transparent text-[1.45rem] font-extrabold leading-tight tracking-tight"
                  style={{
                    backgroundImage: `linear-gradient(90deg, #ffffff 0%, ${accent} 55%, rgba(255,255,255,0.70) 100%)`,
                  }}
                >
                  {config.title}
                </h1>
                <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-gray-400">
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
                    className="relative flex flex-col items-center overflow-hidden rounded-xl px-5 py-2.5"
                    style={{
                      background: `linear-gradient(135deg, ${accent}28, ${accent}0e)`,
                      border: `1px solid ${accent}55`,
                      boxShadow: `0 0 16px ${accent}25, inset 0 1px 0 ${accent}20`,
                    }}
                  >
                    {/* shimmer line */}
                    <div
                      className="pointer-events-none absolute left-0 right-0 top-0 h-px"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${accent}90, transparent)`,
                      }}
                    />
                    <span
                      className="text-sm font-bold leading-tight"
                      style={{ color: accent }}
                    >
                      {stat.value}
                    </span>
                    <span
                      className="mt-0.5 text-[10px] leading-tight"
                      style={{ color: `${accent}99` }}
                    >
                      {stat.label}
                    </span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex flex-col items-center rounded-xl px-5 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span className="text-sm font-bold leading-tight text-white">
                      {stat.value}
                    </span>
                    <span className="mt-0.5 text-[10px] leading-tight text-gray-500">
                      {stat.label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Bottom info row */}
          <div className="mt-5 flex items-center gap-2">
            <span className="text-[10px] text-gray-600">
              Dữ liệu cập nhật theo thời gian thực
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
