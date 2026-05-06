import type { Category, Person, Transaction } from "@/lib/types";
import { TransactionRow } from "./TransactionRow";

interface TransactionsListProps {
  transactions: Transaction[];
  categories: Category[];
  people: Person[];
  isOutlier: (t: Transaction) => boolean;
  isSelectionMode: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
  onEdit: (t: Transaction) => void;
  onMarkAsHappened: (id: number) => void;
  onDeleteRequest: (t: Transaction) => void;
  isResolvingDeleteGroupId: number | null;
  searchQuery: string;
  typeFilter: string;
  paidByFilter: string;
  categoryFilterSize: number;
  creditCardFilter: string;
  isTransactionDateInSelectedMonth: (date: string) => boolean;
}

export function TransactionsList({
  transactions,
  categories,
  people,
  isOutlier,
  isSelectionMode,
  selectedIds,
  onToggleSelection,
  onEdit,
  onMarkAsHappened,
  onDeleteRequest,
  isResolvingDeleteGroupId,
  searchQuery,
  typeFilter,
  paidByFilter,
  categoryFilterSize,
  creditCardFilter,
  isTransactionDateInSelectedMonth,
}: TransactionsListProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-muted">
        {searchQuery.trim() ? (
          <>
            Nenhum lançamento encontrado para &quot;{searchQuery}&quot;
            {typeFilter !== "all" ||
            paidByFilter !== "all" ||
            categoryFilterSize > 0 ||
            creditCardFilter !== "all"
              ? " com os filtros selecionados"
              : ""}
            .
          </>
        ) : (
          <>
            Nenhum lançamento neste mês
            {typeFilter !== "all" && ` do tipo ${typeFilter === "income" ? "renda" : "despesa"}`}
            {paidByFilter !== "all" && " para este pagador"}
            {categoryFilterSize > 0 && " nas categorias selecionadas"}
            {creditCardFilter !== "all" &&
              ` ${creditCardFilter === "yes" ? "no cartão" : "fora do cartão"}`}
            .
          </>
        )}
      </div>
    );
  }

  return (
    <div className="divide-y divide-noir-border">
      {transactions.map((transaction) => (
        <TransactionRow
          key={transaction.id}
          transaction={transaction}
          category={categories.find((category) => category.id === transaction.categoryId)}
          person={people.find((person) => person.id === transaction.paidBy)}
          toPerson={people.find((person) => person.id === transaction.transferToPersonId)}
          isOutlier={isOutlier(transaction)}
          isSelectionMode={isSelectionMode}
          isSelected={selectedIds.has(transaction.id)}
          canSelect={true}
          displayNextBillingTag={
            transaction.isNextBilling && isTransactionDateInSelectedMonth(transaction.date)
          }
          onToggleSelection={() => onToggleSelection(transaction.id)}
          onEdit={() => onEdit(transaction)}
          onMarkAsHappened={
            transaction.isForecast ? () => onMarkAsHappened(transaction.id) : undefined
          }
          onDelete={() => onDeleteRequest(transaction)}
          isDeletePending={isResolvingDeleteGroupId === transaction.id}
        />
      ))}
    </div>
  );
}
