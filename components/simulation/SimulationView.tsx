"use client";

import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import {
  EditableExpensesCard,
  FutureProjectionChart,
  MonthlyBreakdownTable,
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

  const isLoading = isPeopleLoading || isTransactionsLoading;

  const {
    state,
    toggleParticipant,
    setParticipantMultiplier,
    setScenario,
    toggleExpenseInclusion,
    addManualExpense,
    removeManualExpense,
    resetToBaseline,
    projection,
    editableExpenses,
    totalSimulatedExpenses,
    baselineIncome,
    baselineExpenses,
    hasChanges,
    recurringExpenses,
    averageExpenses,
  } = useSimulation({
    people,
    transactions: transactionsForCalculations,
  });

  // Calculate scenario totals
  const minimalistTotal = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);
  const realisticTotal = averageExpenses;

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
          minimalistTotal={minimalistTotal}
          realisticTotal={realisticTotal}
        />
      </div>

      {/* Editable Expenses */}
      <EditableExpensesCard
        expenses={editableExpenses}
        totalSimulatedExpenses={totalSimulatedExpenses}
        onToggleExpense={toggleExpenseInclusion}
        onAddExpense={addManualExpense}
        onRemoveExpense={removeManualExpense}
      />

      {/* Summary Cards */}
      <SimulationSummaryCards summary={projection.summary} baselineIncome={baselineIncome} />

      {/* Chart and Insights Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main Chart */}
        <div className="xl:col-span-2">
          <FutureProjectionChart data={projection.chartData} />
        </div>

        {/* Alerts/Insights Panel */}
        <div className="xl:col-span-1">
          <SimulationAlerts
            summary={projection.summary}
            baselineIncome={baselineIncome}
            baselineExpenses={baselineExpenses}
          />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <MonthlyBreakdownTable data={projection.chartData} />

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
