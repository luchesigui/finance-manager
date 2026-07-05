import { fetcher } from "@/lib/api";
import type { Settings } from "@/lib/types";
import useSWR from "swr";

export function useSettings() {
  const { data, error, isLoading } = useSWR<Settings>("/api/settings", fetcher);
  return { settings: data, error, isLoading };
}
