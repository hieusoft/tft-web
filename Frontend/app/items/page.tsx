import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { MOCK_ITEMS } from "@/lib/mock-data";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = generatePageMetadata({
  title: "Trang Bị TFT & Bộ Đồ Tốt Nhất",
  description:
    "Danh sách tier trang bị TFT đầy đủ. Tìm trang bị tốt nhất cho mọi tướng và đội hình, xếp hạng theo tỷ lệ thắng và hiệu suất.",
  path: "/items",
  keywords: ["trang bị TFT", "trang bị TFT tốt nhất", "bộ đồ TFT", "tier list trang bị TFT"],
});

const itemsJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Trang Bị", item: `${SITE_CONFIG.url}/items` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_CONFIG.url}/items#itemlist`,
    name: "Tier List Trang Bị TFT",
    description: "Trang bị TFT tốt nhất xếp hạng theo hiệu suất và tỷ lệ thắng",
    url: `${SITE_CONFIG.url}/items`,
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  combat: "Trang Bị Chiến Đấu",
  magic: "Trang Bị Phép Thuật",
  tank: "Trang Bị Phòng Thủ",
};

const TIER_BG: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-yellow-500",
  B: "bg-blue-500",
};

export default function ItemsPage() {
  const grouped = MOCK_ITEMS.reduce<Record<string, typeof MOCK_ITEMS>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <>
      <JsonLd data={itemsJsonLd} />

      <div className="bg-[#1a1a1a] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Link href="/" className="hover:text-gray-400">Trang Chủ</Link>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-400">Trang Bị</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Tier List Trang Bị TFT</h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Tất cả trang bị TFT hoàn chỉnh xếp hạng theo tỷ lệ thắng và hiệu suất.
            </p>
          </div>

          {/* Items by category */}
          <div className="flex flex-col gap-10">
            {Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <span>{CATEGORY_LABELS[category] || category}</span>
                  <div className="h-px flex-1 bg-[#2a2a2a]" />
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] p-4 hover:border-yellow-500/30 hover:bg-[#252525] transition-all"
                    >
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#111] text-2xl shrink-0">
                        ⚔️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${TIER_BG[item.tier] || "bg-gray-600"}`}>
                            {item.tier}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 truncate">{item.description}</p>
                        <div className="flex gap-4 mt-2">
                          <div>
                            <span className="text-xs font-semibold text-green-400">{item.top4Rate}%</span>
                            <span className="text-[10px] text-gray-600 ml-1">Top 4</span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white">{item.avgPlacement.toFixed(2)}</span>
                            <span className="text-[10px] text-gray-600 ml-1">T.Bình</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
