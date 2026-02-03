"use client";

import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

// ============================================================================
// Types
// ============================================================================

export type MonthlyTrendData = {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  savingsTarget: number;
  freeBalance: number;
};

type MonthlyTrendChartProps = {
  data: MonthlyTrendData[];
  currentMonthIndex?: number;
};

// ============================================================================
// Custom Tooltip
// ============================================================================

type TooltipPayload = {
  value: number;
  dataKey: string;
  color: string;
  name: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-noir-surface border border-noir-border rounded-card p-3 shadow-lg">
      <p className="text-heading font-semibold mb-2 capitalize">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted">{entry.name}:</span>
            <span className="text-heading font-medium tabular-nums">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function MonthlyTrendChart({ data, currentMonthIndex }: MonthlyTrendChartProps) {
  // Calculate averages and insights
  const insights = useMemo(() => {
    if (data.length === 0) {
      return {
        avgExpenses: 0,
        avgIncome: 0,
        avgSavings: 0,
        trend: "stable" as const,
      };
    }

    const avgExpenses = data.reduce((sum, d) => sum + d.expenses, 0) / data.length;
    const avgIncome = data.reduce((sum, d) => sum + d.income, 0) / data.length;
    const avgSavings = data.reduce((sum, d) => sum + d.savings, 0) / data.length;

    // Determine trend based on last 3 months
    const recentData = data.slice(-3);
    let trend: "improving" | "declining" | "stable" = "stable";

    if (recentData.length >= 2) {
      const recentSavingsAvg =
        recentData.reduce((sum, d) => sum + d.savings, 0) / recentData.length;
      if (recentSavingsAvg > avgSavings * 1.1) {
        trend = "improving";
      } else if (recentSavingsAvg < avgSavings * 0.9) {
        trend = "declining";
      }
    }

    return { avgExpenses, avgIncome, avgSavings, trend };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="noir-card overflow-hidden">
        <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center gap-2">
          <TrendingUp size={18} className="text-accent-primary" />
          <h2 className="font-semibold text-heading">Tendência Liberdade Financeira</h2>
        </div>
        <div className="p-8 text-center text-muted">
          Dados históricos não disponíveis
        </div>
      </div>
    );
  }

  return (
    <div className="noir-card overflow-hidden">
      <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-accent-primary" />
          <h2 className="font-semibold text-heading">Tendência Liberdade Financeira</h2>
        </div>
        <span className="text-xs text-muted">Últimos {data.length} meses</span>
      </div>

      <div className="p-4">
        {/* Chart */}
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 12 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => <span className="text-body text-xs">{value}</span>}
              />
              <Area
                type="monotone"
                dataKey="savingsTarget"
                name="Meta"
                stroke="#22C55E"
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="url(#colorTarget)"
              />
              <Area
                type="monotone"
                dataKey="savings"
                name="Realizado"
                stroke="#FACC15"
                strokeWidth={2}
                fill="url(#colorSavings)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-4 pt-4 border-t border-noir-border flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted">Média: </span>
            <span className="text-heading font-medium tabular-nums">
              {formatCurrency(insights.avgSavings)}/mês
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted">Tendência: </span>
            <span
              className={`font-medium ${
                insights.trend === "improving"
                  ? "text-accent-positive"
                  : insights.trend === "declining"
                    ? "text-accent-negative"
                    : "text-body"
              }`}
            >
              {insights.trend === "improving"
                ? "Melhorando ↑"
                : insights.trend === "declining"
                  ? "Piorando ↓"
                  : "Estável →"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
