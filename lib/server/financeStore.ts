import "server-only";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { cookies, headers } from "next/headers";
import type { Category, Person, Transaction } from "@/lib/types";

// Helper to convert snake_case DB result to camelCase
// biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
const toPerson = (row: any): Person => ({
  id: row.id,
  name: row.name,
  income: Number(row.income),
  householdId: row.household_id,
  linkedUserId: row.linked_user_id,
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

async function getClientAndHousehold() {
  const cookieStore = await cookies();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Authenticated user path (uses RLS)
    const { data, error } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (error || !data) {
       // Fallback or error?
       // If user has no household, something is wrong with the signup trigger.
       throw new Error("No household found for user");
    }
    return { client: supabase, householdId: data.household_id, isAnonymous: false, user };
  }

  // Anonymous user path
  const anonymousId = cookieStore.get("anonymous_session_id")?.value || (await headers()).get("x-anonymous-session-id");
  
  if (!anonymousId) {
    // This should generally be handled by middleware, but if missing:
    throw new Error("No anonymous session found");
  }

  // Use Admin Client to bypass RLS for anonymous operations
  // We MUST carefully filter by householdId in all queries.
  const adminClient = await createAdminClient();
  const householdId = await ensureAnonymousHousehold(adminClient, anonymousId);
  
  return { client: adminClient, householdId, isAnonymous: true, user: null };
}

// biome-ignore lint/suspicious/noExplicitAny: supabase client type
async function ensureAnonymousHousehold(supabase: any, anonymousId: string): Promise<string> {
  // Check if household exists
  const { data: existing } = await supabase
    .from("households")
    .select("id")
    .eq("anonymous_id", anonymousId)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new household
  const { data: newHousehold, error: createError } = await supabase
    .from("households")
    .insert({ anonymous_id: anonymousId })
    .select("id")
    .single();

  if (createError) throw createError;

  const householdId = newHousehold.id;

  // Create default categories (same as SQL trigger)
  await supabase.from("categories").insert([
    { name: "Liberdade Financeira", target_percent: 30, household_id: householdId },
    { name: "Custos Fixos", target_percent: 25, household_id: householdId },
    { name: "Conforto", target_percent: 15, household_id: householdId },
    { name: "Metas", target_percent: 15, household_id: householdId },
    { name: "Prazeres", target_percent: 10, household_id: householdId },
    { name: "Conhecimento", target_percent: 5, household_id: householdId },
  ]);

  // Create default person "Eu" (Me)
  const { data: personData } = await supabase
    .from("people")
    .insert({ name: "Eu", income: 0, household_id: householdId })
    .select("id")
    .single();

  if (personData) {
    await supabase
      .from("households")
      .update({ default_payer_id: personData.id })
      .eq("id", householdId);
  }

  return householdId;
}

export async function getPeople(): Promise<Person[]> {
  const { client, householdId } = await getClientAndHousehold();
  const { data, error } = await client
    .from("people")
    .select("*")
    .eq("household_id", householdId) // Explicit filter
    .order("name");
    
  if (error) throw error;
  return data.map(toPerson);
}

export async function updatePerson(id: string, patch: Partial<Person>): Promise<Person> {
  const { client, householdId } = await getClientAndHousehold();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;

  const { data, error } = await client
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId) // Explicit filter
    .select()
    .single();

  if (error) throw error;
  return toPerson(data);
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return user.id;
  
  // Return null if anonymous
  return null;
}

export async function getCategories(): Promise<Category[]> {
  const { client, householdId } = await getClientAndHousehold();
  const { data, error } = await client
    .from("categories")
    .select("*")
    .eq("household_id", householdId) // Explicit filter
    .order("name");
    
  if (error) throw error;
  return data.map(toCategory);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  const { client, householdId } = await getClientAndHousehold();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.targetPercent !== undefined) dbPatch.target_percent = patch.targetPercent;

  const { data, error } = await client
    .from("categories")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId) // Explicit filter
    .select()
    .single();

  if (error) throw error;
  return toCategory(data);
}

