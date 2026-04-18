import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = generatePageMetadata({
  title: "Tộc & Hệ TFT — Thống Kê Hiệu Suất",
  description:
    "Thống kê tất cả tộc và hệ TFT xếp hạng theo tỷ lệ thắng, top 4, và vị trí trung bình. Tìm tộc/hệ mạnh nhất trong meta hiện tại.",
  path: "/traits",
  keywords: ["tộc TFT", "hệ TFT", "traits TFT", "tier list traits TFT", "tộc hệ mạnh TFT"],
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Thống Kê",  item: `${SITE_CONFIG.url}/tierlist` },
      { "@type": "ListItem", position: 3, name: "Tộc & Hệ", item: `${SITE_CONFIG.url}/traits` },
    ],
  },
];

export default function TraitsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={jsonLd} />
      {children}
    </>
  );
}
