import React from "react";
import { TransactionTag, type TransactionTagVariant } from "../TransactionTag/TransactionTag";
import styles from "./TransactionRow.module.css";

export interface TransactionRowProps {
  avatar: string;
  description: string;
  category: string;
  date: string;
  amount: number;
  transactionType: "expense" | "income";
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
  const signedAmount = transactionType === "income" ? amount : -amount;
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
          className={styles.amount}
          style={{
            color:
              transactionType === "income" ? "var(--status-positive)" : "var(--status-negative)",
          }}
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
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <title>Confirmar</title>
                <circle cx="7" cy="7" r="6.5" stroke="currentColor" strokeWidth="1.2" />
                <polyline
                  points="4,7.5 6.2,9.5 10,5"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          )}
          {onEdit && (
            <button type="button" className={styles.actionBtn} onClick={onEdit} aria-label="Editar">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <title>Editar</title>
                <path
                  d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              className={styles.actionBtn}
              onClick={onDelete}
              aria-label="Excluir"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <title>Excluir</title>
                <path
                  d="M2.5 4H11.5M5 4V2.5H9V4M5.5 6.5V10.5M8.5 6.5V10.5M3.5 4L4 11.5H10L10.5 4"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
