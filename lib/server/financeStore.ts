import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Category, Person, Transaction } from "@/lib/types";

// Helper to convert snake_case DB result to camelCase
// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toPerson = (row: any): Person => ({
  id: row.id,
  name: row.name,
  income: Number(row.income),
  householdId: row.household_id,
  linkedUserId: row.linked_user_id,
  email: row.email,
});

// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toCategory = (row: any): Category => ({
  id: row.id,
  name: row.name,
  targetPercent: Number(row.target_percent),
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
  const { data, error } = await supabase
    .from("people")
    .select("*")
    .order("name");
  if (error) throw error;
  return data.map(toPerson);
}

export async function updatePerson(
  id: string,
  patch: Partial<Person>
): Promise<Person> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;
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
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return data.map(toCategory);
}

export async function updateCategory(
  id: string,
  patch: Partial<Category>
): Promise<Category> {
  const supabase = await createClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.targetPercent !== undefined)
    dbPatch.target_percent = patch.targetPercent;

  const { data, error } = await supabase
    .from("categories")
    .update(dbPatch)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return toCategory(data);
}

export async function getTransactions(
  year?: number,
  month?: number
): Promise<Transaction[]> {
  const supabase = await createClient();
  let query = supabase.from("transactions").select("*");

  if (year !== undefined && month !== undefined) {
    const startDate = new Date(Date.UTC(year, month - 1, 1))
      .toISOString()
      .split("T")[0];
    const endDate = new Date(Date.UTC(year, month, 0))
      .toISOString()
      .split("T")[0];

    query = query.gte("date", startDate).lte("date", endDate);
  }

  const { data, error } = await query.order("date", { ascending: false });
  if (error) throw error;
  return data.map(toTransaction);
}

export async function createTransaction(
  t: Omit<Transaction, "id">
): Promise<Transaction> {
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

  const { data, error } = await supabase
    .from("transactions")
    .insert(dbRow)
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
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return toTransaction(data);
}

export async function createPerson(data: {
  name: string;
  income: number;
}): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Create the person record
  const dbRow = {
    name: data.name,
    income: data.income,
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
  const householdId = await getPrimaryHouseholdId();

  // Check if there are any transactions referencing this person
  const { data: transactions, error: checkError } = await supabase
    .from("transactions")
    .select("id")
    .eq("paid_by", id);

  if (checkError) throw checkError;

  // If there are transactions, reassign them to another person
  if (transactions && transactions.length > 0) {
    // Get the default payer for the household
    const defaultPayerId = await getDefaultPayerId();

    // Find a replacement person (default payer or first other person in household)
    let replacementPersonId: string | null = null;

    if (defaultPayerId && defaultPayerId !== id) {
      // Verify the default payer still exists
      const { data: defaultPayer } = await supabase
        .from("people")
        .select("id")
        .eq("id", defaultPayerId)
        .eq("household_id", householdId)
        .single();

      if (defaultPayer) {
        replacementPersonId = defaultPayerId;
      }
    }

    // If no valid default payer, get the first other person in the household
    if (!replacementPersonId) {
      const { data: otherPeople, error: peopleError } = await supabase
        .from("people")
        .select("id")
        .eq("household_id", householdId)
        .neq("id", id)
        .limit(1);

      if (peopleError) throw peopleError;

      if (!otherPeople || otherPeople.length === 0) {
        const error = new Error(
          "Cannot delete person because they have transactions and there are no other people to reassign them to."
        );
        // @ts-expect-error - Adding error code for API route handling
        error.code = "NO_REPLACEMENT_PERSON";
        throw error;
      }

      replacementPersonId = otherPeople[0].id;
    }

    // Reassign all transactions to the replacement person
    const { error: updateError } = await supabase
      .from("transactions")
      .update({ paid_by: replacementPersonId })
      .eq("paid_by", id);

    if (updateError) throw updateError;
  }

  // Now delete the person
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw error;
}

export async function getDefaultPayerId(): Promise<string | null> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("households")
    .select("default_payer_id")
    .eq("id", householdId)
    .single();

  if (error) throw error;
  return data?.default_payer_id ?? null;
}

export async function updateDefaultPayerId(personId: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  // Verify that the person belongs to the household
  const { data: personData, error: personError } = await supabase
    .from("people")
    .select("id, household_id")
    .eq("id", personId)
    .eq("household_id", householdId)
    .single();

  if (personError || !personData) {
    console.error("Person validation error:", personError);
    throw new Error("Person not found in household");
  }

  const { data: updateData, error } = await supabase
    .from("households")
    .update({ default_payer_id: personId })
    .eq("id", householdId)
    .select();

  if (error) {
    console.error("Failed to update default_payer_id:", error);
    throw error;
  }

  if (!updateData || updateData.length === 0) {
    console.error("Update returned no rows. RLS might be blocking the update.");
    throw new Error("Failed to update default payer - no rows updated");
  }

  console.log("Successfully updated default_payer_id:", updateData);
}