export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
  const { client, householdId } = await getClientAndHousehold();
  let query = client.from("transactions").select("*").eq("household_id", householdId);

  if (year !== undefined && month !== undefined) {
    const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().split("T")[0];
    const endDate = new Date(Date.UTC(year, month, 0)).toISOString().split("T")[0];

    // 1. Fetch transactions in the current month
    const currentMonthQuery = query.gte("date", startDate).lte("date", endDate);
    const { data: currentMonthData, error: currentError } = await currentMonthQuery.order("date", {
      ascending: false,
    });
    if (currentError) throw currentError;

    // 2. Fetch recurring transactions created BEFORE this month
    const { data: recurringData, error: recurringError } = await client
      .from("transactions")
      .select("*")
      .eq("household_id", householdId) // Explicit filter
      .eq("is_recurring", true)
      .lt("date", startDate);

    if (recurringError) throw recurringError;

    // 3. Process recurring transactions
    // biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
    const virtualTransactions = recurringData.map((t: any) => {
      const originalDate = new Date(t.date);
      const day = originalDate.getUTCDate();
      const targetDate = new Date(Date.UTC(year, month - 1, day));

      if (targetDate.getUTCMonth() !== month - 1) {
        const lastDayOfMonth = new Date(Date.UTC(year, month, 0));
        targetDate.setUTCFullYear(lastDayOfMonth.getUTCFullYear());
        targetDate.setUTCMonth(lastDayOfMonth.getUTCMonth());
        targetDate.setUTCDate(lastDayOfMonth.getUTCDate());
      }

      return {
        ...t,
        date: targetDate.toISOString().split("T")[0],
      };
    });

    const allTransactions = [...currentMonthData, ...virtualTransactions];
    allTransactions.sort((a, b) => b.date.localeCompare(a.date));

    return allTransactions.map(toTransaction);
  }

  const { data, error } = await query.order("date", { ascending: false });
  if (error) throw error;
  return data.map(toTransaction);
}

export async function createTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  const { client, householdId } = await getClientAndHousehold();

  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: t.categoryId,
    paid_by: t.paidBy,
    is_recurring: t.isRecurring,
    date: t.date,
    household_id: householdId,
  };

  const { data, error } = await client.from("transactions").insert(dbRow).select().single();

  if (error) throw error;
  return toTransaction(data);
}

export async function deleteTransaction(id: number): Promise<void> {
  const { client, householdId } = await getClientAndHousehold();
  // Ensure we only delete from our household
  const { error } = await client
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
    
  if (error) throw error;
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const { client, householdId } = await getClientAndHousehold();
  const { data, error } = await client
    .from("transactions")
    .select("*")
    .eq("id", id)
    .eq("household_id", householdId)
    .single();
    
  if (error) return null;
  return toTransaction(data);
}

export async function createPerson(data: {
  name: string;
  income: number;
}): Promise<Person> {
  const { client, householdId } = await getClientAndHousehold();

  const dbRow = {
    name: data.name,
    income: data.income,
    household_id: householdId,
    linked_user_id: null,
  };

  const { data: personData, error: personError } = await client
    .from("people")
    .insert(dbRow)
    .select()
    .single();

  if (personError) throw personError;
  return toPerson(personData);
}

