import { fetcher } from "@/lib/api";
import type { Reserve } from "@/lib/types";
import useSWR from "swr";

export function useReserves(month: string) {
  const { data, error, isLoading, mutate } = useSWR<{
    reserves: Reserve[];
    essentialAvg: number;
  }>(`/api/reserves?month=${month}`, fetcher);

  return {
    reserves: data?.reserves ?? [],
    essentialAvg: data?.essentialAvg ?? 0,
    error,
    isLoading,
    mutate,
  };
}
