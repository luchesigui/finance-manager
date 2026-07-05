import clsx from "clsx";
import type React from "react";
import styles from "./GlassCard.module.css";

export type GlassVariant = "fino" | "denso";
export type CardRadius = "panel" | "card";

export interface GlassCardProps {
  variant?: GlassVariant;
  radius?: CardRadius;
  hover?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GlassCard({
  variant = "fino",
  radius = "panel",
  hover = true,
  children,
  className,
  style,
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        styles.card,
        styles[variant],
        styles[`r-${radius}`],
        { [styles.hoverable]: hover },
        className,
      )}
      style={style}
    >
      {children}
    </div>
  );
}
