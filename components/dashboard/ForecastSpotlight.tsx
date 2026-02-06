"use client";

import { ChevronDown, ChevronUp, Eye, EyeOff, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

import { CrystalBallLine } from "@/components/ui/CrystalBallLine";
import { formatCurrency, formatDateString } from "@/lib/format";
import type { Category, Transaction } from "@/lib/types";

// ============================================================================
// Types
// ============================================================================

type ForecastSpotlightProps = {
  forecasts: Transaction[];
  categories: Category[];
  totalExpenses: number;
  isForecastIncluded: (transactionId: number) => boolean;
  setForecastInclusionOverride: (transactionId: number, include: boolean) => void;
  updateTransactionById: (
    id: number,
    patch: { isForecast: boolean; excludeFromSplit: boolean },
  ) => void;
};

// ============================================================================
// Constants
// ============================================================================

const FORECASTS_COLLAPSED_KEY = "dashboard_forecasts_collapsed";

// ============================================================================
// Hooks
// ============================================================================

function useCollapsedState(): [boolean, (collapsed: boolean) => void] {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load initial state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FORECASTS_COLLAPSED_KEY);
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
      localStorage.setItem(FORECASTS_COLLAPSED_KEY, String(collapsed));
    } catch {
      // localStorage not available
    }
  };

  return [isCollapsed, setCollapsed];
}

// ============================================================================
// Component
// ============================================================================

export function ForecastSpotlight({
  forecasts,
  categories,
  totalExpenses,
  isForecastIncluded,
  setForecastInclusionOverride,
  updateTransactionById,
}: ForecastSpotlightProps) {
  const [isCollapsed, setCollapsed] = useCollapsedState();

  if (forecasts.length === 0) {
    return null;
  }

  // Build category lookup
  const categoryMap = new Map(categories.map((cat) => [cat.id, cat]));

  // Calculate total forecast amount
  const totalForecastAmount = forecasts.reduce((sum, t) => sum + t.amount, 0);
  const forecastPercentOfTotal =
    totalExpenses > 0 ? (totalForecastAmount / totalExpenses) * 100 : 0;

  return (
    <div className="noir-card overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed(!isCollapsed)}
        className="w-full p-card-padding flex items-center gap-2 hover:bg-noir-active/30 transition-colors"
      >
        <CrystalBallLine size={20} className="text-accent-spending" />
        <h2 className="text-lg font-semibold text-heading">Gastos Previstos</h2>
        <span className="noir-badge-muted text-xs">
          {forecasts.length} {forecasts.length === 1 ? "item" : "itens"}
        </span>
        <span className="ml-auto text-muted">
          {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </span>
      </button>

      {!isCollapsed && (
        <div className="px-card-padding pb-card-padding space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Forecast list */}
          <div className="space-y-3">
            {forecasts.slice(0, 5).map((forecast) => {
              const category = forecast.categoryId ? categoryMap.get(forecast.categoryId) : null;
              const isIncluded = isForecastIncluded(forecast.id);

              return (
                <div
                  key={forecast.id}
                  className="flex items-start gap-3 py-2 border-b border-noir-border last:border-0"
                >
                  <CrystalBallLine
                    size={16}
                    className="text-accent-spending mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-heading truncate">
                          {forecast.description}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {formatDateString(forecast.date)}
                          {category && <span className="ml-2">({category.name})</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            updateTransactionById(forecast.id, {
                              isForecast: false,
                              excludeFromSplit: false,
                            })
                          }
                          className="p-1.5 rounded-interactive text-accent-positive hover:bg-accent-positive/20 transition-all"
                          title="Marcar como oficial"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForecastInclusionOverride(forecast.id, !isIncluded)}
                          className={`p-1.5 rounded-interactive transition-all ${
                            isIncluded
                              ? "text-body hover:bg-noir-active"
                              : "text-muted hover:text-body hover:bg-noir-active"
                          }`}
                          title={isIncluded ? "Não considerar na conta" : "Considerar na conta"}
                        >
                          {isIncluded ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <p className="text-sm font-bold text-accent-spending tabular-nums ml-2">
                          {formatCurrency(forecast.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {forecasts.length > 5 && (
              <p className="text-xs text-muted text-center pt-2">
                + {forecasts.length - 5}{" "}
                {forecasts.length - 5 === 1 ? "outro gasto" : "outros gastos"} previsto
                {forecasts.length - 5 === 1 ? "" : "s"}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="pt-3 border-t border-noir-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total em previsões:</span>
              <div className="text-right">
                <span className="font-bold text-accent-spending tabular-nums">
                  {formatCurrency(totalForecastAmount)}
                </span>
                {forecastPercentOfTotal > 0 && (
                  <span className="text-muted ml-2">
                    ({forecastPercentOfTotal.toFixed(0)}% do total)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
