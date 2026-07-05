import clsx from "clsx";
import React from "react";
import { ArrowRight, Check } from "../Icons";
import styles from "./TransferCard.module.css";

export interface TransferPerson {
  name: string;
  initial: string;
}

export type TransferStatus = "pending" | "done";

export interface TransferCardProps {
  from?: TransferPerson;
  to?: TransferPerson;
  amount?: number;
  status?: TransferStatus;
  onMarkDone?: () => void;
  empty?: boolean;
}

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export function TransferCard({
  from,
  to,
  amount,
  status = "pending",
  onMarkDone,
  empty,
}: TransferCardProps) {
  if (empty) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>
          <Check width="15" height="15" />
        </span>
        <span className={styles.emptyText}>Nenhuma transferência este mês</span>
      </div>
    );
  }

  const isDone = status === "done";

  return (
    <div className={clsx(styles.card, { [styles.cardDone]: isDone })}>
      {/* Left: avatar stack + label */}
      <div className={styles.left}>
        <div className={styles.avatarStack}>
          {/* From avatar */}
          <span className={styles.avatar}>{from?.initial}</span>
          {/* Arrow circle */}
          <span className={styles.arrowCircle}>
            <ArrowRight width="14" height="14" />
          </span>
          {/* To avatar */}
          <span className={clsx(styles.avatar, styles.avatarTo)}>{to?.initial}</span>
        </div>
        <span className={styles.label}>
          {from?.name} transfere para {to?.name}
        </span>
      </div>

      {/* Amount */}
      <span className={clsx(styles.amount, { [styles.amountDone]: isDone })}>{brl(amount!)}</span>

      {/* CTA */}
      <button
        className={clsx(styles.cta, { [styles.ctaDone]: isDone })}
        onClick={onMarkDone}
        disabled={isDone}
        aria-label={isDone ? "Transferência concluída" : "Marcar como transferido"}
      >
        <Check width="15" height="15" />
      </button>
    </div>
  );
}
