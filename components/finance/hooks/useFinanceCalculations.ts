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

export function calculateTotalIncome(people: Person[]): number {
  return people.reduce((accumulator, person) => accumulator + person.income, 0);
}

export function calculatePeopleShare(people: Person[], totalIncome: number): PersonWithShare[] {
  return people.map((person) => ({
    ...person,
    sharePercent: totalIncome > 0 ? person.income / totalIncome : 0,
  }));
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions.reduce((accumulator, transaction) => accumulator + transaction.amount, 0);
}

export function calculateCategorySummary(
  categories: Category[],
  transactionsForSelectedMonth: Transaction[],
  totalIncome: number,
): CategorySummaryRow[] {
  return categories.map((category) => {
    const totalSpent = transactionsForSelectedMonth
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
  return peopleWithShare.map((person) => {
    const paidAmount = transactionsForSelectedMonth
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
