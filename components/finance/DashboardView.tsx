"use client";

import { ArrowRightLeft, PieChart, TrendingDown, TrendingUp } from "lucide-react";

import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import {
  type SettlementRow,
  calculateCategorySummary,
  calculateIncomeBreakdown,
  calculatePeopleShareWithIncomeTransactions,
  calculateSettlementData,
  calculateTotalExpenses,
  calculateTotalIncome,
  getExpenseTransactions,
} from "@/components/finance/hooks/useFinanceCalculations";
import { getCategoryColorStyle } from "@/lib/categoryColors";
import { normalizeCategoryName, shouldCategoryAutoExcludeFromSplit } from "@/lib/constants";
import { formatCurrency, formatMonthYear, formatPercent } from "@/lib/format";

// ============================================================================
// Component
// ============================================================================

export function DashboardView() {
  const { selectedMonthDate } = useCurrentMonth();
  const { people } = usePeople();
  const { categories } = useCategories();
  const { transactionsForSelectedMonth } = useTransactions();

  // Base calculations
  const totalIncome = calculateTotalIncome(people);
  const incomeBreakdown = calculateIncomeBreakdown(transactionsForSelectedMonth);
  const effectiveIncome = totalIncome + incomeBreakdown.netIncome;

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

  // Calculate totals and summaries
  const totalExpensesAll = calculateTotalExpenses(transactionsForSelectedMonth);
  const totalExpensesForDistribution = calculateTotalExpenses(transactionsForFairDistribution);
  const settlementData = calculateSettlementData(
    peopleWithShare,
    transactionsForFairDistribution,
    totalExpensesForDistribution,
  );
  const categorySummary = calculateCategorySummary(
    categories,
    transactionsForSelectedMonth,
    totalIncome,
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      {/* Summary Cards */}
      <SummaryCards
        effectiveIncome={effectiveIncome}
        incomeBreakdown={incomeBreakdown}
        totalExpenses={totalExpensesForDistribution}
        selectedMonthDate={selectedMonthDate}
      />

      {/* Fair Distribution Section */}
      <FairDistributionSection
        settlementData={settlementData}
        totalExpenses={totalExpensesForDistribution}
        hasTransactions={transactionsForFairDistribution.length > 0}
        selectedMonthDate={selectedMonthDate}
      />

      {/* Category Summary Table */}
      <CategorySummaryTable
        categorySummary={categorySummary}
        totalExpensesAll={totalExpensesAll}
        totalIncome={totalIncome}
      />
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

type SummaryCardsProps = {
  effectiveIncome: number;
  incomeBreakdown: { totalIncomeIncrement: number; totalIncomeDecrement: number };
  totalExpenses: number;
  selectedMonthDate: Date;
};

function SummaryCards({
  effectiveIncome,
  incomeBreakdown,
  totalExpenses,
  selectedMonthDate,
}: SummaryCardsProps) {
  const hasIncomeTransactions =
    incomeBreakdown.totalIncomeIncrement > 0 || incomeBreakdown.totalIncomeDecrement > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Income Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium mb-1">Renda Total Familiar</h3>
        <p className="text-2xl font-bold text-slate-800">{formatCurrency(effectiveIncome)}</p>
        {hasIncomeTransactions && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 space-y-1">
              {incomeBreakdown.totalIncomeIncrement > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp size={12} />
                  <span>+ {formatCurrency(incomeBreakdown.totalIncomeIncrement)} adicionado</span>
                </div>
              )}
              {incomeBreakdown.totalIncomeDecrement > 0 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <TrendingDown size={12} />
                  <span>- {formatCurrency(incomeBreakdown.totalIncomeDecrement)} deduzido</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium mb-1">
          Total Gasto ({formatMonthYear(selectedMonthDate)})
        </h3>
        <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
      </div>

      {/* Free Balance Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-slate-500 text-sm font-medium mb-1">Saldo Livre</h3>
        <p className="text-2xl font-bold text-green-600">
          {formatCurrency(effectiveIncome - totalExpenses)}
        </p>
      </div>
    </div>
  );
}

type FairDistributionSectionProps = {
  settlementData: SettlementRow[];
  totalExpenses: number;
  hasTransactions: boolean;
  selectedMonthDate: Date;
};

function FairDistributionSection({
  settlementData,
  totalExpenses,
  hasTransactions,
  selectedMonthDate,
}: FairDistributionSectionProps) {
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

type PersonSettlementRowProps = {
  person: SettlementRow;
  totalExpenses: number;
};

function PersonSettlementRow({ person, totalExpenses }: PersonSettlementRowProps) {
  const fairSharePercent = totalExpenses > 0 ? (person.fairShareAmount / totalExpenses) * 100 : 0;

  return (
    <div className="relative">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="font-medium text-lg text-slate-800">{person.name}</span>
          <span className="text-xs text-slate-500 ml-2">
            (Renda: {formatPercent(person.sharePercent * 100)})
          </span>
        </div>
      </div>

      <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-slate-300 opacity-50 transition-all duration-500"
          style={{ width: `${fairSharePercent}%` }}
          title="Parte Justa"
        />
      </div>

      <div className="mt-2 text-xs text-slate-500 flex justify-between">
        <span>
          Pagou de fato:{" "}
          <strong className="text-slate-700">{formatCurrency(person.paidAmount)}</strong>
        </span>
        <span>
          Deveria pagar:{" "}
          <strong className="text-slate-700">{formatCurrency(person.fairShareAmount)}</strong>
        </span>
      </div>
    </div>
  );
}

type CategorySummaryTableProps = {
  categorySummary: Array<{
    id: string;
    name: string;
    targetPercent: number;
    totalSpent: number;
    realPercentOfIncome: number;
  }>;
  totalExpensesAll: number;
  totalIncome: number;
};

function CategorySummaryTable({
  categorySummary,
  totalExpensesAll,
  totalIncome,
}: CategorySummaryTableProps) {
  const goalsAndSavingsNames = new Set(
    ["liberdade financeira", "metas"].map((n) => normalizeCategoryName(n)),
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <PieChart size={18} />
          Metas vs Realizado
        </h2>
      </div>
      <div className="p-4 overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3 text-right">Gasto</th>
              <th className="px-4 py-3 text-center">% Previsto</th>
              <th className="px-4 py-3 text-center">% Real</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {categorySummary.map((cat) => {
              const normalizedName = normalizeCategoryName(cat.name);
              const isGoalOrSavings = goalsAndSavingsNames.has(normalizedName);
              const isOverBudget = cat.realPercentOfIncome > cat.targetPercent;
              const isBelowGoal = cat.realPercentOfIncome < cat.targetPercent;

              // For goals/savings, we WANT to reach/exceed the target
              const showBadStatus = isGoalOrSavings ? isBelowGoal : isOverBudget;
              const badStatusLabel = isGoalOrSavings ? "Faltando" : "Estourou";

              return (
                <tr
                  key={cat.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium" style={getCategoryColorStyle(cat.name)}>
                    {cat.name}
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(cat.totalSpent)}</td>
                  <td
                    className="px-4 py-3 text-center"
                    title={formatCurrency(
                      Math.ceil((cat.targetPercent / 100) * totalIncome * 100) / 100,
                    )}
                  >
                    {cat.targetPercent}%
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {cat.realPercentOfIncome.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3">
                    {showBadStatus ? (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                        {badStatusLabel}
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">
                        Dentro
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-slate-50 font-bold">
              <td className="px-4 py-3">TOTAL</td>
              <td className="px-4 py-3 text-right">{formatCurrency(totalExpensesAll)}</td>
              <td className="px-4 py-3 text-center" title={formatCurrency(totalIncome)}>
                100%
              </td>
              <td className="px-4 py-3 text-center">
                {totalIncome > 0 ? ((totalExpensesAll / totalIncome) * 100).toFixed(1) : 0}%
              </td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
