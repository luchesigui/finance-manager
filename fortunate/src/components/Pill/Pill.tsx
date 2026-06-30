import React from "react";
import clsx from "clsx";
import styles from "./Pill.module.css";

export interface PillProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  bg?: string;
  style?: React.CSSProperties & {
    "--pill-bg"?: string;
    "--pill-color"?: string;
    "--pill-border"?: string;
  };
  className?: string;
}

export function Pill({ icon, children, bg, style, className }: PillProps) {
  const customStyle = {
    ...style,
    ...(bg ? { "--pill-bg": bg } : {}),
  } as React.CSSProperties;

  return (
    <span className={clsx(styles.pill, className)} style={customStyle}>
      {icon && (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}
