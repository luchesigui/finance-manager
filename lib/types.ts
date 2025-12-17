export type Person = {
  id: string;
  name: string;
  income: number;
  householdId?: string;
  linkedUserId?: string;
};

export type Category = {
  id: string;
  name: string;
  targetPercent: number;
  householdId?: string;
};

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  categoryId: string;
  paidBy: string;
  isRecurring: boolean;
  recurringId?: string;
  /** YYYY-MM-DD */
  date: string;
  householdId?: string;
};

export type NewTransactionFormState = {
  description: string;
  amount: number | null;
  categoryId: string;
  paidBy: string;
  isRecurring: boolean;
  /** YYYY-MM-DD */
  date: string;
  isInstallment: boolean;
  installments: number;
};
