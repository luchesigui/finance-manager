"use client";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useEmergencyFund } from "@/components/finance/contexts/EmergencyFundContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import {
  EditableExpensesCard,
  FutureProjectionChart,
  ParticipantSimulator,
  ScenarioSelector,
  SimulationAlerts,
  SimulationSummaryCards,
  useSimulation,
} from "@/components/simulation";
import { FlaskConical, RefreshCw, Sparkles } from "lucide-react";

// ============================================================================
// Main Component
// ============================================================================

export function SimulationView() {
  const { people, isPeopleLoading } = usePeople();
  const { transactionsForCalculations, isTransactionsLoading } = useTransactions();
  const { categories, isCategoriesLoading } = useCategories();
  const { emergencyFund, isEmergencyFundLoading } = useEmergencyFund();

  const isLoading =
    isPeopleLoading || isTransactionsLoading || isCategoriesLoading || isEmergencyFundLoading;

  const {
    state,
    toggleParticipant,
    setParticipantMultiplier,
    setScenario,
    toggleExpenseInclusion,
    addManualExpense,
    removeManualExpense,
    setCustomExpenses,
    resetToBaseline,
    projection,
    editableExpenses,
    totalSimulatedExpenses,
    baselineIncome,
    baselineExpenses,
    hasChanges,
    recurringExpenses,
    currentMonthExpenses,
    averageExpenses,
    customExpenses,
  } = useSimulation({
    people,
    transactions: transactionsForCalculations,
    categories,
    emergencyFund,
  });

  // Calculate scenario totals
  const minimalistTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-noir-active rounded mb-2" />
          <div className="h-4 w-96 bg-noir-active rounded" />
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-noir-active rounded-card" />
          <div className="h-64 bg-noir-active rounded-card" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-noir-active rounded-card" />
          ))}
        </div>

        <div className="h-96 bg-noir-active rounded-card" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-heading">Simulação de Futuro</h1>
            <span className="noir-badge-accent flex items-center gap-1">
              <FlaskConical size={14} />
              Sandbox
            </span>
          </div>
          <p className="text-muted mt-1">Simule cenários sem afetar seus dados reais</p>
        </div>

        {/* Reset button */}
        {hasChanges && (
          <button
            type="button"
            onClick={resetToBaseline}
            className="noir-btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Resetar para valores reais
          </button>
        )}
      </div>

      {/* Status indicator */}
      {hasChanges && (
        <div className="noir-card p-3 bg-accent-primary/10 border-accent-primary/30 flex items-center gap-3">
          <Sparkles size={18} className="text-accent-primary" />
          <div className="flex-1">
            <span className="text-sm text-heading font-medium">Simulação ativa</span>
            <span className="text-sm text-muted ml-2">
              Alterações aplicadas aos participantes e/ou cenário
            </span>
          </div>
        </div>
      )}

      {/* Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Participant Management */}
        <ParticipantSimulator
          participants={state.participants}
          onToggle={toggleParticipant}
          onMultiplierChange={setParticipantMultiplier}
        />

        {/* Scenario Selector */}
        <ScenarioSelector
          selectedScenario={state.scenario}
          onScenarioChange={setScenario}
          currentMonthTotal={currentMonthExpenses}
          minimalistTotal={minimalistTotal}
          realisticTotal={averageExpenses}
          customValue={customExpenses}
          onCustomValueChange={setCustomExpenses}
        />
      </div>

      {/* Editable Expenses */}
      <EditableExpensesCard
        expenses={editableExpenses}
        totalSimulatedExpenses={totalSimulatedExpenses}
        scenario={state.scenario}
        onToggleExpense={toggleExpenseInclusion}
        onAddExpense={addManualExpense}
        onRemoveExpense={removeManualExpense}
      />

      {/* Summary Cards */}
      <SimulationSummaryCards summary={projection.summary} baselineIncome={baselineIncome} />

      {/* Chart - Full width */}
      <FutureProjectionChart data={projection.chartData} emergencyFund={emergencyFund} />

      {/* Alerts/Insights - Below chart, horizontally stacked */}
      <SimulationAlerts
        summary={projection.summary}
        baselineIncome={baselineIncome}
        baselineExpenses={baselineExpenses}
        emergencyFund={emergencyFund}
      />

      {/* Disclaimer */}
      <div className="noir-card p-4 bg-noir-active/30">
        <p className="text-sm text-muted text-center">
          <strong className="text-body">Nota:</strong> Esta simulação é apenas uma projeção baseada
          nos dados atuais. Os valores reais podem variar. Nenhuma alteração feita aqui afeta seus
          dados reais.
        </p>
      </div>
    </div>
  );
}
