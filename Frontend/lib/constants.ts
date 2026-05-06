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
      { label: "Đội Hình Sớm", href: "/early", icon: "⚡" },
      { label: "Đội Hình PBE", href: "/pbe", icon: "🧪" },
      { label: "Đội Hình Pro", href: "/pro", icon: "🏆", badge: "Mới" },
    ],
  },
  {
    label: "Thống Kê",
    href: "/tierlist",
    description: "Bảng xếp hạng tướng",
    sub: [
      { label: "Lõi", href: "/augments", icon: "✨" },
      { label: "Tướng", href: "/champions", icon: "⚔️" },
      { label: "Trang Bị", href: "/items", icon: "🛡️" },
      { label: "Tộc & Hệ", href: "/traits", icon: "🌀" },
      { label: "Bảng Xếp Hạng", href: "/tierlist", icon: "📊" },
      { label: "Thần Thoại", href: "/gods", icon: "📊" },
    ],
  },
  {
    label: "Người Chơi",
    href: "/players",
    description: "Xếp hạng người chơi",
    sub: [
      { label: "Lịch Sử Trận", href: "/match-history", icon: "📜" },
      { label: "Bảng Xếp Hạng", href: "/leaderboard", icon: "🥇" },
      { label: "Đang Lên", href: "/rising", icon: "📈" },
    ],
  },
  {
    label: "Công Cụ",
    href: "/tools",
    description: "Công cụ hỗ trợ",
    sub: [
      { label: "Team Builder", href: "/team-builder", icon: "🔧" },
      { label: "Tính Tỷ Lệ", href: "/calculator", icon: "🧮" },
    ],
  },
];

export const TIER_COLORS: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-yellow-500",
  B: "bg-blue-500",
  C: "bg-purple-500",
  D: "bg-gray-500",
};

export const TIER_TEXT: Record<string, string> = {
  S: "text-red-400",
  A: "text-yellow-400",
  B: "text-blue-400",
  C: "text-purple-400",
  D: "text-gray-400",
};

export const TIER_BORDER: Record<string, string> = {
  S: "border-red-500",
  A: "border-yellow-500",
  B: "border-blue-500",
  C: "border-purple-500",
  D: "border-gray-500",
};
