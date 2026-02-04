"use client";

import { formatCurrency } from "@/lib/format";
import type { ExpenseScenario } from "@/lib/simulationTypes";
import { BarChart3, Check, Home } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type ScenarioSelectorProps = {
  selectedScenario: ExpenseScenario;
  onScenarioChange: (scenario: ExpenseScenario) => void;
  minimalistTotal: number;
  realisticTotal: number;
};

type ScenarioCardProps = {
  title: string;
  description: string;
  icon: typeof Home;
  value: number;
  isSelected: boolean;
  onSelect: () => void;
};

// ============================================================================
// Scenario Card Component
// ============================================================================

function ScenarioCard({
  title,
  description,
  icon: Icon,
  value,
  isSelected,
  onSelect,
}: ScenarioCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative overflow-hidden p-4 rounded-card border-2 text-left transition-all duration-300 ease-out flex-1 ${
        isSelected
          ? "border-accent-primary bg-accent-primary/10 scale-[1.02]"
          : "border-noir-border bg-noir-surface hover:border-noir-border-light"
      }`}
    >
      {/* Selection indicator */}
      <div className="absolute top-3 right-3">
        {isSelected ? (
          <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full border-2 border-noir-border" />
        )}
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-card ${
            isSelected ? "bg-accent-primary/20 text-accent-primary" : "bg-noir-active text-muted"
          }`}
        >
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-heading">{title}</h3>
          <p className="text-sm text-muted mt-0.5">{description}</p>
          <p className="text-lg font-bold text-heading tabular-nums mt-2">
            {formatCurrency(value)}
            <span className="text-sm font-normal text-muted">/mês</span>
          </p>
        </div>
      </div>

      {/* Ripple effect */}
      <div
        className={`absolute inset-0 bg-accent-primary/10 rounded-card transition-transform duration-500 pointer-events-none ${
          isSelected ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ScenarioSelector({
  selectedScenario,
  onScenarioChange,
  minimalistTotal,
  realisticTotal,
}: ScenarioSelectorProps) {
  return (
    <div className="noir-card p-4">
      <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-accent-primary" />
        Cenário de Gastos
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <ScenarioCard
          title="Minimalista"
          description="Apenas Gastos Recorrentes"
          icon={Home}
          value={minimalistTotal}
          isSelected={selectedScenario === "minimalist"}
          onSelect={() => onScenarioChange("minimalist")}
        />
        <ScenarioCard
          title="Realista"
          description="Média dos últimos meses"
          icon={BarChart3}
          value={realisticTotal}
          isSelected={selectedScenario === "realistic"}
          onSelect={() => onScenarioChange("realistic")}
        />
      </div>
    </div>
  );
}
