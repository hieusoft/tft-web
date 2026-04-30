import apiClient from "@/lib/api-client";
import TraitsClient from "./TraitsClient";

// Force dynamic rendering — tránh static-generate lúc build khi backend chưa chạy
export const dynamic = "force-dynamic";

export default async function TraitsPage() {
  const traits = await apiClient.getTraits();
  return <TraitsClient traits={traits} />;
}
