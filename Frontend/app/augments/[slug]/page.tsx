import type { Metadata } from "next";
import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import AugmentDetailClient from "./AugmentDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const augment = await apiClient.getAugmentBySlug(slug);
  if (!augment) return { title: "Không tìm thấy lõi công nghệ" };
  return {
    title: `${augment.name} - Lõi Công Nghệ TFT`,
    description: `Thống kê lõi công nghệ ${augment.name} trong TFT: tỷ lệ thắng, vị trí trung bình, và tướng tốt nhất để sử dụng.`,
    alternates: { canonical: `/augments/${slug}` },
    openGraph: {
      title: `${augment.name} | MetaTFT VN`,
      description: `Xem chi tiết lõi công nghệ ${augment.name} trong Teamfight Tactics.`,
    },
  };
}

export default async function AugmentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const augmentData = await apiClient.getAugmentBySlug(slug);
  if (!augmentData) {
    notFound();
  }

  return <AugmentDetailClient augment={augmentData} />;
}
