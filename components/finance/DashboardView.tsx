"use client";

import { CategorySummaryTable } from "@/components/finance/CategorySummaryTable";
import { FairDistributionSection } from "@/components/finance/FairDistributionSection";
import { MonthNavigator } from "@/components/finance/MonthNavigator";
import { SummaryCards } from "@/components/finance/SummaryCards";
import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useCurrentMonth } from "@/components/finance/contexts/CurrentMonthContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";

export function DashboardView() {
  const { selectedMonthDate } = useCurrentMonth();
  const { people } = usePeople();
  const { categories } = useCategories();
  const { transactionsForSelectedMonth } = useTransactions();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <MonthNavigator />

      {/* Summary Cards */}
      <SummaryCards
        people={people}
        transactionsForSelectedMonth={transactionsForSelectedMonth}
        categories={categories}
        selectedMonthDate={selectedMonthDate}
      />

      {/* Fair Distribution Section */}
      <FairDistributionSection
        people={people}
        transactionsForSelectedMonth={transactionsForSelectedMonth}
        categories={categories}
        selectedMonthDate={selectedMonthDate}
      />

      {/* Category Summary Table */}
      <CategorySummaryTable
        categories={categories}
        transactionsForSelectedMonth={transactionsForSelectedMonth}
        people={people}
      />
    </div>
  );
}