export async function deletePerson(id: string): Promise<void> {
  const { client, householdId } = await getClientAndHousehold();

  const { data: transactions, error: checkError } = await client
    .from("transactions")
    .select("id")
    .eq("paid_by", id)
    .eq("household_id", householdId);

  if (checkError) throw checkError;

  if (transactions && transactions.length > 0) {
    const defaultPayerId = await getDefaultPayerId();
    let replacementPersonId: string | null = null;

    if (defaultPayerId && defaultPayerId !== id) {
      const { data: defaultPayer } = await client
        .from("people")
        .select("id")
        .eq("id", defaultPayerId)
        .eq("household_id", householdId)
        .single();

      if (defaultPayer) {
        replacementPersonId = defaultPayerId;
      }
    }

    if (!replacementPersonId) {
      const { data: otherPeople, error: peopleError } = await client
        .from("people")
        .select("id")
        .eq("household_id", householdId)
        .neq("id", id)
        .limit(1);

      if (peopleError) throw peopleError;

      if (!otherPeople || otherPeople.length === 0) {
        const error = new Error(
          "Cannot delete person because they have transactions and there are no other people to reassign them to.",
        );
        // @ts-expect-error - Adding error code for API route handling
        error.code = "NO_REPLACEMENT_PERSON";
        throw error;
      }

      replacementPersonId = otherPeople[0].id;
    }

    const { error: updateError } = await client
      .from("transactions")
      .update({ paid_by: replacementPersonId })
      .eq("paid_by", id)
      .eq("household_id", householdId);

    if (updateError) throw updateError;
  }

  const { error } = await client
    .from("people")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
    
  if (error) throw error;
}

export async function getDefaultPayerId(): Promise<string | null> {
  const { client, householdId } = await getClientAndHousehold();

  const { data, error } = await client
    .from("households")
    .select("default_payer_id")
    .eq("id", householdId)
    .single();

  if (error) throw error;
  return data?.default_payer_id ?? null;
}

export async function updateDefaultPayerId(personId: string): Promise<void> {
  const { client, householdId } = await getClientAndHousehold();

  const { data: personData, error: personError } = await client
    .from("people")
    .select("id, household_id")
    .eq("id", personId)
    .eq("household_id", householdId)
    .single();

  if (personError || !personData) {
    console.error("Person validation error:", personError);
    throw new Error("Person not found in household");
  }

  const { data: updateData, error } = await client
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

export async function mergeAnonymousData(userId: string, anonymousId: string): Promise<void> {
  // Use Admin Client to perform the swap
  const supabase = await createAdminClient();
  
  // 1. Get Anonymous Household
  const { data: anonHousehold } = await supabase
    .from("households")
    .select("id")
    .eq("anonymous_id", anonymousId)
    .single();

  if (!anonHousehold) {
    // No anonymous data to merge
    return;
  }

  // 2. Get User's New Household (created by trigger)
  // The user might have multiple households if they were invited? 
  // But usually the trigger creates one where they are owner.
  const { data: userMember } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .eq("role", "owner")
    .single();

  if (userMember) {
    // Delete the default empty household created by trigger
    // This cascades to categories, people, etc.
    // WARNING: If the user ALREADY added data to this household, it will be lost.
    // But this runs immediately after signup/login, so likely empty.
    await supabase.from("households").delete().eq("id", userMember.household_id);
  }

  // 3. Assign Anonymous Household to User
  await supabase.from("household_members").insert({
    household_id: anonHousehold.id,
    user_id: userId,
    role: "owner"
  });

  // 4. Link the "Eu" person to the User
  // Find the person named "Eu" or with no linked user in this household
  const { data: mePerson } = await supabase
    .from("people")
    .select("id")
    .eq("household_id", anonHousehold.id)
    .is("linked_user_id", null)
    .order("created_at", { ascending: true }) // First created usually
    .limit(1)
    .single();

  if (mePerson) {
    await supabase
      .from("people")
      .update({ linked_user_id: userId, name: "Eu" }) // Ensure name is Eu? Or take from Profile? 
      // Actually, let's keep name as "Eu" or update to match profile name if we wanted.
      .eq("id", mePerson.id);
  }

  // 5. Clear anonymous_id so it's no longer accessible via cookie
  await supabase
    .from("households")
    .update({ anonymous_id: null })
    .eq("id", anonHousehold.id);
}
