"use client";

import { Activity, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import type { HealthScoreResult, HealthStatus } from "@/components/dashboard/hooks/useHealthScore";

// ============================================================================
// Types
// ============================================================================

type HealthScoreProps = {
  healthScore: HealthScoreResult;
  isLoading?: boolean;
};

// ============================================================================
// Constants
// ============================================================================

const STATUS_CONFIG: Record<
  HealthStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    bgColor: string;
    textColor: string;
    progressColor: string;
    glowClass: string;
  }
> = {
  healthy: {
    label: "SAUDÁVEL",
    icon: CheckCircle2,
    bgColor: "bg-accent-positive/10",
    textColor: "text-accent-positive",
    progressColor: "bg-accent-positive",
    glowClass: "shadow-glow-positive",
  },
  warning: {
    label: "ATENÇÃO",
    icon: AlertTriangle,
    bgColor: "bg-accent-warning/10",
    textColor: "text-accent-warning",
    progressColor: "bg-accent-warning",
    glowClass: "shadow-glow-warning",
  },
  critical: {
    label: "CRÍTICO",
    icon: XCircle,
    bgColor: "bg-accent-negative/10",
    textColor: "text-accent-negative",
    progressColor: "bg-accent-negative",
    glowClass: "shadow-glow-negative",
  },
};

// ============================================================================
// Component
// ============================================================================

export function HealthScore({ healthScore, isLoading }: HealthScoreProps) {
  const { score, status, summary } = healthScore;
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;

  if (isLoading) {
    return (
      <div className="noir-card p-6 border-2 border-noir-border animate-pulse">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {/* Header skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-noir-active rounded" />
            <div>
              <div className="h-4 w-28 bg-noir-active rounded mb-2" />
              <div className="h-6 w-20 bg-noir-active rounded" />
            </div>
          </div>

          {/* Progress bar skeleton */}
          <div className="flex-1 md:px-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 h-4 bg-noir-active rounded-full" />
              <div className="h-8 w-16 bg-noir-active rounded" />
            </div>
          </div>
        </div>

        {/* Summary skeleton */}
        <div className="mt-4 pt-4">
          <div className="h-4 w-3/4 bg-noir-active rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`noir-card p-6 ${config.bgColor} border-2 ${
        status === "healthy"
          ? "border-accent-positive/30"
          : status === "warning"
            ? "border-accent-warning/30"
            : "border-accent-negative/30"
      } ${config.glowClass}`}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Header with icon and title */}
        <div className="flex items-center gap-3">
          <Activity size={28} className={config.textColor} />
          <div>
            <h2 className="text-sm font-medium text-body uppercase tracking-wide">
              Saúde Financeira
            </h2>
            <div className={`flex items-center gap-2 ${config.textColor}`}>
              <StatusIcon size={20} />
              <span className="text-lg font-bold">{config.label}</span>
            </div>
          </div>
        </div>

        {/* Progress bar and score */}
        <div className="flex-1 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-noir-active rounded-full overflow-hidden">
              <div
                className={`h-full ${config.progressColor} transition-all duration-500 ease-out`}
                style={{ width: `${score}%` }}
              />
            </div>
            <span className={`text-2xl font-bold tabular-nums ${config.textColor}`}>
              {score}
              <span className="text-base text-muted">/100</span>
            </span>
          </div>
        </div>
      </div>

      {/* Summary message */}
      <div className="mt-4 pt-4">
        <p className="text-body text-sm">{summary}</p>
      </div>
    </div>
  );
}
