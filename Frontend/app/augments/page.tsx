import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from "@/lib/api-client";
import AugmentsClient from "./AugmentsClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Tier List Tăng Cường TFT",
  description:
    "Tier list tăng cường TFT đầy đủ xếp hạng theo tỷ lệ thắng và vị trí trung bình. Tìm tăng cường Bạc, Vàng và Huyền Thoại tốt nhất.",
  path: "/augments",
  keywords: ["tăng cường TFT", "tier list tăng cường TFT", "tăng cường huyền thoại TFT"],
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Tăng Cường", item: `${SITE_CONFIG.url}/augments` },
    ],
  },
];

export default async function AugmentsPage() {
  const augments = await apiClient.getAugments();

  return (
    <>
      <JsonLd data={jsonLd} />
      <AugmentsClient augments={augments} />
    </>
  );
}
