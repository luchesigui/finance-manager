import "server-only";

import { mapPersonRow, toPersonDbPatch } from "@/lib/server/dbMappers";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type { Person, PersonPatch, PersonRow } from "@/lib/types";

export async function getPeople(): Promise<Person[]> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("people")
    .select("*")
    .eq("household_id", householdId)
    .order("name");

  if (error) throw error;
  return (data as PersonRow[]).map(mapPersonRow);
}

export async function updatePerson(id: string, patch: PersonPatch): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toPersonDbPatch(patch);

  const { data, error } = await supabase
    .from("people")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select()
    .single();

  if (error) throw error;
  return mapPersonRow(data as PersonRow);
}

export async function createPerson(input: {
  name: string;
  income: number;
}): Promise<Person> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const dbRow = {
    name: input.name,
    income: input.income,
    household_id: householdId,
    linked_user_id: null,
  };

  const { data, error } = await supabase.from("people").insert(dbRow).select().single();

  if (error) throw error;
  return mapPersonRow(data as PersonRow);
}

async function findReplacementPerson(
  excludeId: string,
  householdId: string,
  // biome-ignore lint/suspicious/noExplicitAny: Supabase client type
  supabase: any,
): Promise<string | null> {
  const defaultPayerId = await getDefaultPayerId();

  if (defaultPayerId && defaultPayerId !== excludeId) {
    const { data: defaultPayer } = await supabase
      .from("people")
      .select("id")
      .eq("id", defaultPayerId)
      .eq("household_id", householdId)
      .single();

    if (defaultPayer) {
      return defaultPayerId;
    }
  }

  const { data: otherPeople, error: peopleError } = await supabase
    .from("people")
    .select("id")
    .eq("household_id", householdId)
    .neq("id", excludeId)
    .limit(1);

  if (peopleError) throw peopleError;

  return otherPeople?.[0]?.id ?? null;
}

export async function deletePerson(id: string): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const [{ data: transactions, error: txError }, { data: templates, error: tmplError }] =
    await Promise.all([
      supabase.from("transactions").select("id").eq("paid_by", id).eq("household_id", householdId),
      supabase
        .from("recurring_templates")
        .select("id")
        .eq("paid_by", id)
        .eq("household_id", householdId),
    ]);

  if (txError) throw txError;
  if (tmplError) throw tmplError;

  const hasTransactions = transactions && transactions.length > 0;
  const hasTemplates = templates && templates.length > 0;

  if (hasTransactions || hasTemplates) {
    const replacementPersonId = await findReplacementPerson(id, householdId, supabase);

    if (!replacementPersonId) {
      const error = new Error(
        "Cannot delete person because they have transactions or recurring templates and there are no other people to reassign them to.",
      ) as Error & { code: string };
      error.code = "NO_REPLACEMENT_PERSON";
      throw error;
    }

    if (hasTransactions) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({ paid_by: replacementPersonId })
        .eq("paid_by", id)
        .eq("household_id", householdId);
      if (updateError) throw updateError;
    }

    if (hasTemplates) {
      const { error: updateError } = await supabase
        .from("recurring_templates")
        .update({ paid_by: replacementPersonId })
        .eq("paid_by", id)
        .eq("household_id", householdId);
      if (updateError) throw updateError;
    }
  }

  const { error } = await supabase
    .from("people")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
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

  const { data: personData, error: personError } = await supabase
    .from("people")
    .select("id, household_id")
    .eq("id", personId)
    .eq("household_id", householdId)
    .single();

  if (personError || !personData) {
    throw new Error("Person not found in household");
  }

  const { data: updateData, error } = await supabase
    .from("households")
    .update({ default_payer_id: personId })
    .eq("id", householdId)
    .select();

  if (error) throw error;

  if (!updateData || updateData.length === 0) {
    throw new Error("Failed to update default payer - no rows updated");
  }
}

export async function getEmergencyFund(): Promise<number> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("households")
    .select("emergency_fund")
    .eq("id", householdId)
    .single();

  if (error) throw error;
  return Number(data?.emergency_fund ?? 0);
}

export async function updateEmergencyFund(amount: number): Promise<void> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data: updateData, error } = await supabase
    .from("households")
    .update({ emergency_fund: amount })
    .eq("id", householdId)
    .select();

  if (error) throw error;

  if (!updateData || updateData.length === 0) {
    throw new Error("Failed to update emergency fund - no rows updated");
  }
}
