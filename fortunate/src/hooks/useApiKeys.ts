import { fetcher } from "@/lib/api";
import type { ApiKeySummary } from "@/lib/types";
import useSWR from "swr";

export function useApiKeys() {
  const { data, error, isLoading } = useSWR<ApiKeySummary[]>("/api/api-keys", fetcher);
  return { apiKeys: data ?? [], error, isLoading };
}
