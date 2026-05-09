import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from '@/lib/api-client';
import GodTierList from './GodTierList'; 

export const metadata: Metadata = generatePageMetadata({
  title: "Tầng Thần Thoại TFT",
  description:
    "Danh sách và bảng xếp hạng các vị Thần Thoại trong Đấu Trường Chân Lý. Xem thứ hạng, lõi bổ trợ và các giai đoạn xuất hiện của từng Thần.",
  path: "/gods",
  keywords: ["thần thoại TFT", "tầng thần TFT", "gods TFT", "Teamfight Tactics thần thoại"],
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Thần Thoại", item: `${SITE_CONFIG.url}/gods` },
    ],
  },
];

export const dynamic = "force-dynamic";

export default async function GodTiersPage() {
  const godsList = await apiClient.getGods({ revalidate: 3600 });

  return (
    <>
      <JsonLd data={jsonLd} />
      <main>
        <GodTierList initialGods={godsList} />
      </main>
    </>
  );
}