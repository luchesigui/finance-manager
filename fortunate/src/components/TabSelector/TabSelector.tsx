import React from "react";
import clsx from "clsx";
import styles from "./TabSelector.module.css";

export interface TabItem {
  label: string;
  color?: string; // accent color for the underline when this tab is active; defaults to var(--c-action)
}

export interface TabSelectorProps {
  tabs: TabItem[];
  value: number; // active tab index (controlled)
  onChange: (index: number) => void;
}

export function TabSelector({ tabs, value, onChange }: TabSelectorProps) {
  return (
    <div className={styles.container}>
      {tabs.map((tab, i) => {
        const isActive = i === value;
        const accent = tab.color ?? "var(--c-action)";
        return (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={clsx(styles.tab, { [styles.active]: isActive })}
            style={isActive ? ({ "--tab-accent": accent } as React.CSSProperties) : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
