import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function isMonthClosed(
  householdId: string,
  year: number,
  month: number,
): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("closed_periods")
    .select("household_id")
    .eq("household_id", householdId)
    .eq("year", year)
    .eq("month", month)
    .maybeSingle();

  if (error) return false;
  return data != null;
}

export type ClosedMonthsInput = { year: number; month: number }[];

/** Returns a Set of "year,month" keys for which a closed period exists. Key format: `${year},${month}` */
export async function getClosedMonthsSet(
  householdId: string,
  periods: ClosedMonthsInput,
): Promise<Set<string>> {
  if (periods.length === 0) return new Set();

  const supabase = await createClient();
  const periodKeys = new Set(periods.map((p) => `${p.year},${p.month}`));
  const years = [...new Set(periods.map((p) => p.year))];

  const { data, error } = await supabase
    .from("closed_periods")
    .select("year, month")
    .eq("household_id", householdId)
    .in("year", years);

  if (error) return new Set();

  const closed = new Set<string>();
  for (const row of data ?? []) {
    const key = `${row.year},${row.month}`;
    if (periodKeys.has(key)) closed.add(key);
  }
  return closed;
}
