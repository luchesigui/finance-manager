import type React from "react";
import { Pill } from "../Pill/Pill";

export type Trend = "up" | "down" | "neutral";

export interface TrendBadgeProps {
  trend: Trend;
  children: React.ReactNode;
  className?: string;
}

const trendIcon: Record<Trend, React.ReactNode> = {
  up: (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden
      style={{ color: "var(--status-positive)" }}
    >
      <polygon points="4,0 8,8 0,8" fill="currentColor" />
    </svg>
  ),
  down: (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden
      style={{ color: "var(--status-negative)" }}
    >
      <polygon points="0,0 8,0 4,8" fill="currentColor" />
    </svg>
  ),
  neutral: (
    <span
      aria-hidden
      style={{
        color: "var(--c-content-muted)",
        fontSize: "0.9rem",
        fontWeight: 700,
        lineHeight: 1,
      }}
    >
      —
    </span>
  ),
};

const BG = "color-mix(in srgb, var(--c-glass) 30%, transparent)";

export function TrendBadge({ trend, children, className }: TrendBadgeProps) {
  return (
    <Pill icon={trendIcon[trend]} bg={BG} className={className}>
      {children}
    </Pill>
  );
}
