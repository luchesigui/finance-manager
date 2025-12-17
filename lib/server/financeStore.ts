import "server-only";

import { DEFAULT_CATEGORIES } from "@/lib/defaultCategories";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Category, Person, Transaction } from "@/lib/types";
import { cookies } from "next/headers";

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

const GUEST_COOKIE_NAME = "fp_guest";

export type SessionInfo = {
  isGuest: boolean;
  userId: string | null;
  householdId: string;
};

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return null;

  // Supabase JWT "sub" is the user id (UUID)
  const sub = (claims as unknown as { sub?: string }).sub;
  return typeof sub === "string" && sub.length > 0 ? sub : null;
}

async function getGuestIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const guestId = cookieStore.get(GUEST_COOKIE_NAME)?.value ?? null;
  return guestId && guestId.length > 0 ? guestId : null;
}

async function ensureGuestHousehold(guestId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: existing, error: existingError } = await admin
    .from("households")
    .select("id, default_payer_id")
    .eq("guest_id", guestId)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existing?.id) return existing.id;

  // Create a new guest household, plus minimum defaults the UI expects.
  const { data: createdHousehold, error: createHouseholdError } = await admin
    .from("households")
    .insert({ guest_id: guestId })
    .select("id")
    .single();

  if (createHouseholdError) throw createHouseholdError;

  const householdId = createdHousehold.id as string;

  const { data: createdPerson, error: createPersonError } = await admin
    .from("people")
    .insert({
      name: "Você",
      income: 0,
      household_id: householdId,
      linked_user_id: null,
    })
    .select("id")
    .single();

  if (createPersonError) throw createPersonError;

  const defaultPersonId = createdPerson.id as string;

  // Default categories (same set as handle_new_user)
  const { error: createCategoriesError } = await admin.from("categories").insert(
    DEFAULT_CATEGORIES.map((c) => ({
      name: c.name,
      target_percent: c.targetPercent,
      household_id: householdId,
    })),
  );

  if (createCategoriesError) throw createCategoriesError;

  const { error: setDefaultPayerError } = await admin
    .from("households")
    .update({ default_payer_id: defaultPersonId })
    .eq("id", householdId);

  if (setDefaultPayerError) throw setDefaultPayerError;

  return householdId;
}

async function getPrimaryHouseholdIdForUser(userId: string): Promise<string> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.household_id) throw new Error("No household found for user");
  return data.household_id as string;
}

export async function getSessionInfo(): Promise<SessionInfo> {
  const userId = await getAuthenticatedUserId();
  if (userId) {
    const householdId = await getPrimaryHouseholdIdForUser(userId);
    return { isGuest: false, userId, householdId };
  }

  const guestId = await getGuestIdFromCookies();
  if (!guestId) {
    // Middleware should always ensure this, but keep a clear error for server-side calls.
    throw new Error("Missing guest cookie");
  }

  const householdId = await ensureGuestHousehold(guestId);
  return { isGuest: true, userId: null, householdId };
}

export async function getPeople(): Promise<Person[]> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("people")
    .select("*")
    .eq("household_id", householdId)
    .order("name");
  if (error) throw error;
  return data.map(toPerson);
}

export async function updatePerson(id: string, patch: Partial<Person>): Promise<Person> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.income !== undefined) dbPatch.income = patch.income;

  const { data, error } = await admin
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) throw error;
  return toPerson(data);
}

export async function getCurrentUserId(): Promise<string> {
  const userId = await getAuthenticatedUserId();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

export async function getCategories(): Promise<Category[]> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .select("*")
    .eq("household_id", householdId)
    .order("name");
  if (error) throw error;
  return data.map(toCategory);
}

export async function updateCategory(id: string, patch: Partial<Category>): Promise<Category> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  // biome-ignore lint/suspicious/noExplicitAny: constructing dynamic object
  const dbPatch: any = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.targetPercent !== undefined) dbPatch.target_percent = patch.targetPercent;

  const { data, error } = await admin
    .from("categories")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) throw error;
  return toCategory(data);
}

export async function getTransactions(year?: number, month?: number): Promise<Transaction[]> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  const query = admin.from("transactions").select("*").eq("household_id", householdId);

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
    const { data: recurringData, error: recurringError } = await admin
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .eq("is_recurring", true)
      .lt("date", startDate);

    if (recurringError) throw recurringError;

    // 3. Process recurring transactions
    // biome-ignore lint/suspicious/noExplicitAny: DB row type is loose
    const virtualTransactions = recurringData.map((t: any) => {
      // Create a date object from the original date
      const originalDate = new Date(t.date);
      const day = originalDate.getUTCDate();

      // Create date for the target month
      const targetDate = new Date(Date.UTC(year, month - 1, day));

      // If the month rolled over (e.g. Feb 31 -> Mar 3), roll back to last day of target month
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

    // Re-sort by date descending
    allTransactions.sort((a, b) => b.date.localeCompare(a.date));

    return allTransactions.map(toTransaction);
  }

  const { data, error } = await query.order("date", { ascending: false });
  if (error) throw error;
  return data.map(toTransaction);
}

