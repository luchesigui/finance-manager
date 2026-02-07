import "server-only";

import { mapCategoryRow, toCategoryDbPatch } from "@/lib/server/dbMappers";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type { Category, CategoryPatch, CategoryRow } from "@/lib/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("household_categories")
    .select(
      `
      id,
      category_id,
      target_percent,
      household_id,
      categories (
        name
      )
    `,
    )
    .eq("household_id", householdId)
    .order("categories(name)");

  if (error) throw error;
  return (data as CategoryRow[]).map(mapCategoryRow);
}

export async function updateCategory(id: string, patch: CategoryPatch): Promise<Category> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toCategoryDbPatch(patch);

  const { data, error } = await supabase
    .from("household_categories")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select(
      `
      id,
      category_id,
      target_percent,
      household_id,
      categories (
        name
      )
    `,
    )
    .single();

  if (error) throw error;
  return mapCategoryRow(data as CategoryRow);
}
