"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

import type { Alert, AlertType } from "@/components/dashboard/hooks/useDashboardAlerts";

// ============================================================================
// Types
// ============================================================================

type AlertsPanelProps = {
  alerts: Alert[];
};

// ============================================================================
// Constants
// ============================================================================

const ALERT_CONFIG: Record<
  AlertType,
  {
    icon: typeof AlertCircle;
    bgColor: string;
    textColor: string;
    borderColor: string;
    emoji: string;
  }
> = {
  critical: {
    icon: AlertCircle,
    bgColor: "bg-accent-negative/10",
    textColor: "text-accent-negative",
    borderColor: "border-accent-negative/30",
    emoji: "🔴",
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-accent-warning/10",
    textColor: "text-accent-warning",
    borderColor: "border-accent-warning/30",
    emoji: "🟡",
  },
  info: {
    icon: Info,
    bgColor: "bg-accent-primary/10",
    textColor: "text-accent-primary",
    borderColor: "border-accent-primary/30",
    emoji: "⚪",
  },
  success: {
    icon: CheckCircle2,
    bgColor: "bg-accent-positive/10",
    textColor: "text-accent-positive",
    borderColor: "border-accent-positive/30",
    emoji: "✅",
  },
};

// ============================================================================
// Components
// ============================================================================

function AlertItem({ alert }: { alert: Alert }) {
  const config = ALERT_CONFIG[alert.type];

  return (
    <div className="flex items-start gap-3 py-2">
      <span className="text-base leading-none mt-0.5">{config.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.textColor}`}>{alert.title}</p>
        {alert.description && (
          <p className="text-xs text-muted mt-0.5 truncate">{alert.description}</p>
        )}
      </div>
    </div>
  );
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return null;
  }

  // Group alerts by type for visual organization
  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const warningAlerts = alerts.filter((a) => a.type === "warning");
  const infoAlerts = alerts.filter((a) => a.type === "info");
  const successAlerts = alerts.filter((a) => a.type === "success");

  // Determine panel border color based on most severe alert
  const panelBorderClass =
    criticalAlerts.length > 0
      ? "border-accent-negative/30"
      : warningAlerts.length > 0
        ? "border-accent-warning/30"
        : successAlerts.length > 0
          ? "border-accent-positive/30"
          : "border-accent-primary/30";

  // Determine panel background color
  const panelBgClass =
    criticalAlerts.length > 0
      ? "bg-accent-negative/5"
      : warningAlerts.length > 0
        ? "bg-accent-warning/5"
        : successAlerts.length > 0
          ? "bg-accent-positive/5"
          : "bg-accent-primary/5";

  return (
    <div className={`noir-card p-4 border ${panelBorderClass} ${panelBgClass}`}>
      <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
        Atenção Necessária
      </h3>
      <div className="space-y-1 divide-y divide-noir-border">
        {/* Success alerts first (if any) */}
        {successAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}

        {/* Critical alerts */}
        {criticalAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}

        {/* Warning alerts */}
        {warningAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}

        {/* Info alerts */}
        {infoAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
