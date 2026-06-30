import React from "react";
import styles from "./FloatingAssistant.module.css";

const suggestions = [
  "Gastei R$ 45 no almoço",
  "Qual meu saldo este mês?",
  "Estou dentro do limite?",
  "Adicionar receita de R$ 3.200",
];

export interface FloatingAssistantProps {
  placeholder?: string;
  promptSuggestions?: string[];
}

const SparkleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.sparkleIcon}
  >
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
  </svg>
);

export function FloatingAssistant({
  placeholder = "Pergunte ao Fortunate AI… (⌘K)",
  promptSuggestions = suggestions,
}: FloatingAssistantProps) {
  return (
    <div className={styles.container}>
      <div className={styles.pills}>
        {promptSuggestions.map((s) => (
          <button key={s} className={styles.pill}>
            {s}
          </button>
        ))}
      </div>
      <div className={styles.searchBar}>
        <SparkleIcon />
        <input className={styles.input} placeholder={placeholder} />
        <kbd className={styles.kbd}>⌘K</kbd>
      </div>
    </div>
  );
}
