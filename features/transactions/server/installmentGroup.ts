import "server-only";

import {
  formatInstallmentDescription,
  parseInstallmentSuffix,
  stripInstallmentSuffix,
} from "@/features/transactions/utils/installmentDescription";
import { getPrimaryHouseholdId } from "@/lib/server/household";
import { createClient } from "@/lib/supabase/server";
import type { Transaction, TransactionPatch } from "@/lib/types";

import { getTransaction, updateTransaction } from "./store";

export type InstallmentGroupMember = {
  id: number;
  index: number;
  total: number;
  base: string;
};

export async function findInstallmentGroupMembers(
  transactionId: number,
): Promise<InstallmentGroupMember[] | null> {
  const tx = await getTransaction(transactionId);
  if (!tx || tx.type === "income" || tx.recurringTemplateId != null) {
    return null;
  }

  const parsed = parseInstallmentSuffix(tx.description);
  if (!parsed || parsed.total < 2) return null;

  const { base, total } = parsed;
  const descriptions = Array.from({ length: total }, (_, i) =>
    formatInstallmentDescription(base, i + 1, total),
  );

  const supabase = await createClient();
  const householdId = await getPrimaryHouseholdId();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, description")
    .eq("household_id", householdId)
    .in("description", descriptions);

  if (error) throw error;
  if (!data || data.length < 2) return null;

  const members: InstallmentGroupMember[] = [];
  for (const row of data) {
    const p = parseInstallmentSuffix(String(row.description ?? ""));
    if (!p || p.base !== base || p.total !== total) continue;
    members.push({
      id: Number(row.id),
      index: p.index,
      total: p.total,
      base: p.base,
    });
  }

  if (members.length < 2) return null;
  members.sort((a, b) => a.index - b.index);
  return members;
}

function buildPatchForMember(
  member: InstallmentGroupMember,
  primaryId: number,
  basePatch: TransactionPatch,
): TransactionPatch {
  const patch: TransactionPatch =
    member.id !== primaryId && basePatch.date !== undefined
      ? (() => {
          const { date: _omitDate, ...rest } = basePatch;
          return rest;
        })()
      : { ...basePatch };

  if (basePatch.description !== undefined) {
    const newBase = stripInstallmentSuffix(basePatch.description);
    return {
      ...patch,
      description: formatInstallmentDescription(newBase, member.index, member.total),
    };
  }

  return patch;
}

export async function updateInstallmentGroupTransactions(
  primaryId: number,
  basePatch: TransactionPatch,
): Promise<Transaction> {
  const members = await findInstallmentGroupMembers(primaryId);
  if (!members) {
    return updateTransaction(primaryId, basePatch);
  }

  let last: Transaction | null = null;
  for (const member of members) {
    const perPatch = buildPatchForMember(member, primaryId, basePatch);
    last = await updateTransaction(member.id, perPatch);
  }
  if (last) return last;
  const fallback = await getTransaction(primaryId);
  if (!fallback) throw new Error("Transaction not found after installment group update");
  return fallback;
}
