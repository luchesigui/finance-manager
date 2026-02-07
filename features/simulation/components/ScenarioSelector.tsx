"use client";

import { CurrencyInput } from "@/components/ui/CurrencyInput";
import type { ExpenseScenario } from "@/features/simulation/types";
import { formatCurrency } from "@/lib/format";
import { BarChart3, Calendar, Check, Home, Settings2 } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

type ScenarioSelectorProps = {
  selectedScenario: ExpenseScenario;
  onScenarioChange: (scenario: ExpenseScenario) => void;
  currentMonthTotal: number;
  minimalistTotal: number;
  realisticTotal: number;
  customValue: number;
  onCustomValueChange: (value: number) => void;
};

type ScenarioOptionProps = {
  title: string;
  description: string;
  icon: typeof Home;
  value: number | null;
  isSelected: boolean;
  onSelect: () => void;
  isCustom?: boolean;
  customValue?: number;
  onCustomValueChange?: (value: number) => void;
};

// ============================================================================
// Scenario Option Component
// ============================================================================

function ScenarioOption({
  title,
  description,
  icon: Icon,
  value,
  isSelected,
  onSelect,
  isCustom,
  customValue,
  onCustomValueChange,
}: ScenarioOptionProps) {
  return (
    <div
      className={`relative overflow-hidden p-4 rounded-interactive border transition-all duration-300 ease-out ${
        isSelected
          ? "border-accent-primary/40 bg-accent-primary/5"
          : "border-noir-border bg-noir-surface hover:border-accent-primary/30 hover:bg-accent-primary/[0.02]"
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left">
        <div className="flex items-center gap-3">
          {/* Selection indicator */}
          <div className="flex-shrink-0">
            {isSelected ? (
              <div className="w-6 h-6 rounded-full bg-accent-primary flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border-2 border-noir-border" />
            )}
          </div>

          {/* Icon */}
          <div
            className={`p-2 rounded-card flex-shrink-0 ${
              isSelected ? "bg-accent-primary/20 text-accent-primary" : "bg-noir-active text-muted"
            }`}
          >
            <Icon size={20} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-heading">{title}</h3>
            <p className="text-sm text-muted">{description}</p>
          </div>

          {/* Value */}
          {value !== null && !isCustom && (
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold text-heading tabular-nums">{formatCurrency(value)}</p>
              <p className="text-xs text-muted">/mês</p>
            </div>
          )}
        </div>
      </button>

      {/* Custom value input */}
      {isCustom && isSelected && (
        <div className="mt-3 pt-3 border-t border-noir-border">
          <label
            htmlFor="custom-expense-value"
            className="text-xs text-muted uppercase tracking-wide mb-1 block"
          >
            Valor mensal personalizado
          </label>
          <CurrencyInput
            id="custom-expense-value"
            value={customValue ?? null}
            onValueChange={(val) => onCustomValueChange?.(val ?? 0)}
            className="noir-input w-full"
            placeholder="R$ 0,00"
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ScenarioSelector({
  selectedScenario,
  onScenarioChange,
  currentMonthTotal,
  minimalistTotal,
  realisticTotal,
  customValue,
  onCustomValueChange,
}: ScenarioSelectorProps) {
  return (
    <div className="noir-card p-card-padding">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-heading flex items-center gap-2">
          <BarChart3 size={20} className="text-accent-primary" />
          Cenário de Gastos
        </h2>
      </div>
      <div className="flex flex-col gap-3">
        <ScenarioOption
          title="Mês Atual"
          description="Usa os gastos do mês atual como referência"
          icon={Calendar}
          value={currentMonthTotal}
          isSelected={selectedScenario === "currentMonth"}
          onSelect={() => onScenarioChange("currentMonth")}
        />
        <ScenarioOption
          title="Minimalista"
          description="Apenas gastos recorrentes"
          icon={Home}
          value={minimalistTotal}
          isSelected={selectedScenario === "minimalist"}
          onSelect={() => onScenarioChange("minimalist")}
        />
        <ScenarioOption
          title="Média dos Últimos Meses"
          description="Média de gastos baseada no histórico"
          icon={BarChart3}
          value={realisticTotal}
          isSelected={selectedScenario === "realistic"}
          onSelect={() => onScenarioChange("realistic")}
        />
        <ScenarioOption
          title="Personalizado"
          description="Defina um valor mensal de gastos"
          icon={Settings2}
          value={customValue > 0 ? customValue : null}
          isSelected={selectedScenario === "custom"}
          onSelect={() => onScenarioChange("custom")}
          isCustom
          customValue={customValue}
          onCustomValueChange={onCustomValueChange}
        />
      </div>
    </div>
  );
}
