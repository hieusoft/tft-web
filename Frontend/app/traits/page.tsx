import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from "@/lib/api-client";
import TraitsClient from "./TraitsClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Tộc & Hệ TFT",
  description:
    "Danh sách đầy đủ tất cả tộc và hệ trong TFT, bao gồm các mốc kích hoạt, tỷ lệ pick và thứ hạng trung bình. Tìm tộc/hệ mạnh nhất meta hiện tại.",
  path: "/traits",
  keywords: ["tộc TFT", "hệ TFT", "trait TFT", "tộc hệ Teamfight Tactics", "bộ tộc TFT tốt nhất"],
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Tộc & Hệ", item: `${SITE_CONFIG.url}/traits` },
    ],
  },
];

// Force dynamic rendering — tránh static-generate lúc build khi backend chưa chạy
export const dynamic = "force-dynamic";

export default async function TraitsPage() {
  const traits = await apiClient.getTraits();
  return (
    <>
      <JsonLd data={jsonLd} />
      <TraitsClient traits={traits} />
    </>
  );
}
