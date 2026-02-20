"use client";

import { Card } from "@/components/ui/card";
import type { SimulationSummary } from "@/features/simulation/types";
import { formatCurrency } from "@/lib/format";
import {
  AlertTriangle,
  Clock,
  HeartCrack,
  Info,
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
    <Card className="p-card-padding h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-heading flex items-center gap-2">
          <AlertTriangle size={20} className="text-accent-negative" />
          Prejuízo Projetado
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        <div className="p-4 bg-noir-active/60 rounded-interactive">
          <p className="text-section-label text-muted uppercase tracking-widest mb-2">
            Prejuízo Mensal
          </p>
          <p className="text-xl font-mono-nums font-semibold text-accent-negative tabular-nums">
            {formatCurrency(monthlyDeficit)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
            <HeartCrack size={12} className="text-accent-negative" />
            <span>{Math.abs(incomePercent).toFixed(0)}% da renda necessária falta</span>
          </div>
        </div>

        <div className="p-4 bg-noir-active/60 rounded-interactive">
          <p className="text-section-label text-muted uppercase tracking-widest mb-2">
            Prejuízo Acumulado
          </p>
          <p className="text-xl font-mono-nums font-semibold text-accent-negative tabular-nums">
            {formatCurrency(totalDeficit)}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted">
            <Info size={11} className="flex-shrink-0" />
            <span>Considerando 12 meses</span>
          </div>
        </div>
      </div>
    </Card>
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
    <Card className="p-card-padding h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-heading flex items-center gap-2">
          <Shield size={20} className="text-accent-primary" />
          Reserva de Emergência
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
        <div className="p-4 bg-noir-active/60 rounded-interactive">
          <p className="text-section-label text-muted uppercase tracking-widest mb-2">
            Valor da Reserva
          </p>
          <p className="text-xl font-mono-nums font-semibold text-accent-primary tabular-nums">
            {formatCurrency(emergencyFund)}
          </p>
        </div>

        <div className="p-4 bg-noir-active/60 rounded-interactive">
          <p className="text-section-label text-muted uppercase tracking-widest mb-2">
            Duração Estimada
          </p>
          <p
            className={`text-xl font-mono-nums font-semibold tabular-nums ${
              isDepleted ? "text-accent-negative" : "text-accent-primary"
            }`}
          >
            {monthsToDepletion === Number.POSITIVE_INFINITY ? "∞" : `${monthsToDepletion} meses`}
          </p>
          {isDepleted && depletedMonth && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted">
              <Clock size={12} className="text-accent-warning" />
              <span>Esgota em {depletedMonth}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// Freedom Impact Card
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
    <Card className="p-card-padding h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-heading flex items-center gap-2">
          <Target
            size={20}
            className={isImprovement ? "text-accent-positive" : "text-accent-warning"}
          />
          Impacto na Liberdade Financeira
        </h3>
      </div>

      <div className="flex items-center justify-center gap-6 mb-4 py-5 bg-noir-active/60 rounded-interactive flex-1">
        <div className="text-center">
          <p className="text-section-label text-muted uppercase tracking-widest mb-2">
            Cenário Atual
          </p>
          <p className="text-xl font-mono-nums font-semibold text-muted tabular-nums">
            {formatCurrency(currentFreedom)}
          </p>
          <p className="text-xs text-muted mt-1">em 12 meses</p>
        </div>

        <div className="text-center px-2">
          <span
            className={`text-lg ${isImprovement ? "text-accent-positive" : "text-accent-warning"}`}
          >
            →
          </span>
        </div>

        <div className="text-center">
          <p className="text-section-label text-muted uppercase tracking-widest mb-2">
            Cenário Simulado
          </p>
          <p className="text-xl font-mono-nums font-semibold text-heading tabular-nums">
            {formatCurrency(simulatedFreedom)}
          </p>
          <p className="text-xs text-muted mt-1">em 12 meses</p>
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
    </Card>
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

  const incomePercent =
    summary.monthlyIncome > 0
      ? ((summary.monthlyExpenses - summary.monthlyIncome) / summary.monthlyIncome) * 100
      : 0;

  const freedomChangePercent =
    baselineTotalFreedom !== 0
      ? ((totalFreedom - baselineTotalFreedom) / Math.abs(baselineTotalFreedom)) * 100
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {hasDeficit && (
        <div className={!(emergencyFund > 0) ? "md:col-span-2" : ""}>
          <DeficitAlertCard
            monthlyDeficit={monthlyBalance}
            totalDeficit={totalDeficit}
            incomePercent={incomePercent}
          />
        </div>
      )}

      {hasDeficit && emergencyFund > 0 && (
        <div>
          <EmergencyFundCard
            emergencyFund={emergencyFund}
            monthsToDepletion={emergencyFundMonths}
            depletedMonth={emergencyFundDepletedMonth}
            isDepleted={emergencyFundDepleted}
          />
        </div>
      )}

      {!hasDeficit && (
        <div className="md:col-span-2">
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
