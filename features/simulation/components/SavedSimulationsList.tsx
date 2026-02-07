"use client";

import type { SavedSimulation } from "@/lib/types";
import { ChevronDown, ChevronRight, FolderOpen, Loader2, Play, Save, Trash2 } from "lucide-react";
import { useState } from "react";

type SavedSimulationsListProps = {
  simulations: SavedSimulation[];
  onLoad: (simulation: SavedSimulation) => void;
  onUpdate: (id: string) => void;
  onDelete: (id: string) => void;
  activeSimulationId: string | null;
  isLoading: boolean;
  isSaveDisabled?: boolean;
  updatingSimulationId?: string | null;
};

export function SavedSimulationsList({
  simulations,
  onLoad,
  onUpdate,
  onDelete,
  activeSimulationId,
  isLoading,
  isSaveDisabled = false,
  updatingSimulationId = null,
}: SavedSimulationsListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="noir-card p-4 flex items-center gap-3">
        <Loader2 size={18} className="animate-spin text-muted" />
        <span className="text-sm text-muted">Carregando simulações salvas...</span>
      </div>
    );
  }

  if (simulations.length === 0) return null;

  return (
    <div className="noir-card">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center gap-3 hover:bg-noir-active/50 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown size={18} className="text-muted" />
        ) : (
          <ChevronRight size={18} className="text-muted" />
        )}
        <FolderOpen size={18} className="text-accent-primary" />
        <span className="text-sm font-medium text-heading">Simulações salvas</span>
        <span className="noir-badge-muted ml-auto">{simulations.length}</span>
      </button>

      {isExpanded && (
        <div className="border-t border-noir-border">
          {simulations.map((sim) => {
            const isActive = sim.id === activeSimulationId;
            return (
              <div
                key={sim.id}
                className="flex items-center gap-3 px-4 py-3 border-b border-noir-border last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-heading truncate">{sim.name}</p>
                </div>
                {isActive && (
                  <button
                    type="button"
                    onClick={() => onUpdate(sim.id)}
                    disabled={isSaveDisabled || updatingSimulationId === sim.id}
                    className="noir-btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingSimulationId === sim.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Save size={14} />
                    )}
                    {updatingSimulationId === sim.id ? "Salvando..." : "Salvar"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onLoad(sim)}
                  className="noir-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Play size={14} />
                  Carregar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(sim.id)}
                  className="text-muted hover:text-red-400 p-1.5 rounded-interactive hover:bg-noir-active transition-all"
                  aria-label={`Excluir simulação ${sim.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
