"use client";

import { ArrowRightLeft } from "lucide-react";

import {
  calculatePeopleShareWithIncomeTransactions,
  calculateSettlementData,
  calculateTotalExpenses,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";

import { PersonSettlementRow } from "./PersonSettlementRow";

type FairDistributionSectionProps = {
  people: Person[];
  transactionsForSelectedMonth: Transaction[];
  categories: Category[];
  selectedMonthDate: Date;
};

export function FairDistributionSection({
  people,
  transactionsForSelectedMonth,
  categories,
  selectedMonthDate,
}: FairDistributionSectionProps) {
  // People share considering income transactions
  const peopleWithShare = calculatePeopleShareWithIncomeTransactions(
    people,
    transactionsForSelectedMonth,
  );

  // Build set of excluded category IDs for fair distribution
  const excludedCategoryIds = new Set(
    categories
      .filter((category) => shouldCategoryAutoExcludeFromSplit(category.name))
      .map((category) => category.id),
  );

  // Filter transactions for fair distribution calculation
  const expenseTransactions = getExpenseTransactions(transactionsForSelectedMonth);
  const transactionsForFairDistribution = expenseTransactions.filter(
    (transaction) =>
      transaction.categoryId !== null &&
      !excludedCategoryIds.has(transaction.categoryId) &&
      !transaction.excludeFromSplit,
  );

  // Calculate settlement data
  const totalExpenses = calculateTotalExpenses(transactionsForFairDistribution);
  const settlementData = calculateSettlementData(
    peopleWithShare,
    transactionsForFairDistribution,
    totalExpenses,
  );

  const hasTransactions = transactionsForFairDistribution.length > 0;
  const debtors = settlementData.filter((person) => person.balance < -0.01);
  const creditors = settlementData.filter((person) => person.balance > 0.01);
  const isSettled = settlementData.every((person) => Math.abs(person.balance) < 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <ArrowRightLeft size={18} />
          Distribuição Justa ({formatMonthYear(selectedMonthDate)})
        </h2>
      </div>
      <div className="p-6">
        {!hasTransactions ? (
          <div className="text-center py-8 text-slate-400">
            Nenhum gasto registrado neste mês para calcular.
          </div>
        ) : (
          <div className="space-y-6">
            {settlementData.map((person) => (
              <PersonSettlementRow key={person.id} person={person} totalExpenses={totalExpenses} />
            ))}

            {/* Settlement Summary */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
              <p className="font-semibold mb-1">Resumo do Acerto:</p>
              {debtors.flatMap((debtor) =>
                creditors.map((creditor) => (
                  <p key={`${debtor.id}-${creditor.id}`}>
                    👉 <strong>{debtor.name}</strong> precisa transferir{" "}
                    <strong>{formatCurrency(Math.abs(debtor.balance))}</strong> para{" "}
                    <strong>{creditor.name}</strong>.
                  </p>
                )),
              )}
              {isSettled && <p>✅ Tudo quitado! Ninguém deve nada.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
