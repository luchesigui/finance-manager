"use client";

import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Alert, AlertType } from "@/features/dashboard/hooks/useDashboardAlerts";

// ============================================================================
// Types
// ============================================================================

type AlertsPanelProps = {
  alerts: Alert[];
};

// ============================================================================
// Constants
// ============================================================================

const ALERTS_COLLAPSED_KEY = "dashboard_alerts_collapsed";

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
// Hooks
// ============================================================================

function useCollapsedState(): [boolean, (collapsed: boolean) => void] {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ALERTS_COLLAPSED_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Persist to localStorage when changed
  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(ALERTS_COLLAPSED_KEY, String(collapsed));
    } catch {
      // localStorage not available
    }
  };

  return [isCollapsed, setCollapsed];
}

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
  const [isCollapsed, setCollapsed] = useCollapsedState();

  if (alerts.length === 0) {
    return null;
  }

  // Group alerts by type for visual organization
  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const warningAlerts = alerts.filter((a) => a.type === "warning");
  const infoAlerts = alerts.filter((a) => a.type === "info");
  const successAlerts = alerts.filter((a) => a.type === "success");

  // Determine badge color based on most severe alert
  const badgeVariant: "negative" | "warning" | "positive" | "secondary" =
    criticalAlerts.length > 0
      ? "negative"
      : warningAlerts.length > 0
        ? "warning"
        : successAlerts.length > 0
          ? "positive"
          : "secondary";

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(!isCollapsed)}
        className="w-full p-card-padding flex items-center gap-2 hover:bg-noir-active/30 transition-colors"
      >
        <Bell size={20} className="text-accent-primary" />
        <h2 className="text-lg font-semibold text-heading">Atenção Necessária</h2>
        <Badge variant={badgeVariant} className="ml-2">
          {alerts.length}
        </Badge>
        <span className="ml-auto text-muted">
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </span>
      </button>

      {!isCollapsed && (
        <div className="px-card-padding pb-card-padding divide-y divide-noir-border animate-in slide-in-from-top-2 duration-200">
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
      )}
    </Card>
  );
}
