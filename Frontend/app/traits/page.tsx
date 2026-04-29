import apiClient from "@/lib/api-client";
import TraitsClient from "./TraitsClient";

export default async function TraitsPage() {
  const traits = await apiClient.getTraits();
  return <TraitsClient traits={traits} />;
}
