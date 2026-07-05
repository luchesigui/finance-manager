import { fetcher } from "@/lib/api";
import type { Category } from "@/lib/types";
import useSWR from "swr";

export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>("/api/categories", fetcher);
  return { categories: data ?? [], error, isLoading };
}
