"use client";

import { formatCurrency } from "@/lib/format";
import type { SimulationSummary } from "@/lib/simulationTypes";
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Gem,
  HeartCrack,
  Shield,
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
  emergencyFund: number;
};

// ============================================================================
// Deficit Alert Card
// ============================================================================

type DeficitAlertCardProps = {
  monthlyDeficit: number;
  totalDeficit: number;
  incomePercent: number;
};

function DeficitAlertCard({ monthlyDeficit, totalDeficit, incomePercent }: DeficitAlertCardProps) {
  return (
    <div className="noir-card p-4 bg-gradient-to-br from-accent-negative/10 to-accent-negative/5 border-2 border-accent-negative border-l-4 shadow-glow-negative">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={20} className="text-accent-negative" />
        <h3 className="font-semibold text-heading">PREJUÍZO PROJETADO</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 bg-noir-surface border border-noir-border rounded-card">
          <p className="text-xs text-muted uppercase mb-1">Prejuízo Mensal</p>
          <p className="text-2xl font-bold text-accent-negative tabular-nums">
            {formatCurrency(monthlyDeficit)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted">
            <HeartCrack size={14} className="text-accent-negative" />
            <span>{Math.abs(incomePercent).toFixed(0)}% da renda necessária falta</span>
          </div>
        </div>

        <div className="p-3 bg-noir-surface border border-noir-border rounded-card">
          <p className="text-xs text-muted uppercase mb-1">Prejuízo Acumulado (12 meses)</p>
          <p className="text-2xl font-bold text-accent-negative tabular-nums">
            {formatCurrency(totalDeficit)}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-muted">
            <AlertCircle size={14} className="text-accent-negative" />
            <span>Sem considerar reserva de emergência</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Emergency Fund Duration Card
// ============================================================================

type EmergencyFundCardProps = {
  emergencyFund: number;
  monthsToDepletion: number;
  depletedMonth: string | null;
  isDepleted: boolean;
};

function EmergencyFundCard({
  emergencyFund,
  monthsToDepletion,
  depletedMonth,
  isDepleted,
}: EmergencyFundCardProps) {
  if (emergencyFund <= 0) return null;

  return (
    <div className="noir-card p-4 bg-gradient-to-br from-accent-primary/10 to-accent-primary/5 border-l-4 border-accent-primary">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={20} className="text-accent-primary" />
        <h3 className="font-semibold text-heading">RESERVA DE EMERGÊNCIA</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-3 bg-noir-surface border border-noir-border rounded-card">
          <p className="text-xs text-muted uppercase mb-1">Valor da Reserva</p>
          <p className="text-2xl font-bold text-accent-primary tabular-nums">
            {formatCurrency(emergencyFund)}
          </p>
        </div>

        <div className="p-3 bg-noir-surface border border-noir-border rounded-card">
          <p className="text-xs text-muted uppercase mb-1">Duração Estimada</p>
          <p
            className={`text-2xl font-bold tabular-nums ${
              isDepleted ? "text-accent-negative" : "text-accent-primary"
            }`}
          >
            {monthsToDepletion === Number.POSITIVE_INFINITY ? "∞" : `${monthsToDepletion} meses`}
          </p>
          {isDepleted && depletedMonth && (
            <div className="flex items-center gap-1 mt-1 text-sm text-muted">
              <Clock size={14} className="text-accent-warning" />
              <span>Esgota em {depletedMonth}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Freedom Impact Card (similar to balance card with current vs simulated)
// ============================================================================

type FreedomImpactCardProps = {
  currentFreedom: number;
  simulatedFreedom: number;
  changePercent: number;
};

function FreedomImpactCard({
  currentFreedom,
  simulatedFreedom,
  changePercent,
}: FreedomImpactCardProps) {
  const isImprovement = simulatedFreedom >= currentFreedom;
  const changeAmount = simulatedFreedom - currentFreedom;

  return (
    <div
      className={`noir-card p-4 bg-gradient-to-br ${
        isImprovement
          ? "from-accent-positive/10 to-accent-positive/5 border-l-4 border-accent-positive"
          : "from-accent-warning/10 to-accent-warning/5 border-l-4 border-accent-warning"
      }`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Target
          size={20}
          className={isImprovement ? "text-accent-positive" : "text-accent-warning"}
        />
        <h3 className="font-semibold text-heading">IMPACTO NA LIBERDADE FINANCEIRA</h3>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4 py-4 bg-noir-surface border border-noir-border rounded-card">
        <div className="text-center">
          <p className="text-xs text-muted uppercase mb-1">Cenário Atual</p>
          <p className="text-xl font-bold text-muted tabular-nums">
            {formatCurrency(currentFreedom)}
          </p>
          <p className="text-xs text-muted">em 12 meses</p>
        </div>

        <div className="text-center px-4">
          <span
            className={`text-lg font-bold ${isImprovement ? "text-accent-positive" : "text-accent-warning"}`}
          >
            →
          </span>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted uppercase mb-1">Cenário Simulado</p>
          <p className="text-xl font-bold text-heading tabular-nums">
            {formatCurrency(simulatedFreedom)}
          </p>
          <p className="text-xs text-muted">em 12 meses</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm">
        {isImprovement ? (
          <TrendingUp size={14} className="text-accent-positive" />
        ) : (
          <TrendingDown size={14} className="text-accent-warning" />
        )}
        <span
          className={`font-medium ${isImprovement ? "text-accent-positive" : "text-accent-warning"}`}
        >
          {isImprovement ? "Aumento" : "Redução"} de {formatCurrency(Math.abs(changeAmount))} (
          {changePercent >= 0 ? "+" : ""}
          {changePercent.toFixed(1)}%)
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
  emergencyFund,
}: SimulationAlertsProps) {
  const {
    monthlyBalance,
    totalDeficit,
    totalFreedom,
    emergencyFundMonths,
    emergencyFundDepleted,
    emergencyFundDepletedMonth,
    baselineTotalFreedom,
  } = summary;

  const hasDeficit = totalDeficit < 0 || monthlyBalance < 0;

  // Calculate income percent for deficit
  const incomePercent =
    summary.monthlyIncome > 0
      ? ((summary.monthlyExpenses - summary.monthlyIncome) / summary.monthlyIncome) * 100
      : 0;

  // Calculate change percent for freedom
  const freedomChangePercent =
    baselineTotalFreedom !== 0
      ? ((totalFreedom - baselineTotalFreedom) / Math.abs(baselineTotalFreedom)) * 100
      : 0;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Show deficit alert if there's a deficit */}
      {hasDeficit && (
        <div className="flex-1">
          <DeficitAlertCard
            monthlyDeficit={monthlyBalance}
            totalDeficit={totalDeficit}
            incomePercent={incomePercent}
          />
        </div>
      )}

      {/* Show emergency fund card in deficit scenario */}
      {hasDeficit && emergencyFund > 0 && (
        <div className="flex-1">
          <EmergencyFundCard
            emergencyFund={emergencyFund}
            monthsToDepletion={emergencyFundMonths}
            depletedMonth={emergencyFundDepletedMonth}
            isDepleted={emergencyFundDepleted}
          />
        </div>
      )}

      {/* Show freedom impact if positive balance */}
      {!hasDeficit && (
        <div className="flex-1">
          <FreedomImpactCard
            currentFreedom={baselineTotalFreedom}
            simulatedFreedom={totalFreedom}
            changePercent={freedomChangePercent}
          />
        </div>
      )}
    </div>
  );
}
