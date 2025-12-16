import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category, Person, Transaction } from "@/lib/types";

// Helper to convert snake_case DB result to camelCase
// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toPerson = (row: any): Person => ({
  id: row.id,
  name: row.name,
  income: Number(row.income),
  color: row.color,
  householdId: row.household_id,
  linkedUserId: row.linked_user_id,
  email: row.email,
});

// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  targetPercent: Number(row.target_percent),
  color: row.color,
  householdId: row.household_id,
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
  householdId: row.household_id,
});

async function getPrimaryHouseholdId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (error || !data) {
    // If no household found, maybe creation failed or race condition.
    // Return null or throw? Throwing ensures we don't write orphaned data.
    throw new Error("No household found for user");
  }
  return data.household_id;
}

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("people").select("*").order("name");
  if (error) throw error;
  return data.map(toPerson);
}

export async function updatePerson(id: string, patch: Partial<Person>): Promise<Person> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;
  if (patch.color !== undefined) dbPatch.color = patch.color;
  if (patch.email !== undefined) dbPatch.email = patch.email;

  const { data, error } = await supabase
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toPerson(data);
}

export async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");
  return user.id;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data.map(toCategory);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  let query = supabase.from("transactions").select("*");

  if (year !== undefined && month !== undefined) {
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split("T")[0];
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split("T")[0];

    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query.order("date", { ascending: false });
  if (error) throw error;
  return data.map(toTransaction);
}

export async function createTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: t.categoryId,
    paid_by: t.paidBy,
    is_recurring: t.isRecurring,
    date: t.date,
    household_id: householdId,
  };

  const { data, error } = await supabase.from("transactions").insert(dbRow).select().single();

  if (error) throw error;
  return toTransaction(data);
}

export async function updateTransaction(id: number, t: Partial<Transaction>): Promise<Transaction> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("transactions").select("*").eq("id", id).single();
  if (error) return null;
  return toTransaction(data);
}

export async function createPerson(data: {
  name: string;
  income: number;
}): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Get a random color for the new person
  const colors = [
    "bg-blue-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Create the person record
  const dbRow = {
    name: data.name,
    income: data.income,
    color: randomColor,
    household_id: householdId,
    linked_user_id: null,
  };

  const { data: personData, error: personError } = await supabase
    .from("people")
    .insert(dbRow)
    .select()
    .single();

  if (personError) throw personError;
  return toPerson(personData);
}

export async function deletePerson(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw error;
}
