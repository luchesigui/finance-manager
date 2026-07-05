import clsx from "clsx";
import type React from "react";
import { Pill } from "../Pill/Pill";
import styles from "./Badge.module.css";

export type BadgeVariant =
  | "pilar-essenciais"
  | "pilar-conforto"
  | "pilar-prazeres"
  | "pilar-conhecimento"
  | "pilar-metas"
  | "pilar-liberdade";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge({ variant = "pilar-metas", children, className, style }: BadgeProps) {
  return (
    <Pill
      icon={<span className={styles.dot} />}
      className={clsx(styles.badge, styles[variant], className)}
      style={style}
    >
      {children}
    </Pill>
  );
}
