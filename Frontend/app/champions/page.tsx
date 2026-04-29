import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import { MOCK_CHAMPIONS } from "@/lib/mock-data";
import JsonLd from "@/components/seo/JsonLd";

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

const COST_LABELS: Record<number, string> = {
  1: "1 Vàng",
  2: "2 Vàng",
  3: "3 Vàng",
  4: "4 Vàng",
  5: "5 Vàng",
};

const COST_COLORS: Record<number, string> = {
  1: "text-gray-400 ring-[#3a3a3a]",
  2: "text-gray-400 ring-[#3a3a3a]",
  3: "text-gray-400 ring-[#3a3a3a]",
  4: "text-gray-400 ring-[#3a3a3a]",
  5: "text-[#f0b90b] ring-[#f0b90b]/50",
};

const COST_BG: Record<number, string> = {
  1: "bg-[#252525]",
  2: "bg-[#252525]",
  3: "bg-[#252525]",
  4: "bg-[#252525]",
  5: "bg-[#2a2520]",
};

const TIER_BG: Record<string, string> = {
  S: "bg-[#3a3a3a]",
  A: "bg-[#333333]",
  B: "bg-[#2e2e2e]",
  C: "bg-[#2a2a2a]",
};

export default function ChampionsPage() {
  const grouped = MOCK_CHAMPIONS.reduce<Record<number, typeof MOCK_CHAMPIONS>>(
    (acc, champ) => {
      if (!acc[champ.cost]) acc[champ.cost] = [];
      acc[champ.cost].push(champ);
      return acc;
    },
    {}
  );

  return (
    <>
      <JsonLd data={championsJsonLd} />

      <div className="bg-[#1a1a1a] min-h-screen">
        <div className="mx-auto max-w-[1400px] px-4 py-6">

          {/* Champions grouped by cost */}
          <div className="flex flex-col gap-8">
            {[5, 4, 3, 2, 1].map((cost) => {
              const champs = grouped[cost];
              if (!champs || champs.length === 0) return null;

              return (
                <div key={cost}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`text-sm font-bold ${COST_COLORS[cost]?.split(" ")[0] || "text-gray-400"}`}>
                      {COST_LABELS[cost]}
                    </span>
                    <div className="h-px flex-1 bg-[#2a2a2a]" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {champs.map((champ) => (
                      <Link
                        key={champ.id}
                        href={`/champions/${champ.id}`}
                        className="group flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] p-3 hover:border-yellow-500/30 hover:bg-[#252525] transition-all"
                      >
                        {/* Avatar */}
                        <div className={`h-12 w-12 shrink-0 flex items-center justify-center rounded text-sm font-bold text-white ring-2 ${COST_COLORS[cost]?.split(" ")[1] || "ring-gray-400"} ${COST_BG[cost] || "bg-gray-800"}`}>
                          {champ.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors truncate">
                              {champ.name}
                            </span>
                            <span className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white ${TIER_BG[champ.tier] || "bg-gray-600"}`}>
                              {champ.tier}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-0.5 flex-wrap">
                            {champ.traits.map((trait) => (
                              <span key={trait} className="text-[10px] text-gray-600">{trait}</span>
                            ))}
                          </div>
                          <div className="flex gap-3 mt-1.5">
                            <div>
                              <span className="text-xs font-semibold text-gray-300">{champ.top4Rate}%</span>
                              <span className="text-[10px] text-gray-600 ml-0.5">Top4</span>
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-[#f0b90b]">{champ.winRate}%</span>
                              <span className="text-[10px] text-gray-600 ml-0.5">Thắng</span>
                            </div>
                          </div>
                        </div>
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
