import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { MOCK_CHAMPIONS } from "@/lib/mock-data";
import JsonLd from "@/components/seo/JsonLd";

export const metadata: Metadata = generatePageMetadata({
  title: "Bảng Xếp Hạng Tướng TFT",
  description:
    "Bảng xếp hạng tướng TFT đầy đủ theo hiệu suất, tỷ lệ thắng và vị trí trung bình. Tìm tướng carry và frontline tốt nhất cho đội hình.",
  path: "/tierlist",
  keywords: ["bảng xếp hạng TFT", "tier list tướng TFT", "tướng TFT tốt nhất", "Teamfight Tactics tier list"],
});

const tierListJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Bảng Xếp Hạng", item: `${SITE_CONFIG.url}/tierlist` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${SITE_CONFIG.url}/tierlist#itemlist`,
    name: "Bảng Xếp Hạng Tướng TFT",
    description: "Xếp hạng tướng TFT theo tỷ lệ thắng và vị trí trung bình",
    url: `${SITE_CONFIG.url}/tierlist`,
  },
];

const TIERS = ["S", "A", "B", "C", "D"];

const TIER_LABELS: Record<string, string> = {
  S: "Siêu Mạnh — Vượt Trội",
  A: "Mạnh — Rất Được Khuyến Nghị",
  B: "Trung Bình — Tốt Theo Tình Huống",
  C: "Dưới Trung Bình — Dùng Cẩn Thận",
  D: "Yếu — Tránh Dùng",
};

const TIER_BG: Record<string, string> = {
  S: "bg-red-500",
  A: "bg-yellow-500",
  B: "bg-blue-500",
  C: "bg-purple-500",
  D: "bg-gray-600",
};

const COST_COLORS: Record<number, string> = {
  1: "ring-gray-400",
  2: "ring-green-400",
  3: "ring-blue-400",
  4: "ring-purple-400",
  5: "ring-yellow-400",
};

const COST_BG: Record<number, string> = {
  1: "bg-gray-700",
  2: "bg-green-900",
  3: "bg-blue-900",
  4: "bg-purple-900",
  5: "bg-yellow-900",
};

export default function TierListPage() {
  const championsByTier = TIERS.reduce<Record<string, typeof MOCK_CHAMPIONS>>(
    (acc, tier) => {
      acc[tier] = MOCK_CHAMPIONS.filter((c) => c.tier === tier);
      return acc;
    },
    {}
  );

  return (
    <>
      <JsonLd data={tierListJsonLd} />

      <div className="bg-[#1a1a1a] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Link href="/" className="hover:text-gray-400">Trang Chủ</Link>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-400">Bảng Xếp Hạng</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Bảng Xếp Hạng Tướng TFT</h1>
            <p className="mt-1 text-sm text-gray-500 max-w-2xl">
              Tướng được xếp hạng theo vị trí trung bình và tỷ lệ thắng trên tất cả hạng.
              Cập nhật mỗi 30 phút với dữ liệu trực tiếp từ Patch {SITE_CONFIG.patch}.
            </p>
          </div>

          {/* Tier rows */}
          <div className="flex flex-col gap-3">
            {TIERS.map((tier) => {
              const champs = championsByTier[tier];
              if (!champs || champs.length === 0) return null;
              return (
                <div
                  key={tier}
                  className="flex flex-col sm:flex-row gap-4 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] p-4"
                >
                  {/* Tier label */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 sm:w-24 shrink-0">
                    <span className={`flex h-10 w-10 items-center justify-center rounded text-base font-bold text-white ${TIER_BG[tier] || "bg-gray-600"}`}>
                      {tier}
                    </span>
                    <p className="hidden sm:block text-[10px] text-center text-gray-600 leading-tight">
                      {TIER_LABELS[tier]}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px bg-[#2a2a2a] mx-2" />

                  {/* Champions grid */}
                  <div className="flex flex-wrap gap-4 flex-1">
                    {champs.map((champ) => (
                      <Link
                        key={champ.id}
                        href={`/champions/${champ.id}`}
                        className="group flex flex-col items-center gap-1.5"
                      >
                        <div className={`h-14 w-14 flex items-center justify-center rounded text-sm font-bold text-white ring-2 ${COST_COLORS[champ.cost] || "ring-gray-400"} ${COST_BG[champ.cost] || "bg-gray-800"} group-hover:opacity-80 transition-opacity`}>
                          {champ.name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[10px] text-gray-500 group-hover:text-white text-center transition-colors">
                          {champ.name}
                        </span>
                        <span className="text-[10px] text-green-400">{champ.top4Rate}%</span>
                      </Link>
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
