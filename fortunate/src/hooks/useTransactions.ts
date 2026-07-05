import { fetcher } from "@/lib/api";
import type { Transaction } from "@/lib/types";
import useSWR from "swr";

// month: "YYYY-MM"
export function useTransactions(month: string) {
  const { data, error, isLoading } = useSWR<Transaction[]>(
    `/api/transactions?month=${month}`,
    fetcher,
  );
  return { transactions: data ?? [], error, isLoading };
}
