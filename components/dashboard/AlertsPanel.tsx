"use client";

import { AlertCircle, AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";

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
    textColor: string;
    emoji: string;
  }
> = {
  critical: {
    icon: AlertCircle,
    textColor: "text-accent-negative",
    emoji: "🔴",
  },
  warning: {
    icon: AlertTriangle,
    textColor: "text-accent-warning",
    emoji: "🟡",
  },
  info: {
    icon: Info,
    textColor: "text-accent-primary",
    emoji: "⚪",
  },
  success: {
    icon: CheckCircle2,
    textColor: "text-accent-positive",
    emoji: "✅",
  },
};

// ============================================================================
// Components
// ============================================================================

function AlertItem({ alert }: { alert: Alert }) {
  const config = ALERT_CONFIG[alert.type];

  return (
    <div className="flex items-start gap-3 py-3">
      <span className="text-base leading-none mt-0.5">{config.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${config.textColor}`}>{alert.title}</p>
        {alert.description && <p className="text-xs text-muted mt-0.5">{alert.description}</p>}
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

  return (
    <div className="noir-card overflow-hidden">
      <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center gap-2">
        <Bell size={18} className="text-accent-primary" />
        <h2 className="font-semibold text-heading">Atenção Necessária</h2>
        <span className="ml-auto text-xs text-muted">{alerts.length} alertas</span>
      </div>

      <div className="p-4 divide-y divide-noir-border">
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
