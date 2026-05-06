import apiClient from "@/lib/api-client";
import { toSlug } from "@/lib/slug";
import { notFound } from "next/navigation";
import TraitDetailClient from "./TraitDetailClient"; // Gọi đúng giao diện xịn xò bạn vừa làm

export const dynamic = "force-dynamic";

export default async function TraitDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Lấy data từ API
  const traits = await apiClient.getTraits();
  const trait = traits.find((t) => toSlug(t.name) === slug);
  
  // Nếu không tìm thấy thì báo lỗi 404
  if (!trait) notFound();

  // Truyền data xuống Client Component chứa Tailwind
  return <TraitDetailClient trait={trait as any} />;
}