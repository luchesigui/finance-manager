"use client";

import { ArrowRightLeft } from "lucide-react";

import {
  calculatePeopleShareWithIncomeTransactions,
  calculateSettlementData,
  calculateTotalExpenses,
  getExpenseTransactions,
} from "@/features/transactions/hooks/useFinanceCalculations";
import { shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import type { Category, Person, Transaction } from "@/lib/types";

import { PersonSettlementRow } from "@/features/people/components/PersonSettlementRow";

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
    <div className="noir-card overflow-hidden">
      <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center justify-between">
        <h2 className="font-semibold text-heading flex items-center gap-2">
          <ArrowRightLeft size={18} className="text-accent-primary" />
          Distribuição Justa ({formatMonthYear(selectedMonthDate)})
        </h2>
      </div>
      <div className="p-6">
        {!hasTransactions ? (
          <div className="text-center py-8 text-muted">
            Nenhum gasto registrado neste mês para calcular.
          </div>
        ) : (
          <div className="space-y-6">
            {settlementData.map((person) => (
              <PersonSettlementRow key={person.id} person={person} totalExpenses={totalExpenses} />
            ))}

            {/* Settlement Summary */}
            <div className="mt-6 p-4 rounded-card bg-accent-primary/10 border border-accent-primary/30 text-sm">
              <p className="font-semibold text-heading mb-2">Resumo do Acerto:</p>
              <div className="space-y-1 text-body">
                {debtors.flatMap((debtor) =>
                  creditors.map((creditor) => (
                    <p key={`${debtor.id}-${creditor.id}`}>
                      👉 <strong className="text-heading">{debtor.name}</strong> precisa transferir{" "}
                      <strong className="text-accent-spending tabular-nums">
                        {formatCurrency(Math.abs(debtor.balance))}
                      </strong>{" "}
                      para <strong className="text-heading">{creditor.name}</strong>.
                    </p>
                  )),
                )}
                {isSettled && (
                  <p className="text-accent-positive">✅ Tudo quitado! Ninguém deve nada.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
