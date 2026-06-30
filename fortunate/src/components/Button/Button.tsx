import React from "react";
import clsx from "clsx";
import styles from "./Button.module.css";

export type ButtonVariant = "action" | "glass" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const sizeMap: Record<ButtonSize, string> = {
  sm: styles.sm,
  md: styles.md,
  lg: styles.lg,
};

const variantMap: Record<ButtonVariant, string> = {
  action: styles.action,
  glass: styles.glass,
  outline: styles.outline,
};

export function Button({
  variant = "action",
  size = "md",
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button className={clsx(styles.btn, variantMap[variant], sizeMap[size], className)} {...props}>
      {children}
    </button>
  );
}
