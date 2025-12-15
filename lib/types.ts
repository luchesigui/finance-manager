export type Person = {
  id: string;
  name: string;
  income: number;
  color: string;
};

export type Category = {
  id: string;
  name: string;
  targetPercent: number;
  color: string;
};

export type Transaction = {
  id: number;
  description: string;
  amount: number;
  categoryId: string;
  paidBy: string;
  isRecurring: boolean;
  /** YYYY-MM-DD */
  date: string;
};

export type NewTransactionFormState = {
  description: string;
  amount: string;
  categoryId: string;
  paidBy: string;
  isRecurring: boolean;
  /** YYYY-MM-DD */
  date: string;
  isInstallment: boolean;
  installments: number;
};
