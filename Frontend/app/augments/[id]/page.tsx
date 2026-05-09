import apiClient from "@/lib/api-client";
import { notFound } from "next/navigation";
import AugmentDetailClient from "./AugmentDetailClient";

export const dynamic = "force-dynamic";

export default async function AugmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const augmentData = await apiClient.getAugment(Number(id));
  if (!augmentData) {
    notFound();
  }

  return <AugmentDetailClient augment={augmentData} />;
}
