import "server-only";

import { getClosedMonthsSet } from "@/features/snapshots/server/store";
import { getAccountingYearMonthUtc } from "@/lib/dateUtils";
import { mapRecurringTemplateRow, toRecurringTemplateDbPatch } from "@/lib/server/dbMappers";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type { RecurringTemplate, RecurringTemplatePatch, RecurringTemplateRow } from "@/lib/types";

export type RecurringTemplateDeleteScope = "template_only" | "full_history";
export type RecurringTemplateUpdateScope = "template_only" | "full_history";

type RecurringTemplateListOptions = {
  activeOnly?: boolean;
  limit?: number;
  offset?: number;
};

export async function getRecurringTemplates(
  options?: RecurringTemplateListOptions,
): Promise<{ templates: RecurringTemplate[]; total: number }> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const limit = Math.min(options?.limit ?? 100, 100);
  const offset = options?.offset ?? 0;

  let query = supabase
    .from("recurring_templates")
    .select("*", { count: "exact" })
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options?.activeOnly !== false) {
    query = query.eq("is_active", true);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    templates: (data as RecurringTemplateRow[]).map(mapRecurringTemplateRow),
    total: count ?? 0,
  };
}

export async function getRecurringTemplate(id: number): Promise<RecurringTemplate | null> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("recurring_templates")
    .select("*")
    .eq("id", id)
    .eq("household_id", householdId)
    .single();

  if (error) return null;
  return mapRecurringTemplateRow(data as RecurringTemplateRow);
}

export async function createRecurringTemplate(
  input: Omit<RecurringTemplate, "id">,
): Promise<RecurringTemplate> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const dbRow = {
    household_id: householdId,
    description: input.description,
    amount: input.amount,
    category_id: input.type === "income" ? null : input.categoryId,
    paid_by: input.paidBy,
    type: input.type,
    is_increment: input.isIncrement,
    is_credit_card: input.type === "income" ? false : input.isCreditCard,
    is_next_billing: input.type === "income" ? false : input.isNextBilling,
    exclude_from_split: input.type === "income" ? false : input.excludeFromSplit,
    day_of_month: input.dayOfMonth,
    is_active: input.isActive,
  };

  const { data, error } = await supabase
    .from("recurring_templates")
    .insert(dbRow)
    .select("*")
    .single();

  if (error) throw error;
  return mapRecurringTemplateRow(data as RecurringTemplateRow);
}

/** Build a transaction patch from template patch (excludes dayOfMonth, isActive). */
function templatePatchToTransactionPatch(patch: RecurringTemplatePatch): Record<string, unknown> {
  const txPatch: Record<string, unknown> = {};
  if (patch.description !== undefined) txPatch.description = patch.description;
  if (patch.amount !== undefined) txPatch.amount = patch.amount;
  if (patch.categoryId !== undefined) txPatch.category_id = patch.categoryId;
  if (patch.paidBy !== undefined) txPatch.paid_by = patch.paidBy;
  if (patch.type !== undefined) txPatch.type = patch.type;
  if (patch.isIncrement !== undefined) txPatch.is_increment = patch.isIncrement;
  if (patch.isCreditCard !== undefined) txPatch.is_credit_card = patch.isCreditCard;
  if (patch.isNextBilling !== undefined) txPatch.is_next_billing = patch.isNextBilling;
  if (patch.excludeFromSplit !== undefined) txPatch.exclude_from_split = patch.excludeFromSplit;
  return txPatch;
}

export async function updateRecurringTemplate(
  id: number,
  patch: RecurringTemplatePatch,
  options?: { scope?: RecurringTemplateUpdateScope },
): Promise<RecurringTemplate> {
  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();
  const dbPatch = toRecurringTemplateDbPatch(patch);

  const { data, error } = await supabase
    .from("recurring_templates")
    .update(dbPatch)
    .eq("id", id)
    .eq("household_id", householdId)
    .select("*")
    .single();

  if (error) throw error;

  const scope = options?.scope ?? "template_only";
  if (scope === "full_history" && Object.keys(templatePatchToTransactionPatch(patch)).length > 0) {
    const { data: rows, error: fetchError } = await supabase
      .from("transactions")
      .select("id, date, is_next_billing")
      .eq("recurring_template_id", id)
      .eq("household_id", householdId);

    if (!fetchError && rows && rows.length > 0) {
      const periods = rows.map((r) => {
        const { year, month } = getAccountingYearMonthUtc(r.date, r.is_next_billing ?? false);
        return { year, month };
      });
      const uniquePeriods = Array.from(
        new Map(periods.map((p) => [`${p.year},${p.month}`, p])).values(),
      );
      const closedSet = await getClosedMonthsSet(householdId, uniquePeriods);

      const toUpdate: number[] = [];
      for (const r of rows) {
        const { year, month } = getAccountingYearMonthUtc(r.date, r.is_next_billing ?? false);
        if (!closedSet.has(`${year},${month}`)) {
          toUpdate.push(Number(r.id));
        }
      }

      const txDbPatch = templatePatchToTransactionPatch(patch);
      if (toUpdate.length > 0 && Object.keys(txDbPatch).length > 0) {
        const { error: updateError } = await supabase
          .from("transactions")
          .update(txDbPatch)
          .eq("household_id", householdId)
          .in("id", toUpdate);
        if (updateError) throw updateError;
      }
    }
  }

  return mapRecurringTemplateRow(data as RecurringTemplateRow);
}

function resolveDeleteScope(options?: {
  scope?: RecurringTemplateDeleteScope;
  purgeTransactions?: boolean;
  fromDate?: string;
}): RecurringTemplateDeleteScope {
  if (options?.scope === "template_only" || options?.scope === "full_history") {
    return options.scope;
  }
  return options?.purgeTransactions === true ? "full_history" : "template_only";
}

export async function deleteRecurringTemplate(
  id: number,
  options?: {
    scope?: RecurringTemplateDeleteScope;
    purgeTransactions?: boolean;
    fromDate?: string;
  },
): Promise<void> {
  const scope = resolveDeleteScope(options);

  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data: rows, error: fetchError } = await supabase
    .from("transactions")
    .select("id, date, is_next_billing")
    .eq("recurring_template_id", id)
    .eq("household_id", householdId);

  if (fetchError) throw fetchError;

  const periods = (rows ?? []).map((r) => {
    const { year, month } = getAccountingYearMonthUtc(r.date, r.is_next_billing ?? false);
    return { year, month };
  });
  const uniquePeriods = Array.from(
    new Map(periods.map((p) => [`${p.year},${p.month}`, p])).values(),
  );
  const closedSet = await getClosedMonthsSet(householdId, uniquePeriods);

  const toUnlink: number[] = [];
  const toDelete: number[] = [];
  for (const r of rows ?? []) {
    const { year, month } = getAccountingYearMonthUtc(r.date, r.is_next_billing ?? false);
    const key = `${year},${month}`;
    const isClosed = closedSet.has(key);
    if (scope === "full_history" && isClosed) {
      toUnlink.push(Number(r.id));
    } else if (!isClosed) {
      toDelete.push(Number(r.id));
    }
    // template_only + closed: do nothing (keep transaction linked)
  }

  if (toUnlink.length > 0) {
    const { error: unlinkError } = await supabase
      .from("transactions")
      .update({ recurring_template_id: null })
      .eq("household_id", householdId)
      .in("id", toUnlink);
    if (unlinkError) throw unlinkError;
  }
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("household_id", householdId)
      .in("id", toDelete);
    if (deleteError) throw deleteError;
  }

  await updateRecurringTemplate(id, { isActive: false });
}
