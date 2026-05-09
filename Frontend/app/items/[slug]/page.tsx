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
  const itemData = await apiClient.getItemBySlug(slug);
  if (!itemData) {
    notFound();
  }

  return <ItemDetailClient item={itemData} />;
}