"use client";

import { formatCurrency, formatPercent } from "@/lib/format";
import type { SimulationSummary } from "@/lib/simulationTypes";
import { AlertCircle, Gem, TrendingUp, Wallet } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type SimulationSummaryCardsProps = {
  summary: SimulationSummary;
  baselineIncome: number;
  isLoading?: boolean;
};

type SummaryCardProps = {
  title: string;
  icon: typeof Wallet;
  mainValue: string;
  subValue?: string;
  indicator?: string;
  indicatorClass?: string;
  progressPercent?: number;
  progressColor?: string;
  glowClass?: string;
};

// ============================================================================
// Summary Card Component
// ============================================================================

function SummaryCard({
  title,
  icon: Icon,
  mainValue,
  subValue,
  indicator,
  indicatorClass = "text-muted",
  progressPercent,
  progressColor = "bg-accent-primary",
  glowClass,
}: SummaryCardProps) {
  return (
    <div className={`noir-card p-4 ${glowClass || ""}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={18} className="text-accent-primary" />
        <span className="text-xs font-medium text-muted uppercase tracking-wide">{title}</span>
      </div>
      <div className="mb-2">
        <span className="text-2xl font-bold text-heading tabular-nums">{mainValue}</span>
      </div>
      {subValue && <p className="text-sm text-muted mb-2">{subValue}</p>}
      {indicator && <div className={`text-sm font-medium ${indicatorClass}`}>{indicator}</div>}
      {progressPercent !== undefined && (
        <div className="mt-3">
          <div className="h-2 bg-noir-active rounded-full overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(Math.max(progressPercent, 0), 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted mt-1 block">{Math.round(progressPercent)}%</span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Skeleton Component
// ============================================================================

function SummaryCardSkeleton() {
  return (
    <div className="noir-card p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 bg-noir-active rounded" />
        <div className="h-3 w-20 bg-noir-active rounded" />
      </div>
      <div className="h-8 w-28 bg-noir-active rounded mb-2" />
      <div className="h-4 w-24 bg-noir-active rounded mb-2" />
      <div className="h-2 w-full bg-noir-active rounded mt-3" />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SimulationSummaryCards({
  summary,
  baselineIncome,
  isLoading,
}: SimulationSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SummaryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const {
    monthlyIncome,
    monthlyBalance,
    totalFreedom,
    totalDeficit,
    incomeChangePercent,
    freedomAcceleration,
    firstDeficitMonth,
  } = summary;

  // Calculate status and colors
  const incomeRatio = baselineIncome > 0 ? (monthlyIncome / baselineIncome) * 100 : 0;
  const isIncomeLow = incomeRatio < 50;
  const isIncomeOk = incomeRatio >= 80;

  const isBalancePositive = monthlyBalance >= 0;
  const hasDeficit = totalDeficit < 0;

  const balancePercentOfIncome = monthlyIncome > 0 ? (monthlyBalance / monthlyIncome) * 100 : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Simulated Income */}
      <SummaryCard
        title="Renda Simulada"
        icon={Wallet}
        mainValue={formatCurrency(monthlyIncome)}
        subValue={`vs ${formatCurrency(baselineIncome)}`}
        indicator={`${incomeChangePercent >= 0 ? "" : ""}${formatPercent(incomeChangePercent)}`}
        indicatorClass={
          incomeChangePercent >= 0
            ? "text-accent-positive"
            : incomeChangePercent < -30
              ? "text-accent-negative"
              : "text-accent-warning"
        }
        progressPercent={incomeRatio}
        progressColor={
          isIncomeLow
            ? "bg-accent-negative"
            : isIncomeOk
              ? "bg-accent-positive"
              : "bg-accent-warning"
        }
      />

      {/* Free Balance */}
      <SummaryCard
        title="Saldo Livre Médio/Mês"
        icon={TrendingUp}
        mainValue={`${isBalancePositive ? "+" : ""}${formatCurrency(monthlyBalance)}`}
        indicator={
          isBalancePositive ? `${Math.round(balancePercentOfIncome)}% da renda` : "Déficit mensal"
        }
        indicatorClass={isBalancePositive ? "text-accent-positive" : "text-accent-negative"}
        progressPercent={isBalancePositive ? Math.min(balancePercentOfIncome, 100) : 0}
        progressColor={isBalancePositive ? "bg-accent-positive" : "bg-accent-negative"}
        glowClass={isBalancePositive ? "" : "border-accent-negative/30"}
      />

      {/* Accumulated Deficit */}
      <SummaryCard
        title="Prejuízo Acumulado"
        icon={AlertCircle}
        mainValue={hasDeficit ? formatCurrency(totalDeficit) : "R$ 0"}
        indicator={hasDeficit ? `A partir de ${firstDeficitMonth}` : "Sem prejuízo"}
        indicatorClass={hasDeficit ? "text-accent-negative" : "text-accent-positive"}
        progressPercent={hasDeficit ? 100 : 100}
        progressColor={hasDeficit ? "bg-accent-negative bg-stripes" : "bg-accent-positive"}
        glowClass={hasDeficit ? "border-accent-negative/30" : ""}
      />

      {/* Financial Freedom */}
      <SummaryCard
        title="Liberdade Financeira"
        icon={Gem}
        mainValue={totalFreedom > 0 ? formatCurrency(totalFreedom) : "—"}
        subValue="em 12 meses"
        indicator={
          !Number.isFinite(freedomAcceleration) || freedomAcceleration === 0
            ? undefined
            : freedomAcceleration > 0
              ? `${freedomAcceleration} meses antecipados`
              : `${Math.abs(freedomAcceleration)} meses atrasados`
        }
        indicatorClass={
          !Number.isFinite(freedomAcceleration) || freedomAcceleration === 0
            ? "text-muted"
            : freedomAcceleration > 0
              ? "text-accent-positive"
              : "text-accent-negative"
        }
        progressPercent={totalFreedom > 0 ? Math.min((totalFreedom / 150000) * 100, 100) : 0}
        progressColor="bg-accent-spending"
        glowClass={totalFreedom > 0 ? "border-accent-spending/30" : ""}
      />
    </div>
  );
}
