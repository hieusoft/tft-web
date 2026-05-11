import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import { SITE_CONFIG } from "@/lib/constants";
import apiClient from "@/lib/api-client";
import TeamBuilderClient from "./TeamBuilderClient";

export const metadata: Metadata = generatePageMetadata({
  title: "Xây Dựng Đội Hình TFT (Team Builder)",
  description: "Công cụ tự thiết kế đội hình TFT của riêng bạn. Kéo thả tướng vào bàn cờ, xem tộc hệ và chia sẻ đội hình.",
  path: "/team-builder",
  keywords: ["tft team builder", "xây dựng đội hình tft", "tạo đội hình tft"],
});

export const dynamic = "force-dynamic";

export default async function TeamBuilderPage() {
  const [champions, traits, items] = await Promise.all([
    apiClient.getChampions(),
    apiClient.getTraits(),
    apiClient.getItems(),
  ]);

  const traitImages: Record<string, string> = {};
  traits.forEach(t => {
    if (t.slug && t.image) {
      traitImages[t.slug] = t.image;
    }
  });

  return (
    <TeamBuilderClient champions={champions as any} traits={traits} items={items} traitImages={traitImages} />
  );
}
