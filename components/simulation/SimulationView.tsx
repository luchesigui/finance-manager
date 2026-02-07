"use client";

import { useCategories } from "@/components/finance/contexts/CategoriesContext";
import { useEmergencyFund } from "@/components/finance/contexts/EmergencyFundContext";
import { usePeople } from "@/components/finance/contexts/PeopleContext";
import { useTransactions } from "@/components/finance/contexts/TransactionsContext";
import {
  EditableExpensesCard,
  FutureProjectionChart,
  ParticipantSimulator,
  SaveSimulationModal,
  SavedSimulationsList,
  ScenarioSelector,
  SimulationAlerts,
  SimulationSummaryCards,
  useSimulation,
} from "@/components/simulation";
import type { SavedSimulation } from "@/lib/types";
import { Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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
    loadState,
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

  // Saved simulations state
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>([]);
  const [isSavedLoading, setIsSavedLoading] = useState(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updatingSimulationId, setUpdatingSimulationId] = useState<string | null>(null);
  const [activeSimulationId, setActiveSimulationId] = useState<string | null>(null);
  const [lastSavedStateSnapshot, setLastSavedStateSnapshot] = useState<string | null>(null);
  const hasSetInitialSnapshot = useRef(false);

  // On first load, treat current state as "saved" so Save is disabled until user changes something
  useEffect(() => {
    if (hasSetInitialSnapshot.current || isLoading) return;
    hasSetInitialSnapshot.current = true;
    setLastSavedStateSnapshot(JSON.stringify(state));
  }, [state, isLoading]);

  const isSaveDisabled = useMemo(
    () => lastSavedStateSnapshot !== null && JSON.stringify(state) === lastSavedStateSnapshot,
    [state, lastSavedStateSnapshot],
  );

  // Fetch saved simulations on mount
  useEffect(() => {
    async function fetchSimulations() {
      try {
        const res = await fetch("/api/simulations");
        if (res.ok) {
          const data = await res.json();
          setSavedSimulations(data);
        }
      } catch {
        // Silently fail — non-critical
      } finally {
        setIsSavedLoading(false);
      }
    }
    fetchSimulations();
  }, []);

  const handleSave = useCallback(
    async (name: string) => {
      setIsSaving(true);
      try {
        const res = await fetch("/api/simulations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, state }),
        });
        if (res.ok) {
          const created: SavedSimulation = await res.json();
          setSavedSimulations((prev) => [created, ...prev]);
          setActiveSimulationId(created.id);
          setLastSavedStateSnapshot(JSON.stringify(state));
          setIsSaveModalOpen(false);
          toast.success("Simulação salva com sucesso.");
        }
      } catch {
        // Silently fail
      } finally {
        setIsSaving(false);
      }
    },
    [state],
  );

  const handleLoad = useCallback(
    (simulation: SavedSimulation) => {
      loadState(simulation.state);
      setActiveSimulationId(simulation.id);
      setLastSavedStateSnapshot(JSON.stringify(simulation.state));
    },
    [loadState],
  );

  const handleUpdate = useCallback(
    async (id: string) => {
      setUpdatingSimulationId(id);
      try {
        const res = await fetch(`/api/simulations/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        });
        if (res.ok) {
          const updated: SavedSimulation = await res.json();
          setSavedSimulations((prev) => prev.map((s) => (s.id === id ? updated : s)));
          setLastSavedStateSnapshot(JSON.stringify(state));
          toast.success("Simulação salva com sucesso.");
        }
      } catch {
        // Silently fail
      } finally {
        setUpdatingSimulationId(null);
      }
    },
    [state],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/simulations/${id}`, { method: "DELETE" });
        if (res.ok) {
          setSavedSimulations((prev) => prev.filter((s) => s.id !== id));
          if (activeSimulationId === id) {
            setActiveSimulationId(null);
          }
        }
      } catch {
        // Silently fail
      }
    },
    [activeSimulationId],
  );

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
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center p-5 mb-2">
        <h1 className="text-4xl font-display text-heading tracking-tight">Simulação de Futuro</h1>
        <span className="text-[11px] text-muted font-medium tracking-wider uppercase mt-1 block">
          Simule cenários sem afetar seus dados reais
        </span>
      </div>

      {/* Action buttons */}
      {hasChanges && (
        <div className="flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              resetToBaseline();
              setActiveSimulationId(null);
              setLastSavedStateSnapshot(null);
            }}
            className="noir-btn-secondary flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Resetar para valores reais
          </button>
          <button
            type="button"
            onClick={() => setIsSaveModalOpen(true)}
            disabled={isSaveDisabled || isSaving}
            className="noir-btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Salvando..." : "Salvar simulação"}
          </button>
        </div>
      )}

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

      {/* Saved simulations list */}
      <SavedSimulationsList
        simulations={savedSimulations}
        onLoad={handleLoad}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        activeSimulationId={activeSimulationId}
        isLoading={isSavedLoading}
        isSaveDisabled={isSaveDisabled}
        updatingSimulationId={updatingSimulationId}
      />

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

      {/* Alerts/Insights */}
      <SimulationAlerts
        summary={projection.summary}
        baselineIncome={baselineIncome}
        baselineExpenses={baselineExpenses}
        emergencyFund={emergencyFund}
      />

      {/* Chart - Full width */}
      <FutureProjectionChart data={projection.chartData} emergencyFund={emergencyFund} />

      {/* Disclaimer */}
      <div className="noir-card p-4 bg-noir-active/30">
        <p className="text-sm text-muted text-center">
          <strong className="text-body">Nota:</strong> Esta simulação é apenas uma projeção baseada
          nos dados atuais. Os valores reais podem variar. Nenhuma alteração feita aqui afeta seus
          dados reais.
        </p>
      </div>

      {/* Save Modal */}
      {isSaveModalOpen && (
        <SaveSimulationModal
          onSave={handleSave}
          onClose={() => setIsSaveModalOpen(false)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}
