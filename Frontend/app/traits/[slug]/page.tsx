import type { Metadata } from "next";
import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import TraitDetailClient from "./TraitDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trait = await apiClient.getTraitBySlug(slug);
  if (!trait) return { title: "Không tìm thấy Tộc/Hệ" };
  return {
    title: `${trait.name} - Tộc/Hệ TFT`,
    description: `Thống kê tộc/hệ ${trait.name} trong TFT: các mốc kích hoạt, tỷ lệ pick, thứ hạng trung bình và danh sách tướng.`,
    alternates: { canonical: `/traits/${slug}` },
    openGraph: {
      title: `${trait.name} | MetaTFT VN`,
      description: `Xem chi tiết tộc/hệ ${trait.name} trong Teamfight Tactics.`,
    },
  };
}

export default async function TraitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Lấy trực tiếp bằng slug từ API (thay vì getTraits() rồi find)
  const trait = await apiClient.getTraitBySlug(slug);
  
  if (!trait) notFound();

  return <TraitDetailClient trait={trait as any} />;
}