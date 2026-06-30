import React from "react";
import clsx from "clsx";
import styles from "./StackedCards.module.css";

export interface WalletCard {
  label: string;
  value: string;
  meta: string;
}

export interface StackedCardsProps {
  cards: WalletCard[];
}

export function StackedCards({ cards }: StackedCardsProps) {
  const visible = cards.slice(0, 3);

  return (
    <div className={styles.container}>
      {visible
        .slice()
        .reverse()
        .map((card, i) => {
          const position = visible.length - 1 - i;
          return (
            <div
              key={i}
              className={clsx(styles.card, styles[`card${position + 1}` as keyof typeof styles])}
            >
              <div className={styles.inner}>
                <span className={styles.label}>{card.label}</span>
                <span className={styles.value}>{card.value}</span>
                <span className={styles.meta}>{card.meta}</span>
              </div>
            </div>
          );
        })}
    </div>
  );
}
