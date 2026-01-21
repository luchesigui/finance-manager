import type { Category, Person, Transaction } from "@/lib/types";

// ============================================================================
// Extended Types for Calculations
// ============================================================================

export type PersonWithShare = Person & {
  sharePercent: number;
};

export type CategorySummaryRow = Category & {
  totalSpent: number;
  realPercentOfIncome: number;
};

export type SettlementRow = PersonWithShare & {
  paidAmount: number;
  fairShareAmount: number;
  balance: number;
};

export type IncomeBreakdown = {
  totalIncomeIncrement: number;
  totalIncomeDecrement: number;
  netIncome: number;
};

// ============================================================================
// Transaction Filters (Single-Pass Optimizations)
// ============================================================================

/**
 * Determines if a transaction should be counted in calculations.
 */
function isIncludedInTotals(transaction: Transaction): boolean {
  return !transaction.isForecast || transaction.isForecastIncluded;
}

/**
 * Filters transactions by type. Use sparingly - prefer single-pass processing when possible.
 */
export function getExpenseTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(
    (transaction) => transaction.type !== "income" && isIncludedInTotals(transaction),
  );
}

/**
 * Filters transactions by type. Use sparingly - prefer single-pass processing when possible.
 */
export function getIncomeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(
    (transaction) => transaction.type === "income" && isIncludedInTotals(transaction),
  );
}

// ============================================================================
// Income Calculations
// ============================================================================

/**
 * Calculates total base income from all people (salary/fixed income).
 */
export function calculateTotalIncome(people: Person[]): number {
  return people.reduce((sum, person) => sum + person.income, 0);
}

/**
 * Calculates people's share percentages based on their income proportion.
 */
export function calculatePeopleShare(people: Person[], totalIncome: number): PersonWithShare[] {
  const safeTotal = totalIncome > 0 ? totalIncome : 1;

  return people.map((person) => ({
    ...person,
    sharePercent: totalIncome > 0 ? person.income / safeTotal : 0,
  }));
}

/**
 * Calculates income breakdown from income-type transactions.
 * Optimized for single-pass processing.
 */
export function calculateIncomeBreakdown(transactions: Transaction[]): IncomeBreakdown {
  let totalIncomeIncrement = 0;
  let totalIncomeDecrement = 0;

  for (const t of transactions) {
    if (t.type !== "income" || !isIncludedInTotals(t)) continue;

    if (t.isIncrement) {
      totalIncomeIncrement += t.amount;
    } else {
      totalIncomeDecrement += t.amount;
    }
  }

  return {
    totalIncomeIncrement,
    totalIncomeDecrement,
    netIncome: totalIncomeIncrement - totalIncomeDecrement,
  };
}

/**
 * Calculates income adjustments per person from income transactions.
 * Returns a Map for O(1) lookup performance.
 */
function calculatePersonIncomeAdjustments(transactions: Transaction[]): Map<string, number> {
  const adjustments = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "income" || !isIncludedInTotals(t)) continue;

    const current = adjustments.get(t.paidBy) ?? 0;
    const delta = t.isIncrement ? t.amount : -t.amount;
    adjustments.set(t.paidBy, current + delta);
  }

  return adjustments;
}

/**
 * Calculates each person's effective income considering income transactions.
 * Returns PersonWithShare with updated income and sharePercent.
 */
export function calculatePeopleShareWithIncomeTransactions(
  people: Person[],
  transactions: Transaction[],
): PersonWithShare[] {
  const incomeAdjustments = calculatePersonIncomeAdjustments(transactions);

  // Calculate effective incomes
  const peopleWithEffectiveIncome = people.map((person) => ({
    ...person,
    income: person.income + (incomeAdjustments.get(person.id) ?? 0),
  }));

  // Calculate total effective income
  const totalEffectiveIncome = peopleWithEffectiveIncome.reduce((sum, p) => sum + p.income, 0);
  const safeTotal = totalEffectiveIncome > 0 ? totalEffectiveIncome : 1;

  // Calculate share percentages
  return peopleWithEffectiveIncome.map((person) => ({
    ...person,
    sharePercent: totalEffectiveIncome > 0 ? person.income / safeTotal : 0,
  }));
}

// ============================================================================
// Expense Calculations
// ============================================================================

/**
 * Calculates total expenses from transactions.
 * Excludes income transactions.
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  let total = 0;

  for (const t of transactions) {
    if (t.type !== "income" && isIncludedInTotals(t)) {
      total += t.amount;
    }
  }

  return total;
}

/**
 * Builds a spending map by category ID for O(1) lookup.
 * Only considers expense transactions.
 */
