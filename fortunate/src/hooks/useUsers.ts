import { fetcher } from "@/lib/api";
import type { User } from "@/lib/types";
import useSWR from "swr";

export function useUsers() {
  const { data, error, isLoading } = useSWR<User[]>("/api/users", fetcher);
  return { users: data ?? [], error, isLoading };
}
