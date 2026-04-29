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
    splashUrl: "/augments-banner.png",
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
    splashUrl: "/traits-banner.png",
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
        style={{ minHeight: "270px" }}
      >
        {/* Background image */}
        <Image
          src={config.splashUrl}
          alt={config.iconAlt}
          fill
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="object-cover"
          style={{ objectPosition: "center 20%" }}
          priority
          quality={85}
        />

        {/* Bottom gradient to fade into page bg */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(26,26,26,0.85) 0%, transparent 50%)",
          }}
        />

        {/* Breadcrumb — pinned to bottom-left */}
        <nav
          className="absolute bottom-0 left-0 right-0 flex items-center gap-1.5 px-5 py-3 text-[11px]"
        >
          {config.breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <svg className="h-2.5 w-2.5 text-gray-500" fill="none" viewBox="0 0 6 10">
                  <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {crumb.href ? (
                <Link href={crumb.href} className="text-gray-400 transition-colors hover:text-white">
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
      </div>
    </div>
  );
}
