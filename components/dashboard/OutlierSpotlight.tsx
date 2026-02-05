"use client";

import { AlertOctagon, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

export type OutlierTransaction = Transaction & {
  historicalAverage: number;
  percentAboveAverage: number;
};

type OutlierSpotlightProps = {
  outliers: OutlierTransaction[];
  categories: Category[];
  totalExpenses: number;
};

// ============================================================================
// Constants
// ============================================================================

const OUTLIERS_COLLAPSED_KEY = "dashboard_outliers_collapsed";

// ============================================================================
// Hooks
// ============================================================================

function useCollapsedState(): [boolean, (collapsed: boolean) => void] {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(OUTLIERS_COLLAPSED_KEY);
      if (stored !== null) {
        setIsCollapsed(stored === "true");
      }
    } catch {
      // localStorage not available
    }
  }, []);

  // Persist to localStorage when changed
  const setCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(OUTLIERS_COLLAPSED_KEY, String(collapsed));
    } catch {
      // localStorage not available
    }
  };

  return [isCollapsed, setCollapsed];
}

// ============================================================================
// Component
// ============================================================================

export function OutlierSpotlight({ outliers, categories, totalExpenses }: OutlierSpotlightProps) {
  const [isCollapsed, setCollapsed] = useCollapsedState();

  if (outliers.length === 0) {
    return null;
  }

  // Build category lookup
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  // Calculate total outlier amount
  const totalOutlierAmount = outliers.reduce((sum, t) => sum + t.amount, 0);
  const outlierPercentOfTotal = totalExpenses > 0 ? (totalOutlierAmount / totalExpenses) * 100 : 0;

  return (
    <div className="noir-card overflow-hidden border border-accent-warning/30">
      <button
        type="button"
        onClick={() => setCollapsed(!isCollapsed)}
        className="w-full p-4 border-b border-noir-border bg-accent-warning/5 flex items-center gap-2 hover:bg-accent-warning/10 transition-colors"
      >
        <AlertOctagon size={18} className="text-accent-warning" />
        <h2 className="font-semibold text-heading">Gastos Fora do Padrão</h2>
        <span className="noir-badge-warning text-xs">
          {outliers.length} {outliers.length === 1 ? "item" : "itens"}
        </span>
        <span className="ml-auto text-muted">
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </span>
      </button>

      {!isCollapsed && (
        <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Outlier list */}
          <div className="space-y-3">
            {outliers.slice(0, 5).map((outlier) => {
              const category = outlier.categoryId ? categoryMap.get(outlier.categoryId) : null;

              return (
                <div
                  key={outlier.id}
                  className="flex items-start gap-3 py-2 border-b border-noir-border last:border-0"
                >
                  <MapPin size={16} className="text-accent-warning mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-heading truncate">
                          {outlier.description}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          Média histórica: {formatCurrency(outlier.historicalAverage)} (
                          <span className="text-accent-warning">
                            +{Math.round(outlier.percentAboveAverage)}%
                          </span>
                          )
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-accent-warning tabular-nums">
                          {formatCurrency(outlier.amount)}
                        </p>
                        {category && <p className="text-xs text-muted">{category.name}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {outliers.length > 5 && (
              <p className="text-xs text-muted text-center pt-2">
                + {outliers.length - 5}{" "}
                {outliers.length - 5 === 1 ? "outro gasto" : "outros gastos"} fora do padrão
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-noir-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total em outliers:</span>
              <div className="text-right">
                <span className="font-bold text-accent-warning tabular-nums">
                  {formatCurrency(totalOutlierAmount)}
                </span>
                <span className="text-muted ml-2">
                  ({outlierPercentOfTotal.toFixed(0)}% do total)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
