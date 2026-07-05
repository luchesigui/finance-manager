import clsx from "clsx";
import React from "react";
import { CheckCircle, Pencil, Trash } from "../Icons";
import { TransactionTag, type TransactionTagVariant } from "../TransactionTag/TransactionTag";
import styles from "./TransactionRow.module.css";

export interface TransactionRowProps {
  avatar: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  transactionType: "expense" | "income" | "transfer";
  pills?: TransactionTagVariant[];
  onConfirm?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TransactionRow({
  avatar,
  description,
  category,
  date,
  amount,
  transactionType,
  pills,
  onConfirm,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const signedAmount =
    transactionType === "income" || transactionType === "transfer" ? amount : -amount;
  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(signedAmount);

  const showConfirm = onConfirm && transactionType === "expense" && pills?.includes("previsao");

  return (
    <div className={styles.row}>
      <div className={styles.avatar}>{avatar}</div>
      <div className={styles.body}>
        <span className={styles.description}>{description}</span>
        <div className={styles.meta}>
          <span>{category}</span>
          <span>•</span>
          <span>{date}</span>
          {pills?.map((variant) => (
            <TransactionTag key={variant} variant={variant} />
          ))}
        </div>
      </div>
      <div className={styles.right}>
        <span
          className={clsx(styles.amount, {
            [styles.income]: transactionType === "income",
            [styles.expense]: transactionType === "expense",
            [styles.transfer]: transactionType === "transfer",
          })}
        >
          {formattedAmount}
        </span>
        <div className={styles.actions}>
          {showConfirm && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={onConfirm}
              aria-label="Confirmar"
            >
              <CheckCircle />
            </button>
          )}
          {onEdit && (
            <button type="button" className={styles.actionBtn} onClick={onEdit} aria-label="Editar">
              <Pencil />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={onDelete}
              aria-label="Excluir"
            >
              <Trash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
