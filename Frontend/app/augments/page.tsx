import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { MOCK_AUGMENTS } from "@/lib/mock-data";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = generatePageMetadata({
  title: "Tier List Tăng Cường TFT",
  description:
    "Tier list tăng cường TFT đầy đủ xếp hạng theo tỷ lệ thắng và vị trí trung bình. Tìm tăng cường Bạc, Vàng và Huyền Thoại tốt nhất.",
  path: "/augments",
  keywords: ["tăng cường TFT", "tier list tăng cường TFT", "tăng cường huyền thoại TFT"],
});

const augmentsJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Tăng Cường", item: `${SITE_CONFIG.url}/augments` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_CONFIG.url}/augments#itemlist`,
    name: "Tier List Tăng Cường TFT",
    description: "Tăng cường TFT tốt nhất xếp hạng theo tỷ lệ thắng và hiệu suất",
    url: `${SITE_CONFIG.url}/augments`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Bạc": "text-gray-300 border-gray-500/40 bg-gray-500/10",
  "Vàng": "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  "Huyền Thoại": "text-purple-400 border-purple-500/40 bg-purple-500/10",
};

const TIER_BG: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-yellow-500",
  B: "bg-blue-500",
};

export default function AugmentsPage() {
  const grouped = MOCK_AUGMENTS.reduce<Record<string, typeof MOCK_AUGMENTS>>(
    (acc, aug) => {
      if (!acc[aug.category]) acc[aug.category] = [];
      acc[aug.category].push(aug);
      return acc;
    },
    {}
  );

  const orderedCategories = ["Huyền Thoại", "Vàng", "Bạc"];

  return (
    <>
      <JsonLd data={augmentsJsonLd} />

      <div className="bg-[#1a1a1a] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Link href="/" className="hover:text-gray-400">Trang Chủ</Link>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-400">Tăng Cường</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Tier List Tăng Cường TFT</h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Tất cả tăng cường TFT xếp hạng theo hiệu suất. Tăng cường Huyền Thoại mang lại sức mạnh lớn nhất — hãy chọn khôn ngoan.
            </p>
          </div>

          {/* Augments grouped by rarity */}
          <div className="flex flex-col gap-8">
            {orderedCategories.map((category) => {
              const augments = grouped[category];
              if (!augments || augments.length === 0) return null;
              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`rounded border px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[category] || "text-gray-400"}`}>
                      {category}
                    </span>
                    <div className="h-px flex-1 bg-[#2a2a2a]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {augments.map((aug) => (
                      <div
                        key={aug.id}
                        className="flex items-start gap-4 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] p-4 hover:border-yellow-500/30 hover:bg-[#252525] transition-all cursor-pointer"
                      >
                        <div className="h-12 w-12 flex items-center justify-center rounded-lg border border-[#3a3a3a] bg-[#111] text-2xl shrink-0">
                          ✨
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-white">{aug.name}</span>
                            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${TIER_BG[aug.tier] || "bg-gray-600"}`}>
                              {aug.tier}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{aug.description}</p>
                          <div className="flex gap-4 mt-2">
                            <div>
                              <span className="text-xs font-semibold text-green-400">{aug.top4Rate}%</span>
                              <span className="text-[10px] text-gray-600 ml-1">Top 4</span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-white">{aug.avgPlacement.toFixed(2)}</span>
                              <span className="text-[10px] text-gray-600 ml-1">T.Bình</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
