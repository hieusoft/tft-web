"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_CONFIG } from "@/lib/constants";

// ── Banner config theo từng route ──────────────────────────────────────────────

interface BannerConfig {
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;       // tailwind bg class for glow
  gradientFrom: string;      // inline hex từ
  gradientTo: string;        // inline hex đến
  stats: { label: string; value: string; highlight?: boolean }[];
  breadcrumb: { label: string; href?: string }[];
}

const BANNER_MAP: Record<string, BannerConfig> = {
  "/comps": {
    title: "Đội Hình TFT Tốt Nhất",
    subtitle: "Đội hình meta được phân tích từ hàng triệu trận đấu. Cập nhật theo thời gian thực.",
    icon: "🔥",
    accentColor: "bg-red-500",
    gradientFrom: "#1f0a0a",
    gradientTo: "#1a1a1a",
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
    icon: "✨",
    accentColor: "bg-purple-500",
    gradientFrom: "#130a1f",
    gradientTo: "#1a1a1a",
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
    icon: "⚔️",
    accentColor: "bg-yellow-500",
    gradientFrom: "#1f1500",
    gradientTo: "#1a1a1a",
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
    icon: "🛡️",
    accentColor: "bg-blue-500",
    gradientFrom: "#050f1f",
    gradientTo: "#1a1a1a",
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
    icon: "🌀",
    accentColor: "bg-teal-500",
    gradientFrom: "#041a17",
    gradientTo: "#1a1a1a",
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
    icon: "📊",
    accentColor: "bg-orange-500",
    gradientFrom: "#1f0d00",
    gradientTo: "#1a1a1a",
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
    icon: "🥇",
    accentColor: "bg-yellow-500",
    gradientFrom: "#1a1500",
    gradientTo: "#1a1a1a",
    stats: [
      { label: "Người Chơi", value: "12.4K" },
      { label: "Challenger", value: "200" },
      { label: "LP Cao Nhất", value: "2,140", highlight: true },
      { label: "Server", value: "VN" },
    ],
    breadcrumb: [{ label: "Trang Chủ", href: "/" }, { label: "Người Chơi" }],
  },
};

// Fallback cho các route không được config
const DEFAULT_BANNER: BannerConfig = {
  title: "MetaTFT VN",
  subtitle: "Khám phá meta TFT với thống kê và dữ liệu cập nhật.",
  icon: "⚡",
  accentColor: "bg-yellow-500",
  gradientFrom: "#1a1500",
  gradientTo: "#1a1a1a",
  stats: [
    { label: "Patch", value: SITE_CONFIG.patch, highlight: true },
    { label: "Trận Hôm Nay", value: "48K" },
  ],
  breadcrumb: [{ label: "Trang Chủ", href: "/" }],
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function PageBanner() {
  const pathname = usePathname();

  // Không hiển thị banner ở trang chủ
  if (pathname === "/") return null;

  // Tìm config khớp — dùng route gần nhất
  let config = BANNER_MAP[pathname];
  if (!config) {
    // khớp với prefix (vd: /comps/early → /comps)
    const prefix = Object.keys(BANNER_MAP).find((k) => pathname.startsWith(k));
    config = prefix ? BANNER_MAP[prefix] : DEFAULT_BANNER;
  }

  return (
    <div className="w-full py-4 px-4">
      <div
        className="relative mx-auto max-w-[1400px] overflow-hidden rounded-xl border border-[#2a2a2a]"
        style={{
          background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 70%)`,
          minHeight: "200px",
        }}
      >
        {/* Decorative glow blob */}
        <div
          className={`absolute -top-10 -left-10 h-48 w-48 rounded-full opacity-10 blur-3xl ${config.accentColor}`}
        />
        <div
          className={`absolute -bottom-8 right-1/4 h-32 w-64 rounded-full opacity-5 blur-3xl ${config.accentColor}`}
        />

        {/* Decorative grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Content */}
        <div className="relative px-5 py-4">
          {/* Breadcrumb */}
          <nav className="mb-2 flex items-center gap-1.5 text-[11px] text-gray-600">
            {config.breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-700">›</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-gray-400 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-400">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>

          {/* Title row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl leading-none">{config.icon}</span>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">{config.title}</h1>
                <p className="mt-0.5 text-xs text-gray-500 max-w-xl">{config.subtitle}</p>
              </div>
            </div>

            {/* Stats chips */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {config.stats.map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center rounded-lg border border-[#2a2a2a] bg-[#111]/70 px-3 py-1.5 backdrop-blur-sm"
                >
                  <span
                    className={`text-sm font-bold leading-tight ${
                      stat.highlight ? "text-yellow-400" : "text-white"
                    }`}
                  >
                    {stat.value}
                  </span>
                  <span className="text-[10px] text-gray-600 leading-tight">{stat.label}</span>
                </div>
              ))}

              {/* Live indicator */}
              <div className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400 font-medium">Trực Tiếp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
