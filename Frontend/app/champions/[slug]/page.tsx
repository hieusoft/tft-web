import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import ChampionDetailClient from "./ChampionDetailClient";
export const dynamic = "force-dynamic";

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