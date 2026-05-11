import type { Metadata } from "next";
import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import ItemDetailClient from "./ItemDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await apiClient.getItemBySlug(slug);
  if (!item) return { title: "Không tìm thấy trang bị" };
  return {
    title: `${item.name} - Trang Bị TFT`,
    description: `Thống kê trang bị ${item.name} trong TFT: tỷ lệ thắng, vị trí trung bình, tướng tốt nhất để sử dụng.`,
    alternates: { canonical: `/items/${slug}` },
    openGraph: {
      title: `${item.name} | MetaTFT VN`,
      description: `Xem chi tiết trang bị ${item.name} trong Teamfight Tactics.`,
    },
  };
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch detailed item AND all items list for component mapping
  const [itemData, allItems] = await Promise.all([
    apiClient.getItemBySlug(slug),
    apiClient.getItems()
  ]);

  if (!itemData) {
    notFound();
  }

  // Create a map for fast lookup
  const itemMap = new Map();
  for (const it of allItems) {
    itemMap.set(it.id, {
      id: it.id,
      name: it.name,
      slug: it.slug,
      image: it.image ?? it.icon_path
    });
  }

  // Map components to full objects instead of IDs
  if (typeof itemData.component_1 === "number" || typeof itemData.component_1 === "string") {
    itemData.component_1 = itemMap.get(Number(itemData.component_1)) ?? null;
  }
  if (typeof itemData.component_2 === "number" || typeof itemData.component_2 === "string") {
    itemData.component_2 = itemMap.get(Number(itemData.component_2)) ?? null;
  }

  // Find what this item builds into
  const buildsInto = [];
  for (const it of allItems) {
    if (it.component_1 === itemData.id || it.component_2 === itemData.id) {
      buildsInto.push({
        id: it.id,
        name: it.name,
        slug: it.slug ?? String(it.id),
        image: it.image ?? it.icon_path ?? ""
      });
    }
  }

  return <ItemDetailClient item={itemData} buildsInto={buildsInto} />;
}