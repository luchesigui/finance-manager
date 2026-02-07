"use client";

import type { ChartDataPoint } from "@/features/simulation/types";
import { formatCurrency } from "@/lib/format";
import { Activity } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================================
// Types
// ============================================================================

type FutureProjectionChartProps = {
  data: ChartDataPoint[];
  emergencyFund: number;
  isLoading?: boolean;
};

// ============================================================================
// Custom Tooltip
// ============================================================================

type TooltipPayloadItem = {
  value: number;
  dataKey: string;
  color: string;
  name: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  showFreedom: boolean;
  hasEmergencyFund: boolean;
};

function CustomTooltip({
  active,
  payload,
  label,
  showFreedom,
  hasEmergencyFund,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const freedomItem = payload.find((p) => p.dataKey === "cumulativeFreedom");
  const deficitItem = payload.find((p) => p.dataKey === "cumulativeDeficit");
  const emergencyItem = payload.find((p) => p.dataKey === "emergencyFundRemaining");

  return (
    <div className="bg-noir-surface border border-noir-border rounded-card p-3 shadow-lg min-w-[200px]">
      <p className="text-heading font-semibold mb-2 border-b border-noir-border pb-2">{label}</p>
      <div className="space-y-1.5 text-sm">
        {showFreedom && freedomItem && freedomItem.value > 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-accent-spending">Liberdade Financeira:</span>
            <span className="text-heading tabular-nums">{formatCurrency(freedomItem.value)}</span>
          </div>
        )}
        {!showFreedom && deficitItem && deficitItem.value < 0 && (
          <div className="flex justify-between gap-4">
            <span className="text-accent-negative">Prejuízo Acumulado:</span>
            <span className="text-heading tabular-nums">{formatCurrency(deficitItem.value)}</span>
          </div>
        )}
        {hasEmergencyFund && emergencyItem && (
          <div className="flex justify-between gap-4">
            <span className="text-accent-primary">Reserva Restante:</span>
            <span className="text-heading tabular-nums">{formatCurrency(emergencyItem.value)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Legend Component
// ============================================================================

type ChartLegendProps = {
  showFreedom: boolean;
  hasEmergencyFund: boolean;
};

function ChartLegend({ showFreedom, hasEmergencyFund }: ChartLegendProps) {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4 text-sm">
      {showFreedom ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-spending/40 rounded" />
          <span className="text-body">Liberdade Financeira (acumulado)</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-accent-negative/50 rounded bg-stripes" />
          <span className="text-body">Prejuízo (acumulado)</span>
        </div>
      )}
      {hasEmergencyFund && !showFreedom && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 bg-accent-primary rounded" />
          <span className="text-body">Reserva de Emergência</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function FutureProjectionChart({
  data,
  emergencyFund,
  isLoading,
}: FutureProjectionChartProps) {
  const showFreedom = useMemo(() => {
    if (data.length === 0) return true;
    const lastPoint = data[data.length - 1];
    return lastPoint.cumulativeFreedom > 0 || lastPoint.cumulativeDeficit === 0;
  }, [data]);

  const hasEmergencyFund = emergencyFund > 0;

  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 10000];

    let min = 0;
    let max = 0;

    for (const point of data) {
      if (showFreedom) {
        max = Math.max(max, point.cumulativeFreedom);
      } else {
        min = Math.min(min, point.cumulativeDeficit);
        if (hasEmergencyFund) {
          max = Math.max(max, emergencyFund);
        }
      }
    }

    const range = max - min;
    const padding = range * 0.1 || 1000;
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [data, showFreedom, hasEmergencyFund, emergencyFund]);

  // Theme-aware chart colors
  const chartColors = {
    grid: "var(--chart-grid)",
    axis: "var(--chart-axis)",
    text: "rgb(var(--chart-text))",
    primary: "rgb(var(--accent-primary))",
    spending: "rgb(var(--accent-spending))",
    negative: "rgb(var(--accent-negative))",
    muted: "rgb(var(--text-muted))",
  };

  const headerContent = (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
        <Activity size={20} className="text-accent-primary" />
        Projeção 12 Meses
      </h2>
    </div>
  );

  if (isLoading) {
    return (
      <div className="noir-card p-card-padding">
        {headerContent}
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2 text-muted">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Calculando projeção...</span>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="noir-card p-card-padding">
        {headerContent}
        <div className="py-8 text-center text-muted">Dados insuficientes para projeção</div>
      </div>
    );
  }

  const currentMonth = data[0]?.period || "Hoje";

  return (
    <div className="noir-card p-card-padding">
      {headerContent}
      <div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="freedomGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColors.spending} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColors.spending} stopOpacity={0.1} />
                </linearGradient>
                <pattern id="deficitPattern" patternUnits="userSpaceOnUse" width="4" height="4">
                  <path
                    d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"
                    stroke={chartColors.negative}
                    strokeWidth="1"
                    strokeOpacity="0.5"
                  />
                </pattern>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />

              <XAxis
                dataKey="period"
                tick={{ fill: chartColors.text, fontSize: 11 }}
                tickLine={{ stroke: chartColors.axis }}
                axisLine={{ stroke: chartColors.axis }}
              />

              <YAxis
                domain={yDomain}
                tick={{ fill: chartColors.text, fontSize: 11 }}
                tickLine={{ stroke: chartColors.axis }}
                axisLine={{ stroke: chartColors.axis }}
                tickFormatter={(value) => {
                  if (Math.abs(value) >= 1000) {
                    return `${(value / 1000).toFixed(0)}k`;
                  }
                  return value.toString();
                }}
              />

              <Tooltip
                content={
                  <CustomTooltip
                    showFreedom={showFreedom}
                    hasEmergencyFund={hasEmergencyFund && !showFreedom}
                  />
                }
              />

              <ReferenceLine
                y={0}
                stroke={chartColors.muted}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />

              <ReferenceLine
                x={currentMonth}
                stroke={chartColors.muted}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
                label={{ value: "Hoje", fill: chartColors.text, fontSize: 10, position: "top" }}
              />

              {showFreedom && (
                <Area
                  type="monotone"
                  dataKey="cumulativeFreedom"
                  name="Liberdade Financeira"
                  stroke={chartColors.spending}
                  strokeWidth={2}
                  fill="url(#freedomGradient)"
                />
              )}

              {!showFreedom && (
                <Area
                  type="monotone"
                  dataKey="cumulativeDeficit"
                  name="Prejuízo Acumulado"
                  stroke={chartColors.negative}
                  strokeWidth={2}
                  fill="url(#deficitPattern)"
                  fillOpacity={0.5}
                />
              )}

              {!showFreedom && hasEmergencyFund && (
                <Line
                  type="monotone"
                  dataKey="emergencyFundRemaining"
                  name="Reserva de Emergência"
                  stroke={chartColors.primary}
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <ChartLegend
          showFreedom={showFreedom}
          hasEmergencyFund={hasEmergencyFund && !showFreedom}
        />
      </div>
    </div>
  );
}
