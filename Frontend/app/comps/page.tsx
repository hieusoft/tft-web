import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from "@/lib/api-client";
import CompsClient from "./CompsClient";
import "./comps.css";

export const metadata: Metadata = generatePageMetadata({
  title: "Đội Hình TFT Tốt Nhất",
  description:
    "Khám phá đội hình TFT tốt nhất được xếp hạng theo tỷ lệ thắng, top 4 và vị trí trung bình. Cập nhật mọi 30 phút với dữ liệu trực tiếp.",
  path: "/comps",
  keywords: [
    "đội hình TFT tốt nhất",
    "meta TFT",
    "tier list đội hình TFT",
    "Teamfight Tactics comps",
    "đội hình Teamfight Tactics",
  ],
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

export default async function CompsPage() {
  const comps = await apiClient.getComps();

  return (
    <>
      <JsonLd data={compsJsonLd} />

      <div className="comp-page">
        <div className="comp-container">
          <CompsClient initialComps={comps} />
        </div>
      </div>
    </>
  );
}
