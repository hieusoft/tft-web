import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";

// Dynamic import - giam initial JS bundle, chi load CompsClient khi can
// Skeleton loading cai thien perceived performance
const CompsClient = dynamic(() => import("./CompsClient"), {
  loading: () => (
    <div className="flex flex-col gap-2">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-16 rounded bg-[#1e1e1e] border border-[#2a2a2a] animate-pulse"
        />
      ))}
    </div>
  ),
});


export const metadata: Metadata = generatePageMetadata({
  title: "Đội Hình TFT Tốt Nhất",
  description:
    "Khám phá đội hình TFT tốt nhất được xếp hạng theo tỷ lệ thắng, top 4 và vị trí trung bình. Cập nhật mọi 30 phút với dữ liệu trực tiếp.",
  path: "/comps",
  keywords: ["đội hình TFT tốt nhất", "meta TFT", "tier list đội hình TFT", "Teamfight Tactics comps", "đội hình Teamfight Tactics"],
});

const compsJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Đội Hình", item: `${SITE_CONFIG.url}/comps` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_CONFIG.url}/comps#itemlist`,
    name: "Đội Hình TFT Tốt Nhất",
    description: "Xếp hạng đội hình TFT theo tỷ lệ thắng và hiệu suất",
    url: `${SITE_CONFIG.url}/comps`,
  },
];

export default function CompsPage() {
  return (
    <>
      <JsonLd data={compsJsonLd} />

      <div className="bg-[#1a1a1a] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          <CompsClient />

        </div>
      </div>
    </>
  );
}
