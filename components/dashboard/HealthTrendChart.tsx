"use client";

import { Activity, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================================
// Types
// ============================================================================

export type HealthTrendDataPoint = {
  month: string;
  monthLabel: string;
  score: number;
  isProjected: boolean;
  isCurrent: boolean;
};

type HealthTrendChartProps = {
  data: HealthTrendDataPoint[];
  currentScore: number;
  isLoading?: boolean;
};

// ============================================================================
// Custom Tooltip
// ============================================================================

type TooltipPayload = {
  value: number;
  dataKey: string;
  color: string;
  name: string;
  payload: HealthTrendDataPoint;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
};

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dataPoint = payload[0].payload;
  const score = Math.round(dataPoint.score);

  const getScoreStatus = (s: number) => {
    if (s >= 80) return { label: "Saudável", color: "text-accent-positive" };
    if (s >= 50) return { label: "Atenção", color: "text-accent-warning" };
    return { label: "Crítico", color: "text-accent-negative" };
  };

  const status = getScoreStatus(score);

  return (
    <div className="bg-noir-surface border border-noir-border rounded-card p-3 shadow-lg">
      <p className="text-heading font-semibold mb-1">{dataPoint.monthLabel}</p>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-heading tabular-nums">{score}</span>
        <span className={`text-xs font-medium ${status.color}`}>
          {status.label}
          {dataPoint.isProjected && " (projeção)"}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

export function HealthTrendChart({ data, currentScore, isLoading }: HealthTrendChartProps) {
  // Calculate insights from actual data (not projected)
  const insights = useMemo(() => {
    const actualData = data.filter((d) => !d.isProjected);

    if (actualData.length === 0) {
      return {
        avgScore: currentScore,
        trend: "stable" as const,
        trendDelta: 0,
      };
    }

    const avgScore = actualData.reduce((sum, d) => sum + d.score, 0) / actualData.length;

    // Calculate trend: compare first half to second half
    let trend: "improving" | "declining" | "stable" = "stable";
    let trendDelta = 0;

    if (actualData.length >= 2) {
      const firstScore = actualData[0].score;
      const lastScore = actualData[actualData.length - 1].score;
      trendDelta = lastScore - firstScore;

      if (trendDelta > 5) {
        trend = "improving";
      } else if (trendDelta < -5) {
        trend = "declining";
      }
    }

    return { avgScore, trend, trendDelta };
  }, [data, currentScore]);

  if (isLoading) {
    return (
      <div className="noir-card overflow-hidden">
        <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center gap-2">
          <Activity size={18} className="text-accent-primary" />
          <h2 className="font-semibold text-heading">Tendência de Saúde Financeira</h2>
        </div>
        <div className="p-8 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-[200px] w-full bg-noir-active rounded" />
            <span className="text-sm text-muted">Carregando dados...</span>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="noir-card overflow-hidden">
        <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center gap-2">
          <Activity size={18} className="text-accent-primary" />
          <h2 className="font-semibold text-heading">Tendência de Saúde Financeira</h2>
        </div>
        <div className="p-8 text-center text-muted">Dados históricos não disponíveis</div>
      </div>
    );
  }

  // Find the index where projection starts
  const projectionStartIndex = data.findIndex((d) => d.isProjected);

  return (
    <div className="noir-card overflow-hidden">
      <div className="p-4 border-b border-noir-border bg-noir-active/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-accent-primary" />
          <h2 className="font-semibold text-heading">Tendência de Saúde Financeira</h2>
        </div>
        <div className="flex items-center gap-2">
          {insights.trend === "improving" ? (
            <TrendingUp size={16} className="text-accent-positive" />
          ) : insights.trend === "declining" ? (
            <TrendingDown size={16} className="text-accent-negative" />
          ) : null}
          <span
            className={`text-xs font-medium ${
              insights.trend === "improving"
                ? "text-accent-positive"
                : insights.trend === "declining"
                  ? "text-accent-negative"
                  : "text-muted"
            }`}
          >
            {insights.trend === "improving"
              ? `+${Math.round(insights.trendDelta)} pts`
              : insights.trend === "declining"
                ? `${Math.round(insights.trendDelta)} pts`
                : "Estável"}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Chart */}
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                tickLine={{ stroke: "rgba(255,255,255,0.1)" }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Reference lines for health zones */}
              <ReferenceLine y={80} stroke="#22C55E" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={50} stroke="#F97316" strokeDasharray="3 3" strokeOpacity={0.5} />

              <Legend
                wrapperStyle={{ paddingTop: "10px" }}
                formatter={(value) => <span className="text-body text-xs">{value}</span>}
              />

              {/* Actual score area */}
              <Area
                type="monotone"
                dataKey="score"
                name="Score"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorScore)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.isProjected) {
                    return (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill="#94A3B8"
                        stroke="#94A3B8"
                        strokeWidth={2}
                        strokeDasharray="2 2"
                      />
                    );
                  }
                  if (payload.isCurrent) {
                    return (
                      <circle cx={cx} cy={cy} r={6} fill="#3B82F6" stroke="#fff" strokeWidth={2} />
                    );
                  }
                  return <circle cx={cx} cy={cy} r={4} fill="#3B82F6" />;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-4 pt-4 border-t border-noir-border flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted">Atual: </span>
            <span
              className={`font-bold tabular-nums ${
                currentScore >= 80
                  ? "text-accent-positive"
                  : currentScore >= 50
                    ? "text-accent-warning"
                    : "text-accent-negative"
              }`}
            >
              {Math.round(currentScore)} pts
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted ml-auto">
            <span className="inline-block w-3 h-0.5 bg-accent-positive" /> Saudável (80+)
            <span className="inline-block w-3 h-0.5 bg-accent-warning ml-2" /> Atenção (50-79)
          </div>
        </div>
      </div>
    </div>
  );
}
