import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import ItemDetailClient from "./ItemDetailClient";

export const dynamic = "force-dynamic";

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