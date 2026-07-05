import clsx from "clsx";
import React from "react";
import styles from "./PilarCard.module.css";

export type PilarKey =
  | "essenciais"
  | "conforto"
  | "prazeres"
  | "conhecimento"
  | "metas"
  | "liberdade";

const pilarConfig: Record<PilarKey, { label: string; cssVar: string }> = {
  essenciais: { label: "Gastos Essenciais", cssVar: "var(--pilar-essenciais)" },
  conforto: { label: "Conforto", cssVar: "var(--pilar-conforto)" },
  prazeres: { label: "Prazeres", cssVar: "var(--pilar-prazeres)" },
  conhecimento: { label: "Conhecimento", cssVar: "var(--pilar-conhecimento)" },
  metas: { label: "Metas", cssVar: "var(--pilar-metas)" },
  liberdade: { label: "Liberdade Financeira", cssVar: "var(--pilar-liberdade)" },
};

const brl = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

export interface PilarCardProps {
  pilar: PilarKey;
  mode?: "display" | "config";
  /** Display mode: valor monetário gasto */
  usedValue?: number;
  /** Display mode: meta monetária */
  targetValue?: number;
  /** Config mode: percentual planejado (0–100) */
  percentTarget?: number;
  /** Config mode: callback ao alterar percentual */
  onPercentChange?: (value: number) => void;
}

export function PilarCard({
  pilar,
  mode = "display",
  usedValue = 0,
  targetValue = 0,
  percentTarget = 0,
  onPercentChange,
}: PilarCardProps) {
  const config = pilarConfig[pilar];

  /* ── Config mode ── */
  if (mode === "config") {
    const barWidth = Math.min(100, Math.max(0, percentTarget));
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.pilarInfo}>
            <span className={styles.dot} style={{ background: config.cssVar }} />
            <span className={styles.label}>{config.label}</span>
          </div>
          <div className={styles.configPercent}>
            <input
              type="number"
              min={0}
              max={100}
              value={percentTarget}
              onChange={(e) => {
                const val = Math.max(0, Math.min(100, Number.parseInt(e.target.value, 10) || 0));
                onPercentChange?.(val);
              }}
              className={styles.percentInput}
            />
            <span className={styles.percentSymbol}>%</span>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${barWidth}%`, background: config.cssVar }}
          />
        </div>
      </div>
    );
  }

  /* ── Display mode ── */
  const progress = targetValue > 0 ? Math.round((usedValue / targetValue) * 100) : 0;
  const isOverflow = progress > 100;
  const barWidth = isOverflow ? 100 : Math.max(0, progress);
  const accentColor = isOverflow ? "var(--status-negative)" : config.cssVar;

  return (
    <div className={clsx(styles.card, { [styles.cardOverflow]: isOverflow })}>
      <div className={styles.header}>
        <div className={styles.pilarInfo}>
          <span className={styles.dot} style={{ background: accentColor }} />
          <span className={styles.label}>{config.label}</span>
        </div>
        <span className={clsx(styles.percent, { [styles.percentOverflow]: isOverflow })}>
          {progress}%
        </span>
      </div>

      <div className={styles.progressBar}>
        <div
          className={clsx(styles.progressFill, { [styles.progressFillOverflow]: isOverflow })}
          style={{ width: `${barWidth}%`, background: accentColor }}
        />
      </div>

      <div className={styles.footer}>
        <span className={clsx(styles.spent, { [styles.spentOverflow]: isOverflow })}>
          {brl(usedValue)}
        </span>
        <span className={styles.target}>meta {brl(targetValue)}</span>
      </div>
    </div>
  );
}
