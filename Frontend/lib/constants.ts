export const SITE_CONFIG = {
  name: "MetaTFT VN",
  tagline: "Khám phá Meta TFT với thống kê và dữ liệu",
  description:
    "Khám phá dữ liệu về đội hình, trang bị, tăng cường TFT và nhiều hơn nữa. Nhận đầy đủ thông tin & công cụ Teamfight Tactics với MetaTFT VN.",
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
      { label: "Đội Hình", href: "/comps" },
      { label: "Đội Hình Sớm", href: "/comps/early" },
    ],
  },
  {
    label: "Thống Kê",
    href: "/tierlist",
    description: "Bảng xếp hạng tướng",
    sub: [
      { label: "Bảng Xếp Hạng", href: "/tierlist" },
      { label: "Tướng", href: "/champions" },
      { label: "Trang Bị", href: "/items" },
      { label: "Tăng Cường", href: "/augments" },
    ],
  },
  {
    label: "Người Chơi",
    href: "/players",
    description: "Xếp hạng người chơi",
    sub: [],
  },
  {
    label: "Công Cụ",
    href: "/tools",
    description: "Công cụ hỗ trợ",
    sub: [],
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
