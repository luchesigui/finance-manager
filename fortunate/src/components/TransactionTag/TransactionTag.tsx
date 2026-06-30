import React from "react";
import clsx from "clsx";
import { Pill } from "../Pill/Pill";
import styles from "./TransactionTag.module.css";

export type TransactionTagVariant =
  | "previsao"
  | "fora-do-padrao"
  | "cartao"
  | "proxima-fatura"
  | "recorrente"
  | "parcelado";

export interface TransactionTagProps {
  variant: TransactionTagVariant;
  label?: string;
  className?: string;
}

type TagConfig = {
  defaultLabel: string;
  icon: React.ReactNode;
};

const tagConfig: Record<TransactionTagVariant, TagConfig> = {
  previsao: {
    defaultLabel: "Previsão",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.1" />
        <circle cx="6" cy="5.5" r="4.5" fill="currentColor" opacity={0.1} />
        <circle cx="4.2" cy="3.8" r="1.1" fill="currentColor" opacity={0.5} />
        <path d="M4 10.5 L8 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M6 10 L6 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  "fora-do-padrao": {
    defaultLabel: "Fora do padrão",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M6 1.5L10.5 10.5H1.5L6 1.5Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <line
          x1="6"
          y1="5"
          x2="6"
          y2="7.5"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="6" cy="9.5" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  cartao: {
    defaultLabel: "Cartão",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect
          x="1"
          y="2.5"
          width="10"
          height="7"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line x1="1" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.1" />
        <rect x="2.5" y="6.5" width="3" height="1.5" rx="0.4" fill="currentColor" opacity={0.6} />
      </svg>
    ),
  },
  "proxima-fatura": {
    defaultLabel: "Próxima Fatura",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <rect
          x="1.5"
          y="2"
          width="9"
          height="8.5"
          rx="1.2"
          stroke="currentColor"
          strokeWidth="1.1"
        />
        <line x1="1.5" y1="5" x2="10.5" y2="5" stroke="currentColor" strokeWidth="1" />
        <line
          x1="4"
          y1="0.5"
          x2="4"
          y2="3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <line
          x1="8"
          y1="0.5"
          x2="8"
          y2="3"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="4" cy="7.5" r="0.8" fill="currentColor" />
        <circle cx="6" cy="7.5" r="0.8" fill="currentColor" />
        <circle cx="8" cy="7.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  recorrente: {
    defaultLabel: "Recorrente",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2.5 4.5C3.2 2.8 5 1.75 7 2C8.8 2.2 10 3.5 10.25 5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M9.5 2.5L10.25 5L7.5 4.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.5 7.5C8.8 9.2 7 10.25 5 10C3.2 9.8 2 8.5 1.75 7"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M2.5 9.5L1.75 7L4.5 7.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  parcelado: {
    defaultLabel: "Parcelado",
    icon: (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M1.5 4L6 2L10.5 4L6 6L1.5 4Z"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M1.5 6.5L6 8.5L10.5 6.5"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.5 9L6 11L10.5 9"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
};

export function TransactionTag({ variant, label, className }: TransactionTagProps) {
  const config = tagConfig[variant];
  return (
    <Pill icon={config.icon} className={clsx(styles.tag, styles[variant], className)}>
      {label ?? config.defaultLabel}
    </Pill>
  );
}