export async function createTransaction(t: Omit<Transaction, "id">): Promise<Transaction> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();

  const dbRow = {
    description: t.description,
    amount: t.amount,
    category_id: t.categoryId,
    paid_by: t.paidBy,
    is_recurring: t.isRecurring,
    date: t.date,
    household_id: householdId,
  };

  const { data, error } = await admin.from("transactions").insert(dbRow).select().single();

  if (error) throw error;
  return toTransaction(data);
}

export async function deleteTransaction(id: number): Promise<void> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  const { error } = await admin
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) throw error;
}

export async function getTransaction(id: number): Promise<Transaction | null> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();
  const { data, error } = await admin
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
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();

  // Create the person record
  const dbRow = {
    name: data.name,
    income: data.income,
    household_id: householdId,
    linked_user_id: null,
  };

  const { data: personData, error: personError } = await admin
    .from("people")
    .insert(dbRow)
    .select()
    .single();

  if (personError) throw personError;
  return toPerson(personData);
}

export async function deletePerson(id: string): Promise<void> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();

  // Check if there are any transactions referencing this person
  const { data: transactions, error: checkError } = await admin
    .from("transactions")
    .select("id")
    .eq("paid_by", id)
    .eq("household_id", householdId);

  if (checkError) throw checkError;

  // If there are transactions, reassign them to another person
  if (transactions && transactions.length > 0) {
    // Get the default payer for the household
    const defaultPayerId = await getDefaultPayerId();

    // Find a replacement person (default payer or first other person in household)
    let replacementPersonId: string | null = null;

    if (defaultPayerId && defaultPayerId !== id) {
      // Verify the default payer still exists
      const { data: defaultPayer } = await admin
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
      const { data: otherPeople, error: peopleError } = await admin
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

    // Reassign all transactions to the replacement person
    const { error: updateError } = await admin
      .from("transactions")
      .update({ paid_by: replacementPersonId })
      .eq("paid_by", id)
      .eq("household_id", householdId);

    if (updateError) throw updateError;
  }

  // Now delete the person
  const { error } = await admin
    .from("people")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) throw error;
}

export async function getDefaultPayerId(): Promise<string | null> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("households")
    .select("default_payer_id")
    .eq("id", householdId)
    .single();

  if (error) throw error;
  return data?.default_payer_id ?? null;
}

export async function updateDefaultPayerId(personId: string): Promise<void> {
  const { householdId } = await getSessionInfo();
  const admin = createAdminClient();

  // Verify that the person belongs to the household
  const { data: personData, error: personError } = await admin
    .from("people")
    .select("id, household_id")
    .eq("id", personId)
    .eq("household_id", householdId)
    .single();

  if (personError || !personData) {
    console.error("Person validation error:", personError);
    throw new Error("Person not found in household");
  }

  const { data: updateData, error } = await admin
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

export async function migrateGuestHouseholdToUser(userId: string, guestId: string): Promise<void> {
  const admin = createAdminClient();

  const { data: guestHousehold, error: householdError } = await admin
    .from("households")
    .select("id, default_payer_id")
    .eq("guest_id", guestId)
    .maybeSingle();

  if (householdError) throw householdError;
  if (!guestHousehold?.id) return;

  const householdId = guestHousehold.id as string;

  // Add the new user as owner of the guest household (so auth-based RLS access works too).
  const { error: memberUpsertError } = await admin.from("household_members").upsert(
    {
      household_id: householdId,
      user_id: userId,
      role: "owner",
    },
    { onConflict: "household_id,user_id" },
  );

  if (memberUpsertError) throw memberUpsertError;

  // Link one existing person in that household to the new user.
  const { data: person, error: personError } = await admin
    .from("people")
    .select("id")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (personError) throw personError;

  if (person?.id) {
    const { error: linkError } = await admin
      .from("people")
      .update({ linked_user_id: userId })
      .eq("id", person.id)
      .eq("household_id", householdId);
    if (linkError) throw linkError;

    if (!guestHousehold.default_payer_id) {
      const { error: setDefaultError } = await admin
        .from("households")
        .update({ default_payer_id: person.id })
        .eq("id", householdId);
      if (setDefaultError) throw setDefaultError;
    }
  }
}
