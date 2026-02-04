"use client";

import { formatCurrency } from "@/lib/format";
import type { SimulationSummary } from "@/lib/simulationTypes";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Gem,
  HeartCrack,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type SimulationAlertsProps = {
  summary: SimulationSummary;
  baselineIncome: number;
  baselineExpenses: number;
};

// ============================================================================
// Deficit Alert Card
// ============================================================================

type DeficitAlertCardProps = {
  monthlyDeficit: number;
  totalDeficit: number;
  firstDeficitMonth: string;
  incomePercent: number;
};

function DeficitAlertCard({
  monthlyDeficit,
  totalDeficit,
  firstDeficitMonth,
  incomePercent,
}: DeficitAlertCardProps) {
  return (
    <div className="noir-card p-4 bg-gradient-to-br from-accent-negative/10 to-accent-negative/5 border-2 border-accent-negative border-l-4 shadow-glow-negative">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-accent-negative" />
        <h3 className="font-semibold text-heading">ALERTA: PREJUÍZO PROJETADO</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-noir-surface/50 rounded-card">
          <p className="text-xs text-muted uppercase mb-1">Prejuízo Mensal</p>
          <p className="text-2xl font-bold text-accent-negative tabular-nums">
            {formatCurrency(monthlyDeficit)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted">
            <HeartCrack size={14} className="text-accent-negative" />
            <span>{Math.abs(incomePercent).toFixed(0)}% da renda necessária falta</span>
          </div>
        </div>

        <div className="p-3 bg-noir-surface/50 rounded-card">
          <p className="text-xs text-muted uppercase mb-1">Prejuízo Acumulado (12 meses)</p>
          <p className="text-2xl font-bold text-accent-negative tabular-nums">
            {formatCurrency(totalDeficit)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted">
            <AlertCircle size={14} className="text-accent-negative" />
            <span>Equivalente a reserva de emergência</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <TrendingDown size={14} className="text-accent-negative" />
          <span className="text-body">
            Primeiro mês negativo: <strong className="text-heading">{firstDeficitMonth}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Freedom Acceleration Card
// ============================================================================

type FreedomAccelerationCardProps = {
  monthlyBalance: number;
  totalFreedom: number;
  freedomAcceleration: number;
  freedomTargetDate: string;
  balanceChangePercent: number;
};

function FreedomAccelerationCard({
  monthlyBalance,
  totalFreedom,
  freedomAcceleration,
  freedomTargetDate,
  balanceChangePercent,
}: FreedomAccelerationCardProps) {
  const isPositive = freedomAcceleration >= 0;

  return (
    <div
      className={`noir-card p-4 bg-gradient-to-br ${
        isPositive
          ? "from-accent-positive/10 to-accent-positive/5 border-2 border-accent-positive border-l-4"
          : "from-accent-warning/10 to-accent-warning/5 border-2 border-accent-warning border-l-4"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Target size={20} className={isPositive ? "text-accent-positive" : "text-accent-warning"} />
        <h3 className="font-semibold text-heading">IMPACTO NA LIBERDADE FINANCEIRA</h3>
      </div>

      <div className="flex items-center justify-center gap-8 mb-4 py-4 bg-noir-surface/50 rounded-card">
        <div className="text-center">
          <p className="text-xs text-muted uppercase mb-1">Projeção 12 Meses</p>
          <p className="text-2xl font-bold text-accent-spending tabular-nums">
            {formatCurrency(totalFreedom)}
          </p>
        </div>

        <div className="h-12 w-px bg-noir-border" />

        <div className="text-center">
          <p className="text-xs text-muted uppercase mb-1">Aceleração</p>
          <p
            className={`text-2xl font-bold tabular-nums ${
              isPositive ? "text-accent-positive" : "text-accent-warning"
            }`}
          >
            {freedomAcceleration > 0 ? "+" : ""}
            {freedomAcceleration} meses
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Gem size={14} className="text-accent-spending" />
          <span className="text-body">
            Aumento do Aporte Mensal:{" "}
            <strong
              className={
                balanceChangePercent >= 0 ? "text-accent-positive" : "text-accent-negative"
              }
            >
              {balanceChangePercent >= 0 ? "+" : ""}
              {balanceChangePercent.toFixed(1)}%
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isPositive ? (
            <TrendingUp size={14} className="text-accent-positive" />
          ) : (
            <TrendingDown size={14} className="text-accent-warning" />
          )}
          <span className="text-body">
            Meta projetada para: <strong className="text-heading">{freedomTargetDate}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Positive Balance Card
// ============================================================================

type PositiveBalanceCardProps = {
  currentBalance: number;
  simulatedBalance: number;
  balanceChange: number;
  balanceChangePercent: number;
};

function PositiveBalanceCard({
  currentBalance,
  simulatedBalance,
  balanceChange,
  balanceChangePercent,
}: PositiveBalanceCardProps) {
  const isImprovement = balanceChange > 0;

  return (
    <div
      className={`noir-card p-4 bg-gradient-to-br ${
        isImprovement
          ? "from-accent-positive/10 to-accent-positive/5 border-l-4 border-accent-positive"
          : "from-noir-surface to-noir-active border-l-4 border-noir-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        {isImprovement ? (
          <CheckCircle2 size={20} className="text-accent-positive" />
        ) : (
          <TrendingDown size={20} className="text-accent-warning" />
        )}
        <h3 className="font-semibold text-heading">SALDO LIVRE PROJETADO</h3>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4 py-4 bg-noir-surface/50 rounded-card">
        <div className="text-center">
          <p className="text-xs text-muted uppercase mb-1">Cenário Atual</p>
          <p className="text-xl font-bold text-muted tabular-nums">
            {formatCurrency(currentBalance)}
          </p>
          <p className="text-xs text-muted">por mês</p>
        </div>

        <div className="text-center px-4">
          <span
            className={`text-lg font-bold ${isImprovement ? "text-accent-positive" : "text-accent-warning"}`}
          >
            {isImprovement ? "→" : "→"}
          </span>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted uppercase mb-1">Cenário Simulado</p>
          <p className="text-xl font-bold text-heading tabular-nums">
            {formatCurrency(simulatedBalance)}
          </p>
          <p className="text-xs text-muted">por mês</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        {isImprovement ? (
          <TrendingUp size={14} className="text-accent-positive" />
        ) : (
          <TrendingDown size={14} className="text-accent-warning" />
        )}
        <span
          className={`font-medium ${
            isImprovement ? "text-accent-positive" : "text-accent-warning"
          }`}
        >
          {balanceChange >= 0 ? "+" : ""}
          {formatCurrency(balanceChange)} ({balanceChangePercent >= 0 ? "+" : ""}
          {balanceChangePercent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SimulationAlerts({
  summary,
  baselineIncome,
  baselineExpenses,
}: SimulationAlertsProps) {
  const {
    monthlyBalance,
    totalDeficit,
    totalFreedom,
    firstDeficitMonth,
    freedomAcceleration,
    freedomTargetDate,
    balanceChangePercent,
  } = summary;

  const hasDeficit = totalDeficit < 0;
  const baselineBalance = baselineIncome - baselineExpenses;
  const balanceChange = monthlyBalance - baselineBalance;

  // Calculate income percent for deficit
  const incomePercent =
    summary.monthlyIncome > 0
      ? ((summary.monthlyExpenses - summary.monthlyIncome) / summary.monthlyIncome) * 100
      : 0;

  return (
    <div className="space-y-4">
      {/* Show deficit alert if there's a deficit */}
      {hasDeficit && firstDeficitMonth && (
        <DeficitAlertCard
          monthlyDeficit={monthlyBalance}
          totalDeficit={totalDeficit}
          firstDeficitMonth={firstDeficitMonth}
          incomePercent={incomePercent}
        />
      )}

      {/* Show freedom acceleration if positive balance */}
      {!hasDeficit && totalFreedom > 0 && (
        <FreedomAccelerationCard
          monthlyBalance={monthlyBalance}
          totalFreedom={totalFreedom}
          freedomAcceleration={freedomAcceleration}
          freedomTargetDate={freedomTargetDate}
          balanceChangePercent={balanceChangePercent}
        />
      )}

      {/* Show balance comparison */}
      {!hasDeficit && (
        <PositiveBalanceCard
          currentBalance={baselineBalance}
          simulatedBalance={monthlyBalance}
          balanceChange={balanceChange}
          balanceChangePercent={balanceChangePercent}
        />
      )}
    </div>
  );
}
