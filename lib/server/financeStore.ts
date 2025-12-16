import "server-only";

import { supabase } from "@/lib/supabaseClient";
import type { Category, Person, Transaction } from "@/lib/types";

// Helper to convert snake_case DB result to camelCase
// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toPerson = (row: any): Person => ({
  id: row.id,
  name: row.name,
  income: Number(row.income),
  color: row.color,
});

// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  targetPercent: Number(row.target_percent),
  color: row.color,
});

// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toTransaction = (row: any): Transaction => ({
  id: Number(row.id),
  description: row.description,
  amount: Number(row.amount),
  categoryId: row.category_id,
  paidBy: row.paid_by,
  isRecurring: row.is_recurring,
  date: row.date,
});

export async function getPeople(): Promise<Person[]> {
  const { data, error } = await supabase.from("people").select("*").order("name");
  if (error) throw error;
  return data.map(toPerson);
}

export async function updatePerson(id: string, patch: Partial<Person>): Promise<Person> {
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;
  if (patch.color !== undefined) dbPatch.color = patch.color;

  const { data, error } = await supabase
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toPerson(data);
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data.map(toCategory);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.targetPercent !== undefined) dbPatch.target_percent = patch.targetPercent;
  if (patch.color !== undefined) dbPatch.color = patch.color;

  const { data, error } = await supabase
    .from("categories")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toCategory(data);
}

export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
  let query = supabase.from("transactions").select("*");

  if (year !== undefined && month !== undefined) {
    // Construct start and end date for the month
    // Note: month is 0-indexed in JS Date, but usually 1-indexed in API params?
    // Let's check how it's used. In route.ts: Number.parseInt(month, 10).
    // Usually people pass 1-12. But JS Date uses 0-11.
    // The current implementation does: t.date.split("-")[1] === m.
    // If date is "2023-05-01", split gives "05", parseInt gives 5.
    // So if user passes 5, it matches May.

    // Postgres dates are YYYY-MM-DD.
    // We can use filters.

    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split("T")[0];
    // Last day of month
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split("T")[0];

    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query.order("date", { ascending: false });
  if (error) throw error;
  return data.map(toTransaction);
}

export async function createTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: t.categoryId,
    paid_by: t.paidBy,
    is_recurring: t.isRecurring,
    date: t.date,
  };

  const { data, error } = await supabase.from("transactions").insert(dbRow).select().single();

  if (error) throw error;
  return toTransaction(data);
}

export async function updateTransaction(id: number, t: Partial<Transaction>): Promise<Transaction> {
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (t.description !== undefined) dbPatch.description = t.description;
  if (t.amount !== undefined) dbPatch.amount = t.amount;
  if (t.categoryId !== undefined) dbPatch.category_id = t.categoryId;
  if (t.paidBy !== undefined) dbPatch.paid_by = t.paidBy;
  if (t.isRecurring !== undefined) dbPatch.is_recurring = t.isRecurring;
  if (t.date !== undefined) dbPatch.date = t.date;

  const { data, error } = await supabase
    .from("transactions")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toTransaction(data);
}

export async function deleteTransaction(id: number): Promise<void> {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single();
  if (error) return null; // Handle not found gracefully?
  return toTransaction(data);
}
