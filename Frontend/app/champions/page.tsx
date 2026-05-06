import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from "@/lib/api-client";
import ChampionsClient from "./ChampionsClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Tướng TFT & Kỹ Năng",
  description:
    "Danh sách đầy đủ tất cả tướng TFT với tộc, kỹ năng, trang bị tốt nhất và số liệu hiệu suất. Tìm carry tốt nhất cho đội hình.",
  path: "/champions",
  keywords: ["tướng TFT", "danh sách tướng TFT", "kỹ năng TFT", "tướng Teamfight Tactics"],
});

const championsJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Tướng", item: `${SITE_CONFIG.url}/champions` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_CONFIG.url}/champions#itemlist`,
    name: "Danh Sách Tướng TFT",
    description: "Tất cả tướng TFT với thống kê, tộc và xếp hạng tier",
    url: `${SITE_CONFIG.url}/champions`,
  },
];

export const dynamic = "force-dynamic";

export default async function ChampionsPage() {
  const champions = await apiClient.getChampions();

  return (
    <>
      <JsonLd data={championsJsonLd} />

      <ChampionsClient champions={champions as any} />
    </>
  );
}