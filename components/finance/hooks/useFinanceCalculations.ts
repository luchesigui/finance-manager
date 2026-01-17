import type { Category, Person, Transaction } from "@/lib/types";

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

export function calculateTotalIncome(people: Person[]): number {
  return people.reduce((accumulator, person) => accumulator + person.income, 0);
}

export function calculatePeopleShare(people: Person[], totalIncome: number): PersonWithShare[] {
  return people.map((person) => ({
    ...person,
    sharePercent: totalIncome > 0 ? person.income / totalIncome : 0,
  }));
}

/**
 * Calculates each person's effective income considering income transactions.
 * Returns PersonWithShare with updated income and sharePercent based on effective income.
 */
export function calculatePeopleShareWithIncomeTransactions(
  people: Person[],
  transactions: Transaction[],
): PersonWithShare[] {
  const incomeTransactions = getIncomeTransactions(transactions);

  // Calculate effective income for each person
  const peopleWithEffectiveIncome = people.map((person) => {
    const personIncomeTransactions = incomeTransactions.filter((t) => t.paidBy === person.id);

    const increments = personIncomeTransactions
      .filter((t) => t.isIncrement)
      .reduce((acc, t) => acc + t.amount, 0);

    const decrements = personIncomeTransactions
      .filter((t) => !t.isIncrement)
      .reduce((acc, t) => acc + t.amount, 0);

    const effectiveIncome = person.income + increments - decrements;

    return {
      ...person,
      income: effectiveIncome,
      baseIncome: person.income,
    };
  });

  // Calculate total effective income
  const totalEffectiveIncome = peopleWithEffectiveIncome.reduce((acc, p) => acc + p.income, 0);

  // Calculate share percentages based on effective income
  return peopleWithEffectiveIncome.map((person) => ({
    ...person,
    sharePercent: totalEffectiveIncome > 0 ? person.income / totalEffectiveIncome : 0,
  }));
}

/**
 * Calculates total expenses from transactions, excluding income transactions.
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((transaction) => transaction.type !== "income")
    .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);
}

/**
 * Calculates income breakdown from income transactions.
 * Returns increment, decrement, and net income values.
 */
export function calculateIncomeBreakdown(transactions: Transaction[]): IncomeBreakdown {
  const incomeTransactions = transactions.filter((t) => t.type === "income");

  const totalIncomeIncrement = incomeTransactions
    .filter((t) => t.isIncrement)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalIncomeDecrement = incomeTransactions
    .filter((t) => !t.isIncrement)
    .reduce((acc, t) => acc + t.amount, 0);

  return {
    totalIncomeIncrement,
    totalIncomeDecrement,
    netIncome: totalIncomeIncrement - totalIncomeDecrement,
  };
}

/**
 * Filter to get only expense transactions.
 */
export function getExpenseTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.type !== "income");
}

/**
 * Filter to get only income transactions.
 */
export function getIncomeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter((t) => t.type === "income");
}

export function calculateCategorySummary(
  categories: Category[],
  transactionsForSelectedMonth: Transaction[],
  totalIncome: number,
): CategorySummaryRow[] {
  // Only consider expense transactions for category summary
  const expenseTransactions = getExpenseTransactions(transactionsForSelectedMonth);

  return categories.map((category) => {
    const totalSpent = expenseTransactions
      .filter((transaction) => transaction.categoryId === category.id)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    const realPercentOfIncome = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

    return {
      ...category,
      totalSpent,
      realPercentOfIncome,
    };
  });
}

export function calculateSettlementData(
  peopleWithShare: PersonWithShare[],
  transactionsForSelectedMonth: Transaction[],
  totalExpenses: number,
): SettlementRow[] {
  // Only consider expense transactions for settlement calculation
  const expenseTransactions = getExpenseTransactions(transactionsForSelectedMonth);

  return peopleWithShare.map((person) => {
    const paidAmount = expenseTransactions
      .filter((transaction) => transaction.paidBy === person.id)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

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