function buildCategorySpendingMap(transactions: Transaction[]): Map<string, number> {
  const spendingMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.type === "income" || t.categoryId === null || !isIncludedInTotals(t)) continue;

    const current = spendingMap.get(t.categoryId) ?? 0;
    spendingMap.set(t.categoryId, current + t.amount);
  }

  return spendingMap;
}

/**
 * Calculates category summary with spending totals and percentages.
 */
export function calculateCategorySummary(
  categories: Category[],
  transactions: Transaction[],
  totalIncome: number,
): CategorySummaryRow[] {
  const spendingMap = buildCategorySpendingMap(transactions);
  const safeIncome = totalIncome > 0 ? totalIncome : 1;

  return categories.map((category) => {
    const totalSpent = spendingMap.get(category.id) ?? 0;
    const realPercentOfIncome = totalIncome > 0 ? (totalSpent / safeIncome) * 100 : 0;

    return {
      ...category,
      totalSpent,
      realPercentOfIncome,
    };
  });
}

// ============================================================================
// Settlement Calculations
// ============================================================================

/**
 * Builds a payment map by person ID for O(1) lookup.
 * Only considers expense transactions.
 */
function buildPersonPaymentMap(transactions: Transaction[]): Map<string, number> {
  const paymentMap = new Map<string, number>();

  for (const t of transactions) {
    if (t.type === "income" || !isIncludedInTotals(t)) continue;

    const current = paymentMap.get(t.paidBy) ?? 0;
    paymentMap.set(t.paidBy, current + t.amount);
  }

  return paymentMap;
}

/**
 * Calculates settlement data showing who owes/is owed money.
 * Uses optimized single-pass payment aggregation.
 */
export function calculateSettlementData(
  peopleWithShare: PersonWithShare[],
  transactions: Transaction[],
  totalExpenses: number,
): SettlementRow[] {
  const paymentMap = buildPersonPaymentMap(transactions);

  return peopleWithShare.map((person) => {
    const paidAmount = paymentMap.get(person.id) ?? 0;
    const fairShareAmount = totalExpenses * person.sharePercent;
    const balance = paidAmount - fairShareAmount;

    return {
      ...person,
      paidAmount,
      fairShareAmount,
      balance,
    };
  });
}

// ============================================================================
// Comprehensive Financial Summary (Single-Pass)
// ============================================================================

export type FinancialSummary = {
  totalExpenses: number;
  incomeBreakdown: IncomeBreakdown;
  categorySpending: Map<string, number>;
  personPayments: Map<string, number>;
  personIncomeAdjustments: Map<string, number>;
};

/**
 * Calculates all financial metrics in a single pass through transactions.
 * Use this when you need multiple metrics to avoid redundant iterations.
 */
export function calculateFinancialSummary(transactions: Transaction[]): FinancialSummary {
  let totalExpenses = 0;
  let totalIncomeIncrement = 0;
  let totalIncomeDecrement = 0;

  const categorySpending = new Map<string, number>();
  const personPayments = new Map<string, number>();
  const personIncomeAdjustments = new Map<string, number>();

  for (const t of transactions) {
    if (!isIncludedInTotals(t)) continue;
    if (t.type === "income") {
      // Income transaction
      const adjustment = personIncomeAdjustments.get(t.paidBy) ?? 0;
      if (t.isIncrement) {
        totalIncomeIncrement += t.amount;
        personIncomeAdjustments.set(t.paidBy, adjustment + t.amount);
      } else {
        totalIncomeDecrement += t.amount;
        personIncomeAdjustments.set(t.paidBy, adjustment - t.amount);
      }
    } else {
      // Expense transaction
      totalExpenses += t.amount;

      // Track by category
      if (t.categoryId !== null) {
        const catCurrent = categorySpending.get(t.categoryId) ?? 0;
        categorySpending.set(t.categoryId, catCurrent + t.amount);
      }

      // Track by person
      const personCurrent = personPayments.get(t.paidBy) ?? 0;
      personPayments.set(t.paidBy, personCurrent + t.amount);
    }
  }

  return {
    totalExpenses,
    incomeBreakdown: {
      totalIncomeIncrement,
      totalIncomeDecrement,
      netIncome: totalIncomeIncrement - totalIncomeDecrement,
    },
    categorySpending,
    personPayments,
    personIncomeAdjustments,
  };
}
