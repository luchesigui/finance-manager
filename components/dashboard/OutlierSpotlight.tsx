"use client";

import { AlertOctagon, MapPin } from "lucide-react";

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
// Component
// ============================================================================

export function OutlierSpotlight({ outliers, categories, totalExpenses }: OutlierSpotlightProps) {
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
      <div className="p-4 border-b border-noir-border bg-accent-warning/5 flex items-center gap-2">
        <AlertOctagon size={18} className="text-accent-warning" />
        <h2 className="font-semibold text-heading">Gastos Fora do Padrão</h2>
        <span className="ml-auto noir-badge-warning text-xs">
          {outliers.length} {outliers.length === 1 ? "item" : "itens"}
        </span>
      </div>

      <div className="p-4 space-y-4">
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
              + {outliers.length - 5} {outliers.length - 5 === 1 ? "outro gasto" : "outros gastos"}{" "}
              fora do padrão
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
    </div>
  );
}
