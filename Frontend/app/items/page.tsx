import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import JsonLd from "@/components/seo/JsonLd";
import apiClient from "@/lib/api-client";
import ItemsClient from "./ItemsClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Bảng Phân Hạng Trang Bị TFT",
  description:
    "Trang bị TFT tốt nhất xếp hạng theo vị trí trung bình và tỷ lệ thắng. Tìm trang bị tốt nhất cho mọi tướng và đội hình.",
  path: "/items",
  keywords: ["trang bị TFT", "tier list trang bị TFT", "trang bị TFT tốt nhất", "bộ đồ TFT"],
});

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Trang Chủ", item: SITE_CONFIG.url },
      { "@type": "ListItem", position: 2, name: "Trang Bị", item: `${SITE_CONFIG.url}/items` },
    ],
  },
];

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic";

/** Normalise a raw API item so the client component receives clean, consistent data */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseItem(raw: any) {
  // win_rate / pick_rate come as "60.0%" strings – strip % so client can display as-is
  // or as a decimal like "0.82"
  const pct = (v: string | null | undefined): string | null => {
    if (!v) return null;
    if (v.includes("%")) return v; // Already formatted, keep as-is
    const n = parseFloat(v);
    return isNaN(n) ? null : `${(n * 100).toFixed(1)}%`;
  };

  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug ?? null,
    category: raw.category ?? "Khác",
    rank: raw.rank ?? null,
    // Normalise the image URL field – API sends `image` but our client expects `icon_path`
    icon_path: raw.image ?? raw.icon_path ?? null,
    description: raw.description ?? null,
    avg_placement: raw.avg_placement ?? null,
    win_rate: pct(raw.win_rate),
    pick_rate: pct(raw.pick_rate),
    top_4_rate: pct(raw.top_4_rate),
    games_played: raw.games_played ?? 0,
    stats: raw.stats ?? {},
    recipe: raw.recipe ?? [],
    // Pass component objects for recipe display in tooltip
    component_1: raw.component_1 ?? null,
    component_2: raw.component_2 ?? null,
  };
}

export default async function ItemsPage() {
  const rawItems = await apiClient.getItems();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (rawItems as any[]).map(normaliseItem);

  return (
    <>
      <JsonLd data={jsonLd} />
      <ItemsClient items={items} />
    </>
  );
}
