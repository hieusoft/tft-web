import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from "@/lib/api-client";
import AugmentsClient from "./AugmentsClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Tier Listlõi TFT",
  description:
    "Tier listlõi TFT đầy đủ xếp hạng theo tỷ lệ thắng và vị trí trung bình. Tìmlõi Bạc, Vàng và Huyền Thoại tốt nhất.",
  path: "/augments",
  keywords: ["Lõi TFT", "tier listlõi TFT", "Lõi huyền thoại TFT"],
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Lõi", item: `${SITE_CONFIG.url}/augments` },
    ],
  },
];

// Force dynamic rendering — tránh static-generate lúc build khi backend chưa chạy
export const dynamic = "force-dynamic";

export default async function AugmentsPage() {
  const augments = await apiClient.getAugments();

  return (
    <>
      <JsonLd data={jsonLd} />
      <AugmentsClient augments={augments} />
    </>
  );
}
