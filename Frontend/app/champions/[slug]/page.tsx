import type { Metadata } from "next";
import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import ChampionDetailClient from "./ChampionDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const champion = await apiClient.getChampionBySlug(slug);
  if (!champion) return { title: "Không tìm thấy tướng" };
  return {
    title: `${champion.name} - Tướng TFT`,
    description: `Thống kê tướng ${champion.name} trong TFT: tộc, kỹ năng, trang bị tốt nhất, tỷ lệ thắng và thứ hạng trung bình.`,
    alternates: { canonical: `/champions/${slug}` },
    openGraph: {
      title: `${champion.name} | MetaTFT VN`,
      description: `Xem thống kê chi tiết tướng ${champion.name} trong Teamfight Tactics.`,
    },
  };
}

export default async function ChampionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const champion = await apiClient.getChampionBySlug(slug);

  if (!champion) {
    notFound();
  }

  return <ChampionDetailClient champion={champion as any} />;
}