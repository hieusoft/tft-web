export const SITE_CONFIG = {
  name: "MetaTFT VN",
  tagline: "Khám phá Meta TFT với thống kê và dữ liệu",
  description:
    "Khám phá dữ liệu về đội hình, trang bị,lõi TFT và nhiều hơn nữa. Nhận đầy đủ thông tin & công cụ Teamfight Tactics với MetaTFT VN.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://metatft.gg",
  ogImage: "/og-image.png",
  twitterHandle: "@metatftvn",
  themeColor: "#1a1a1a",
  patch: "17.1",
  locale: "vi_VN",
  language: "vi",
};

export const NAV_LINKS = [
  {
    label: "Đội Hình",
    href: "/comps",
    description: "Đội hình TFT tốt nhất theo tỷ lệ thắng",
    sub: [
      { label: "Đội Hình", href: "/comps", icon: "🔥" },
      { label: "Đội Hình PBE", href: "/pbe", icon: "🧪" },
    ],
  },
  {
    label: "Thống Kê",
    href: "/champions",
    description: "Thống kê tướng, trang bị, tộc hệ",
    sub: [
      { label: "Lõi", href: "/augments", icon: "✨" },
      { label: "Tướng", href: "/champions", icon: "⚔️" },
      { label: "Trang Bị", href: "/items", icon: "🛡️" },
      { label: "Tộc & Hệ", href: "/traits", icon: "🌀" },
      { label: "Thần Thoại", href: "/gods", icon: "📊" },
    ],
  },
  {
    label: "Công Cụ",
    href: "/tools",
    description: "Công cụ hỗ trợ",
    sub: [
      { label: "Team Builder", href: "/team-builder", icon: "🔧" },
    ],
  },
];

// ── Canonical tier palette — dùng chung mọi trang ──
// S=red, A=orange, B=gold, C=emerald, D=gray
export const TIER_HEX: Record<string, string> = {
  S: "#ef4444",
  A: "#f97316",
  B: "#f0b90b",
  C: "#10b981",
  D: "#6b7280",
};

export const TIER_COLORS: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-orange-500",
  B: "bg-yellow-500",
  C: "bg-emerald-500",
  D: "bg-gray-500",
};

export const TIER_TEXT: Record<string, string> = {
  S: "text-red-400",
  A: "text-orange-400",
  B: "text-yellow-400",
  C: "text-emerald-400",
  D: "text-gray-400",
};

export const TIER_BORDER: Record<string, string> = {
  S: "border-red-500",
  A: "border-orange-500",
  B: "border-yellow-500",
  C: "border-emerald-500",
  D: "border-gray-500",
};
